# MANY SYSTEMS · ONE BUILDER
### A 40-second cinematic personal portfolio film — Remotion + React Three Fiber

The film is one continuous computational object that changes form around a
single person:

```
PERSON → CURIOSITY → MIND/GRAPH → CODEATLAS → OMNIROUTE
       → MODEL TRAINING → INTERFACES → WORKBENCH → UNIVERSE → IDENTITY
```

Every transformation is a semantic morph of the *same* population of nodes
(`src/three/layouts.ts`): dependency edges become routing paths, endpoints
compress into neural layers, layer outputs become interface geometry, and the
interfaces expand back into an ecosystem around the builder. There are no
slide cuts between worlds — the camera physically travels through them.

## Structure

| File | Role |
| --- | --- |
| `src/timeline.ts` | 40 s master clock, scene/layout windows, VO schedule, palette, RNG |
| `src/three/CameraRig.tsx` | Physical camera journey (Catmull-smoothed knots, roll, fov punches) |
| `src/three/Subject.tsx` | Rim-lit figure that breathes, turns and reaches toward the systems |
| `src/three/GraphWorld.tsx` | The master morphing graph: GPU points + crossfading edge fields |
| `src/three/layouts.ts` | Eight deterministic semantic layouts for one shared node population |
| `src/three/ParticleField.tsx` | Volumetric dust + drifting near motes |
| `src/three/AtlasWorld.tsx` | CodeAtlas: clusters, orbital shells, `auth_service`, dependency path |
| `src/three/OmniWorld.tsx` | OmniRoute: seven spatial provider endpoints + routing core + packets |
| `src/three/TrainingWorld.tsx` | Mini-Soup style training machine: layers, LoRA, activation wave, output |
| `src/three/InterfaceWorld.tsx` | Output becomes a curved wall of designed panels, charts, code |
| `src/three/WorkbenchFX.tsx` | Mind instrumentation labels, project signatures, hand-ripple, shell |
| `src/three/panelTextures.tsx` | Canvas-drawn technical UI surfaces (code, telemetry, topology…) |
| `src/three/Labels.tsx` | Environmental tags + large project titles (sparse typography) |
| `src/overlays/Portrait.tsx` | Photographic face reveal and final identity portrait |
| `src/overlays/Cinematics.tsx` | Letterbox, grain, grade, title card, final fade |
| `src/audio/Soundtrack.tsx` | Deterministic VO placement over the synthesized bed |
| `tools/make-audio.mjs` | Procedural sound design + VO silence-trim/tempo normalization |
| `tools/prepare-plates.mjs` | Bakes the cinematic identity plate from the reference photo |

## Audio

`tools/make-audio.mjs` synthesizes the entire sonic bed without external
samples: room tone, electrical texture, computational pulses, per-project
tonal motifs, spatial whooshes, UI clicks and the unifying impact. Voice-over
clips live in `public/audio/vo-XX.mp3`; the tool trims silence, applies a
subtle tempo normalization and writes `vo-XX-t.mp3` on the film's timeline.

## Identity plate

The reference photograph is the identity anchor. Drop it at
`assets/source.jpg` (or leave the uploaded file in `/home/user/uploads`) and run:

```
node tools/prepare-plates.mjs
```

It detects the circular avatar, grades it into the obsidian palette while
preserving face/skin/hair identity, and writes `public/assets/portrait-crop.jpg`
used by the first face reveal and the final portrait.

## Commands

```
npm install
npm run audio       # rebuild sound design + normalize VO
npm run plates      # rebuild the identity plate from the reference photo
npm run preview     # Remotion studio
npm run render      # 1920x1080 master -> out/film.mp4
npm run render:720  # faster 720p validation render
```

The render is fully deterministic; every layout, particle, texture and pulse
is seeded.
