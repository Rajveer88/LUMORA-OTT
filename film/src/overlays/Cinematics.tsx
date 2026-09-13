import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FPS } from "../timeline";
import { smoothstep, clamp01 } from "../lib/anim";
import { Grain } from "./Grain";
import { PortraitInsert, FinalPortrait } from "./Portrait";

// 2.39:1 letterbox as a fraction of frame height (resolution independent)
const BAR_FRAC = (1 - 1 / 2.39) / 2;

const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const t = frame / FPS;
  const env = smoothstep(0.1, 0.9, t);
  const barH = Math.round(height * BAR_FRAC);
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: barH, background: "#000", transform: `translateY(${(1 - env) * -barH}px)`, zIndex: 16 }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: barH, background: "#000", transform: `translateY(${(1 - env) * barH}px)`, zIndex: 16 }} />
    </>
  );
};

const BuildingSystems: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const t = frame / FPS;
  const env = smoothstep(2.0, 2.75, t) * (1 - smoothstep(4.0, 4.5, t));
  const y = 8 + (1 - smoothstep(2.0, 2.9, t)) * 14;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        opacity: env * 0.92,
        transform: `translateY(${y}px)`,
        zIndex: 22,
        pointerEvents: "none",
      }}
    >
      <div style={{ marginTop: height * 0.6, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: height * 0.034,
            letterSpacing: "0.52em",
            paddingLeft: "0.52em",
            color: "#dfe5ff",
            textShadow: "0 0 26px rgba(139,92,246,0.5)",
          }}
        >
          BUILDING SYSTEMS
        </div>
        <div style={{ marginTop: height * 0.018, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: 0.85 }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,#5b6486)" }} />
          <div style={{ width: 5, height: 5, borderRadius: 5, background: "#8b5cf6", boxShadow: "0 0 10px #8b5cf6" }} />
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,#5b6486,transparent)" }} />
        </div>
      </div>
    </div>
  );
};

const BlackControl: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // cut dip into identity portrait
  const cut = smoothstep(37.98, 38.16, t) * (1 - smoothstep(38.24, 38.42, t));
  // final fade to black
  const end = smoothstep(39.68, 39.99, t);
  const o = clamp01(Math.max(cut, end));
  return <div style={{ position: "absolute", inset: 0, background: "#000", opacity: o, zIndex: 60, pointerEvents: "none" }} />;
};

// subtle color grade + black crush across the whole frame
const Grade: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 39,
      background:
        "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,5,0.42) 100%), linear-gradient(180deg, rgba(20,16,48,0.05), rgba(0,0,0,0.12))",
    }}
  />
);

export const Overlays: React.FC = () => {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}>
        <PortraitInsert />
        <BuildingSystems />
        <FinalPortrait />
      </div>
      <Grade />
      <Grain />
      <Letterbox />
      <BlackControl />
    </>
  );
};
