import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import { mulberry32 } from "../timeline";

// Two layers: far volumetric dust filling the corridor, and slow near motes.
export const ParticleField: React.FC<{ time: number }> = ({ time }) => {
  const frame = useCurrentFrame();
  const farRef = useRef<THREE.Points>(null);
  const nearRef = useRef<THREE.Points>(null);

  const { farGeo, nearGeo } = useMemo(() => {
    const rng = mulberry32(99173);
    const NF = 1500;
    const farPos = new Float32Array(NF * 3);
    const farSize = new Float32Array(NF);
    const farAlpha = new Float32Array(NF);
    // dust distributed along the whole journey corridor and around workbench
    for (let i = 0; i < NF; i++) {
      const zone = rng();
      let x, y, z;
      if (zone < 0.6) {
        // journey corridor z 0..28
        x = (rng() - 0.5) * 24;
        y = rng() * 9 - 1.5;
        z = rng() * 30 - 2;
      } else if (zone < 0.86) {
        // ecosystem shell around the person
        const r = 5 + rng() * 12;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        x = r * Math.sin(ph) * Math.cos(th);
        y = 1.6 + r * Math.cos(ph) * 0.7;
        z = r * Math.sin(ph) * Math.sin(th);
      } else {
        // intimate haze near subject
        x = (rng() - 0.5) * 5;
        y = 0.5 + rng() * 2.5;
        z = (rng() - 0.5) * 5;
      }
      farPos.set([x, y, z], i * 3);
      farSize[i] = 0.28 + rng() * 0.6;
      farAlpha[i] = 0.05 + rng() * 0.15;
    }
    const farGeo = new THREE.BufferGeometry();
    farGeo.setAttribute("position", new THREE.BufferAttribute(farPos, 3));
    farGeo.setAttribute("aSize", new THREE.BufferAttribute(farSize, 1));
    farGeo.setAttribute("aAlpha", new THREE.BufferAttribute(farAlpha, 1));

    const NN = 70;
    const nearPos = new Float32Array(NN * 3);
    const nearSize = new Float32Array(NN);
    const nearAlpha = new Float32Array(NN);
    const nearSeed = new Float32Array(NN);
    for (let i = 0; i < NN; i++) {
      nearPos.set([(rng() - 0.5) * 20, rng() * 6 - 0.5, (rng() - 0.5) * 22], i * 3);
      nearSize[i] = 0.5 + rng() * 0.8;
      nearAlpha[i] = 0.07 + rng() * 0.14;
      nearSeed[i] = rng();
    }
    const nearGeo = new THREE.BufferGeometry();
    nearGeo.setAttribute("position", new THREE.BufferAttribute(nearPos, 3));
    nearGeo.setAttribute("aSize", new THREE.BufferAttribute(nearSize, 1));
    nearGeo.setAttribute("aAlpha", new THREE.BufferAttribute(nearAlpha, 1));
    nearGeo.userData.seeds = nearSeed;
    return { farGeo, nearGeo };
  }, []);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#5560a0") } },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aAlpha;
          varying float vA;
          void main() {
            vA = aAlpha;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = min(7.0, aSize * (52.0 / max(0.1, -mv.z)));
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.05, d) * vA;
            gl_FragColor = vec4(uColor, a);
          }
        `,
      }),
    []
  );

  useFrame(() => {
    const t = time;
    if (farRef.current) {
      farRef.current.rotation.y = Math.sin(t * 0.05) * 0.03;
      farRef.current.position.y = Math.sin(t * 0.11) * 0.12;
    }
    if (nearRef.current) {
      const attr = nearGeo.getAttribute("position") as THREE.BufferAttribute;
      const seeds = nearGeo.userData.seeds as Float32Array;
      for (let i = 0; i < attr.count; i++) {
        const ix = i * 3;
        attr.array[ix + 1] += 0.0012 + seeds[i] * 0.002;
        attr.array[ix] += Math.sin(t * 0.4 + seeds[i] * 30) * 0.0009;
        if (attr.array[ix + 1] > 5.5) attr.array[ix + 1] = -0.5;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={farRef} geometry={farGeo} material={mat} frustumCulled={false} />
      <points ref={nearRef} geometry={nearGeo} material={mat} frustumCulled={false} />
    </group>
  );
};
