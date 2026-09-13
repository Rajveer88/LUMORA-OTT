import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getLayouts, type LayoutName, N_NODE } from "./layouts";
import { LAYOUTS } from "../timeline";
import { smoothstep, clamp01 } from "../lib/anim";

const LAYOUT_ORDER: LayoutName[] = [
  "seed",
  "mind",
  "atlas",
  "omni",
  "training",
  "interface",
  "workbench",
  "universe",
];

function riseEnd(name: LayoutName) {
  const w = LAYOUTS[name];
  return w.appear + (w.hold - w.appear) * 0.45;
}
function fallStart(name: LayoutName) {
  const w = LAYOUTS[name];
  return w.dissolve - 1.1;
}
function layoutEnv(name: LayoutName, t: number) {
  const w = LAYOUTS[name];
  return clamp01(
    smoothstep(w.appear, riseEnd(name), t) *
      (1 - smoothstep(fallStart(name), w.dissolve, t))
  );
}

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = min(20.0, aSize * (104.0 / max(0.1, -mv.z)));
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float halo = smoothstep(0.5, 0.05, d);
    float core = smoothstep(0.16, 0.0, d);
    vec3 col = vColor + core * 0.28;
    float a = halo * vAlpha;
    gl_FragColor = vec4(col * (0.5 * halo + 0.85 * core), a);
  }
`;

export const GraphWorld: React.FC<{ time: number }> = ({ time }) => {
  const data = useMemo(() => getLayouts(), []);

  const pointsGeo = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N_NODE * 3), 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(N_NODE * 3), 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(N_NODE), 1));
    geometry.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(N_NODE), 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 12), 60);
    return geometry;
  }, []);

  const pointsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const edgeObjs = useMemo(() => {
    return LAYOUT_ORDER.map((name) => {
      const e = data.edges[name];
      if (!e) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(e.segments.slice(), 3));
      g.setAttribute("color", new THREE.BufferAttribute(e.colors.slice(), 3));
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 12), 60);
      const m = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      return new THREE.LineSegments(g, m);
    });
  }, [data]);

  const crossGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.crossEdges.segments, 3));
    g.setAttribute("color", new THREE.BufferAttribute(data.crossEdges.colors, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 2, 12), 60);
    return g;
  }, [data]);
  const crossMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const weightsRef = useRef<Record<LayoutName, number>>({
    seed: 0, mind: 0, atlas: 0, omni: 0, training: 0, interface: 0, workbench: 0, universe: 0,
  });

  useFrame(() => {
    const t = time;
    const weights = weightsRef.current;
    for (const l of LAYOUT_ORDER) weights[l] = layoutEnv(l, t);

    const posAttr = pointsGeo.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = pointsGeo.getAttribute("aColor") as THREE.BufferAttribute;
    const sizeAttr = pointsGeo.getAttribute("aSize") as THREE.BufferAttribute;
    const alphaAttr = pointsGeo.getAttribute("aAlpha") as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;
    const siz = sizeAttr.array as Float32Array;
    const alp = alphaAttr.array as Float32Array;

    // dominant layout drives a per-era node size factor
    let dom: LayoutName = "seed";
    let domW = -1;
    for (const name of LAYOUT_ORDER) {
      if (weights[name] > domW) { domW = weights[name]; dom = name; }
    }
    const sizeMul: Record<LayoutName, number> = {
      seed: 0.38, mind: 0.8, atlas: 0.95, omni: 0.85, training: 0.88, interface: 0.72, workbench: 0.8, universe: 0.85,
    };

    for (let i = 0; i < N_NODE; i++) {
      const u = data.nodes[i];
      let wx = 0, wy = 0, wz = 0;
      let cr = 0, cg = 0, cb = 0, wa = 0;
      let tw = 0;
      for (const name of LAYOUT_ORDER) {
        const env = weights[name];
        if (env < 0.001) continue;
        const inT = clamp01(
          ((t - LAYOUTS[name].appear) / (riseEnd(name) - LAYOUTS[name].appear)) * 1.1 -
            u.seed * 0.32
        );
        const w = env * (0.25 + 0.75 * inT);
        const P = data.positions[name];
        wx += P[i * 3] * w;
        wy += P[i * 3 + 1] * w;
        wz += P[i * 3 + 2] * w;
        const C = data.colors[name];
        cr += C[i * 3] * w;
        cg += C[i * 3 + 1] * w;
        cb += C[i * 3 + 2] * w;
        wa += (data.alphaScale[name] ? data.alphaScale[name][i] : 1) * w;
        tw += w;
      }
      if (tw > 0.0001) {
        const inv = 1 / tw;
        pos[i * 3] = wx * inv + Math.sin(t * 0.5 + u.seed * 40) * 0.025;
        pos[i * 3 + 1] = wy * inv + Math.cos(t * 0.42 + u.seed * 27) * 0.03;
        pos[i * 3 + 2] = wz * inv + Math.sin(t * 0.33 + u.seed * 55) * 0.025;
        col[i * 3] = cr * inv;
        col[i * 3 + 1] = cg * inv;
        col[i * 3 + 2] = cb * inv;
        alp[i] = clamp01(tw) * clamp01(wa / tw) * 0.95;
        siz[i] = data.sizes[i] * sizeMul[dom] * (0.82 + 0.3 * Math.sin(t * 1.3 + u.seed * 20));
      } else {
        pos[i * 3 + 1] = -999;
        alp[i] = 0;
      }
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    alphaAttr.needsUpdate = true;

    edgeObjs.forEach((obj, idx) => {
      if (!obj) return;
      const m = obj.material as THREE.LineBasicMaterial;
      m.opacity = weights[LAYOUT_ORDER[idx]] * 0.9;
      obj.visible = m.opacity > 0.01;
    });

    crossMat.opacity = smoothstep(34.4, 36.4, t) * 0.9 * (1 - smoothstep(37.9, 38.15, t));
  });

  return (
    <group>
      <points geometry={pointsGeo} material={pointsMat} frustumCulled={false} />
      {edgeObjs.map((obj, i) =>
        obj ? <primitive key={LAYOUT_ORDER[i]} object={obj} frustumCulled={false} /> : null
      )}
      <lineSegments geometry={crossGeo} material={crossMat} frustumCulled={false} />
    </group>
  );
};
