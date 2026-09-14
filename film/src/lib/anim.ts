import * as THREE from "three";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
export const smoother = (t: number) =>
  t * t * t * (t * (t * 6 - 15) + 10);

export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const expOut = (t: number) => 1 - Math.exp(-4 * t);

/** normalized progress inside a window, with smooth 0/1 edges */
export const windowEnv = (
  time: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number
) => {
  const fadeIn = smoothstep(inStart, inEnd, time);
  const fadeOut = 1 - smoothstep(outStart, outEnd, time);
  return Math.min(fadeIn, fadeOut);
};

/** envelope: 0 before start, 1 after end, smooth between */
export const rise = (time: number, start: number, end: number) =>
  smoothstep(start, end, time);

/** piecewise layout weight helper: layout active envelope */
export const layoutWeight = (
  time: number,
  appear: number,
  hold: number,
  dissolve: number
) => {
  const a = smoothstep(appear, hold, time);
  const b = 1 - smoothstep(hold + (dissolve - hold) * 0, dissolve, time);
  return clamp01(Math.min(a, b));
};

/** weighted vector blend between layouts */
export const blendPos = (
  layouts: { pos: THREE.Vector3; w: number }[]
): THREE.Vector3 => {
  const out = new THREE.Vector3();
  let tw = 0;
  for (const l of layouts) {
    out.addScaledVector(l.pos, l.w);
    tw += l.w;
  }
  if (tw > 1e-5) out.multiplyScalar(1 / tw);
  return out;
};

/** Catmull-Rom interpolation through Vector3 knots (uniform, non-uniform t) */
export const catmull = (
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  p3: THREE.Vector3,
  t: number
) => {
  const v = new THREE.Vector3();
  const t2 = t * t;
  const t3 = t2 * t;
  v.set(
    0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    0.5 *
      (2 * p1.z +
        (-p0.z + p2.z) * t +
        (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
        (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3)
  );
  return v;
};

export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));
