import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { FPS } from "../timeline";

/**
 * Procedural rim-lit head-and-shoulders silhouette used ONLY until the real
 * identity plate (public/assets/portrait-crop.jpg) is baked by
 * tools/prepare-plates.mjs. It carries no invented facial identity — it is a
 * dark figure edged with the film's violet/cyan light and threaded with the
 * same computational constellation as the worlds behind it.
 */

// deterministic constellation nodes in the 200x200 viewBox
const NODES: [number, number, number][] = [
  [30, 58, 0.9], [22, 92, 0.6], [34, 124, 0.8], [52, 148, 0.5],
  [74, 158, 0.7], [100, 162, 0.55], [128, 156, 0.75], [152, 142, 0.6],
  [168, 112, 0.85], [176, 78, 0.6], [168, 46, 0.7], [146, 24, 0.5],
  [116, 14, 0.65], [84, 16, 0.55], [54, 26, 0.7],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14], [14, 0],
  [0, 14], [8, 10], [2, 4],
];

export const BustSilhouette: React.FC<{ tone?: number }> = ({ tone = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const motes = useMemo(() => {
    let seed = 4127;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      return seed / 4294967296;
    };
    return Array.from({ length: 34 }).map(() => ({
      x: 14 + rnd() * 172,
      y0: rnd() * 200,
      spd: 3.2 + rnd() * 5.5,
      r: 0.5 + rnd() * 1.3,
      ph: rnd() * Math.PI * 2,
      hue: rnd(),
      op: 0.25 + rnd() * 0.5,
    }));
  }, []);

  const breathe = Math.sin(t * 1.05) * 0.7;
  const rimV = 0.55 + Math.sin(t * 0.8) * 0.12;
  const rimC = 0.5 + Math.sin(t * 0.8 + 1.7) * 0.14;

  return (
    <svg
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        transform: `translateY(${breathe * 0.28}%)`,
      }}
    >
      <defs>
        <radialGradient id="bs-fill" cx="50%" cy="36%" r="78%">
          <stop offset="0%" stopColor="#141838" />
          <stop offset="55%" stopColor="#0b0e24" />
          <stop offset="100%" stopColor="#05060f" />
        </radialGradient>
        <linearGradient id="bs-rimL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bs-rimR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="bs-glowV" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c5cf0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7c5cf0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bs-glowC" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1fb8d8" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#1fb8d8" stopOpacity="0" />
        </radialGradient>
        <filter id="bs-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <clipPath id="bs-frame">
          <rect x="0" y="0" width="200" height="200" />
        </clipPath>
      </defs>

      <g clipPath="url(#bs-frame)" opacity={tone}>
        {/* back light washes */}
        <ellipse cx="74" cy="80" rx="62" ry="74" fill="url(#bs-glowV)" opacity={rimV} />
        <ellipse cx="130" cy="92" rx="58" ry="70" fill="url(#bs-glowC)" opacity={rimC} />

        {/* drifting motes */}
        {motes.map((m, i) => {
          const yy = ((m.y0 - t * m.spd * 6) % 214 + 214) % 214 - 7;
          const xx = m.x + Math.sin(t * 0.7 + m.ph) * 3;
          const tw = 0.55 + 0.45 * Math.sin(t * 2.1 + m.ph);
          const col = m.hue > 0.82 ? "#67e8f9" : m.hue > 0.6 ? "#a78bfa" : "#7d87c8";
          return <circle key={i} cx={xx} cy={yy} r={m.r} fill={col} opacity={m.op * tw} />;
        })}

        {/* constellation halo */}
        <g>
          {LINKS.map(([a, b], i) => {
            const A = NODES[a];
            const B = NODES[b];
            const pulse = 0.22 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.6 + i));
            return (
              <line
                key={i}
                x1={A[0]}
                y1={A[1]}
                x2={B[0]}
                y2={B[1]}
                stroke={i % 3 === 0 ? "#67e8f9" : "#8b7cf6"}
                strokeWidth={0.45}
                opacity={pulse}
              />
            );
          })}
          {NODES.map(([x, y, s], i) => {
            const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.3));
            const col = i % 4 === 0 ? "#67e8f9" : i % 4 === 2 ? "#c4b5fd" : "#9d9bd8";
            return <circle key={"n" + i} cx={x} cy={y} r={1.0 * s * tw + 0.55} fill={col} opacity={0.9 * tw} />;
          })}
        </g>

        {/* figure: shoulders + neck + head, pure dark fill */}
        <path
          d="M30 200 C36 156 62 142 100 142 C138 142 164 156 170 200 Z"
          fill="url(#bs-fill)"
        />
        <path d="M86 120 L114 120 L116 146 L84 146 Z" fill="#080a1c" />
        <ellipse cx="100" cy="86" rx="29" ry="37" fill="url(#bs-fill)" />

        {/* rim edges, violet on the left, cyan on the right */}
        <g filter="url(#bs-soft)">
          <path
            d="M73 62 C66 88 70 116 88 132"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            opacity={Math.min(1, rimV * 1.3)}
          />
          <path
            d="M127 62 C135 88 130 116 112 132"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.8"
            strokeLinecap="round"
            opacity={Math.min(1, rimC * 1.35)}
          />
          <path
            d="M38 196 C46 162 68 150 92 147"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="2.3"
            strokeLinecap="round"
            opacity={Math.min(1, rimV)}
          />
          <path
            d="M162 196 C154 162 132 150 108 147"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2.3"
            strokeLinecap="round"
            opacity={Math.min(1, rimC)}
          />
        </g>

        {/* crisp hairline rims above the blur */}
        <path d="M73 62 C66 88 70 116 88 132" fill="none" stroke="#b9a7ff" strokeWidth="0.7" opacity={rimV} />
        <path d="M127 62 C135 88 130 116 112 132" fill="none" stroke="#7df0ff" strokeWidth="0.7" opacity={rimC} />
        <path
          d="M71 88 C71 60 84 47 100 47 C116 47 129 60 129 88"
          fill="none"
          stroke="#9aa4e8"
          strokeWidth="0.55"
          opacity="0.34"
        />
        {/* shoulder collar line */}
        <path
          d="M44 188 C52 164 72 153 100 153 C128 153 148 164 156 188"
          fill="none"
          stroke="#8f98d8"
          strokeWidth="0.5"
          opacity="0.4"
        />
      </g>
    </svg>
  );
};
