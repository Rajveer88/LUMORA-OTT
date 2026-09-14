import React, { useState } from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS } from "../timeline";
import { smoothstep, clamp01 } from "../lib/anim";
import { BustSilhouette } from "./BustSilhouette";

const PLATE = "assets/portrait-crop.jpg";

/** Slow-drifting residual computation motes for the identity shot. */
const FaintParticles: React.FC<{ time: number }> = ({ time }) => {
  const { width, height } = useVideoConfig();
  const dots = React.useMemo(() => {
    let seed = 909;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed / 4294967296;
    };
    return Array.from({ length: 90 }).map(() => ({
      x: rnd(),
      y: rnd(),
      r: 0.6 + rnd() * 1.6,
      p: rnd() * Math.PI * 2,
      s: 0.2 + rnd() * 0.8,
      hue: rnd(),
    }));
  }, []);
  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: 0.7 }}>
      {dots.map((d, i) => {
        const x = d.x * width + Math.sin(time * d.s + d.p) * 18;
        const y = d.y * height - ((time * 6 * d.s) % height);
        const col = d.hue > 0.8 ? "#22d3ee" : d.hue > 0.6 ? "#8b5cf6" : "#7d87c8";
        return <circle key={i} cx={x} cy={((y % height) + height) % height} r={d.r} fill={col} opacity={0.32} />;
      })}
    </svg>
  );
};

/** First face reveal, ~3.0–4.7s */
export const PortraitInsert: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / FPS;
  const [failed, setFailed] = useState(false);
  const env = smoothstep(3.0, 3.55, t) * (1 - smoothstep(4.2, 4.75, t));
  const size = height * 0.82;
  const ken = 1.12 - smoothstep(3.0, 4.75, t) * 0.08;

  if (env <= 0.001) return null;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: env }}>
      {/* scrim to obsidian */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 46%, rgba(5,6,11,0) 30%, rgba(5,6,11,0.55) 62%, rgba(5,6,11,0.97) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size,
          height: size,
          transform: `translate(-50%,-50%) scale(${ken})`,
          WebkitMaskImage:
            "radial-gradient(ellipse 48% 42% at 50% 44%, black 50%, transparent 76%)",
          maskImage:
            "radial-gradient(ellipse 48% 42% at 50% 44%, black 50%, transparent 76%)",
        }}
      >
        {failed ? (
          <BustSilhouette />
        ) : (
          <Img
            src={staticFile(PLATE)}
            onError={() => setFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
        )}
      </div>
      {/* violet / cyan rim traces */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 36% 42%, rgba(139,92,246,0.2), transparent 42%), radial-gradient(ellipse at 66% 46%, rgba(34,211,238,0.12), transparent 40%)",
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};

/** Final identity portrait, 38–40s — composed inside the 2.39 frame */
export const FinalPortrait: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / FPS;
  const [failed, setFailed] = useState(false);
  const env = smoothstep(38.08, 38.5, t);
  const nameEnv = smoothstep(38.55, 38.95, t);
  const titleEnv = smoothstep(38.9, 39.35, t);
  const scale = 1.05 - smoothstep(38.1, 39.9, t) * 0.05;

  // letterbox metrics
  const barH = Math.round(height * ((1 - 1 / 2.39) / 2));
  const plate = height * 0.47;
  const plateCenterY = height * 0.455; // centered in the open image band

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: env,
        background: "radial-gradient(ellipse at 50% 42%, #0a0c18 0%, #05060b 62%, #03040a 100%)",
      }}
    >
      <FaintParticles time={t} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: plateCenterY,
          width: plate,
          height: plate,
          transform: `translate(-50%,-50%) scale(${scale})`,
            WebkitMaskImage:
              "radial-gradient(ellipse 58% 66% at 50% 46%, black 44%, transparent 80%)",
            maskImage:
              "radial-gradient(ellipse 58% 66% at 50% 46%, black 44%, transparent 80%)",
        }}
      >
        {failed ? (
          <BustSilhouette />
        ) : (
          <Img
            src={staticFile(PLATE)}
            onError={() => setFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 16%" }}
          />
        )}
      </div>
      {/* rim traces from the universe */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 39% 36%, rgba(139,92,246,0.16), transparent 45%), radial-gradient(ellipse at 63% 42%, rgba(34,211,238,0.09), transparent 42%)",
          mixBlendMode: "screen",
        }}
      />
      {/* name + title, set into the lower letterbox band */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height - barH + barH * 0.34,
          textAlign: "center",
          opacity: nameEnv,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 300,
            fontSize: height * 0.034,
            letterSpacing: "0.34em",
            paddingLeft: "0.34em",
            color: "#eef1ff",
            textShadow: "0 0 40px rgba(139,92,246,0.4)",
          }}
        >
          RAJVEER AHIR
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: height * 0.008,
            fontSize: height * 0.0105,
            letterSpacing: "0.42em",
            paddingLeft: "0.42em",
            color: "#8d97c4",
            opacity: clamp01(titleEnv),
          }}
        >
          BUILDER&nbsp;&nbsp;·&nbsp;&nbsp;ENGINEER&nbsp;&nbsp;·&nbsp;&nbsp;CREATIVE&nbsp;TECHNOLOGIST
        </div>
      </div>
    </div>
  );
};
