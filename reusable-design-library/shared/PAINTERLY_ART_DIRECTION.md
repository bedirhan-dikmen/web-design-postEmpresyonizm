# Painterly Art Direction

The visual language, separated into principles another project can reuse and choices that belong to
one brand.

---

# PART 1 — REUSABLE STYLE PRINCIPLES

## 1. THE CORE IDEA

**One mark-making system, used everywhere.**

Every particle in the film is a square painted dab drawn from a small atlas of brush textures, tinted
at runtime. The backgrounds are painted in the same idiom. Because the mark is the same at every
scale, a dab can be a star, a code module, a dust mote, a window-frame block, an interface tile, or a
module of a real code — and the reader accepts all of them as the same substance.

This is what allows transformation instead of scene replacement. It is an art-direction decision with
structural consequences.

## 2. TWO WORLDS, OPPOSED

A cinematic crossing needs a payoff, and the payoff is contrast.

| | Source world | Destination world |
|---|---|---|
| Temperature | cool | warm |
| Value | dark, low key | brighter, mid key |
| Density | sparse — a few objects in a large space | dense — a room full of things |
| Light | diffuse, no clear source | one strong directional source |
| Palette breadth | narrow (2–3 hues) | wider (4–6 hues) |
| Scale | vast | human |

Keep the *continuity* elements shared — the dab texture, the accent hue, the grain — and oppose
everything else.

## 3. IMPASTO SQUARE DABS

```text
atlas:      N square cells (8 is enough), one strip
content:    a light-grey painted square with visible brush texture, on transparency
size:       256px per cell is plenty; the renderer reads the real size from the image
tinting:    fill colour → composite 'multiply' with the cell → 'destination-in' with it again
```

Properties that matter:

- **Square, not round.** A square dab can be a code module. A round one cannot. Because every mark is
  square, the code formations look like the same material as the star field.
- **Several variants.** Each module keeps one variant for life, so the field has texture without any
  per-frame randomness.
- **Slight rotation.** A small per-module rotation (±0.15 rad) while free, easing to 0 when landed.
  Free material is loose; settled material is aligned.
- **Texture survives tinting.** The multiply/destination-in pair preserves both the brush texture and
  the alpha shape.

## 4. CONTROLLED ACCENT

Exactly one accent hue, used for exactly one thing: the subject the reader follows.

```text
accent      the followed subset, and nothing else
neutral     the bulk of the field
secondary   a minority tint (~20%) for variation within the field
ink         the field once it has landed and become something printed
```

Additive glow behind accent dabs only, and only while they are below ~200px on screen. Beyond that
size the glow becomes a wash.

The discipline is: **if the accent appears on something that is not the subject, the subject has been
lost.**

## 5. TEXTURE HIERARCHY

From back to front:

```text
1. sky / far background     softest, lowest contrast, largest shapes, most atmosphere
2. mid ground               the main painted plates; most of the detail
3. particle field           canvas dabs; the only layer that moves independently
4. foreground occluders     negative depth; high contrast; often partially out of frame
5. grade / veil             colour temperature and value, applied globally
6. grain                    soft-light, ~0.13 opacity, unifies everything
```

The grain is not optional. It is what makes raster plates and canvas dabs look like one image rather
than two rendering systems.

## 6. ATMOSPHERIC MOTION

Every region gets ambient particles on the wall clock, with a defined character:

```ts
{ x0, y0, x1, y1, n, size, color, alpha, rise, sway }
```

```text
dust in a light shaft      many, small, warm, slow rise, slight sway
steam over a heat source   few, large, pale, fast rise, wide sway
sparks in an evening sky   medium, warm, medium rise
lit windows in a city      static, warm, slow flicker
stars                      static, cool, slow twinkle
```

Wrap them vertically inside their region and fade near the wrap edges so nothing pops. Amplitude
multiplied by a global `calm` channel so the film can quieten toward its ending — but never to zero.

## 7. FOREGROUND / BACKGROUND DEPTH

Depth is a per-layer number relative to the camera plane:

```text
δ > 0    behind the plane — moves and scales less  (sky at 1.6, horizon at 0.8)
δ = 0    on the plane                              (main scene)
δ < 0    in front — moves more, can pass the lens  (near table at −0.28)
```

Rules:

- Always have at least one layer at δ < 0. Foreground parallax is what makes a 2D painting feel like
  a space.
- Fade layers at δ < 0 as they approach the lens, by screen scale, so nothing becomes a full-screen
  smear.
- A blend-mode light layer (`screen`, ~0.4 opacity) at a slightly negative depth reads convincingly
  as a light shaft.

## 8. GRADING AND VEILING

Change time of day and mood by **veiling**, never by swapping artwork:

```text
multiply veil    a saturated colour over everything — turns evening into night
crush layer      a dark flat layer at low opacity — deepens the blacks
hole             a region excluded from the veil, so one place stays the warmest light
vignette         a radial darkening, deepening as the film calms
```

A single continuous "time of day" channel driving a colour interpolation lets an entire long act
drift from midday to dusk without any plate changing. Keep the drift slow enough that every region is
lit by the same light at any one moment.

Build veil holes from **four sibling rectangles**, not a `clip-path: path()`.

## 9. THE ARTWORK CONTRACT

Whatever produces the plates — a generator script, a painter, a 3D render — must honour a contract so
the animation never needs to change when art is replaced:

```text
- one design space; every plate placed by its top-left corner in design units
- each plate laid out at its own natural pixel size; the design size carried as a transform ratio
- overscan beyond the widest (21:9) and tallest (4:3) framing of every shot it appears in
- defined safe areas per shot, where copy may sit
- a documented depth per plate
- the same grain and palette treatment across all of them
```

# PART 2 — KERINTI-SPECIFIC BRAND CHOICES

Everything below is *this* project's answer to the principles above. Replace all of it.

## Palette

```text
night base      #050b1e     the page and the source world's ground
star            #eaf0f7     the field at rest
mist            #9cc7e0     minority tint, ~20% of stars
gold            #e8c66a     THE ACCENT — the followed subject
goldDeep        #f2b64a     the accent once landed
cream           #fff1cf     the field in the warm world, before landing
ink             #1f3263     the field once it has become something printed
```

Destination-world working colours: terracotta `#c8643b`, ochre `#e3a83b`, sage `#8a9a5b`,
olive `#a79a4a`.

Card / code: cream `#f4ecd8` face, ink `#16264f` modules, gold rim.

## Worlds

- **Source:** a nocturne — cobalt sky with painted ribbons and a large swirl centred on the portal
  finder; a low horizon; a scattered star field.
- **Destination:** a restaurant interior in morning light — a warm wall, a mid-ground, a sunbeam
  crossing the room, a near table in the foreground.
- **Closing:** the same world at night, with a city of lit windows, a brand tower and a cut-away
  studio; the sky reuses the source world's recipe with its swirl centred on the final code.

## Typography

- Display: Fraunces (variable, `SOFT 60`, `opsz 144`), letter-spacing −0.015em, `text-wrap: balance`.
- Sans: Inter Tight.
- Eyebrow: 0.14em letterspacing, uppercase, semibold.

## Motif

A 25×25 code. Its top-left finder's 3×3 core is the portal. The finder square — a gold core inside a
square outline — is the brand mark, reused at 14px in eyebrows and in the page footer.

## Grain and atlas

- Grain: `00-shared/grain.png`, `soft-light`, 0.13 opacity.
- Dabs: `00-shared/dabs.png`, 8 cells × 256px.
- Both generated by `scripts/paint-prototype-assets.mjs`.

## Ambient regions (destination world)

```text
kitchen         46 warm specks (rise 9) + 14 large steam wisps (rise 34)
front counter   40 dust motes in window light (rise 3)
storeroom       54 dust motes in bulb light (rise 2)
office          50 dust motes in a sunset beam (rise 2.5)
evening sky     60 lifting sparks (rise 12)
```

---

## WHICH KERINTI FILES CARRY THE ART DIRECTION

| Concern | File |
|---|---|
| Palette constants | `lib/prototype/moduleField.ts → COLORS`, `SLOT_COLORS` |
| Atlas definition, memory notes | `lib/prototype/sceneConfig.ts → DAB_ATLAS` |
| Plate placement, depths, blends | `lib/prototype/sceneConfig.ts → PLATES` |
| Ambient regions | `lib/prototype/moduleField.ts → AMBIENT_ROOMS` |
| Time-of-day grade | `components/prototype/Chapter4Layers.tsx → gradeAt(day)`, `Chapter4Grade` |
| Night veil and vignette | `components/prototype/Chapter5Layers.tsx → Chapter5Veil`, `Chapter5Grade` |
| Typography | `app/layout.tsx`, `app/globals.css` |
| Grain overlay | `components/prototype/PortalFilm.tsx` (grain div), `SHARED.grain` |
| Artwork generators | `scripts/art/*.mjs`, `scripts/paint-prototype-assets.mjs` |
| Full art documentation | `ART_DIRECTION.md`, `ARTWORK_COMPOSITIONS.md`, `ARTWORK_REPLACEMENT_CONTRACT.md`, `ASSET_MANIFEST.md` |
