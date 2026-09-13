import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getLayouts } from "./layouts";
import { Tag } from "./Labels";
import { smoothstep, lerp, clamp01 } from "../lib/anim";
import { makePanelTexture } from "./panelTextures";
import { mulberry32 } from "../timeline";

const SPAWN = new THREE.Vector3(0, 2.0, 22.95);
const ANCHOR = new THREE.Vector3(-1.6, 3.5, -2.6);

export const InterfaceWorld: React.FC<{ time: number }> = ({ time }) => {
  const L = useMemo(() => getLayouts(), []);
  const grp = useRef<THREE.Group>(null);
  const barsRef = useRef<THREE.Group>(null);
  const miniRef = useRef<THREE.Group>(null);
  const env = smoothstep(23.9, 24.8, time) * (1 - smoothstep(28.7, 29.5, time));

  const panels = useMemo(
    () =>
      L.interface.panels.map((p, i) => ({
        ...p,
        tex: makePanelTexture(p.kind, i + 3),
        seed: i,
      })),
    [L]
  );

  const grad = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 32;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 128, 0);
    g.addColorStop(0, "rgba(139,92,246,0)");
    g.addColorStop(0.5, "rgba(167,139,250,0.35)");
    g.addColorStop(1, "rgba(34,211,238,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 32);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  // floating 3D bar chart
  const bars = useMemo(() => {
    const rng = mulberry32(77);
    return Array.from({ length: 10 }).map((_, i) => 0.4 + rng() * 1.3 + (i > 6 ? 0.8 : 0));
  }, []);

  // floating node-link diagram
  const miniGraph = useMemo(() => {
    const rng = mulberry32(123);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 12; i++) {
      pts.push(new THREE.Vector3((rng() - 0.5) * 1.8, (rng() - 0.5) * 1.1, (rng() - 0.5) * 0.5));
    }
    const lines: [number, number][] = [];
    for (let i = 1; i < pts.length; i++) lines.push([i, Math.max(0, i - 1 - (i % 3))]);
    for (let i = 2; i < pts.length; i += 4) lines.push([i, Math.floor(rng() * i)]);
    return { pts, lines };
  }, []);
  const miniLineGeo = useMemo(() => {
    const arr = new Float32Array(miniGraph.lines.length * 6);
    miniGraph.lines.forEach(([a, b], i) => {
      arr.set([miniGraph.pts[a].x, miniGraph.pts[a].y, miniGraph.pts[a].z, miniGraph.pts[b].x, miniGraph.pts[b].y, miniGraph.pts[b].z], i * 6);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, [miniGraph]);

  useFrame(() => {
    const fade = 1 - collapse;
    if (barsRef.current) {
      barsRef.current.rotation.y = Math.sin(time * 0.3) * 0.4;
      barsRef.current.scale.setScalar(0.001 + fade * 0.999);
      barsRef.current.children.forEach((child, i) => {
        const target = bars[i];
        const grow = smoothstep(25.4 + i * 0.05, 26 + i * 0.05, time);
        child.scale.y = Math.max(0.001, target * grow);
        child.position.y = (target * grow) / 2;
      });
    }
    if (miniRef.current) {
      miniRef.current.rotation.y = time * 0.25;
      miniRef.current.scale.setScalar(0.001 + fade * 0.999);
    }
  });

  const assembly = (i: number) => clamp01(smoothstep(23.9 + i * 0.09, 24.7 + i * 0.09, time));
  const collapse = smoothstep(28.5, 29.25, time);
  const objFade = 1 - collapse;
  void objFade;

  return (
    <group ref={grp} visible={env > 0.01}>
      {panels.map((p, i) => {
        const a = assembly(i);
        const final = p.pos;
        const pos = new THREE.Vector3().lerpVectors(SPAWN, final, a * (1 - collapse));
        pos.lerp(ANCHOR, collapse);
        const scale = 0.001 + a * (1 - collapse) * 0.999;
        return (
          <group key={i} position={pos.toArray()} rotation={[0, p.rotY + Math.PI, 0]} scale={scale}>
            <mesh>
              <planeGeometry args={[p.w, p.h]} />
              <meshBasicMaterial
                map={p.tex}
                transparent
                opacity={0.96}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
            {/* scanning highlight */}
            <mesh position={[((time * 0.6 + i * 0.3) % 2.4) - 1.2, 0, 0.012]}>
              <planeGeometry args={[0.5, p.h]} />
              <meshBasicMaterial map={grad} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}

      {/* 3D bar chart standing in the gap */}
      <group ref={barsRef} position={[3.6, 1.4, L.interface.center.z - 0.6]}>
        {bars.map((h, i) => (
          <mesh key={i} position={[(i - 4.5) * 0.3, 0, 0]}>
            <boxGeometry args={[0.16, 1, 0.16]} />
            <meshBasicMaterial color={i > 6 ? "#22d3ee" : "#8b5cf6"} transparent opacity={env * 0.85} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>

      {/* floating node-link composition */}
      <group ref={miniRef} position={[-4.0, 2.7, L.interface.center.z - 1.2]}>
        <lineSegments geometry={miniLineGeo}>
          <lineBasicMaterial color="#34d399" transparent opacity={env * 0.7} blending={THREE.AdditiveBlending} />
        </lineSegments>
        {miniGraph.pts.map((p, i) => (
          <mesh key={i} position={p.toArray()}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={i % 4 === 0 ? "#34d399" : "#a78bfa"} transparent opacity={env} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>

      <Tag position={[3.6, 2.9, L.interface.center.z - 0.6]} color="#22d3ee" opacity={env * smoothstep(26, 26.8, time)} scale={0.13}>
        latency · p95
      </Tag>
      <Tag position={[-4.0, 3.6, L.interface.center.z - 1.2]} color="#34d399" opacity={env * smoothstep(26.4, 27.2, time)} scale={0.13}>
        latent → view
      </Tag>
    </group>
  );
};
