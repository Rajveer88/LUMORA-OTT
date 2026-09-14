import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Deterministic fine film grain, stepped across tiles.
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tiles = useMemo(() => {
    const out: string[] = [];
    let seed = 1234;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let t = 0; t < 6; t++) {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      const img = ctx.createImageData(256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = rnd() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 38;
      }
      ctx.putImageData(img, 0, 0);
      out.push(c.toDataURL("image/png"));
    }
    return out;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        backgroundImage: `url(${tiles[frame % tiles.length]})`,
        backgroundSize: "256px 256px",
        opacity: 0.085,
        mixBlendMode: "overlay",
        width,
        height,
      }}
    />
  );
};
