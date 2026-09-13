import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

const FACES = [
  { family: "Inter", weight: "300" as const, file: "fonts/inter-latin-300-normal.woff2" },
  { family: "Inter", weight: "400" as const, file: "fonts/inter-latin-400-normal.woff2" },
  { family: "Inter", weight: "500" as const, file: "fonts/inter-latin-500-normal.woff2" },
  { family: "Inter", weight: "600" as const, file: "fonts/inter-latin-600-normal.woff2" },
  { family: "Inter", weight: "700" as const, file: "fonts/inter-latin-700-normal.woff2" },
  { family: "JetBrains Mono", weight: "400" as const, file: "fonts/jetbrains-mono-latin-400-normal.woff2" },
  { family: "JetBrains Mono", weight: "500" as const, file: "fonts/jetbrains-mono-latin-500-normal.woff2" },
  { family: "JetBrains Mono", weight: "600" as const, file: "fonts/jetbrains-mono-latin-600-normal.woff2" },
];

let fontsPromise: Promise<void> | null = null;
const loadAll = () => {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      for (const f of FACES) {
        const url = staticFile(f.file);
        const face = new FontFace(f.family, `url(${url})`, { weight: f.weight });
        await face.load();
        (document.fonts as unknown as { add: (f: FontFace) => void }).add(face);
      }
      await document.fonts.ready;
    })();
  }
  return fontsPromise;
};

export const FontGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const handle = delayRender("Loading local typography");
    loadAll().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, []);
  if (!ready) return null;
  return <>{children}</>;
};
