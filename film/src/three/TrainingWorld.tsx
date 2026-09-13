import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getLayouts } from "./layouts";
import { Tag, Readout } from "./Labels";
import { smoothstep, clamp01 } from "../lib/anim";
import { makePanelTexture } from "./panelTextures";

export const TrainingWorld: React.FC<{ time: number }> = ({ time }) => {
  const L = useMemo(() => getLayouts(), []);
  const env = smoothstep(19.7, 20.9, time) * (1 - smoothstep(24.0, 24.7, time));
  const grp = useRef<THREE.Group>(null);
  const ringMats = useRef<THREE.MeshBasicMaterial[]>([]);
  const plateMats = useRef<THREE.MeshBasicMaterial[]>([]);
  const outTex = useMemo(() => makePanelTexture(4, 4), []);

  // activation wave travels through layers
  const waveT = clamp01((time - 22.0) / 2.6);

  useFrame(() => {
    L.training.layers.forEach((_, i) => {
      const local = waveT * 1.5 - i * 0.22;
      const hit = Math.max(0, 1 - Math.abs(local - 0.5) * 4);
      const m = ringMats.current[i];
      if (m) m.opacity = env * (0.12 + hit * 0.7);
      const p = plateMats.current[i];
      if (p) p.opacity = env * (0.1 + hit * 0.22);
    });
  });

  return (
    <group ref={grp} visible={env > 0.01}>
      {/* layer plates + activation rings */}
      {L.training.layers.map((layer, i) => (
        <group key={i} position={[L.training.center.x, L.training.center.y, L.training.center.z + layer.z]}>
          <mesh>
            <planeGeometry args={[layer.width * 0.82, 1.1]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) plateMats.current[i] = m;
              }}
              color="#0d1226"
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[0.34 + i * 0.03, 0.36 + i * 0.03, 64]} />
            <meshBasicMaterial
              ref={(m) => {
                if (m) ringMats.current[i] = m;
              }}
              color={i === 2 ? "#f59e0b" : i >= 3 ? "#34d399" : "#8b5cf6"}
              transparent
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* LoRA adapter branch off the bottleneck */}
      <group position={[1.5, L.training.center.y + 0.9, L.training.center.z]}>
        <mesh>
          <boxGeometry args={[0.5, 0.34, 0.34]} />
          <meshBasicMaterial color="#3a2a08" transparent opacity={env * 0.95} />
        </mesh>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(0.5, 0.34, 0.34)]} />
          <lineBasicMaterial color="#f59e0b" transparent opacity={env * 0.9} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>

      {/* emerging response panel at the output, facing the incoming camera */}
      <mesh
        position={[0, L.training.center.y - 0.1, L.training.center.z + 3.4]}
        rotation={[0, Math.PI, 0]}
        scale={0.6 + 0.4 * smoothstep(23.4, 24.0, time)}
      >
        <planeGeometry args={[2.6, 1.7]} />
        <meshBasicMaterial
          map={outTex}
          transparent
          opacity={env * smoothstep(23.3, 24.0, time)}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* instrumentation labels */}
      <Tag position={[-4.9, L.training.center.y - 0.4, L.training.center.z - 3.2]} color="#f59e0b" opacity={env} scale={0.14}>
        JSONL
      </Tag>
      <Tag position={[-3.4, L.training.center.y + 1.35, L.training.center.z - 2.2]} color="#a78bfa" opacity={env} scale={0.14}>
        PyTorch
      </Tag>
      <Tag position={[0, L.training.center.y + 1.5, L.training.center.z - 0.6]} color="#8b5cf6" opacity={env} scale={0.14}>
        Transformers
      </Tag>
      <Tag position={[2.0, L.training.center.y + 1.25, L.training.center.z + 0.2]} color="#f59e0b" opacity={env} scale={0.13}>
        PEFT / LoRA
      </Tag>
      <Tag position={[-2.2, L.training.center.y - 1.25, L.training.center.z + 1.4]} color="#34d399" opacity={env} scale={0.13}>
        4-bit
      </Tag>
      <Readout
        position={[1.4, L.training.center.y - 1.1, L.training.center.z - 1.8]}
        opacity={env * 0.9}
        lines={["params: 410M", "trainable: 0.8%", "loss → 1.94"]}
      />
    </group>
  );
};
