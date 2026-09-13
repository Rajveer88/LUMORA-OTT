import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { VO, s, FPS } from "../timeline";
import { clamp01, smoothstep } from "../lib/anim";

const BED_BASE = 0.72;
const BED_DUCK = 0.55; // level under narration
const FADE = 0.3; // seconds

/** Continuous bed, gently ducked beneath each VO line for clear narration. */
const bedVolume = (frame: number): number => {
  const t = frame / FPS;
  let env = 0;
  for (const c of VO) {
    const fadeIn = smoothstep(c.start - FADE, c.start, t);
    const fadeOut = 1 - smoothstep(c.start + c.duration, c.start + c.duration + FADE, t);
    env = Math.max(env, clamp01(fadeIn * fadeOut));
  }
  return BED_BASE * (1 - env) + BED_DUCK * env;
};

export const Soundtrack: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("audio/bed.wav")} volume={bedVolume} />
      {VO.map((clip) => (
        <Sequence key={clip.id} from={s(clip.start)} layout="none" durationInFrames={Math.ceil(clip.duration * FPS) + 8}>
          <Audio src={staticFile(clip.src)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};
