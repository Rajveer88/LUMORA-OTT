import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getLayouts } from "./layouts";
import { Tag } from "./Labels";
import { smoothstep, clamp01 } from "../lib/anim";

const MIND_LABELS = [
  { text: "AI", pos: [0.4, 3.9, 4.0] as [number, number, number], color: "#8b5cf6", at: 6.3 },
  { text: "CODE", pos: [-3.9, 2.7, 3.0] as [number, number, number], color: "#a78bfa", at: 6.9 },
  { text: "SYSTEMS", pos: [3.9, 2.3, 3.5] as [number, number, number], color: "#22d3ee", at: 7.5 },
  { text: "VISUALIZATION", pos: [-2.9, 0.75, 5.0] as [number, number, number], color: "#34d399", at: 8.1 },
  { text: "INTERFACES", pos: [3.0, 0.85, 4.6] as [number, number, number], color: "#a78bfa", at: 8.7 },
];

export const MindLabels: React.FC<{ time: number }> = ({ time }) => {
  const env = smoothstep(5.4, 6.4, time) * (1 - smoothstep(9.8, 10.5, time));
  return (
    <group visible={env > 0.01}>
      {MIND_LABELS.map((l) => {
        const o = env * smoothstep(l.at - 0.3, l.at + 0.2, time);
        return <Tag key={l.text} position={l.pos} color={l.color} opacity={o} scale={0.17} />;
      })}
    </group>
  );
};

const RIPPLE_COLORS = ["#8b5cf6", "#22d3ee", "#f59e0b", "#34d399"];

export const WorkbenchFX: React.FC<{ time: number }> = ({ time }) => {
  const L = useMemo(() => getLayouts(), []);
  const rippleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const shellRef = useRef<THREE.Mesh>(null);

  const wbEnv = smoothstep(28.9, 30.2, time);
  const idEnv = wbEnv * (1 - smoothstep(37.0, 37.9, time));
  const ripple = smoothstep(32.25, 32.6, time) * (1 - smoothstep(33.9, 34.35, time));

  useFrame(() => {
    rippleRefs.current.forEach((m, i) => {
      if (!m) return;
      const t = clamp01((time - 32.3 - i * 0.16) / 1.6);
      const e = Math.max(0, 1 - t);
      m.scale.setScalar(0.15 + t * 2.7);
      (m.material as THREE.MeshBasicMaterial).opacity = ripple * e * e * 0.2;
    });
    ringRefs.current.forEach((m, i) => {
      if (!m) return;
      const pulse = Math.exp(-Math.pow((time - (32.55 + i * 0.16)) * 2.2, 2));
      m.scale.setScalar(1 + pulse * 0.5);
      (m.material as THREE.MeshBasicMaterial).opacity = wbEnv * (0.18 + pulse * 0.45);
      m.lookAt(0, 1.5, 0);
    });
    if (shellRef.current) {
      shellRef.current.rotation.y = time * 0.03;
      (shellRef.current.material as THREE.MeshBasicMaterial).opacity =
        smoothstep(34.8, 36.2, time) * (1 - smoothstep(37.9, 38.15, time)) * 0.045;
    }
  });

  const ids = ["codeatlas", "omniroute", "mini-soup", "interfaces"];
  const colors = ["#a78bfa", "#7dd3fc", "#fbbf24", "#6ee7b7"];

  const icoGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.78, 1)), []);
  const cubeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.5, 0)), []);
  const sigRefs = useRef<(THREE.Group | null)[]>([]);
  useFrame(() => {
    sigRefs.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.y = time * (i % 2 ? -0.5 : 0.4);
      g.rotation.x = Math.sin(time * 0.4 + i) * 0.18;
    });
  });

  return (
    <group>
      {/* floating project identifiers */}
      {L.workbench.anchors.map((a, i) => {
        const bob = Math.sin(time * 0.6 + i * 1.7) * 0.12;
        return (
          <group key={ids[i]} position={[a.x, a.y + 2.0 + (i === 3 ? 0.2 : 0) + bob, a.z]}>
            <Tag position={[0, 0, 0]} color={colors[i]} opacity={idEnv} scale={0.16} anchor="center">
              {ids[i]}
            </Tag>
          </group>
        );
      })}

      {/* response rings at each machine */}
      {L.workbench.anchors.map((a, i) => (
        <mesh
          key={"ring" + i}
          ref={(m) => {
            ringRefs.current[i] = m;
          }}
          position={[a.x, a.y, a.z]}
        >
          <torusGeometry args={[1.05, 0.012, 8, 80]} />
          <meshBasicMaterial
            color={colors[i]}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ripples from the builder's hand */}
      {RIPPLE_COLORS.map((c, i) => (
        <mesh
          key={c}
          ref={(m) => {
            rippleRefs.current[i] = m;
          }}
          position={[0.3, 1.42, 0.55]}
        >
          <sphereGeometry args={[1, 20, 14]} />
          <meshBasicMaterial color={c} wireframe transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}

      {/* faint ecosystem shell */}
      <mesh ref={shellRef} position={[0, 1.7, 0]}>
        <sphereGeometry args={[11.5, 36, 24]} />
        <meshBasicMaterial color="#7c8cff" wireframe transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* each machine has a recognizable signature */}
      {L.workbench.anchors.map((a, i) => (
        <group
          key={"sig" + i}
          ref={(g) => {
            sigRefs.current[i] = g;
          }}
          position={[a.x, a.y, a.z]}
        >
          {i === 0 && (
            // codeatlas: wireframe globe with orbit ring
            <>
              <lineSegments geometry={icoGeo}>
                <lineBasicMaterial color="#a78bfa" transparent opacity={idEnv * 0.55} blending={THREE.AdditiveBlending} />
              </lineSegments>
              <mesh rotation={[Math.PI / 2.3, 0, 0]}>
                <torusGeometry args={[1.05, 0.008, 8, 80]} />
                <meshBasicMaterial color="#8b5cf6" transparent opacity={idEnv * 0.5} blending={THREE.AdditiveBlending} />
              </mesh>
            </>
          )}
          {i === 1 && (
            // omniroute: routing core with ring
            <>
              <lineSegments geometry={cubeGeo}>
                <lineBasicMaterial color="#7dd3fc" transparent opacity={idEnv * 0.6} blending={THREE.AdditiveBlending} />
              </lineSegments>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.95, 0.008, 8, 80]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={idEnv * 0.45} blending={THREE.AdditiveBlending} />
              </mesh>
            </>
          )}
          {i === 2 && (
            // training: stacked neural rings
            <>
              {[-0.55, -0.18, 0.18, 0.55].map((zz, k) => (
                <mesh key={k} position={[0, 0, zz]}>
                  <torusGeometry args={[0.42 + (k === 1 || k === 2 ? -0.08 : 0), 0.01, 8, 56]} />
                  <meshBasicMaterial color={k >= 2 ? "#34d399" : "#f59e0b"} transparent opacity={idEnv * 0.55} blending={THREE.AdditiveBlending} />
                </mesh>
              ))}
            </>
          )}
          {i === 3 && (
            // interfaces: three floating rectangles
            <>
              {[-0.6, 0, 0.6].map((yy, k) => (
                <mesh key={k} position={[Math.sin(k) * 0.2, yy * 0.7, Math.cos(k) * 0.25]} rotation={[0, 0.4 - k * 0.35, 0]}>
                  <planeGeometry args={[0.7, 0.42]} />
                  <meshBasicMaterial color="#6ee7b7" wireframe transparent opacity={idEnv * 0.5} side={THREE.DoubleSide} />
                </mesh>
              ))}
            </>
          )}
        </group>
      ))}
    </group>
  );
};
