import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getLayouts } from "./layouts";
import { Tag, ProjectTitle } from "./Labels";
import { smoothstep } from "../lib/anim";

const PROVIDERS = [
  "AgentRouter",
  "Pollinations",
  "Cerebras",
  "OpenRouter",
  "OpenCode",
  "Arena",
  "NVIDIA NIM",
];

export const OmniWorld: React.FC<{ time: number }> = ({ time }) => {
  const L = useMemo(() => getLayouts(), []);
  const grp = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const env = smoothstep(14.7, 16.3, time) * (1 - smoothstep(19.7, 20.6, time));
  const titleEnv = smoothstep(16.5, 17.2, time) * (1 - smoothstep(18.6, 19.2, time));

  const arcs = useMemo(() => {
    return L.omni.endpoints.map((e, i) => {
      const mid = e.pos.clone().lerp(L.omni.core, 0.5);
      mid.y += 1.35;
      const curve = new THREE.QuadraticBezierCurve3(e.pos, mid, L.omni.core);
      const pts = curve.getPoints(56);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return { geo, curve, color: e.hue, pos: e.pos, label: e.label };
    });
  }, [L]);

  const coreGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.42, 1)), []);
  const innerGeo = useMemo(() => new THREE.OctahedronGeometry(0.2, 0), []);

  // routing packets along arcs
  const PACKETS = 21;
  const packetRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.7;
      coreRef.current.rotation.x = time * 0.3;
      const pass = smoothstep(19.4, 19.95, time) * (1 - smoothstep(20.1, 20.9, time));
      coreRef.current.scale.setScalar(1 + pass * 1.35 + Math.sin(time * 4) * 0.03);
    }
    if (ringRef.current) ringRef.current.rotation.y = -time * 0.08;
    for (let i = 0; i < PACKETS; i++) {
      const m = packetRefs.current[i];
      if (!m) continue;
      const arc = arcs[i % arcs.length];
      const speed = 0.32 + (i % 3) * 0.07;
      if (i < PACKETS / 2) {
        // inbound requests
        const t = (time * speed + i * 0.137) % 1;
        m.position.copy(arc.curve.getPoint(t));
        (m.material as THREE.MeshBasicMaterial).opacity = env * (0.35 + 0.65 * Math.sin(t * Math.PI));
      } else {
        // intelligently redirected responses: out on a *different* arc
        const arc2 = arcs[(i + 3) % arcs.length];
        const t = (time * (speed * 0.85) + i * 0.151) % 1;
        m.position.copy(arc2.curve.getPoint(1 - t));
        (m.material as THREE.MeshBasicMaterial).opacity = env * (0.3 + 0.6 * Math.sin(t * Math.PI));
      }
      m.visible = env > 0.02;
    }
  });

  return (
    <group ref={grp} visible={env > 0.01}>
      {/* feeding arcs */}
      <group>
        {arcs.map((a, i) => (
          <lineSegments key={i} geometry={a.geo}>
            <lineBasicMaterial color={a.color} transparent opacity={env * 0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </lineSegments>
        ))}
      </group>

      {/* outer orbit ring */}
      <group ref={ringRef} position={L.omni.core.toArray()}>
        <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <torusGeometry args={[4.75, 0.006, 6, 180]} />
          <meshBasicMaterial color="#3b4480" transparent opacity={env * 0.6} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* provider endpoints */}
      {L.omni.endpoints.map((e, i) => (
        <group key={e.label} position={e.pos.toArray()}>
          <mesh>
            <sphereGeometry args={[0.14, 20, 20]} />
            <meshBasicMaterial color={e.hue} transparent opacity={env} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.007, 8, 48]} />
            <meshBasicMaterial color={e.hue} transparent opacity={env * 0.6} blending={THREE.AdditiveBlending} />
          </mesh>
          <Tag
            position={[0, 0.5 + (i % 2) * 0.28, 0]}
            color={e.hue}
            opacity={env * smoothstep(16.4 + i * 0.12, 16.9 + i * 0.12, time)}
            scale={0.15}
            anchor="center"
          >
            {e.label}
          </Tag>
        </group>
      ))}

      {/* routing core */}
      <group ref={coreRef} position={L.omni.core.toArray()}>
        <lineSegments geometry={coreGeo}>
          <lineBasicMaterial color="#7dd3fc" transparent opacity={env * 0.9} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <mesh geometry={innerGeo}>
          <meshBasicMaterial color="#0b2736" transparent opacity={env * 0.95} />
        </mesh>
        <mesh geometry={innerGeo} scale={0.55}>
          <meshBasicMaterial color="#22d3ee" transparent opacity={env} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* packets */}
      {Array.from({ length: PACKETS }).map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            packetRefs.current[i] = m;
          }}
        >
          <sphereGeometry args={[i < PACKETS / 2 ? 0.05 : 0.042, 12, 12]} />
          <meshBasicMaterial
            color={i < PACKETS / 2 ? "#bff3ff" : "#6ee7b7"}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      <ProjectTitle
        position={[L.omni.core.x, L.omni.core.y + 1.55, L.omni.core.z - 1.6]}
        title="OMNIROUTE"
        opacity={titleEnv}
        color="#dffaff"
        scale={0.8}
      />
    </group>
  );
};
