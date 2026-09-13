import React from "react";
import { Composition } from "remotion";
import { PortfolioFilm } from "./Film";
import { FPS, TOTAL_FRAMES, WIDTH, HEIGHT } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PortfolioFilm"
        component={PortfolioFilm}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
