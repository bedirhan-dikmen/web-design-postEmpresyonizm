# Code Reference

Clean, standalone reference copies of the most reusable helpers. **These are copies for reading and
porting, not modules.**

---

## Rules

- **Nothing here is imported by the live site.** No production file points into this folder, and none
  ever should.
- **Nothing here was moved.** Every production file remains exactly where it was.
- These are *distilled* versions: dependencies on this project's geometry files, brand constants and
  React layers have been removed so each file can be read on its own. They are not drop-in
  replacements for the production code and they have not been compiled or run.
- The authoritative implementation is always the production file named at the top of each reference
  copy and in the implementation maps.

## Why the `.ts.txt` extension

The project's `tsconfig.json` includes `**/*.ts`. A `.ts` file in this archive would be pulled into
the TypeScript program and into `next build`, which would mean the archive could break the
production build — the opposite of what an archive is for.

Using `.ts.txt` keeps these files out of the compiler and out of the bundle without modifying any
production configuration. To use one in a new project, rename it to `.ts` there.

## Files

| File | What it is | Production source |
|---|---|---|
| `camera-model.ts.txt` | The portal-square camera: design space, cover mapping, per-depth layer transform, the cover predicate | `lib/prototype/camera.ts`, `lib/prototype/sceneConfig.ts` |
| `portal-crossing.ts.txt` | The threshold crossing: brushy aperture, hole clip, world toggling, glow/flare, the seven-step sequence as timeline calls | `components/prototype/PortalFilm.tsx`, `lib/prototype/timeline.ts` |
| `beat-timeline.ts.txt` | Beat maps, fractional positioning, camera path interpolation (Catmull-Rom over log zoom), travel/look/text helpers | `lib/prototype/chapter4/timeline.ts` |
| `module-field.ts.txt` | The persistent particle field: seeded construction, roles, tinted sprite cache, the dab primitive, near-fade, formation morphing | `lib/prototype/moduleField.ts`, `lib/prototype/chapter4/formations.ts` |
| `qr-geometry.ts.txt` | Seeded PRNG, the stylised code matrix, finder cell ordering, deterministic slot assignment | `lib/prototype/moduleField.ts`, `lib/prototype/chapter4/formations.ts`, `lib/prototype/chapter5/finalQr.ts` |

## What is deliberately NOT copied

| Not copied | Why |
|---|---|
| The real QR encoder (`lib/prototype/chapter5/qr.ts`) | ~300 lines of standards-conformant code that is correct as it stands and dangerous to fork. Copy the production file directly, or use an off-the-shelf encoder. It carries its own provenance note (structure after Project Nayuki's MIT reference generator) |
| The 3D stage matrices (`lib/prototype/chapter4/stage3d.ts`) | Self-contained and short; read the original. Its correctness depends on matching the DOM `matrix3d` convention exactly, which a paraphrase would obscure |
| The React layer components | Thousands of lines, entirely specific to this film's props, rooms and interfaces. The reusable part is the *pattern* (world-space `place()`, guarded style writes, full reset on inactive), which is documented in the skills |
| Geometry JSON | Pure project data |
| Artwork generators (`scripts/art/*`) | Project-specific painting recipes; see `ART_GENERATION_BRIEFS.md` |

## Reading order

1. `camera-model.ts.txt` — everything else assumes this coordinate system
2. `beat-timeline.ts.txt` — how time is organised
3. `module-field.ts.txt` + `qr-geometry.ts.txt` — the protagonist
4. `portal-crossing.ts.txt` — the crossing
