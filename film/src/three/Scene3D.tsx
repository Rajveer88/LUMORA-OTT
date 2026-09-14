import React, { useRef } from "react";
import { ThreeCanvas } from "@remotion/three";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useVideoConfig, useCurrentFrame } from "remotion";
import { smoothstep } from "../lib/anim";
import { CameraRig } from "./CameraRig";
import { Subject } from "./Subject";
import { GraphWorld } from "./GraphWorld";
import { ParticleField } from "./ParticleField";
import { AtlasWorld } from "./AtlasWorld";
import { OmniWorld } from "./OmniWorld";
import { TrainingWorld } from "./TrainingWorld";
import { InterfaceWorld } from "./InterfaceWorld";
import { WorkbenchFX, MindLabels } from "./WorkbenchFX";
import { FPS } from "../timeline";

const SeedLights: React.FC<{ time: number }> = ({ time }) => {
  const rim = useRef<THREE.PointLight>(null);
  const spark = useRef<THREE.PointLight>(null);
  useFrame(() => {
    // emerges as the microscopic point expands, fades once we enter the system
    const born = smoothstep(1.4, 2.8, time);
    const gone = 1 - smoothstep(5.4, 6.4, time);
    if (rim.current) rim.current.intensity = 1.5 + born * 8 * gone;
    if (spark.current) spark.current.intensity = 0.6 + born * 2 * gone;
  });
  return (
    <>
      <pointLight ref={rim} position={[0.05, 1.78, 1.5]} intensity={2} color="#b9c4ff" distance={6} />
      <pointLight ref={spark} position={[0.0, 1.5, 1.28]} intensity={0.6} color="#f59e0b" distance={3.5} />
    </>
  );
};

export const Scene3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const time = frame / FPS;

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ fov: 46, position: [-2.45, 1.72, -3.5], near: 0.1, far: 140 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#05060b"]} />
      <fog attach="fog" args={["#05060b", 14, 52]} />

      {/* observatory lighting */}
      <ambientLight intensity={0.4} color="#3d4680" />
      <hemisphereLight args={["#2a336b", "#05060b", 0.55]} />
      {/* rim lights on the subject */}
      <spotLight
        position={[-3.2, 2.9, -2.6]}
        angle={0.62}
        penumbra={1}
        intensity={30}
        color="#8b5cf6"
        distance={18}
        target-position={[0, 1.55, 0]}
      />
      <spotLight
        position={[3.4, 2.5, -3.0]}
        angle={0.62}
        penumbra={1}
        intensity={22}
        color="#22d3ee"
        distance={18}
      />
      <SeedLights time={time} />
      {/* cool fill from behind camera for the subject's back and the workbench */}
      <pointLight position={[0, 3.3, -2.6]} intensity={3.2} color="#5a68b8" distance={11} />
      <pointLight position={[2.6, 2.0, -3.6]} intensity={4.5} color="#6b78c8" distance={14} />
      <pointLight position={[0, 2.2, 2.2]} intensity={5} color="#3a4a90" distance={10} />

      <CameraRig time={time} />
      <Subject time={time} />
      <GraphWorld time={time} />
      <ParticleField time={time} />
      <MindLabels time={time} />
      <AtlasWorld time={time} />
      <OmniWorld time={time} />
      <TrainingWorld time={time} />
      <InterfaceWorld time={time} />
      <WorkbenchFX time={time} />

      <EffectComposer>
        <Bloom
          intensity={0.46}
          luminanceThreshold={0.46}
          luminanceSmoothing={0.5}
          mipmapBlur
          radius={0.58}
        />
        <Vignette eskil={false} offset={0.22} darkness={0.88} />
      </EffectComposer>
    </ThreeCanvas>
  );
};
