import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { smoothstep, smoother, clamp01 } from "../lib/anim";

interface Knot {
  t: number;
  p: [number, number, number];
  look: [number, number, number];
  roll: number;
  fov: number;
  ease?: number; // per-segment easing exponent
}

// Physical camera journey: behind the subject -> face -> into the mind graph
// -> atlas thrust -> omni orbit & pass-through -> training machine ->
// interface wall -> collapse/retract -> workbench circle -> universe pullback.
const KNOTS: Knot[] = [
  // THE PERSON — behind the silhouette, orbit to the face
  { t: 0.0, p: [-2.45, 1.72, -3.5], look: [0, 1.5, 1.0], roll: 0, fov: 46 },
  { t: 1.8, p: [-2.3, 1.74, -3.1], look: [0, 1.55, 1.25], roll: 0, fov: 46 },
  { t: 3.0, p: [-1.0, 1.78, -1.4], look: [0, 1.66, 0.6], roll: 1.5, fov: 48 },
  { t: 4.4, p: [1.9, 1.74, 1.4], look: [0, 1.68, 0.3], roll: -2, fov: 50 },
  // THE MIND — past the shoulder into the growing system
  { t: 5.3, p: [-1.0, 1.7, 0.6], look: [0, 1.85, 2.8], roll: 2, fov: 47 },
  { t: 6.7, p: [-0.6, 1.8, 2.2], look: [0, 2.0, 5.2], roll: 0, fov: 48 },
  { t: 9.6, p: [0.1, 2.0, 3.8], look: [0, 2.2, 7.6], roll: 0, fov: 52 },
  // CODEATLAS — viewed from above the orbital shells, looking at auth_service,
  // then following its dependency path into the hub
  { t: 10.7, p: [-1.7, 3.0, 2.8], look: [-1.5, 2.3, 9.6], roll: 0, fov: 50 },
  { t: 11.9, p: [-1.5, 2.9, 4.4], look: [-0.7, 2.3, 9.6], roll: 0, fov: 50 },
  { t: 12.85, p: [-0.8, 2.55, 5.8], look: [0.2, 2.3, 11.4], roll: 0, fov: 50 },
  { t: 13.6, p: [0.5, 2.5, 11.4], look: [0, 2.1, 13.6], roll: 5, fov: 58 },
  // OMNIROUTE — circle the routing core outside the provider ring
  { t: 15.2, p: [1.5, 2.35, 11.0], look: [0, 2.0, 13.4], roll: 2, fov: 50 },
  { t: 16.3, p: [1.0, 2.3, 18.4], look: [0, 2.0, 13.4], roll: 0, fov: 47 },
  { t: 17.4, p: [5.0, 2.2, 13.9], look: [0, 2.0, 13.4], roll: -1, fov: 47 },
  { t: 18.5, p: [1.0, 2.4, 8.9], look: [0, 2.0, 13.4], roll: 0, fov: 47 },
  { t: 19.25, p: [-3.7, 2.2, 10.3], look: [0, 2.0, 13.4], roll: -2, fov: 50 },
  // pass through the routing core
  { t: 19.9, p: [0.35, 2.05, 12.7], look: [0, 2.0, 15.2], roll: 2, fov: 64 },
  // TRAINING — three-quarter view of the compact experimental machine, push to output
  { t: 20.8, p: [-4.0, 2.95, 15.7], look: [0.1, 2.05, 19.4], roll: 0, fov: 48 },
  { t: 22.1, p: [-2.9, 2.65, 17.0], look: [0.1, 2.0, 19.6], roll: 0, fov: 46 },
  { t: 23.35, p: [-1.25, 2.15, 20.2], look: [0.3, 1.95, 22.7], roll: 0, fov: 48 },
  // INTERFACE — the output becomes a curved wall of designed surfaces
  { t: 24.5, p: [0, 2.15, 22.6], look: [0, 2.15, 25.2], roll: 0, fov: 52 },
  { t: 26.2, p: [-1.4, 2.5, 22.9], look: [-0.4, 2.1, 25.0], roll: 1, fov: 50 },
  { t: 27.6, p: [-3.6, 2.7, 23.6], look: [-1.0, 2.05, 24.8], roll: -2, fov: 49 },
  // collapse + whip back home (stay clear of the curved panel wall)
  { t: 28.7, p: [-2.2, 3.0, 21.9], look: [-1.0, 2.2, 24.8], roll: -4, fov: 56 },
  { t: 29.3, p: [1.4, 3.6, 10.5], look: [0, 2.1, 1.5], roll: -2, fov: 54 },
  // WORKBENCH — the builder among the machines
  { t: 29.9, p: [4.3, 2.7, -5.9], look: [0, 1.55, 1.2], roll: 1, fov: 48 },
  { t: 31.5, p: [4.7, 2.35, -4.7], look: [0, 1.5, 1.6], roll: 0, fov: 46 },
  { t: 32.6, p: [2.6, 2.0, -4.4], look: [0.6, 1.55, 2.2], roll: 0, fov: 46 },
  { t: 33.9, p: [-4.3, 2.25, -4.3], look: [0, 1.5, 1.2], roll: 2, fov: 48 },
  // UNIFYING — pull back to the whole ecosystem
  { t: 34.4, p: [-5.2, 2.7, -5.6], look: [0, 1.6, 0.8], roll: 1, fov: 49 },
  { t: 37.9, p: [-11.5, 7.2, -14.5], look: [0, 1.3, 0.6], roll: 0, fov: 58 },
  { t: 40.0, p: [-11.5, 7.2, -14.5], look: [0, 1.3, 0.6], roll: 0, fov: 58 },
];

export const CameraRig: React.FC<{ time: number }> = ({ time }) => {
  const { camera } = useThree();
  const persp = camera as THREE.PerspectiveCamera;

  const state = useMemo(() => {
    const pos = new THREE.Vector3();
    const look = new THREE.Vector3();
    const lookPrev = new THREE.Vector3(0, 1.5, 0);
    return { pos, look, lookPrev };
  }, []);

  useFrame(() => {
    let i = 0;
    while (i < KNOTS.length - 2 && time > KNOTS[i + 1].t) i++;
    const a = KNOTS[i];
    const b = KNOTS[i + 1];
    let u = clamp01((time - a.t) / (b.t - a.t));
    // smooth with a touch of smoothstep; thrust segments use fov punch instead
    u = smoother(u);

    state.pos.set(
      a.p[0] + (b.p[0] - a.p[0]) * u,
      a.p[1] + (b.p[1] - a.p[1]) * u,
      a.p[2] + (b.p[2] - a.p[2]) * u
    );
    state.look.set(
      a.look[0] + (b.look[0] - a.look[0]) * u,
      a.look[1] + (b.look[1] - a.look[1]) * u,
      a.look[2] + (b.look[2] - a.look[2]) * u
    );
    const roll = a.roll + (b.roll - a.roll) * u;
    const fov = a.fov + (b.fov - a.fov) * u;

    // handheld micro-breathing, deterministic
    state.pos.x += Math.sin(time * 0.71) * 0.022;
    state.pos.y += Math.sin(time * 0.93) * 0.016;

    camera.position.copy(state.pos);
    camera.up.set(0, 1, 0);
    camera.lookAt(state.look);
    camera.rotateZ((roll * Math.PI) / 180);
    if (Math.abs(persp.fov - fov) > 0.01) {
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }
  });

  return null;
};
