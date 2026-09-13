import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getLayouts } from "./layouts";
import { Tag, ProjectTitle, Readout } from "./Labels";
import { smoothstep } from "../lib/anim";

export const AtlasWorld: React.FC<{ time: number }> = ({ time }) => {
  const L = useMemo(() => getLayouts(), []);
  const grp = useRef<THREE.Group>(null);
  const ringMats = useRef<THREE.MeshBasicMaterial[]>([]);
  const tubeMat = useRef<THREE.MeshBasicMaterial>(null);
  const packetRef = useRef<THREE.Mesh>(null);
  const authRef = useRef<THREE.Group>(null);
  const hubRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Group>(null);

  const env = smoothstep(9.8, 11.0, time) * (1 - smoothstep(14.7, 15.5, time));
  const titleEnv = smoothstep(10.9, 11.7, time) * (1 - smoothstep(12.9, 13.4, time));

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(L.atlas.authPath, false, "catmullrom", 0.4),
    [L]
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 140, 0.018, 8, false), [curve]);

  const territoryRings = useMemo(() => {
    return L.atlas.clusters.slice(1).map((c, i) => {
      const g = new THREE.TorusGeometry(1.18 + (i % 2) * 0.2, 0.007, 8, 90);
      return { g, c, tilt: i * 0.33 };
    });
  }, [L]);

  const hubGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.4, 1)), []);
  const shells = useMemo(
    () => [
      { r: 4.9, tube: 0.006, color: "#3c4480" },
      { r: 5.85, tube: 0.005, color: "#2a3160" },
    ],
    []
  );

  useFrame(() => {
    if (hubRef.current) {
      hubRef.current.rotation.y = time * 0.25;
      hubRef.current.rotation.x = Math.sin(time * 0.18) * 0.2;
    }
    if (shellRef.current) shellRef.current.rotation.y = -time * 0.05;
    ringMats.current.forEach((m, i) => {
      if (!m) return;
      const pulse = 0.14 + 0.1 * (0.5 + 0.5 * Math.sin(time * 1.6 + i * 1.4));
      m.opacity = env * pulse;
    });
    if (tubeMat.current) {
      const thrust = smoothstep(12.3, 12.9, time) * (1 - smoothstep(13.9, 14.5, time));
      tubeMat.current.opacity = env * (0.35 + thrust * 0.5);
    }
    if (packetRef.current) {
      const speed = 0.22 + smoothstep(12.3, 13.2, time) * 0.5;
      const t = (time * speed + 0.1) % 1;
      packetRef.current.position.copy(curve.getPoint(t));
      const sc = 0.8 + 0.4 * Math.sin(time * 9);
      packetRef.current.scale.setScalar(sc);
      const m = packetRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = env * (0.6 + 0.4 * Math.sin(t * Math.PI));
    }
    if (authRef.current) authRef.current.rotation.y = time * 0.5;
  });

  return (
    <group ref={grp} visible={env > 0.01}>
      {/* orbital hierarchy shells */}
      <group ref={shellRef} position={L.atlas.hub.toArray()}>
        {shells.map((s, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, i * 0.4]} scale={[1, 0.82, 1]}>
            <torusGeometry args={[s.r, s.tube, 6, 160]} />
            <meshBasicMaterial
              color={s.color}
              transparent
              opacity={env * 0.5}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* territory boundary rings */}
      {territoryRings.map((r, i) => (
        <mesh
          key={i}
          geometry={r.g}
          position={r.c.toArray()}
          rotation={[Math.PI / 2 + r.tilt * 0.2, 0, r.tilt]}
        >
          <meshBasicMaterial
            ref={(m) => {
              if (m) ringMats.current[i] = m;
            }}
            color="#7c6cf0"
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* central hub */}
      <group ref={hubRef} position={L.atlas.hub.toArray()}>
        <lineSegments geometry={hubGeo}>
          <lineBasicMaterial color="#22d3ee" transparent opacity={env * 0.8} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <mesh>
          <icosahedronGeometry args={[0.22, 1]} />
          <meshBasicMaterial color="#0e2a3a" transparent opacity={env * 0.9} />
        </mesh>
      </group>

      {/* auth_service node + dependency path */}
      <group position={L.atlas.auth.toArray()}>
        <group ref={authRef}>
          <mesh>
            <octahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={env} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.34, 0]} />
            <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={env * 0.6} />
          </mesh>
        </group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.46, 0.008, 8, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={env * 0.55} blending={THREE.AdditiveBlending} />
        </mesh>
        <Tag position={[0, 0.62, 0]} color="#7dd3fc" opacity={env} scale={0.17}>
          auth_service
        </Tag>
        <Readout
          position={[0.42, -0.5, 0.1]}
          opacity={env * 0.85}
          lines={["deps: 14", "cluster: core", "LOC: 2.4k"]}
        />
      </group>

      {/* dependency filament */}
      <mesh geometry={tube}>
        <meshBasicMaterial
          ref={tubeMat}
          color="#38bdf8"
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#e8fcff" transparent blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {[L.atlas.authPath[2], L.atlas.authPath[4]].map((p, i) => (
        <mesh key={i} position={p.toArray()}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshBasicMaterial color={i === 0 ? "#34d399" : "#a78bfa"} transparent opacity={env * 0.9} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      <ProjectTitle
        position={[L.atlas.hub.x - 0.5, L.atlas.hub.y + 1.35, L.atlas.hub.z + 1.5]}
        title="CODE ATLAS"
        subtitle="UNDERSTAND THE SYSTEM BEHIND THE CODE"
        opacity={titleEnv}
        scale={0.85}
      />
    </group>
  );
};
