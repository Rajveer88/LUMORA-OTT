import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { smoothstep, clamp01 } from "../lib/anim";

// Stylized rim-lit figure. The face identity is carried by the photographic
// portrait inserts; this body exists inside the 3D observatory: dark clothing,
// white collar, charcoal blazer, back/side rim light. It breathes, turns, and
// reaches toward the systems.
export const Subject: React.FC<{ time: number }> = ({ time }) => {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const rArm = useRef<THREE.Group>(null);
  const lArm = useRef<THREE.Group>(null);
  const rFore = useRef<THREE.Group>(null);
  const bodyMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const skinMats = useRef<THREE.MeshStandardMaterial[]>([]);

  const cloth = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a2038", roughness: 0.72, metalness: 0.25, emissive: "#0b0f22", emissiveIntensity: 0.5 }), []);
  const blazer = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2e3655", roughness: 0.62, metalness: 0.35, emissive: "#0c1024", emissiveIntensity: 0.55 }), []);
  const trouser = useMemo(() => new THREE.MeshStandardMaterial({ color: "#171b30", roughness: 0.85, metalness: 0.1, emissive: "#070a16", emissiveIntensity: 0.5 }), []);
  const skin = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a5a3b", roughness: 0.62, metalness: 0.05 }), []);
  const hair = useMemo(() => new THREE.MeshStandardMaterial({ color: "#14100d", roughness: 0.9, metalness: 0.05 }), []);
  const shirt = useMemo(() => new THREE.MeshStandardMaterial({ color: "#dfe3ee", roughness: 0.7, metalness: 0.0 }), []);
  const beard = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1c1612", roughness: 0.95 }), []);

  // global visibility
  const envOut = (t: number) => {
    // present 0-5.4 (dissolve as camera passes into system), back from 29
    const first = 1 - smoothstep(5.15, 6.1, t);
    const second = smoothstep(29.0, 30.2, t);
    const cut = 1 - smoothstep(37.95, 38.18, t);
    return clamp01(Math.max(first, second)) * cut;
  };
  const vis = envOut(time);

  useFrame(() => {
    if (root.current) root.current.visible = vis > 0.01;
    const breathe = 1 + Math.sin(time * 1.5) * 0.0035;
    if (root.current) root.current.scale.set(1, breathe, 1);
    if (head.current) {
      // micro-movement; turns toward the reaching hand in workbench
      const reachT = smoothstep(31.3, 32.6, time) * (1 - smoothstep(34.1, 34.8, time));
      head.current.rotation.y = Math.sin(time * 0.35) * 0.05 - reachT * 0.35;
      head.current.rotation.x = reachT * 0.12 + Math.sin(time * 0.27) * 0.03;
    }
    // right arm reaches forward and opens the hand
    const reach = smoothstep(31.2, 32.7, time) * (1 - smoothstep(33.9, 34.5, time) * 0.4);
    if (rArm.current) {
      rArm.current.rotation.x = -0.08 - reach * 1.32;
      rArm.current.rotation.z = 0.16 - reach * 0.25;
    }
    if (rFore.current) {
      rFore.current.rotation.x = -reach * 0.35;
    }
    if (lArm.current) lArm.current.rotation.z = -0.16;
    const allMats = [cloth, blazer, trouser, skin, hair, shirt, beard];
    allMats.forEach((m) => (m.transparent = true));
    cloth.opacity = blazer.opacity = trouser.opacity = hair.opacity = shirt.opacity = beard.opacity = vis;
    skin.opacity = vis;
  });

  return (
    <group ref={root} position={[0, 0, 0]}>
      {/* legs */}
      <mesh material={trouser} position={[-0.1, 0.42, 0]} castShadow={false}>
        <capsuleGeometry args={[0.105, 0.74, 6, 14]} />
      </mesh>
      <mesh material={trouser} position={[0.1, 0.42, 0]}>
        <capsuleGeometry args={[0.105, 0.74, 6, 14]} />
      </mesh>
      {/* shoes */}
      <mesh material={cloth} position={[-0.1, 0.06, 0.05]} scale={[0.16, 0.09, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh material={cloth} position={[0.1, 0.06, 0.05]} scale={[0.16, 0.09, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      {/* torso / blazer */}
      <mesh material={blazer} position={[0, 1.13, 0]} scale={[1.12, 1.18, 0.78]}>
        <capsuleGeometry args={[0.19, 0.46, 8, 18]} />
      </mesh>
      {/* shoulders */}
      <mesh material={blazer} position={[0, 1.42, 0]} scale={[1.9, 0.55, 0.95]}>
        <sphereGeometry args={[0.16, 24, 16]} />
      </mesh>
      {/* white shirt front + collar hint */}
      <mesh material={shirt} position={[0, 1.16, 0.155]} scale={[0.62, 1.05, 0.35]}>
        <planeGeometry args={[0.3, 0.62]} />
      </mesh>
      <mesh material={shirt} position={[-0.055, 1.46, 0.15]} rotation={[0, 0, 0.35]}>
        <planeGeometry args={[0.11, 0.12]} />
      </mesh>
      <mesh material={shirt} position={[0.055, 1.46, 0.15]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[0.11, 0.12]} />
      </mesh>

      {/* neck */}
      <mesh material={skin} position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.058, 0.07, 0.16, 16]} />
      </mesh>

      {/* head group */}
      <group ref={head} position={[0, 1.72, 0]}>
        <mesh material={skin}>
          <sphereGeometry args={[0.15, 32, 24]} />
        </mesh>
        {/* ears */}
        <mesh material={skin} position={[-0.152, -0.01, 0]} scale={[0.55, 0.8, 0.7]}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>
        <mesh material={skin} position={[0.152, -0.01, 0]} scale={[0.55, 0.8, 0.7]}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>
        {/* jaw beard: partial shell around lower face */}
        <mesh material={beard} position={[0, -0.045, 0.02]} scale={[1.02, 0.72, 1.02]}>
          <sphereGeometry args={[0.15, 32, 16, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.5]} />
        </mesh>
        {/* hair cap: dense black wavy top */}
        <mesh material={hair} position={[0, 0.055, -0.015]} scale={[1.07, 1.0, 1.08]}>
          <sphereGeometry args={[0.155, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        </mesh>
        <mesh material={hair} position={[0, 0.02, -0.1]} scale={[1.05, 1.05, 0.85]}>
          <sphereGeometry args={[0.15, 28, 18, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5]} />
        </mesh>
        {/* hair clumps for volume */}
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={hair}
              position={[Math.cos(a) * 0.145, 0.07 - (i % 3) * 0.02, -0.02 + Math.sin(a) * 0.13]}
              scale={[0.45 + (i % 2) * 0.15, 0.7, 0.45]}
            >
              <sphereGeometry args={[0.045, 10, 10]} />
            </mesh>
          );
        })}
      </group>

      {/* arms, pivoted at shoulders */}
      <group ref={lArm} position={[-0.23, 1.38, 0]}>
        <mesh material={blazer} position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.062, 0.34, 6, 12]} />
        </mesh>
        <mesh material={skin} position={[0, -0.46, 0]} scale={[0.9, 1.1, 0.9]}>
          <sphereGeometry args={[0.055, 14, 12]} />
        </mesh>
      </group>
      <group ref={rArm} position={[0.23, 1.38, 0]}>
        <mesh material={blazer} position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.062, 0.34, 6, 12]} />
        </mesh>
        <group ref={rFore} position={[0, -0.42, 0]}>
          <mesh material={cloth} position={[0, -0.13, 0]}>
            <capsuleGeometry args={[0.055, 0.22, 6, 12]} />
          </mesh>
          <mesh material={skin} position={[0, -0.3, 0.02]} scale={[0.85, 1.25, 0.55]}>
            <sphereGeometry args={[0.058, 16, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
