import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { VO, s } from "../timeline";

export const Soundtrack: React.FC = () => {
  return (
    <>
      <Audio src={staticFile("audio/bed.wav")} volume={0.72} />
      {VO.map((clip) => (
        <Sequence key={clip.id} from={s(clip.start)} layout="none" durationInFrames={Math.ceil(clip.duration * 24) + 8}>
          <Audio src={staticFile(clip.src)} volume={1} />
        </Sequence>
      ))}
    </>
  );
};
