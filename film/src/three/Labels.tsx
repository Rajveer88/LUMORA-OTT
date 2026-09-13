import React from "react";
import { Html } from "@react-three/drei";
import { useVideoConfig } from "remotion";
import * as THREE from "three";

const mono: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  whiteSpace: "pre",
  pointerEvents: "none",
  userSelect: "none",
};

/** Small technical annotation living inside the environment. */
export const Tag: React.FC<{
  position: [number, number, number];
  children?: React.ReactNode;
  color?: string;
  scale?: number;
  opacity?: number;
  anchor?: "left" | "center";
  transform?: boolean;
  bob?: number;
}> = ({ position, children, color = "#9aa6ff", scale = 0.16, opacity = 1, anchor = "left", transform = true, bob = 0 }) => {
  return (
    <Html
      position={position}
      transform={transform}
      sprite={transform}
      zIndexRange={[10, 0]}
      style={{ ...mono, opacity }}
      scale={transform ? scale : undefined}
      wrapperClass="env-tag"
    >
      <div
        style={{
          ...mono,
          display: "flex",
          alignItems: "center",
          gap: 7,
          justifyContent: anchor === "center" ? "center" : "flex-start",
          transform: bob ? `translateY(${Math.sin(bob) * 4}px)` : undefined,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: 5, background: color, boxShadow: `0 0 8px ${color}`, display: "inline-block" }} />
        <span style={{ color, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500, textShadow: `0 0 14px ${color}66` }}>
          {children}
        </span>
      </div>
    </Html>
  );
};

/** Large project title standing in space (screen-facing billboard). */
export const ProjectTitle: React.FC<{
  position: [number, number, number];
  title: string;
  subtitle?: string;
  opacity?: number;
  color?: string;
  scale?: number;
}> = ({ position, title, subtitle, opacity = 1, color = "#eef1ff", scale = 1 }) => {
  const { width } = useVideoConfig();
  const rs = (width / 1920) * scale;
  return (
    <Html position={position} transform={false} zIndexRange={[12, 0]} style={{ opacity, pointerEvents: "none" }} center>
      <div style={{ textAlign: "center", transform: `scale(${rs})`, transformOrigin: "center", width: 1100 }}>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 250,
            fontSize: 58,
            letterSpacing: "0.42em",
            color,
            paddingLeft: "0.42em",
            textShadow: "0 0 34px rgba(139,92,246,0.55)",
            lineHeight: 1,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              ...mono,
              marginTop: 16,
              fontSize: 12.5,
              letterSpacing: "0.5em",
              paddingLeft: "0.5em",
              color: "#8d97c4",
            }}
          >
            {subtitle}
          </div>
        ) : null}
        <div style={{ margin: "18px auto 0", width: 92, height: 1, background: "linear-gradient(90deg,transparent,#8b5cf6,transparent)" }} />
      </div>
    </Html>
  );
};

/** Tiny monospace coordinate readout. */
export const Readout: React.FC<{
  position: [number, number, number];
  lines: string[];
  opacity?: number;
  color?: string;
  scale?: number;
}> = ({ position, lines, opacity = 1, color = "#5b6486", scale = 0.11 }) => (
  <Html position={position} transform sprite zIndexRange={[9, 0]} scale={scale} style={{ ...mono, opacity }}>
    <div style={{ ...mono, fontSize: 11, lineHeight: 1.7, letterSpacing: "0.1em", color, textAlign: "left" }}>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  </Html>
);

export const V3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
