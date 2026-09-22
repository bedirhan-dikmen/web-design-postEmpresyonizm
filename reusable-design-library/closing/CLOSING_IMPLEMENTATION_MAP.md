# Closing — Implementation Map

Exact pointers into the Kerinti codebase. Every path, symbol and value below was read from source.

Timeline span of the closing: **t 48.60 → 54.25** (565vh).

---

## Timeline

```text
File: lib/prototype/chapter5/timeline.ts

Key symbols:
- CH5_START = CH4.end                    the act begins on the previous act's final frame
- DURATIONS = { k1: 2.0, k2: 1.25, k3: 0.9, k4: 1.5 }
- BEATS / CH5 = { start, beats, end }    accumulated beat map
- at(beat, frac)                         a time inside a beat
- CH5_LABELS                             freeze points: ch5-start, to-night, city-night, kerinti,
                                         to-studio, company, team, to-sky, assemble, cta, ch5-end
- buildChapter5(tl, st)

Helpers (local):
- to(beat, f, d, vars, ease)             a tween positioned inside a beat
- look(beat, f, d, shot, ease)           a camera move to a named shot
- travel(beat, f, d, [shots], N = 24)    Catmull-Rom path, baked as keyframes
- text(beat, key, inF, outBeat, outF)    copy in (~10vh) / out (~7vh)

Shot table: SHOT = { ...chapter4/geometry.json camera, ...chapter5/geometry.json camera }
```

## Camera shots used

```text
File: lib/prototype/chapter5/geometry.json → camera
- cityPull, skyKerinti, towerFace, studioWide, teamDesk, towerRise, finalSky
(plus officeLife from chapter4/geometry.json, the act's starting shot)

Format: [x, y, zoom, yaw, pitch, roll]  →  shotVars() → { px, py, logS, yaw, pitch, roll }
```

## State channels (closing subset)

```text
File: lib/prototype/camera.ts → FilmState

ch5        1 once the act has started (gates plates and layers)
night      0 the warm evening … 1 the brand night (veil, grade, city lights)
k5         0 on the workplace monitor · 1 drifting in the sky · 2 the final code
qr         the final card's face and the crisp scannable code
calm       the final frame calms: ambient motion recedes
dissolve   the workplace panel dissolving into square dabs
markDim    the carried finder mark steps back while the camera is with the team
t5Kerinti, t5Company, t5Team, t5Cta      four copy channels (0 before · 1 shown · 2 after)
```

## DOM layers

```text
File: components/prototype/Chapter5Layers.tsx

Exported components:
- Chapter5Veil()      night veil: [data-veil5="out"] (cobalt multiply, 4 sibling rects),
                      [data-veil5="crush"], [data-veil5="in"] (the building's lighter veil)
- Chapter5World()     [data-ch5-world]: tower sign, team sprites, three desk monitors,
                      the systems wall, the server rack, running gold modules, the QR card
- Chapter5Grade()     [data-vignette5] navy vignette (screen space)
- Chapter5Text()      the four copy blocks + their sibling pools ([data-pool5], [data-text5])
- createChapter5Updater(root)  the per-frame updater

Local helpers:
- Prop({id,w,h}) / Glow({id,w,h,color}) / T({children}) / Mark({size})
- frameVeil(W, H, hole)   the four-rect veil frame (NOT a clip-path — see the failure modes)
- place(id, wx, wy, opacity, opts)   world-space prop placement with culling
- runnerAt(u)             position along the studio's system path
- poolOpacity(v)          the pool curve matched to the text channel
- buildQr()               writes the real code into the card, once, on the client

DOM hooks:
[data-ch5] [data-ch5-world] [data-prop5=<id>] [data-veil5] [data-veil5-part]
[data-vignette5] [data-text5=<key>] [data-pool5=<key>] [data-qr-crisp] [data-qr-path]
[data-led5] [data-caret] [data-breathe5] [data-ui-text]
```

## The final code

```text
Files:
- lib/prototype/chapter5/qr.ts          the real encoder
- lib/prototype/chapter5/finalQr.ts     film-side assembly
- lib/site/config.ts                    qrTarget()
- lib/site/site.json                    canonical url (null → the serving origin is used)

Key functions:
- encodeQr(text, ecc = 'M', minVersion = 2) -> QrCode
    byte mode, versions 1–6, ECC L/M, Reed–Solomon over GF(2^8) poly 0x11D,
    all 8 masks evaluated by the standard penalty rules
- rsRemainder(data, degree)             verified against the published "HELLO WORLD" 1-M vector
- getFinalQr() -> FinalQr | null        cached by target string; built lazily on the client
    { code, cell, origin, full, cellAt(r,c), finderRing[], finderCore[], dataCells[] }

Constants:
- QR_CELL_BASE = geometry.json → qr.cell (34)
- quiet zone   = geometry.json → qr.quiet (4 modules)
- card centre  = geometry.json → qr.center ([14760, -6200])
- cell size    = QR_CELL_BASE * 25 / n   (the card keeps one physical size)
- dataCells shuffled with seed 2027
```

## Module field — closing behaviour

```text
File: lib/prototype/moduleField.ts

- drift5[]      per-module target in the night sky (seeded ellipse, geometry.json → drift)
- city5[]       lit windows of the night city, as square dabs
- stars5[]      110 sky stars; the spares join the final code when it is larger than 25×25
- panel5[]      the previous act's operations panel, as the dabs it dissolves into
- drawAmbient5(st, time, dab, project)   city windows, stars, the dissolving panel
- drawChapter4(...) Chapter-5 block      k5 0→1 (rise into the sky) and 1→2 (into the code)
- finderOf / FINDER_SLOTS / FINDER_CORE  the carried mark → the code's top-left finder

Seeds: mulberry32(5005) for all closing data (separate from the opening's 7 and act 4's 4004)
```

## Copy and CTA

```text
File: lib/prototype/chapter5/content.ts
- BEAT5_TEXTS[]  four blocks: t5Kerinti, t5Company, t5Team, t5Cta
                 each { key, eyebrow, heading, line, box: { x, y, w } }
- CTA = { label, qrHint }

Destination: lib/site/config.ts → CONTACT_HREF (`#` + site.json contactAnchor)
Navigation:  components/site/scrollTo.ts → scrollToContact
Styling:     app/globals.css → .cta-primary, .film-text, .display, .eyebrow
```

## Geometry

```text
File: lib/prototype/chapter5/geometry.json
- plates        placement of the closing plates
- building.rect the previous act's building, for the veil hole
- neighbours    the night city: rects + window grid
- tower.sign    the brand sign on the tower
- studio        display, monitors, lamps, rack, engineers, runners
- drift         { center, rx, ry }   where the modules float
- qr            { center, cell, quiet }
- camera        the act's named shots
```

## Artwork

```text
public/prototype-assets/05-kerinti/
  sky.webp        22000 × 10000 design units, depth 0, drawn AFTER the veil
  city.webp       8000 × 9100
  studio.webp     3200 × 1400
  sprites/engineer-a|b|c.webp     team figures (lazy-loaded, anchored bottom-centre on the desk)

Generators: scripts/art/chapter5-plates.mjs, scripts/art/chapter5-sprites.mjs
            (npm run art:chapter5)

Note: the closing plates render AFTER the night veil in the stage tree, so the veil darkens the
previous act's world but never these — they are painted at night already.
```

## Previous-act hand-off

```text
File: lib/prototype/chapter4/timeline.ts (final beats)
- to('h6', 0.05, 0.62, { finder: 1 }, 'sine.inOut')
    the finder mark forms quietly bottom-left over the final management frame
- tl.to({}, { duration: … })   a stable final frame, which is where the closing begins

File: lib/prototype/chapter4/formations.ts
- FINDER_SLOTS  the 7×7 ring in DRAWING ORDER (clockwise from the top-left corner)
- FINDER_CORE   the 3×3 core, centre first
- geometry.json → finder.screen = [300, 830, 17]   screen-space placement and cell size
```

## Reusable dependencies

```text
Closing depends on:
- Module Field                shared/MODULE_FIELD_SKILL.md
- Camera model + travel       shared/CAMERA_GRAMMAR.md
- Scroll architecture         shared/CINEMATIC_SCROLL_ARCHITECTURE.md
- Text timing                 shared/TEXT_TIMING_SKILL.md
- The carried finder mark from the previous act

Closing does NOT depend on:
- any portal (there is none in this act)
- the stylised matrix generator (this act uses the real encoder)
```
