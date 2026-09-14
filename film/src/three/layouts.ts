// ---------------------------------------------------------------------------
// Layout generation for the master morphing graph.
// Nodes are one continuous population that reorganizes between semantic
// layouts: seed -> mind -> atlas -> omni -> training -> interface ->
// workbench -> universe. Edges are defined per layout and crossfade, so each
// transformation reads as the same object changing form.
// ---------------------------------------------------------------------------
import * as THREE from "three";
import { mulberry32, gaussian } from "../timeline";

export type LayoutName =
  | "seed"
  | "mind"
  | "atlas"
  | "omni"
  | "training"
  | "interface"
  | "workbench"
  | "universe";

export interface EdgeSet {
  segments: Float32Array; // xyz pairs
  colors: Float32Array; // rgb pairs
  name: LayoutName | "cross";
}

export interface NodeData {
  group: number; // 0..3, final ecosystem territory
  seed: number;
  cluster: number;
  layer: number;
  slot: number;
  phi: number;
  shell: number;
}

export interface WorldLayouts {
  nodes: NodeData[];
  positions: Record<LayoutName, Float32Array>;
  colors: Record<LayoutName, Float32Array>;
  alphaScale: Record<LayoutName, Float32Array>;
  sizes: Float32Array;
  seeds: Float32Array;
  edges: Partial<Record<LayoutName, EdgeSet>>;
  crossEdges: EdgeSet;
  // landmark positions used by sub-world components
  atlas: {
    clusters: THREE.Vector3[];
    hub: THREE.Vector3;
    auth: THREE.Vector3;
    authPath: THREE.Vector3[];
  };
  omni: {
    core: THREE.Vector3;
    endpoints: { pos: THREE.Vector3; label: string; hue: string }[];
  };
  training: {
    center: THREE.Vector3;
    layerZ: number[];
    layers: { pos: THREE.Vector3; rows: number; width: number; z: number }[];
  };
  interface: {
    center: THREE.Vector3;
    panels: { pos: THREE.Vector3; rotY: number; w: number; h: number; kind: number }[];
  };
  workbench: {
    anchors: THREE.Vector3[];
  };
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const COL = {
  violet: new THREE.Color("#8b5cf6"),
  violetSoft: new THREE.Color("#a78bfa"),
  cyan: new THREE.Color("#22d3ee"),
  emerald: new THREE.Color("#34d399"),
  amber: new THREE.Color("#f59e0b"),
  white: new THREE.Color("#e8ecff"),
  dim: new THREE.Color("#5b6486"),
};

function pushColor(arr: Float32Array, i: number, c: THREE.Color) {
  arr[i * 3] = c.r;
  arr[i * 3 + 1] = c.g;
  arr[i * 3 + 2] = c.b;
}

export const N_NODE = 640;

const ATLAS_C = V(0, 2.2, 8.3);
const OMNI_C = V(0, 2.0, 13.4);
const TRAIN_C = V(0, 2.05, 19.4);
const INTER_C = V(0, 2.15, 25.6);
const SEED_C = V(0, 1.62, 1.35);

export const CENTERS = {
  seed: SEED_C,
  mind: V(0, 1.8, 1.6),
  atlas: ATLAS_C,
  omni: OMNI_C,
  training: TRAIN_C,
  interface: INTER_C,
};

export function buildLayouts(): WorldLayouts {
  const rng = mulberry32(20260913);
  const nodes: NodeData[] = [];
  for (let i = 0; i < N_NODE; i++) {
    nodes.push({
      group: i % 4,
      seed: rng(),
      cluster: i % 7,
      layer: 0,
      slot: Math.floor(rng() * 9999),
      phi: rng() * Math.PI * 2,
      shell: rng(),
    });
  }

  const emptyPos = () => new Float32Array(N_NODE * 3);
  const positions: Record<LayoutName, Float32Array> = {
    seed: emptyPos(),
    mind: emptyPos(),
    atlas: emptyPos(),
    omni: emptyPos(),
    training: emptyPos(),
    interface: emptyPos(),
    workbench: emptyPos(),
    universe: emptyPos(),
  };
  const colors: Record<LayoutName, Float32Array> = {
    seed: emptyPos(),
    mind: emptyPos(),
    atlas: emptyPos(),
    omni: emptyPos(),
    training: emptyPos(),
    interface: emptyPos(),
    workbench: emptyPos(),
    universe: emptyPos(),
  };
  const alphaScale: Record<LayoutName, Float32Array> = {
    seed: new Float32Array(N_NODE).fill(1),
    mind: new Float32Array(N_NODE).fill(1),
    atlas: new Float32Array(N_NODE).fill(1),
    omni: new Float32Array(N_NODE).fill(1),
    training: new Float32Array(N_NODE).fill(1),
    interface: new Float32Array(N_NODE).fill(1),
    workbench: new Float32Array(N_NODE).fill(1),
    universe: new Float32Array(N_NODE).fill(1),
  };
  const sizes = new Float32Array(N_NODE);
  const seeds = new Float32Array(N_NODE);
  for (let i = 0; i < N_NODE; i++) {
    sizes[i] = 0.7 + nodes[i].seed * 1.6 + (nodes[i].seed > 0.93 ? 1.6 : 0);
    seeds[i] = nodes[i].seed;
  }

  // --- SEED: tiny ordered lattice, the first computational structure -------
  {
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N_NODE; i++) {
      const t = i / N_NODE;
      const r = 0.05 + 0.34 * Math.pow(t, 0.6);
      const theta = golden * i;
      const y = (1 - 2 * (i + 0.5) / N_NODE) * 0.3 * (0.4 + t);
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      positions.seed.set([SEED_C.x + x, SEED_C.y + y, SEED_C.z + z], i * 3);
      const s = nodes[i].seed;
      const c = s > 0.97 ? COL.white : s > 0.72 ? COL.cyan : COL.violet;
      pushColor(colors.seed, i, c);
      // the seed is a small, sparse lattice — most population joins later
      alphaScale.seed[i] = i < 150 ? 1 : 0.04;
    }
  }

  // --- MIND: architecture waking around the person, funneling forward -----
  {
    for (let i = 0; i < N_NODE; i++) {
      const u = nodes[i];
      let x: number, y: number, z: number;
      if (u.seed < 0.36) {
        // shell around the person
        const r = 1.5 + Math.pow(u.seed / 0.36, 0.8) * 3.6;
        const theta = u.phi;
        x = r * Math.cos(theta);
        z = 0.9 + r * 0.5 * Math.sin(theta);
        y = 1.85 + gaussian(rng) * 1.2;
      } else {
        // spiral funnel leading into the architecture ahead
        const tt = (u.seed - 0.36) / 0.64;
        z = 1.4 + tt * 8.1;
        const rad = 3.6 * (1 - tt * 0.42) + gaussian(rng) * 0.45;
        const theta = u.phi + tt * 1.35;
        x = rad * Math.cos(theta);
        y = 1.9 + gaussian(rng) * 1.25;
        z += rad * 0.22 * Math.sin(theta);
      }
      positions.mind.set([x, y, z], i * 3);
      const c =
        u.seed > 0.965 ? COL.white : u.seed > 0.72 ? COL.violetSoft : u.seed < 0.08 ? COL.cyan : COL.violet;
      pushColor(colors.mind, i, c);
    }
  }

  // --- ATLAS: clustered territories + orbital hierarchy --------------------
  const clusterCenters: THREE.Vector3[] = [V(0, 0, 0)];
  for (let k = 1; k < 7; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.32;
    const r = 3.9 + (k % 2) * 0.55;
    clusterCenters.push(
      V(Math.cos(a) * r, gaussian(rng) * 0.7, Math.sin(a) * r * 0.82)
    );
  }
  const atlasWorld: THREE.Vector3[] = [];
  {
    for (let i = 0; i < N_NODE; i++) {
      const u = nodes[i];
      let p: THREE.Vector3;
      if (u.shell < 0.12) {
        // orbital hierarchy shells
        const R = u.shell < 0.06 ? 5.6 : 6.5;
        p = V(
          R * Math.cos(u.phi * 3),
          gaussian(rng) * 0.5,
          R * 0.82 * Math.sin(u.phi * 3)
        );
      } else if (u.cluster === 0) {
        // central hub
        p = V(gaussian(rng) * 0.5, gaussian(rng) * 0.5, gaussian(rng) * 0.5);
      } else {
        const cc = clusterCenters[u.cluster];
        p = V(
          cc.x + gaussian(rng) * 1.1,
          cc.y + gaussian(rng) * 0.9,
          cc.z + gaussian(rng) * 1.45
        );
      }
      const w = p.clone().add(ATLAS_C);
      atlasWorld.push(w);
      positions.atlas.set([w.x, w.y, w.z], i * 3);
      const c =
        u.cluster === 0
          ? COL.cyan
          : u.shell < 0.12
          ? COL.dim
          : u.seed > 0.85
          ? COL.emerald
          : u.seed > 0.6
          ? COL.violetSoft
          : COL.violet;
      pushColor(colors.atlas, i, c);
    }
  }

  // --- OMNI: provider endpoints feeding a routing core ---------------------
  const providers = [
    "AgentRouter",
    "Pollinations",
    "Cerebras",
    "OpenRouter",
    "OpenCode",
    "Arena",
    "NVIDIA NIM",
  ];
  const endpointPositions: THREE.Vector3[] = [];
  const endpointHues = [
    "#8b5cf6",
    "#34d399",
    "#22d3ee",
    "#a78bfa",
    "#f59e0b",
    "#38bdf8",
    "#4ade80",
  ];
  {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.7;
      endpointPositions.push(
        V(Math.cos(a) * 4.8, 0.35 + (i % 2) * 0.5, Math.sin(a) * 4.8 * 0.86)
      );
    }
    for (let i = 0; i < N_NODE; i++) {
      const u = nodes[i];
      let p: THREE.Vector3;
      const prov = i % 7;
      if (u.shell < 0.4) {
        // along feeding arcs (quadratic bow from endpoint to core)
        const ep = endpointPositions[prov];
        const t = Math.pow(u.seed, 0.8);
        const p0 = ep;
        const p1 = ep.clone().multiplyScalar(0.5);
        p1.y += 1.3;
        const w = 1 - t;
        p = new THREE.Vector3()
          .addScaledVector(p0, w * w)
          .addScaledVector(p1, 2 * w * t)
          .addScaledVector(V(0, 0, 0), t * t);
        p.x += gaussian(rng) * 0.09;
        p.y += gaussian(rng) * 0.09;
        p.z += gaussian(rng) * 0.09;
      } else if (u.shell < 0.66) {
        // core swarm
        p = V(gaussian(rng) * 0.55, gaussian(rng) * 0.5, gaussian(rng) * 0.55);
      } else {
        // endpoint swirls
        const ep = endpointPositions[prov];
        const a = u.phi * 2;
        const rr = 0.42 * u.seed;
        p = V(ep.x + Math.cos(a) * rr, ep.y + gaussian(rng) * 0.22, ep.z + Math.sin(a) * rr);
      }
      const w = p.clone().add(OMNI_C);
      positions.omni.set([w.x, w.y, w.z], i * 3);
      const hue = new THREE.Color(endpointHues[prov]);
      const c = u.shell < 0.66 ? (u.seed > 0.93 ? COL.white : COL.cyan) : hue;
      pushColor(colors.omni, i, c);
      // keep the routing core a tight lattice rather than a packed starburst
      if (u.shell >= 0.4 && u.shell < 0.66) alphaScale.omni[i] = u.seed < 0.45 ? 1 : 0.3;
      else if (u.shell < 0.4) alphaScale.omni[i] = 0.9;
    }
  }

  // --- TRAINING: neural layers + data stream --------------------------------
  const layerDefs = [
    { rows: 13, width: 3.8, z: -2.6 },
    { rows: 9, width: 2.8, z: -1.3 },
    { rows: 5, width: 1.3, z: 0 },
    { rows: 8, width: 2.5, z: 1.3 },
    { rows: 12, width: 3.5, z: 2.6 },
  ];
  const totalLayer = layerDefs.reduce((a, l) => a + l.rows * 2, 0);
  const layerWorld: { x: number; y: number; z: number; layer: number }[] = [];
  {
    let cursor = 0;
    for (let li = 0; li < layerDefs.length; li++) {
      const def = layerDefs[li];
      for (let r = 0; r < def.rows * 2; r++) {
        layerWorld.push({
          x: ((r % def.rows) - (def.rows - 1) / 2) * (def.width / def.rows) + gaussian(rng) * 0.05,
          y: Math.floor(r / def.rows) * 0.62 - 0.31 + gaussian(rng) * 0.04,
          z: def.z + gaussian(rng) * 0.05,
          layer: li,
        });
        cursor++;
      }
    }
    for (let i = 0; i < N_NODE; i++) {
      const u = nodes[i];
      let p;
      if (i < totalLayer) {
        const L = layerWorld[i];
        p = V(L.x, L.y, L.z);
        nodes[i].layer = L.layer;
      } else {
        // JSONL data particles funneling in from below-left
        const t = (i - totalLayer) / (N_NODE - totalLayer);
        const a = u.phi;
        p = V(
          -5.2 + t * 2.4 + Math.sin(a) * 0.35 * t,
          -1.6 + t * 1.4 + gaussian(rng) * 0.12,
          -3.4 + t * 0.6 + gaussian(rng) * 0.18
        );
      }
      const w = p.clone().add(TRAIN_C);
      positions.training.set([w.x, w.y, w.z], i * 3);
      const c =
        i >= totalLayer
          ? COL.amber
          : nodes[i].layer === 2
          ? COL.amber
          : nodes[i].layer >= 3
          ? COL.emerald
          : COL.violetSoft;
      pushColor(colors.training, i, c);
    }
  }

  // --- INTERFACE: curved wall of panels -------------------------------------
  const panels: { pos: THREE.Vector3; rotY: number; w: number; h: number; kind: number }[] = [];
  {
    const cols = 5;
    const rows = 3;
    let k = 0;
    for (let ry = 0; ry < rows; ry++) {
      for (let cx = 0; cx < cols; cx++) {
        const idx = ry * cols + cx;
        if (idx === 6 || idx === 8 || idx === 2 || idx === 4) continue; // deliberate gaps
        const t = (cx - (cols - 1) / 2) / ((cols - 1) / 2);
        const arc = t * 0.62;
        const R = 7.4;
        const x = Math.sin(arc) * R;
        const z = Math.cos(arc) * R - R;
        const y = (ry - 1) * 1.72 + gaussian(rng) * 0.06;
        const w = 2.32 + (cx % 2) * 0.25;
        const h = 1.52;
        panels.push({
          pos: V(x, y, z).add(INTER_C),
          rotY: arc,
          w,
          h,
          kind: k % 5,
        });
        k++;
      }
    }
    for (let i = 0; i < N_NODE; i++) {
      const u = nodes[i];
      let p;
      if (u.shell < 0.72) {
        // panel corner / edge nodes
        const pn = panels[Math.floor(u.seed * panels.length * 4) % panels.length];
        const corner = i % 4;
        const ox = (corner % 2 ? 0.5 : -0.5) * pn.w + (corner === 0 || corner === 3 ? -0.02 : 0.02);
        const oy = (corner < 2 ? 0.5 : -0.5) * pn.h;
        const local = V(ox, oy, 0.03);
        local.applyAxisAngle(V(0, 1, 0), pn.rotY);
        p = local.add(pn.pos).sub(INTER_C);
      } else {
        // fine spatial grid between panels
        const t = u.phi / (Math.PI * 2);
        const arc = (t - 0.5) * 1.4;
        const R = 7.4;
        p = V(
          Math.sin(arc) * R,
          gaussian(rng) * 2.0,
          Math.cos(arc) * R - R + gaussian(rng) * 0.3
        );
      }
      const w = p.clone();
      positions.interface.set([w.x + INTER_C.x, w.y + INTER_C.y, w.z + INTER_C.z], i * 3);
      const c = u.seed > 0.82 ? COL.white : u.seed > 0.55 ? COL.cyan : u.seed < 0.1 ? COL.emerald : COL.violetSoft;
      pushColor(colors.interface, i, c);
    }
  }

  // --- WORKBENCH / UNIVERSE: four machines around the person ---------------
  const anchorDefs = [
    V(-6.6, 1.5, 2.4), // codeatlas (left)
    V(5.9, 1.7, -1.4), // omniroute (right)
    V(2.9, 1.2, 5.6), // training (front)
    V(-1.6, 3.5, -2.6), // interfaces (above, toward the circling camera)
  ];
  const anchorScale = [0.52, 0.56, 0.5, 0.72];
  {
    for (let i = 0; i < N_NODE; i++) {
      const u = nodes[i];
      const g = u.group;
      const anchor = anchorDefs[g];
      const sc = anchorScale[g];
      let local: THREE.Vector3;
      if (g === 0) {
        // mini atlas cluster
        const a = u.phi;
        local = V(
          Math.cos(a) * (1.2 + (u.cluster % 3) * 0.5),
          gaussian(rng) * 0.9,
          Math.sin(a) * (1.2 + (u.cluster % 3) * 0.5) * 0.8
        );
      } else if (g === 1) {
        // mini omni ring
        const a = (i % 9) / 9 * Math.PI * 2;
        local = V(
          Math.cos(a) * 1.9 + gaussian(rng) * 0.12,
          gaussian(rng) * 0.5,
          Math.sin(a) * 1.6 + gaussian(rng) * 0.12
        );
      } else if (g === 2) {
        // mini training machine: three compact layers
        const li = i % 3;
        const k = Math.floor(i / 3) % 9;
        local = V(
          ((k % 5) - 2) * 0.32 + gaussian(rng) * 0.04,
          (Math.floor(k / 5) - 0.5) * 0.4 + gaussian(rng) * 0.04,
          (li - 1) * 0.55
        );
      } else {
        // mini interface wall
        const col = i % 4;
        const row = Math.floor(i / 4) % 3;
        local = V((col - 1.5) * 1.25, (row - 1) * 0.85, gaussian(rng) * 0.3);
      }
      local.multiplyScalar(sc);
      const wb = anchor.clone().add(local);
      positions.workbench.set([wb.x, wb.y, wb.z], i * 3);
      const uni = wb.clone().sub(V(0, 1.5, 0)).multiplyScalar(1.42).add(V(0, 1.9, 0));
      positions.universe.set([uni.x, uni.y, uni.z], i * 3);
      const palette = [COL.violet, COL.cyan, COL.amber, COL.emerald];
      const c = u.seed > 0.9 ? COL.white : palette[g];
      pushColor(colors.workbench, i, c);
      pushColor(colors.universe, i, c);
    }
  }

  // -------------------------------------------------------------------------
  // Edges
  // -------------------------------------------------------------------------
  const makeEdges = (
    name: LayoutName,
    pairs: [number, number][],
    colorFor: (a: number, b: number) => THREE.Color,
    alpha = 0.5
  ): EdgeSet => {
    const segs = new Float32Array(pairs.length * 6);
    const cols = new Float32Array(pairs.length * 6);
    const P = positions[name];
    const ea = Math.min(0.85, alpha * 1.25);
    pairs.forEach(([a, b], k) => {
      segs.set([P[a * 3], P[a * 3 + 1], P[a * 3 + 2], P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], k * 6);
      const c = colorFor(a, b);
      cols.set([c.r * ea, c.g * ea, c.b * ea, c.r * ea, c.g * ea, c.b * ea], k * 6);
    });
    return { segments: segs, colors: cols, name };
  };

  const nearest = (name: LayoutName, k: number, predicate?: (i: number, j: number) => boolean, maxD = 9) => {
    const P = positions[name];
    const pairs: [number, number][] = [];
    const at = (i: number) => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
    for (let i = 0; i < N_NODE; i++) {
      const cand: { j: number; d: number }[] = [];
      const [x, y, z] = at(i);
      for (let j = i + 1; j < N_NODE; j++) {
        if (predicate && !predicate(i, j)) continue;
        const dx = P[j * 3] - x;
        const dy = P[j * 3 + 1] - y;
        const dz = P[j * 3 + 2] - z;
        const d = dx * dx + dy * dy + dz * dz;
        if (d < maxD) cand.push({ j, d });
      }
      cand.sort((a, b) => a.d - b.d);
      for (let m = 0; m < Math.min(k, cand.length); m++) pairs.push([i, cand[m].j]);
    }
    return pairs;
  };

  const violetEdges = () => () => COL.violet;
  const edges: Partial<Record<LayoutName, EdgeSet>> = {};

  // seed lattice: each node to next few on spiral
  {
    const pairs: [number, number][] = [];
    for (let i = 0; i < N_NODE - 2; i++) {
      pairs.push([i, i + 1]);
      if (i % 13 < 3 && i + 21 < N_NODE) pairs.push([i, i + 21]);
    }
    edges.seed = makeEdges("seed", pairs, () => COL.violetSoft, 0.5);
  }
  edges.mind = makeEdges("mind", nearest("mind", 1, undefined, 7.5), () => COL.violet, 0.26);
  edges.atlas = makeEdges(
    "atlas",
    nearest("atlas", 2, (i, j) => nodes[i].cluster === nodes[j].cluster || (i % 23 === 0)),
    (i) => (nodes[i].cluster === 0 ? COL.cyan : COL.violet),
    0.3
  );
  edges.omni = makeEdges(
    "omni",
    nearest("omni", 2, (i, j) => i % 7 === j % 7 || (i % 29 === 0 && j % 29 === 0), 6),
    (i) => new THREE.Color(endpointHues[i % 7]),
    0.18
  );
  edges.training = makeEdges(
    "training",
    nearest("training", 3, (i, j) => {
      if (i >= totalLayer || j >= totalLayer) return i >= totalLayer && j < totalLayer && nodes[j].layer === 0;
      return nodes[j].layer === nodes[i].layer + 1;
    }),
    (i) => (i >= totalLayer ? COL.amber : nodes[i].layer >= 3 ? COL.emerald : COL.violet),
    0.3
  );
  edges.interface = makeEdges(
    "interface",
    nearest("interface", 1, (i, j) => Math.abs(nodes[i].seed - nodes[j].seed) < 0.18, 5),
    () => COL.cyan,
    0.13
  );
  edges.workbench = makeEdges(
    "workbench",
    nearest("workbench", 2, (i, j) => nodes[i].group === nodes[j].group),
    (i) => [COL.violet, COL.cyan, COL.amber, COL.emerald][nodes[i].group],
    0.34
  );
  edges.universe = makeEdges(
    "universe",
    nearest("universe", 2, (i, j) => nodes[i].group === nodes[j].group),
    (i) => [COL.violet, COL.cyan, COL.amber, COL.emerald][nodes[i].group],
    0.36
  );

  // cross-system filaments revealed in the unifying shot
  {
    const pairs: [number, number][] = [];
    const r2 = mulberry32(4242);
    for (let k = 0; k < 46; k++) {
      const ga = k % 4;
      const gb = (ga + 1 + Math.floor(r2() * 3)) % 4;
      const a = Math.floor(r2() * N_NODE);
      let b = Math.floor(r2() * N_NODE);
      let tries = 0;
      while (nodes[b].group !== gb && tries++ < 20) b = Math.floor(r2() * N_NODE);
      if (nodes[b].group === gb) pairs.push([a, b]);
    }
    const segs = new Float32Array(pairs.length * 6);
    const cols = new Float32Array(pairs.length * 6);
    const PU = positions.universe;
    pairs.forEach(([a, b], k) => {
      segs.set([PU[a * 3], PU[a * 3 + 1], PU[a * 3 + 2], PU[b * 3], PU[b * 3 + 1], PU[b * 3 + 2]], k * 6);
      const c = COL.white;
      cols.set([c.r * 0.18, c.g * 0.2, c.b * 0.3, c.r * 0.18, c.g * 0.2, c.b * 0.3], k * 6);
    });
    var cross = { segments: segs, colors: cols, name: "cross" as const };
  }

  // landmarks ----------------------------------------------------------------
  const authCluster = clusterCenters[2].clone().add(ATLAS_C);
  const authPath = [
    authCluster,
    clusterCenters[0].clone().add(ATLAS_C).lerp(authCluster, 0.4).add(V(0.4, 0.6, 0.2)),
    clusterCenters[0].clone().add(ATLAS_C),
    clusterCenters[5].clone().add(ATLAS_C).lerp(clusterCenters[0].clone().add(ATLAS_C), 0.5).add(V(-0.3, 0.3, 0.4)),
    clusterCenters[5].clone().add(ATLAS_C),
  ];

  return {
    nodes,
    positions,
    colors,
    alphaScale,
    sizes,
    seeds,
    edges,
    crossEdges: cross!,
    atlas: { clusters: clusterCenters.map((c) => c.clone().add(ATLAS_C)), hub: ATLAS_C.clone(), auth: authCluster, authPath },
    omni: {
      core: OMNI_C.clone(),
      endpoints: endpointPositions.map((p, i) => ({
        pos: p.clone().add(OMNI_C),
        label: providers[i],
        hue: endpointHues[i],
      })),
    },
    training: {
      center: TRAIN_C.clone(),
      layerZ: layerDefs.map((l) => l.z + TRAIN_C.z),
      layers: layerDefs.map((l) => ({
        pos: V(TRAIN_C.x, TRAIN_C.y, TRAIN_C.z + l.z),
        rows: l.rows,
        width: l.width,
        z: l.z,
      })),
    },
    interface: { center: INTER_C.clone(), panels },
    workbench: { anchors: anchorDefs },
  };
}

// shared singleton so landmarks and the point graph stay in lockstep
let _cache: WorldLayouts | null = null;
export const getLayouts = (): WorldLayouts => {
  if (!_cache) _cache = buildLayouts();
  return _cache;
};
