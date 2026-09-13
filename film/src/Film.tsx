import React from "react";
import { AbsoluteFill } from "remotion";
import { FontGate } from "./FontGate";
import { Scene3D } from "./three/Scene3D";
import { Overlays } from "./overlays/Cinematics";
import { Soundtrack } from "./audio/Soundtrack";

export const PortfolioFilm: React.FC = () => {
  return (
    <FontGate>
      <AbsoluteFill style={{ background: "#05060b", overflow: "hidden" }}>
        <Scene3D />
        <Overlays />
        <Soundtrack />
      </AbsoluteFill>
    </FontGate>
  );
};
