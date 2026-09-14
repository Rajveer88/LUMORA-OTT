import * as THREE from "three";
import { mulberry32 } from "../timeline";

const ACCENTS = ["#8b5cf6", "#22d3ee", "#34d399", "#f59e0b", "#a78bfa"];

const CODE_SNIPPETS = [
  [
    "export const router = createOmniRoute({",
    "  providers: [cerebras, openrouter, nim],",
    "  strategy: 'latency-first',",
    "  fallback: pollinations,",
    "});",
  ],
  [
    "const graph = await codeatlas.traverse({",
    "  root: 'auth_service',",
    "  depth: 4,",
    "  kind: ['imports', 'rpc'],",
    "});",
  ],
  [
    "model = LoraModel.from_pretrained(",
    "  'mini-soup-410m',",
    "  load_in_4bit=True,",
    "  r=16, lora_alpha=32,",
    ");",
  ],
  [
    "function MorphCanvas({ nodes, edges }) {",
    "  const sim = useForceLayout(graph);",
    "  return <Graph3D sim={sim} focus={node} />;",
    "}",
  ],
  [
    "stream = router.complete({",
    "  model: 'nim/llama-3',",
    "  tools: [search, render, query],",
    "  onToken: paint,",
    "});",
  ],
];

function panelFrame(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, title: string) {
  ctx.fillStyle = "rgba(8,10,20,0.92)";
  ctx.fillRect(0, 0, w, h);
  // border
  ctx.strokeStyle = accent + "55";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);
  // header
  ctx.fillStyle = accent + "14";
  ctx.fillRect(0, 0, w, 38);
  ctx.fillStyle = accent;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(18 + i * 14, 19, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = "500 15px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#aeb8e8";
  ctx.textAlign = "left";
  ctx.fillText(title, 56, 24);
  ctx.strokeStyle = accent + "33";
  ctx.beginPath();
  ctx.moveTo(0, 38.5);
  ctx.lineTo(w, 38.5);
  ctx.stroke();
}

export function makePanelTexture(kind: number, seed = 1): THREE.CanvasTexture {
  const w = 512;
  const h = 340;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const accent = ACCENTS[seed % ACCENTS.length];
  const titles = ["omni/route.ts", "atlas/telemetry", "graph/topology", "train/config", "model/output"];
  panelFrame(ctx, w, h, accent, titles[kind % titles.length]);

  if (kind === 0) {
    // code
    const lines = CODE_SNIPPETS[seed % CODE_SNIPPETS.length];
    ctx.font = "17px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    lines.forEach((line, i) => {
      const y = 76 + i * 30;
      ctx.fillStyle = "#3d466e";
      ctx.fillText(String(i + 1).padStart(2, " "), 22, y);
      // crude token coloring
      const tokens = line.split(/([{}(),'[\]])/);
      let x = 64;
      tokens.forEach((tok) => {
        if (/export|const|function|return|await/.test(tok)) ctx.fillStyle = "#c084fc";
        else if (/'[^']*'/.test(tok)) ctx.fillStyle = "#6ee7b7";
        else if (/[{}()\[\],]/.test(tok)) ctx.fillStyle = "#8d97c4";
        else if (/OmniRoute|codeatlas|LoraModel|Graph3D|MorphCanvas/.test(tok)) ctx.fillStyle = "#7dd3fc";
        else ctx.fillStyle = "#d6ddff";
        ctx.fillText(tok, x, y);
        x += ctx.measureText(tok).width;
      });
    });
  } else if (kind === 1) {
    // dashboard
    const rng = mulberry32(seed * 99 + 7);
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#5b6486";
    ctx.fillText("P95 ROUTE LATENCY", 26, 72);
    ctx.font = "300 46px 'Inter', sans-serif";
    ctx.fillStyle = "#eef1ff";
    ctx.fillText("38ms", 24, 118);
    ctx.font = "14px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#5b6486";
    ctx.fillText("CACHE HIT", 280, 72);
    ctx.font = "300 46px 'Inter', sans-serif";
    ctx.fillStyle = accent;
    ctx.fillText("99.8%", 278, 118);
    // area chart
    ctx.beginPath();
    ctx.moveTo(24, 290);
    for (let i = 0; i <= 24; i++) {
      const x = 24 + (i / 24) * 464;
      const y = 250 - Math.sin(i * 0.7 + seed) * 34 - rng() * 36;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(488, 290);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 160, 0, 290);
    grad.addColorStop(0, accent + "55");
    grad.addColorStop(1, accent + "00");
    ctx.fillStyle = grad;
    ctx.fill();
    // bars
    for (let i = 0; i < 26; i++) {
      const bh = 10 + rng() * 42;
      ctx.fillStyle = i > 20 ? accent : accent + "66";
      ctx.fillRect(30 + i * 17.4, 300 - bh, 9, bh);
    }
  } else if (kind === 2) {
    // topology diagram
    const rng = mulberry32(seed * 31 + 3);
    const pts: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      pts.push([60 + rng() * 392, 66 + rng() * 236]);
    }
    ctx.strokeStyle = accent + "44";
    ctx.lineWidth = 1.2;
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = i % 5 === 0 ? [pts[i], pts[Math.floor(rng() * i)]] : [pts[i], pts[i - 1]];
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
    }
    pts.forEach(([x, y], i) => {
      ctx.beginPath();
      ctx.arc(x, y, i % 4 === 0 ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = i % 4 === 0 ? accent : "#8d97c4";
      ctx.fill();
      if (i % 4 === 0) {
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#aeb8e8";
        ctx.fillText("svc_" + i, x + 10, y + 4);
      }
    });
  } else if (kind === 3) {
    // training config controls
    const rows = [
      ["load_in_4bit", true],
      ["lora_rank", "16"],
      ["lora_alpha", "32"],
      ["temperature", "0.7"],
      ["max_tokens", "2048"],
      ["jsonl shards", "412"],
    ];
    ctx.font = "15px 'JetBrains Mono', monospace";
    rows.forEach(([label, val], i) => {
      const y = 74 + i * 40;
      ctx.fillStyle = "#8d97c4";
      ctx.textAlign = "left";
      ctx.fillText(String(label), 28, y);
      if (typeof val === "boolean") {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect?.(392, y - 16, 44, 20, 10);
        ctx.stroke();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(424, y - 6, 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.textAlign = "right";
        ctx.fillStyle = "#eef1ff";
        ctx.fillText(String(val), 480, y);
      }
      ctx.strokeStyle = "#1c2240";
      ctx.beginPath();
      ctx.moveTo(26, y + 14);
      ctx.lineTo(486, y + 14);
      ctx.stroke();
    });
    ctx.fillStyle = accent + "22";
    ctx.fillRect(28, 278, 200, 36);
    ctx.fillStyle = accent;
    ctx.font = "13px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("▶  run training step", 46, 301);
  } else {
    // model output stream
    ctx.font = "16px 'Inter', sans-serif";
    ctx.fillStyle = "#c7cff5";
    const text =
      "a codebase is a city of decisions; every import is a street, every service a district. navigate it like a place you know.";
    const words = text.split(" ");
    let line = "";
    let y = 70;
    words.forEach((wd) => {
      const test = line + wd + " ";
      if (ctx.measureText(test).width > 460) {
        ctx.fillText(line, 28, y);
        line = wd + " ";
        y += 30;
      } else line = test;
    });
    ctx.fillText(line, 28, y);
    ctx.fillStyle = accent;
    ctx.fillRect(30 + ctx.measureText(line).width * 0.8, y - 16, 9, 20);
    ctx.strokeStyle = accent + "44";
    ctx.beginPath();
    ctx.moveTo(26, 300);
    ctx.lineTo(486, 300);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}
