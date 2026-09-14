// ---------------------------------------------------------------------------
// Builds the cinematic identity plate from the uploaded reference photo.
// Detects the circular avatar inside the phone screenshot, grades the image
// into the film's obsidian palette while preserving skin / facial identity,
// bakes a strong cinematic vignette and fine grain, and writes a square
// head-and-shoulders crop consumed by the portrait overlays.
// ---------------------------------------------------------------------------
import Jimp from "jimp";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "assets");
const DIAG = join(ROOT, "assets");

const CANDIDATES = [
  ...readdirSyncSafe("/home/user/uploads").map((f) => join("/home/user/uploads", f)),
  join(DIAG, "source.jpg"),
  join(DIAG, "source.jpeg"),
  join(DIAG, "source.png"),
  join(DIAG, "source.webp"),
  join(DIAG, "portrait.jpg"),
];

function readdirSyncSafe(p) {
  try {
    return readdirSync(p).filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f));
  } catch {
    return [];
  }
}

const dist = (a, b) =>
  (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;

async function detectCircle(img) {
  const { width: W, height: H } = img.bitmap;
  // corner/background reference: average of 40x40 corner patches
  const patches = [];
  const patch = (x0, y0) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y0 + 40; y += 2)
      for (let x = x0; x < x0 + 40; x += 2) {
        const c = Jimp.intToRGBA(img.getPixelColor(x, y));
        r += c.r; g += c.g; b += c.b; n++;
      }
    return { r: r / n, g: g / n, b: b / n };
  };
  for (const [cx, cy] of [
    [4, 4],
    [W - 44, 4],
    [4, H - 44],
    [W - 44, H - 44],
  ]) patches.push(patch(cx, cy));
  const bg = {
    r: patches.reduce((a, p) => a + p.r, 0) / 4,
    g: patches.reduce((a, p) => a + p.g, 0) / 4,
    b: patches.reduce((a, p) => a + p.b, 0) / 4,
  };

  let minX = W, minY = H, maxX = 0, maxY = 0;
  const step = 2;
  let hit = 0;
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const c = Jimp.intToRGBA(img.getPixelColor(x, y));
      if (dist(c, bg) > 2600) {
        hit++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bboxW = maxX - minX, bboxH = maxY - minY;
  console.log(`image ${W}x${H}, non-bg hits ${hit}, bbox ${minX},${minY} ${bboxW}x${bboxH}, bg`, bg);
  // circle bbox should be near-square; tighten to the larger span
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  let side = Math.max(bboxW, bboxH) * 0.99;
  side = Math.min(side, W, H);
  // avoid circular: only trust bbox if reasonably sized
  if (bboxW < W * 0.25 || bboxH < H * 0.25) {
    side = Math.min(W, H) * 0.74;
  }
  return { x: cx - side / 2, y: cy - side / 2, side, cx, cy };
}

async function main() {
  const src = CANDIDATES.find((p) => existsSync(p));
  if (!src) {
    console.log("MISSING: no reference photo found. Place it at film/assets/source.jpg");
    process.exit(0);
  }
  console.log("using reference:", src);
  mkdirSync(OUT, { recursive: true });
  mkdirSync(DIAG, { recursive: true });

  const img = await Jimp.read(src);
  const { width: W0, height: H0 } = img.bitmap;
  const circle = await detectCircle(img);

  // safe crop inside image bounds
  const x = Math.max(0, Math.min(W0 - circle.side, circle.x));
  const y = Math.max(0, Math.min(H0 - circle.side, circle.y - circle.side * 0.02));
  const crop = img.clone().crop(Math.round(x), Math.round(y), Math.round(circle.side), Math.round(circle.side));
  crop.resize(1080, 1080, Jimp.RESIZE_BICUBIC);
  crop.quality(94);
  await crop.writeAsync(join(DIAG, "diag-crop-raw.jpg"));

  // ---- grade: obsidian, cool shadows, keep skin warm ----------------------
  crop
    .brightness(-0.05)
    .contrast(0.18)
    .color([
      { apply: "desaturate", params: [12] },
      { apply: "mix", params: ["#0a0e22", 16] }, // cool the whole frame slightly
    ])
    .contrast(0.06);

  // per-pixel: cool shadows, preserve mids/highlights, vignette, grain
  let seed = 771;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const S = 1080;
  crop.scan(0, 0, S, S, function (x, y, idx) {
    const data = this.bitmap.data;
    let r = data[idx], g = data[idx + 1], b = data[idx + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // elliptical cinematic vignette, strongest at corners
    const dx = (x - S * 0.5) / (S * 0.52);
    const dy = (y - S * 0.46) / (S * 0.62);
    const dd = Math.min(1, dx * dx + dy * dy);
    const vig = 1 - Math.pow(dd, 1.7) * 0.92;
    // cool the darks
    if (lum < 90) {
      b += (90 - lum) * 0.18;
      r -= (90 - lum) * 0.06;
    }
    r *= vig; g *= vig; b *= Math.min(1, vig + 0.06);
    // fine grain
    const n = (rnd() - 0.5) * 7;
    data[idx] = Math.max(0, Math.min(255, r + n));
    data[idx + 1] = Math.max(0, Math.min(255, g + n));
    data[idx + 2] = Math.max(0, Math.min(255, b + n));
  });

  await crop.writeAsync(join(OUT, "portrait-crop.jpg"));
  console.log("wrote public/assets/portrait-crop.jpg");
  writeFileSync(
    join(DIAG, "plate-meta.json"),
    JSON.stringify({ source: src, sourceSize: [W0, H0], circle }, null, 2)
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
