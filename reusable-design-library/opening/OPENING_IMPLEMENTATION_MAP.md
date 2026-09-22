# Opening — Implementation Map

Exact pointers into the Kerinti codebase as it stands. Every path, symbol and value below was read
from the source; nothing here is invented. Use it to find working code for any part of Pattern A.

Timeline span of the opening: **t 0.00 → 4.40** (Chapters 1–3, 440vh).

---

## Stage, render loop, scroll binding

```text
Files:
- components/prototype/PortalFilm.tsx
- app/page.tsx                          (mounts <PortalFilm /> above the normal page)
- app/layout.tsx                        (fonts, <body> background #050b1e)
- app/globals.css                       (.film-text wipe mask, .display, .eyebrow, .rail-dot)

Key symbols:
- PortalFilm()                          the whole stage component
- render(time)                          the pure per-frame renderer
- textStyle(el, v)                      the 0/1/2 copy channel → opacity, translate, --wipe
- APERTURE                              seeded brushy portal outline (36 points, 4 sides × 9)
- LABELS / DEV                          dev-only freeze + debug tooling
- Plate({id, src, w, h, blend, lazy})   one artwork layer

DOM hooks (data attributes):
- [data-track]      the scroll track          [data-motif]      the module-field canvas
- [data-world="A"]  source world container    [data-world="B"]  destination world container
- [data-glow]       warm light behind aperture[data-flare]      threshold bloom
- [data-plate=<id>] one artwork plate         [data-atlas]      the dab atlas image
- [data-text-frame] design-space text frame   [data-text=<id>]  a copy block
- [data-rail]       chapter progress dot      [data-debug]      dev overlay

Scroll binding:
- ScrollTrigger.create({ trigger: '[data-track]', start: 'top top', end: 'bottom bottom',
                         scrub: reduced ? true : 0.7, animation: film })
```

## Camera and viewport

```text
File: lib/prototype/camera.ts

Key functions:
- initialFilmState()                    every channel's starting value
- cameraFor(world, st) -> {d, camX, camY}
- layerTransform(cam, depth, out)       -> {m, tx, ty, ok}
- viewportFor(vw, vh)                   -> {vw, vh, b, ox, oy}   (cover fit)
- portalCovers(st, vp) -> boolean       the switch predicate

Constants:
- VC = { x: 960, y: 540 }               design-frame centre

State (opening subset):
- px, py, logS      camera = the portal square on screen
- world             0 source · 1 destination
- assemble          stars → code
- aperture          finder aperture open amount
- glow, flicks, flare
- goldCarry         subject held by the camera
- goldLand          0 carried · 1 in the beam · 2 landed
- settle            dust → object's code
- textIntro, textSmall, textNexa   0 before · 1 shown · 2 after
```

## Scene configuration

```text
File: lib/prototype/sceneConfig.ts

- DESIGN = { w: 1920, h: 1080 }
- QR_A   = { x: 1025, y: 225, cell: 22, n: 25 }        the opening code's grid
- PORTAL.A = derived from QR_A: centre of the top-left finder, size 5 × cell (= 110)
- PORTAL.B = { cx: 620, cy: 400, size: 360 }           the window glass in the destination
- GLASS_B  = { x0: 440, y0: 220, x1: 800, y1: 580 }    window rectangle; frame cell = 72
- TENT_B   = { x0:1180, y0:650, x1:1310, y1:780, qr:{x:1193,y:664,cell:4.2}, depth:-0.28 }
- PLATES[]  every artwork layer with world, src, x, y, w, h, depth, blend, opacity
- fitPlate(img, def)  lays each <img> out at its natural pixel size (see Performance guide)
- SHARED.grain, DAB_ATLAS
- TEXT_FRAME, TEXT_BOXES { intro, small, nexa }
- CHAPTERS[] scroll budget per chapter; TOTAL_VH
```

## Master timeline

```text
File: lib/prototype/timeline.ts

- buildFilm(st) -> gsap.core.Timeline    (paused, defaults ease 'none')
- WORLD_SWITCH = 2.58                    the instant set(world: 1)
- PEAK_SIZE    = 7000                    portal size at the switch
- LABELS = { kerinti: 0, portal: 1.8, nexa: 3.0, end: 4.4 }

Chapter 1 (0.00 → 1.80)   textIntro, assemble, the lean, glow, aperture, textSmall
Chapter 2 (1.80 → 3.00)   logS → PEAK_SIZE, centring, glow, aperture, goldCarry, flicks,
                          flare, set(world:1) at WORLD_SWITCH, settle-back to PORTAL.B
Chapter 3 (3.00 → 4.40)   goldLand → 1, table re-frame, settle, goldLand → 2, textNexa, hold
```

## Module field / QR formation

```text
File: lib/prototype/moduleField.ts

Key symbols:
- buildQrMatrix(n = 25, seed = 2026)     stylised (non-scannable) matrix
- class ModuleField
    constructor()                        builds the pool from seed mulberry32(7)
    setAtlas(img)                        reads the real cell size; builds the glow sprite
    sprite(variant, color)               cached tinted dab (fill → multiply → destination-in)
    draw(ctx, st, vp, dpr, time)         the whole field
- roles: DATA = 0, RING = 1, GOLD = 2, TENT = 3, DUST = 4
- COLORS { star, mist, gold, goldDeep, cream, ink, … }
- nearFade(screenSize)                   fade for modules passing the lens
- flickSeeds                             90 elongated dabs for the passage

Per-module fields (interface Mod):
  sx, sy, sd, ss   scatter (World A)      qx, qy, qs   code cell
  dx, dy, dd, ds   dust (World B)         tx, ty, td, ts  destination target
  aDelay, bDelay, curve, variant, phase, starColor
  carryX, carryY   camera-held formation  beamX, beamY  position in the light beam

Counts: code modules from the 25×25 matrix, + 24 ambient finder-ring modules, + 170 dust.
```

## Artwork assets

```text
public/prototype-assets/
  00-shared/    dabs.png (8 × 256 atlas), grain.png
  01-kerinti-night/  sky.webp (2880×1800, depth 1.6), horizon.webp (2880×800, depth 0.8)
  02-portal/         window-view.webp (2400×1800, world 'view', depth 2.2)
  03-nexa-morning/   room-wall.webp (depth 0), room-mid.webp (−0.12),
                     light-beam.webp (−0.06, blend screen, opacity 0.42),
                     table-near.webp (−0.28)

Generators (dev only, not part of the build):
- scripts/paint-prototype-assets.mjs     dab atlas + grain
- scripts/art/window-view.mjs            npm run art:window-view
- scripts/art/restaurant-wall.mjs        npm run art:room-wall
- scripts/art/engine.mjs                 shared painting primitives
```

## Copy

```text
Inline in components/prototype/PortalFilm.tsx (Chapters 1–3 only; later acts use content modules):
- [data-text="intro"]  eyebrow + h1 + supporting line      box TEXT_BOXES.intro  (300, 330, w 500)
- [data-text="small"]  one display line                    box TEXT_BOXES.small  (300, 640, w 460)
- [data-text="nexa"]   eyebrow + h2 + 3 bullets            box TEXT_BOXES.nexa   (1220, 200, w 400)

Styling: .film-text (mask-image wipe driven by --wipe), .display, .eyebrow in app/globals.css
```

## Dev / review tooling (development builds only)

```text
?t=<number|label>   freeze the film at a timeline time or named label
?debug              on-screen state overlay (time, world, covers, portal size, channels)
window.__film       { film, st, field, render }     for console inspection
```

These are compiled out of production builds via `const DEV = process.env.NODE_ENV !== 'production'`.

## Reusable dependencies

```text
Opening depends on:
- Module Field                shared/MODULE_FIELD_SKILL.md
- Camera model                shared/CAMERA_GRAMMAR.md
- Scroll architecture         shared/CINEMATIC_SCROLL_ARCHITECTURE.md
- Text timing                 shared/TEXT_TIMING_SKILL.md

Opening does NOT depend on:
- the real QR encoder (chapter5/qr.ts) — the opening code is stylised
- stage3d.ts orientation — the opening camera is square-on (yaw/pitch/roll all 0)
- flowPath.ts / formations.ts — those are act-4 machinery
```
