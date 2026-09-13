// ---------------------------------------------------------------------------
// Global timeline constants for the 40-second portfolio film
// 24 fps, 960 frames. Everything in the film is derived deterministically.
// ---------------------------------------------------------------------------

export const FPS = 24;
export const DURATION_S = 40;
export const TOTAL_FRAMES = FPS * DURATION_S; // 960
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const s = (seconds: number) => Math.round(seconds * FPS);

// Scene windows (seconds) ----------------------------------------------------
export const SCENES = {
  person: { start: 0.0, end: 5.0 },
  mind: { start: 5.0, end: 10.0 },
  atlas: { start: 10.0, end: 15.0 },
  omni: { start: 15.0, end: 20.0 },
  training: { start: 20.0, end: 24.0 },
  interface: { start: 24.0, end: 29.0 },
  workbench: { start: 29.0, end: 34.0 },
  universe: { start: 34.0, end: 38.0 },
  identity: { start: 38.0, end: 40.0 },
} as const;

// Master morph layout windows. Each layout eases in across a transition band.
// Each world holds at full strength until the next world arrives, then the two
// briefly coexist during a semantic morph (dissolve band overlaps next appear).
export const LAYOUTS = {
  seed: { appear: 1.6, hold: 3.0, dissolve: 5.4 },
  mind: { appear: 4.8, hold: 9.4, dissolve: 10.7 },
  atlas: { appear: 9.4, hold: 13.9, dissolve: 15.5 },
  omni: { appear: 13.9, hold: 19.6, dissolve: 20.8 },
  training: { appear: 19.6, hold: 23.4, dissolve: 24.6 },
  interface: { appear: 23.8, hold: 28.6, dissolve: 29.6 },
  workbench: { appear: 28.8, hold: 34.0, dissolve: 35.4 },
  universe: { appear: 34.0, hold: 37.6, dissolve: 40.0 },
} as const;

// Voice-over schedule (seconds). Clips are tempo-normalized by tools/make-audio.mjs
export interface VoClip {
  id: string;
  src: string;
  start: number; // seconds
  duration: number; // seconds (post tempo)
}

export const VO: VoClip[] = [
  { id: "vo-01", src: "audio/vo-01-t.mp3", start: 0.9, duration: 3.168 },
  { id: "vo-02", src: "audio/vo-02-t.mp3", start: 5.2, duration: 3.216 },
  { id: "vo-03", src: "audio/vo-03-t.mp3", start: 10.0, duration: 4.824 },
  { id: "vo-04", src: "audio/vo-04-t.mp3", start: 15.4, duration: 5.616 },
  { id: "vo-05", src: "audio/vo-05-t.mp3", start: 21.2, duration: 4.584 },
  { id: "vo-06", src: "audio/vo-06-t.mp3", start: 26.2, duration: 2.568 },
  { id: "vo-07", src: "audio/vo-07-t.mp3", start: 29.2, duration: 2.208 },
  { id: "vo-08", src: "audio/vo-08-t.mp3", start: 32.0, duration: 1.92 },
  { id: "vo-09", src: "audio/vo-09-t.mp3", start: 34.45, duration: 1.824 },
  { id: "vo-10", src: "audio/vo-10-t.mp3", start: 36.3, duration: 1.776 },
  { id: "vo-11", src: "audio/vo-11-t.mp3", start: 38.35, duration: 1.56 },
];

// Palette --------------------------------------------------------------------
export const C = {
  bg: "#05060b",
  violet: "#8b5cf6",
  violetSoft: "#a78bfa",
  cyan: "#22d3ee",
  emerald: "#34d399",
  amber: "#f59e0b",
  white: "#eef1ff",
  dim: "#5b6486",
};

// Deterministic PRNG ---------------------------------------------------------
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gaussian(rand: () => number) {
  // Box-Muller
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
