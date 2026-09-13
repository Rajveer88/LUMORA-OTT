// ---------------------------------------------------------------------------
// Deterministic sound design for the portfolio film.
// No external audio: synthesizes a 40.2s stereo bed (room tone, electrical
// texture, computational pulses, drones, whooshes, UI clicks, impacts) and
// tempo-normalizes the voice-over clips.
// ---------------------------------------------------------------------------
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUD = join(ROOT, "public", "audio");
const SR = 48000;
const DUR = 40.2;
const N = Math.floor(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

const f2i = (s) => Math.floor(s * SR);

// --- deterministic noise ----------------------------------------------------
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry(7319);
const white = new Float32Array(SR * 2);
for (let i = 0; i < white.length; i++) white[i] = rnd() * 2 - 1;
let brown = 0;
const brownN = new Float32Array(SR * 2);
for (let i = 0; i < brownN.length; i++) {
  const w = rnd() * 2 - 1;
  brown = (brown + 0.02 * w) / 1.02;
  brownN[i] = brown * 3.5;
}
function noiseAt(buf, i) {
  return buf[((i % buf.length) + buf.length) % buf.length];
}

// --- RBJ biquad -------------------------------------------------------------
function biquad(type, fc, Q = 0.707, gainDb = 0) {
  let b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  const w0 = (2 * Math.PI * fc) / SR;
  const cosw = Math.cos(w0), sinw = Math.sin(w0);
  const alpha = sinw / (2 * Q);
  const A = Math.pow(10, gainDb / 40);
  let b0n, b1n, b2n, a0n, a1n, a2n;
  if (type === "lp") {
    b0n = (1 - cosw) / 2; b1n = 1 - cosw; b2n = (1 - cosw) / 2;
    a0n = 1 + alpha; a1n = -2 * cosw; a2n = 1 - alpha;
  } else if (type === "hp") {
    b0n = (1 + cosw) / 2; b1n = -(1 + cosw); b2n = (1 + cosw) / 2;
    a0n = 1 + alpha; a1n = -2 * cosw; a2n = 1 - alpha;
  } else if (type === "bp") {
    b0n = alpha; b1n = 0; b2n = -alpha;
    a0n = 1 + alpha; a1n = -2 * cosw; a2n = 1 - alpha;
  } else {
    throw new Error(type);
  }
  b0 = b0n / a0n; b1 = b1n / a0n; b2 = b2n / a0n; a1 = a1n / a0n; a2 = a2n / a0n;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x) => {
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

// --- voices -----------------------------------------------------------------
function addMono(buf, startS, src, gain = 1, pan = 0) {
  const i0 = f2i(startS);
  const pl = Math.cos((pan + 1) * Math.PI * 0.25);
  const pr = Math.sin((pan + 1) * Math.PI * 0.25);
  for (let i = 0; i < src.length; i++) {
    const idx = i0 + i;
    if (idx < 0 || idx >= N) continue;
    L[idx] += src[i] * gain * pl;
    R[idx] += src[i] * gain * pr;
  }
}

function envI(n, a, d, s = 0, r = 0, sus = 0.7) {
  // a/d/r in samples
  const e = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v;
    if (i < a) v = i / Math.max(1, a);
    else if (i < a + d) v = 1 - (1 - sus) * ((i - a) / Math.max(1, d));
    else if (i > n - r) v = sus * ((n - i) / Math.max(1, r));
    else v = sus;
    e[i] = v;
  }
  return e;
}

function sineEnv(seconds, freq, fEnd, env, type = "sine") {
  const n = f2i(seconds);
  const out = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const f = freq + (fEnd - freq) * t;
    ph += (2 * Math.PI * f) / SR;
    let v;
    if (type === "sine") v = Math.sin(ph);
    else if (type === "tri") v = Math.asin(Math.sin(ph)) * (2 / Math.PI);
    else v = Math.tanh(2 * Math.sin(ph));
    out[i] = v * env[i];
  }
  return out;
}

function noiseBurst(seconds, envFn, filterType = "lp", fc0 = 1000, fc1 = 1000, Q = 1) {
  const n = f2i(seconds);
  const out = new Float32Array(n);
  const f = biquad(filterType, fc0, Q);
  const off = f2i(rnd() * 100);
  for (let i = 0; i < n; i++) {
    // dynamic fc: re-create filter per-block cheaply by interpolating coeffs is
    // complex; instead sweep via fractional oversample blend of two filters
    out[i] = f(noiseAt(white, i + off)) * envFn(i, n);
  }
  return out;
}

// Swept band: render three fixed bandpasses and crossfade isn't trivial, so
// implement time-varying biquad directly:
function noiseSweep(seconds, fcStart, fcEnd, q, gainFn, type = "bp", src = white) {
  const n = f2i(seconds);
  const out = new Float32Array(n);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  const off = f2i(rnd() * 1000);
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const fc = fcStart * Math.pow(fcEnd / fcStart, t);
    const w0 = (2 * Math.PI * fc) / SR;
    const cosw = Math.cos(w0), sinw = Math.sin(w0);
    const alpha = sinw / (2 * q);
    let b0, b1, b2, a0, a1, a2;
    if (type === "bp") {
      b0 = alpha; b1 = 0; b2 = -alpha;
    } else { // lp
      b0 = (1 - cosw) / 2; b1 = 1 - cosw; b2 = (1 - cosw) / 2;
    }
    a0 = 1 + alpha; a1 = -2 * cosw; a2 = 1 - alpha;
    b0 /= a0; b1 /= a0; b2 /= a0; a1 /= a0; a2 /= a0;
    const x = noiseAt(src, i + off);
    const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    out[i] = y * gainFn(t, i);
  }
  return out;
}

// --- continuous beds --------------------------------------------------------
function buildBed() {
  // brown room tone, swelling subtly
  const roomLp = biquad("lp", 220, 0.5);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const swell = 0.75 + 0.25 * Math.sin(2 * Math.PI * t / 17 + 1.3);
    const v = roomLp(noiseAt(brownN, i)) * 0.5;
    const g = 0.105 * swell;
    L[i] += v * g; R[i] += v * g;
  }
  // high electrical texture (appears with the mind ~4.5, stays, changes color)
  const elecHp = biquad("hp", 2600, 0.9);
  const elecBp = biquad("bp", 6200, 4);
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const env =
      Math.min(1, Math.max(0, (t - 4.4) / 2)) *
      (t > 37.9 ? Math.max(0, 1 - (t - 37.9) / 0.5) : 1);
    const lfo = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(2 * Math.PI * t / 3.1));
    const x = noiseAt(white, i);
    const v = elecHp(x) * 0.5 + elecBp(x) * 0.5;
    const g = 0.022 * env * lfo;
    // gentle stereo drift
    L[i] += v * g * (0.85 + 0.15 * Math.sin(2 * Math.PI * t / 7.7));
    R[i] += v * g * (0.85 + 0.15 * Math.cos(2 * Math.PI * t / 6.3));
  }
}

// --- drones -----------------------------------------------------------------
const SECTIONS = [
  // start, end, rootHz, partials[], gain
  { a: 0.0, b: 5.0, root: 55, partials: [[1, 0.4]], g: 0.0, det: 4 },
  { a: 5.0, b: 10.0, root: 55, partials: [[1, 0.5], [2, 0.18], [3.01, 0.07]], g: 0.052, det: 6 },
  { a: 10.0, b: 15.0, root: 55, partials: [[1, 0.55], [1.5, 0.16], [2, 0.22], [3, 0.08]], g: 0.07, det: 7 },
  { a: 15.0, b: 20.0, root: 49.0, partials: [[1, 0.6], [2, 0.2], [2.5, 0.1]], g: 0.072, det: 6 },
  { a: 20.0, b: 24.0, root: 46.25, partials: [[1, 0.62], [2, 0.14], [2.02, 0.1]], g: 0.078, det: 9 },
  { a: 24.0, b: 29.0, root: 52.0, partials: [[1, 0.5], [2, 0.2], [3, 0.12], [3.75, 0.07]], g: 0.06, det: 5 },
  { a: 29.0, b: 34.0, root: 55, partials: [[1, 0.55], [2, 0.2], [3, 0.1], [1.5, 0.12]], g: 0.074, det: 7 },
  { a: 34.0, b: 38.1, root: 55, partials: [[1, 0.75], [2, 0.3], [3, 0.14], [1.5, 0.2], [4, 0.06]], g: 0.105, det: 10 },
  { a: 38.1, b: 40.2, root: 55, partials: [[1, 0.6]], g: 0.032, det: 3 },
];
function buildDrones() {
  for (const sec of SECTIONS) {
    const len = sec.b - sec.a;
    const n = f2i(len);
    const mix = new Float32Array(n);
    for (const [mult, amp] of sec.partials) {
      const f = sec.root * mult;
      let ph1 = 0, ph2 = 0;
      const d1 = 1 + (rnd() - 0.5) * 0.002;
      for (let i = 0; i < n; i++) {
        ph1 += (2 * Math.PI * f * d1) / SR;
        ph2 += (2 * Math.PI * f / d1) / SR;
        mix[i] += (Math.sin(ph1) + Math.sin(ph2)) * 0.5 * amp;
      }
    }
    // slow amplitude breathing + crossfade edges
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const breathe = 0.8 + 0.2 * Math.sin(2 * Math.PI * t / 5.3 + sec.a);
      const edge = Math.min(1, i / f2i(1.4), (n - i) / f2i(1.6));
      mix[i] *= breathe * edge * sec.g;
    }
    addMono(L, sec.a, mix, 1, 0);
    addMono(R, sec.a, mix, 1, 0);
  }
}

// --- blips / pulses ---------------------------------------------------------
const PENT_A = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33];
const PENT_E = [196, 246.94, 293.66, 329.63, 369.99, 493.88, 587.33];
const PENT_C = [261.63, 329.63, 392, 440, 523.25, 659.25, 783.99];
function blip(freq, seconds = 0.22, type = "sine", bright = 0.12) {
  const n = f2i(seconds);
  const e = envI(n, f2i(0.008), f2i(0.05), 0, n - f2i(0.008), 0);
  const body = sineEnv(seconds, freq, freq * 0.995, e, type);
  // add a quiet octave shimmer
  const sh = sineEnv(seconds, freq * 2, freq * 2, e.map((v) => v * 0.25));
  for (let i = 0; i < n; i++) body[i] = body[i] * (1 - bright) + sh[i] * bright;
  return body;
}

function scheduleBlips() {
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  // sparse mind pulses 5.2-9.8
  for (let t = 5.4; t < 9.8; t += 0.7 + rnd() * 0.9) {
    addMono(L, t, blip(pick(PENT_A.slice(0, 4)), 0.3), 0.05, (rnd() - 0.5) * 1.2);
    addMono(R, t, blip(pick(PENT_A.slice(0, 4)), 0.3), 0.05, (rnd() - 0.5) * 1.2);
  }
  // atlas: denser filament chatter, spatial
  for (let t = 10.6; t < 14.8; t += 0.32 + rnd() * 0.5) {
    const pan = Math.sin(t * 1.3) * 0.9;
    addMono(L, t, blip(pick(PENT_A), 0.24, "tri", 0.18), 0.052, pan);
    addMono(R, t, blip(pick(PENT_A), 0.24, "tri", 0.18), 0.052, pan);
  }
  // omni: regular routing ticks, alternating channels, plus flowing triplets
  let k = 0;
  for (let t = 15.9; t < 19.7; t += 0.36) {
    const pan = k % 2 ? 0.75 : -0.75;
    addMono(L, t, blip(pick(PENT_E.slice(0, 5)), 0.16), 0.04, pan);
    addMono(R, t, blip(pick(PENT_E.slice(0, 5)), 0.16), 0.04, pan);
    k++;
  }
  for (let t = 17.4; t < 19.6; t += 0.9) {
    for (let j = 0; j < 3; j++) {
      addMono(L, t + j * 0.09, blip(PENT_E[4 + (j % 3)], 0.14, "tri", 0.2), 0.03, -0.9 + j * 0.9);
      addMono(R, t + j * 0.09, blip(PENT_E[4 + (j % 3)], 0.14, "tri", 0.2), 0.03, -0.9 + j * 0.9);
    }
  }
  // training: cascading data quantizations, machine-like
  for (let t = 20.4; t < 23.8; t += 0.22 + rnd() * 0.25) {
    const step = Math.floor(rnd() * 5);
    addMono(L, t, blip(330 + step * 55 + (rnd() < 0.3 ? 120 : 0), 0.12, "square", 0.05), 0.028, (rnd() - 0.5) * 0.6 - 0.2);
    addMono(R, t, blip(330 + step * 55 + (rnd() < 0.3 ? 120 : 0), 0.12, "square", 0.05), 0.028, (rnd() - 0.5) * 0.6 - 0.2);
  }
  // activation wave at ~22.6: rising arpeggio
  for (let j = 0; j < 6; j++) {
    addMono(L, 22.4 + j * 0.13, blip(PENT_A[j % PENT_A.length], 0.3, "tri", 0.2), 0.05, -0.4 + j * 0.16);
    addMono(R, 22.4 + j * 0.13, blip(PENT_A[j % PENT_A.length], 0.3, "tri", 0.2), 0.05, -0.4 + j * 0.16);
  }
  // interface: delicate UI clicks / taps, brighter
  for (let t = 24.4; t < 28.8; t += 0.28 + rnd() * 0.4) {
    addMono(L, t, blip(pick(PENT_C), 0.12, "tri", 0.3), 0.035, (rnd() - 0.5) * 1.4);
    addMono(R, t, blip(pick(PENT_C), 0.12, "tri", 0.3), 0.035, (rnd() - 0.5) * 1.4);
  }
  // workbench: motifs of all worlds returning, sparse, round
  for (let t = 29.6; t < 33.9; t += 0.55 + rnd() * 0.6) {
    const scale = rnd() < 0.5 ? PENT_A : PENT_C;
    addMono(L, t, blip(pick(scale), 0.28), 0.042, (rnd() - 0.5) * 1.1);
    addMono(R, t, blip(pick(scale), 0.28), 0.042, (rnd() - 0.5) * 1.1);
  }
  // hand activation ripple 32.4
  for (let j = 0; j < 8; j++) {
    const t = 32.45 + j * 0.11;
    addMono(L, t, blip(392 + j * 55, 0.4, "tri", 0.25), 0.05, -0.8 + j * 0.23);
    addMono(R, t, blip(392 + j * 55, 0.4, "tri", 0.25), 0.05, -0.8 + j * 0.23);
  }
  // universe: slow high shimmer stars
  for (let t = 34.8; t < 37.9; t += 0.5 + rnd() * 0.7) {
    addMono(L, t, blip(pick([523.25, 659.25, 783.99, 880, 1046.5]), 0.5, "sine", 0.35), 0.045, (rnd() - 0.5) * 1.5);
    addMono(R, t, blip(pick([523.25, 659.25, 783.99, 880, 1046.5]), 0.5, "sine", 0.35), 0.045, (rnd() - 0.5) * 1.5);
  }
  // faint trace blips after the cut
  addMono(L, 38.7, blip(523.25, 0.5, "sine", 0.3), 0.02, 0.4);
  addMono(R, 38.7, blip(523.25, 0.5, "sine", 0.3), 0.02, 0.4);
  addMono(L, 39.4, blip(659.25, 0.5, "sine", 0.3), 0.016, -0.5);
  addMono(R, 39.4, blip(659.25, 0.5, "sine", 0.3), 0.016, -0.5);
}

// --- whooshes, impacts, clicks ----------------------------------------------
function whoosh(t, dur = 1.3, pan = 0, up = true, g = 0.5) {
  const src = noiseSweep(
    dur,
    up ? 180 : 5200,
    up ? 5200 : 160,
    1.4,
    (tt) => Math.sin(Math.PI * tt) * g,
    "bp"
  );
  addMono(L, t, src, 1, pan);
  addMono(R, t, src, 1, pan);
  // airy top
  const air = noiseSweep(dur, up ? 1200 : 9000, up ? 9000 : 900, 3, (tt) => Math.sin(Math.PI * tt) * g * 0.4, "bp");
  addMono(L, t, air, 1, pan * 0.6);
  addMono(R, t, air, 1, pan * 0.6);
}
function impact(t, g = 1) {
  // sub drop
  const n = f2i(2.4);
  const sub = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const tt = i / SR;
    const f = 62 * Math.exp(-tt * 1.6) + 36;
    ph += (2 * Math.PI * f) / SR;
    const e = Math.exp(-tt * 1.5);
    sub[i] = Math.sin(ph) * e * 0.9 * g;
  }
  addMono(L, t, sub, 1, 0); addMono(R, t, sub, 1, 0);
  // crack
  const crack = noiseSweep(0.5, 4000, 120, 1.2, (tt) => Math.exp(-tt * 7) * 0.5 * g, "lp");
  addMono(L, t, crack, 1, 0); addMono(R, t, crack, 1, 0);
  // rising shimmer tail
  const sh = noiseSweep(2.6, 600, 3200, 2.5, (tt) => Math.pow(tt, 1.5) * Math.exp(-tt * 1.1) * 0.22 * g, "bp");
  addMono(L, t, sh, 1, -0.3); addMono(R, t, sh, 1, 0.3);
}
function click(t, g = 0.4, pan = 0) {
  const n = f2i(0.05);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = (white[(i + f2i(t)) & (white.length - 1)] * 0.6 + Math.sin(2 * Math.PI * 2400 * (i / SR))) * Math.exp(-i / (SR * 0.006)) * g;
  }
  addMono(L, t, out, 1, pan); addMono(R, t, out, 1, pan);
}
function tonalMotif(t, freqs, dur = 2.2, g = 0.05) {
  for (let k = 0; k < freqs.length; k++) {
    const n = f2i(dur);
    const e = envI(n, f2i(0.25), f2i(0.6), f2i(0.4), 0.85);
    const o = sineEnv(dur, freqs[k], freqs[k], e, "sine");
    const pan = (k - (freqs.length - 1) / 2) * 0.35;
    addMono(L, t, o, g, pan); addMono(R, t, o, g, pan);
  }
}

function scheduleFx() {
  whoosh(4.7, 1.4, -0.4, true, 0.34);            // mind awakens
  whoosh(9.55, 1.5, 0.3, true, 0.4);            // into atlas
  tonalMotif(10.7, [220, 329.63, 440, 554.37], 2.6, 0.045); // atlas reveal (Am add)
  whoosh(12.4, 1.6, 0, true, 0.5);              // "places" thrust (12.9)
  whoosh(14.55, 1.4, 0.5, false, 0.42);         // dissolve to omni
  tonalMotif(15.7, [196, 293.66, 392, 493.88], 2.4, 0.042); // omni resolve (G/Em color)
  whoosh(19.5, 1.2, -0.3, true, 0.38);          // collapse to training
  tonalMotif(20.4, [174.61, 261.63, 349.23], 2.2, 0.04);    // machine (F)
  whoosh(23.7, 1.3, 0.35, false, 0.4);          // output -> interface
  tonalMotif(24.3, [261.63, 392, 523.25, 587.33], 2.4, 0.04); // interface bright
  // ui click clusters at label/panel appearances
  [24.6, 25.3, 26.0, 26.9, 27.6, 28.3].forEach((t, i) => click(t, 0.18, -0.5 + (i % 3) * 0.5));
  whoosh(28.7, 1.9, 0, true, 0.5);              // collapse to workbench
  tonalMotif(29.4, [220, 329.63, 440], 2.4, 0.05);
  whoosh(32.3, 0.9, 0, true, 0.3);              // hand activation
  click(32.5, 0.25, 0);
  impact(34.32, 1.0);                           // THE unifying reveal
  tonalMotif(34.9, [110, 220, 329.63, 440, 554.37, 659.25], 3.1, 0.05);
  // identity cut: everything ducks with a soft low-pass feel (handled by master);
  // a single warm pad note
  tonalMotif(38.3, [220, 329.63], 1.8, 0.035);
  // tiny label clicks during mind instrumentation
  [6.6, 7.2, 7.8, 8.4, 9.0].forEach((t, i) => click(t, 0.12, -0.8 + i * 0.4));
  // atlas labels
  [11.6, 12.1].forEach((t, i) => click(t, 0.14, -0.3 + i * 0.6));
  // omni providers
  [16.6, 16.9, 17.2, 17.5, 17.8, 18.1, 18.4].forEach((t, i) => click(t, 0.12, -0.9 + i * 0.3));
  // training annotations
  [20.8, 21.2, 21.6, 22.9, 23.2].forEach((t, i) => click(t, 0.1, -0.4 + (i % 3) * 0.4));
}

// --- master -----------------------------------------------------------------
function master() {
  // duck the world when the intimate portrait cut happens (38.05), fade tail
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    // soft global fade in
    const fin = Math.min(1, t / 1.2);
    // final fade to silence
    let fout = 1;
    if (t > 39.55) fout = Math.max(0, 1 - (t - 39.55) / 0.5);
    // gentle dip at identity cut, then slight recovery
    let duck = 1;
    if (t > 37.95 && t < 38.5) duck = 1 - 0.75 * Math.sin(Math.PI * Math.min(1, (t - 37.95) / 0.55));
    L[i] *= fin * fout * duck;
    R[i] *= fin * fout * duck;
  }
  // simple peak protection
  let peak = 0;
  for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const ceiling = 0.62;
  const g = Math.min(1, ceiling / (peak + 1e-6));
  for (let i = 0; i < N; i++) {
    L[i] = Math.tanh(L[i] * g * 1.1) * 0.9;
    R[i] = Math.tanh(R[i] * g * 1.1) * 0.9;
  }
}

function writeWav(path, lc, rc) {
  const n = lc.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const li = Math.max(-1, Math.min(1, lc[i]));
    const ri = Math.max(-1, Math.min(1, rc[i]));
    buf.writeInt16LE(Math.round(li * 32760), 44 + i * 4);
    buf.writeInt16LE(Math.round(ri * 32760), 46 + i * 4);
  }
  writeFileSync(path, buf);
}

// --- VO normalization -------------------------------------------------------
const FFMPEG = join(ROOT, "node_modules", "@remotion", "compositor-linux-x64-gnu", "ffmpeg");
const TEMPO = { "01": 1.045, "02": 1.1, "03": 1.1, "04": 1.16, "05": 1.16, "06": 1.1, "07": 1.1, "08": 1.12, "09": 1.055, "10": 1.057, "11": 1.0 };

function pcmInfo(path) {
  // decode to mono s16 wav @24k, find leading/trailing silence boundaries
  const raw = execFileSync(FFMPEG, ["-i", path, "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", "-f", "wav", "-"], {
    maxBuffer: 1024 * 1024 * 64,
  });
  // locate data chunk
  let off = 12;
  let pcm = null;
  while (off + 8 <= raw.length) {
    const id = raw.toString("ascii", off, off + 4);
    const size = raw.readUInt32LE(off + 4);
    if (id === "data") { pcm = raw.subarray(off + 8, off + 8 + size); break; }
    off += 8 + size + (size & 1);
  }
  if (!pcm) throw new Error("no data chunk in " + path);
  const n = Math.floor(pcm.length / 2);
  const data = new Float32Array(n);
  for (let i = 0; i < n; i++) data[i] = pcm.readInt16LE(i * 2) / 32768;
  const SRR = 24000;
  const thresh = 0.006; // ~ -44 dBFS
  // 40 ms rolling energy window
  const win = Math.floor(SRR * 0.04);
  const energyAt = (center) => {
    let e = 0;
    for (let i = center - win; i < center + win; i++) {
      if (i >= 0 && i < n) e += data[i] * data[i];
    }
    return Math.sqrt(e / (2 * win));
  };
  let start = 0;
  for (let i = 0; i < n; i += 240) {
    if (energyAt(i) > thresh) { start = Math.max(0, i / SRR - 0.05); break; }
  }
  let end = n / SRR;
  for (let i = n; i > 0; i -= 240) {
    if (energyAt(i) > thresh) { end = Math.min(n / SRR, i / SRR + 0.22); break; }
  }
  return { duration: n / SRR, start, end };
}

function processVo() {
  mkdirSync(AUD, { recursive: true });
  const FFPROBE = FFMPEG.replace("ffmpeg", "ffprobe");
  const result = [];
  for (const [id, tempo] of Object.entries(TEMPO)) {
    const src = join(AUD, `vo-${id}.mp3`);
    const dst = join(AUD, `vo-${id}-t.mp3`);
    if (!existsSync(src)) { console.log(`skip vo-${id} (missing)`); continue; }
    const { start, end } = pcmInfo(src);
    const af = `atrim=start=${start.toFixed(3)}:end=${end.toFixed(3)},atempo=${tempo.toFixed(4)},apad=pad_dur=0.14`;
    execFileSync(
      FFMPEG,
      ["-y", "-i", src, "-af", af, "-c:a", "libmp3lame", "-q:a", "3", dst],
      { stdio: "ignore" }
    );
    const out = execFileSync(
      FFPROBE,
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst],
      { encoding: "utf8" }
    ).trim();
    console.log(`vo-${id}: trimmed ${start.toFixed(2)}->${end.toFixed(2)} tempo ${tempo} => ${parseFloat(out).toFixed(3)}s`);
    result.push({ id: `vo-${id}`, duration: parseFloat(out) });
  }
  writeFileSync(join(AUD, "vo-timing.json"), JSON.stringify(result, null, 2));
}

buildBed();
buildDrones();
scheduleBlips();
scheduleFx();
master();
mkdirSync(AUD, { recursive: true });
writeWav(join(AUD, "bed.wav"), L, R);
console.log("bed.wav written", DUR + "s");
processVo();
console.log("done");
