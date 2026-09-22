# ARTWORK COMPOSITIONS — Chapters 1–3

> Phase 2.5 production document. Companion files: `ASSET_MANIFEST.md`, `ART_GENERATION_BRIEFS.md`, `ARTWORK_REPLACEMENT_CONTRACT.md`.
> Covers the three master compositions, their layer breakdowns and the text safe areas (Tasks 2, 3 and 6).
>
> **Coordinates.** All coordinates are **design units** (1920×1080 per world, cover-fit). "Screen" means the design-space position on the 1920×1080 frame; "plate" means the painting's own design coordinates. Every figure was measured from the running prototype.
>
> **Timeline.** `t` is timeline time: 1.0 = 100vh of scroll. Chapter 1 runs 0–1.8, Chapter 2 runs 1.8–3.0, Chapter 3 runs 3.0–4.4. Any frame can be viewed at `http://localhost:3100/?debug&t=<t>`.

---

## How the camera works (what painters need to know)

- **One square drives the camera.** In World A it is the QR's top-left finder aperture. In World B it is the restaurant window glass.
- **Everything is 2.5D.** Each plate sits at a depth δ relative to that square's plane.
  - A plate magnifies by `m = (1 + δ) / (d + δ)`, where `d` is the camera distance (1 at rest).
  - It pans laterally by about `1 / (1 + δ)` of the square's motion.
- **Consequences for painting:**
  - Far plates (δ > 0) barely move, so they need little margin but must be calm over large areas.
  - Near plates (δ < 0) rush past the camera during the dive and pull-back, so their edges and contact points must be soft.
  - Nothing rotates. There are no cuts, and nothing cross-fades a world.

---

# MASTER A — KERINTI NIGHT

Frames to check: `t=0` (rest), `t=0.9` (assembling), `t=1.8` (QR complete, finder opening).

## A.1 Camera

| Moment | Portal square (screen) | Sky magnification | Reading |
|---|---|---|---|
| t = 0 (first paint) | centre (1102, 302), size 101 | 0.97× | Slightly pulled back: the composition breathes |
| t = 1.8 (end of Chapter 1) | centre (1062, 336), size 128 | 1.06× | A slow push-in of ~26% on the QR plane with a small drift toward the finder. The sky moves only ~9% |

The viewer is standing on a low rise at night, looking slightly up. The horizon is low, and the sky is the subject.

## A.2 Fixed geometry (do not move)

| Element | Design coordinates |
|---|---|
| QR (25×25 modules, 22-unit cells) | x 1025–1575, y 225–775 |
| **QR safe zone** (calm field) | **x 985–1615, y 185–815** |
| Top-left finder square (outer ring) | x 1025–1179, y 225–379 |
| **Finder aperture = portal** | x 1047–1157, y 247–357 · centre **(1102, 302)** · 110 units |
| Warm finder glow (code) | radius ≈ 550 around (1102, 302) |
| **Horizon ridge line** | y 840–900; **≥ 830 under the QR** (x 985–1615) |
| Kerinti text safe zone | see §T1–T2 |

## A.3 Lighting

- **No moon, and no single large light source in the sky.**
- Ambient light is a cool night glow rising from behind the far ridge (mist-200 at low opacity, y 700–860). It gives the ridge tops a thin cool rim.
- **The only warmth** comes from ≤ 12 tiny window dabs in the distant settlement, plus the code-driven finder glow.
- Do **not** paint warm light around the finder. The glow is code, and painted warmth would slide against it because the sky sits at a different depth.

## A.4 Depth planes

| Plane | Content | Depth |
|---|---|---|
| Far | Sky ribbons, faint pinpoint stars | δ +1.6 |
| Middle-far | Ridges, distant settlement | δ +0.8 |
| (optional) Atmosphere | Translucent mist ribbons | δ +0.35 |
| Portal plane | QR modules, finder, gold core (code) | δ 0 |
| Near air | Drifting star modules (code) | δ −0.06 … −0.55 |

## A.5 Negative space and energy distribution

```
 x:  0        480        960        1440       1920
y 0 ┌────────────────────────────────────────────┐
    │  medium ribbons   ↘  HIGH: ribbons converge │
    │                      ↘ and bend around  ↙   │
200 │                   ┌──finder──┐ QR SAFE ZONE │
    │  KERINTI TEXT     │ ▣        │  lowest      │
    │  SAFE ZONE        │   QR     │  contrast    │
    │  (calm, dark,     │          │              │
600 │   low texture)    │          │              │
    │                   └──────────┘              │
800 │ low mist glow ─────────────────────────────  │
    │▁▁▂▂▃ ridges + distant settlement ▃▂▂▁▁▁▁▁▁▁▁ │
1080└────────────────────────────────────────────┘
```

- **High energy.** Long ribbon strokes in the upper band (y < 220) and the upper-right third. They **flow toward and curve around the finder**: brush direction points at (1102, 302) from the upper left and bends past it on the right.
- **Medium energy.** The upper-left sky.
- **Calm.**
  - Kerinti text zone: dark nocturne-900/800 with short, low-contrast strokes.
  - QR safe zone: ribbons allowed, but at ≤ 12% luminance contrast, no stars and no bright highlights, so the light modules read cleanly.
  - Just above the ridge: soft mist.

## A.6 Must remain calm / may animate

| Must remain calm | Animated (all by code, except camera motion) |
|---|---|
| Headline zone · QR safe zone · the sky directly around the finder (no painted halo) · ridge silhouettes (no detail that would compete with star modules) | Star modules drifting and assembling · finder glow · portal hole opening · the camera push. Plates themselves never animate internally |

## A.7 Originality guardrails (Master A)

These are hard rules, to avoid any recognizable Starry Night composition:
- No crescent moon, and no large luminous orb.
- No dominant spiral vortex. Curvature belongs to **long ribbons** bending around the QR, not to whirlpools. At most one gentle curl, fully hidden behind the QR zone.
- No large concentric star halos. At most 5 pinpoint stars under 40 units, none inside the QR zone.
- No tall dark vertical foreground form (tree, flame shape, spire).
- No village with a church spire. The settlement is low, flat and distant.
- The composition is **horizontal and low-horizon, with the focal point on the right third**. It must not be a diagonal hill-village with a swirling centre.

## A.8 Layer breakdown (Master A)

| Layer | File | Why separate | Parallax (lateral vs. QR plane) | Magnification range | Margin beyond the visible region | Alpha | Transformed each frame | Must align with |
|---|---|---|---|---|---|---|---|---|
| 01 Sky | `01-kerinti-night/sky.webp` | Deepest plane. It must move least during the push and dive to create depth | 0.38 | 0.97–1.57× | Spare ≥ 330 units on every side (16:9, 21:9 and 4:3 tested) | No | Yes (translate + scale, from state tweened by GSAP) | Nothing geometric. Brush direction must lead to the finder at (1102, 302) |
| 02 Horizon | `01-kerinti-night/horizon.webp` | Mid-depth parallax against the sky. Separates earth from sky so the dive feels like flying forward | 0.56 | 0.95–2.09× | Spare ≥ 380 units left, right and bottom | Yes (above the ridge) | Yes | Ridge ≥ 830 under the QR. The painted sky must continue behind it (no gap) |
| (03 Atmosphere, optional) | `01-kerinti-night/atmosphere.webp` | Adds a third depth cue during the push | 0.74 | up to ~3.7× | as sky | Yes | Yes | Must stay out of the QR and text zones |
| Portal plane (code) | — | Modules, finder, gold core, portal hole | 1.0 | up to ~63× | — | — | — | The reference plane |

---

# MASTER B — PORTAL CROSSOVER (both sides)

Frames to check: `t=1.8`, `2.1`, `2.3`, `2.575` / `2.585` (either side of the switch), `2.75`, `3.0`, `3.32`.

**This is one painting seen from two worlds:** `02-portal/window-view.webp`. The rest of the crossover (frame ring, hole edge, light, flicks, flare) is code, and it is already approved.

## B.1 Exact portal geometry

| | World A (night) | World B (restaurant) |
|---|---|---|
| Portal square | Finder aperture x 1047–1157, y 247–357 | Window glass x 440–800, y 220–580 |
| Centre / size | (1102, 302) / 110 | (620, 400) / 360 |
| Frame around it | 24 star-white dabs (22-unit cells) | 24 Kerinti-blue dabs (72-unit cells), band x 368–872, y 148–652 |
| What is behind the hole | `window-view.webp` | `window-view.webp` (the same plate, the same transform) |

**How the worlds align.** At every frame, the World B camera is derived from the same on-screen square as the World A camera. The window view is therefore positioned identically through the finder and through the glass. At the switch (t = 2.58) the square is 7000 units wide and covers the entire screen. Both worlds would render **the identical frame**, so the world flag flips invisibly.

## B.2 What the viewer sees, frame by frame (window-view plate coordinates)

| t | Event | Region of `window-view` on screen | Magnification |
|---|---|---|---|
| 1.3–1.8 | Finder aperture opens to 42%. Light leaks between the gold dabs | a pinhole around **x 882–966, y 314–398** | 0.64× |
| 1.8–2.1 | Aperture fully open. The camera begins the dive | **x 723–1054, y 261–591** | 0.96× |
| ≈ 2.28 | Portal edge leaves the screen. Night is no longer visible | x 161–1546, y 107–886 | 1.39× |
| **2.58** | **World switch** (invisible) | **x 178–1529, y 116–876** | 1.42× |
| 2.58–2.75 | Held in the light. Flicks and flare fade | same | 1.42× |
| 3.0 | Pulling back: the glass edge and blue frame re-enter from the screen edges | x 316–1075, y 72–811 | 1.24× |
| 3.32 | Settled: seen through the window | **x 440–800, y 220–580** | 1.00× |
| 4.4 | Final hold, seen through the window | x 320–714, y 175–570 | 1.04× |

Union of everything ever visible: **x 138–1569, y 72–923.** The rest of the 2400×1800 canvas is bleed.

## B.3 Content zones inside the window view

```
 window-view plate coords (x −580…1820, y −500…1300)
      160           620          1060         1560
  100 ┌──────────────────────────────────────────┐  ← crossing frame top (≈116)
      │  soft cloud bands      ░░ GLIMPSE ░░     │
  250 │                        ░ bright warm  ░  │  ← brightest sky bloom
      │  ┌── WINDOW VIEW ───┐  ░ bloom        ░  │    x 840–1000, y 260–400
  380 │  │  (settled glass) │ ┌─GOLD READABILITY─┐│
      │  │  sky upper 55%   │ │ cool aqua sky →  ││  mid value, NO gold/ochre
  480 │  │                  │ │ sage-blue hills  ││
      │  │  rooftops, trees │ └──────────────────┘│
  600 │  └──────────────────┘   distant hills line ≈ y 520–600
      │   terracotta/ochre rooftops, rounded trees │
  876 └──────────────────────────────────────────┘  ← crossing frame bottom
```

| Zone (plate coordinates) | Requirement |
|---|---|
| **Glimpse** x 840–1000, y 260–400 | The brightest, warmest area of the painting (luminous cream-gold sky bloom). This is what glows inside the finder square in the night world. **No hard shapes.** |
| **Unfold** x 700–1080, y 240–620 | A readable promise of a morning world: bloom above, the first hint of hills and rooftops below |
| **Gold readability** x 700–1010, y 380–640 | The 9 gold modules hover over this area during the crossing (screen centre ± 148). Use a **mid-value, cooler** band (daysky aqua into sage-blue hills). **No gold, ochre or cream** here, or the gold modules disappear |
| **Crossing frame** x 178–1530, y 116–876 | Must work as a **complete, balanced, premium full-screen landscape**. It fills the screen for ~50vh of scroll (t ≈ 2.28–2.8). Horizon (distant hills) at y ≈ 520–600, so ~55% of the frame is sky |
| **Window view** x 300–820, y 160–600 | Through the restaurant window: upper half sky, lower third rooftops and trees. It must read unmistakably as "outside" |

## B.4 Brush edge behaviour (code; nothing to paint)

- The hole in the night is a 36-point hand-jittered square that pushes outward up to 7%. It sits exactly under the 24 finder-ring dabs.
- The gaps between ring dabs let slivers of morning light through ("light through the cracks").
- The edge leaves the screen at t ≈ 2.28, and from then on only the window view is visible.
- **Painters:** never paint a frame, vignette or border into the window view. The frame is always the dabs.

## B.5 How warm light enters the blue world

All of this is code-driven, and none of it is painted:
1. **Light behind the finder.** A radial warm gradient centered on the finder (screen blend). It ramps to 60% during t 1.1–1.8 and 100% by 2.2, then fades as the hole grows past ~1400 px.
2. **Leaks through ring gaps** once the hole opens (t 1.3).
3. **Cream speed flicks** (t 2.02–2.92), the same colour on both sides of the switch.
4. **Threshold flare** peaking at 80% exactly at t = 2.58.

**Implication for Master A:** the sky around the finder must be mid-dark and neutral, so that the code light reads as light and not as mud.

## B.6 What hides the world switch

At t = 2.58 the screen contains **only**:
- the window view (the crossing frame),
- the 9 gold modules,
- cream flicks,
- the flare.

No World A or World B plate is on screen. The quality of the crossing frame is therefore the switch's only disguise. If that painting is beautiful and complete, the switch cannot be seen.

## B.7 Reverse scroll

Everything is state-driven, so reverse is the same film backward:
- The window frame and room recede outward.
- The screen fills with morning light.
- The world flips invisibly at 2.58.
- The night portal edge re-enters from the screen edges at ~2.28.
- The finder closes and the QR scatters to stars.

During reverse the viewer sees the same window-view zones in the opposite order. **Nothing additional needs painting.**

## B.8 Layer breakdown (Master B)

| Layer | File | Why separate | Parallax | Magnification | Margin | Alpha | Transformed | Must align with |
|---|---|---|---|---|---|---|---|---|
| Window view | `02-portal/window-view.webp` | Lives in World B space but must be visible *through* World A, so it sits beneath both worlds | 0.31 | 0.63–1.42× | Spare ≥ 250 units on every side of the visible union | No | Yes | Zones §B.3; the gold readability zone |
| World A plates (hole-clipped) | Master A layers | Clipped by the finder hole | — | — | — | — | Yes + clip path | Finder aperture (code) |
| World B wall (glass hole) | `03-nexa-morning/room-wall.webp` | Hidden until the switch, then frames the view | 1.0 | 5.5× at first reveal | — | Glass hole | Yes | **Glass hole exactly x 440–800, y 220–580** |
| Code layers | — | Frame dabs, gold, flicks, flare, glow | — | — | — | — | — | — |

---

# MASTER C — NEXA RESTAURANT MORNING

Frames to check: `t=3.0` (reveal), `3.32` (settle), `3.8` (dust travelling), `4.4` (final hold).

## C.1 Camera

| Moment | Portal (window) on screen | Wall magnification | Reading |
|---|---|---|---|
| t = 2.58 | glass 7000 units wide, centred | 19× (hidden) | Inside the light |
| t = 2.58 → 3.32 **pull-back reveal** | glass shrinks to 360; centre glides to (620, 400) | 5.5× → 1.0× | We back away from the window into the room. The blue dab frame, then the curtains, wall and mid tables pass the camera, and the hero table sweeps in from the lower right |
| **t = 3.32 settle** | glass at x 440–800, y 220–580 | **1.00×: the plate appears exactly at its design coordinates** | The establishing frame of the restaurant |
| t = 3.32 → 4.32 gentle push | window moves to (470, 360), size 410 | 1.14× | A slow lean toward the table while dust becomes the QR |
| **t = 4.32–4.4 final hold** | — | wall 1.14×, mid 1.16×, near 1.21× | Visible wall region **x 208–1892, y 84–1032** |

## C.2 Fixed geometry and composition map (wall plate coordinates)

```
 x:  0      368 440     800 872      1180  1220          1840  1920
y 0 ┌─────────────────────────────────────────────────────────────┐
    │ ceiling beam / warm shadow                                   │
148 │      ┌────────── blue dab frame band (plain plaster) ─┐        │
170 │      │ ┌──────── GLASS HOLE ────────┐ │  pendant ┌─────────────┐
220 │ cur- │ │    (transparent)           │ │  lamp    │  NeXa TEXT  │
    │ tain │ │    window view behind      │ │ (mid,    │  SAFE ZONE  │
    │      │ │                            │ │ x≤1160)  │ plain sunlit│
    │plant │ │                            │ │ shelf    │  plaster,   │
580 │      │ └────────────────────────────┘ │ x930–1180│  no objects │
590 │      └────────────────────────────────┘          └─────────────┘
652 │   ▁▁▁ window sill ▁▁▁        ↘ sunbeam ↘      ┌── KITCHEN PASS ─────
700 │ ═══ terracotta wainscot ═══════      ┌card┐    │ two gestural cooks
    │  mid tables + guests (mid)      ↘   │ QR │    │ warm heat-lamp glow
780 │                                     └────┘    │ counter ledge ~ y 790
840 │ ─── floor line ───────────  ╭──── hero table (near) ────╮
    │  honey-wood floor, planks   │  cream cloth, cup, vase    │
1080└─────────────────────────────┴────────────────────────────┴──┘
```

| Element | Plate | Coordinates | Rule |
|---|---|---|---|
| **Glass hole** | wall | **x 440–800, y 220–580**, alpha 0 | The former finder aperture. Exact |
| **Dab frame band** | wall | x 368–872, y 148–652 (72 units around the glass) | **Plain light plaster** (≈ #F1E4C8, low texture). The 24 Kerinti-blue dabs are code-drawn here. A 10–14 unit warm wood reveal just inside the glass edge is allowed |
| Curtains (optional) | wall | x 300–368 and 872–940, y 110–700 | Sheer, pale, soft-edged. Never inside the band |
| Sill | wall | x 340–900, y 652–690 | A small herb pot is allowed |
| Plant | wall | x 120–340, y 420–840 | Left of the window, below curtain height |
| Shelf with jars | wall | **x 930–1180**, y 320–420 | Must end before x 1180 (the text zone) |
| **NeXa text safe zone** | wall, mid, near | **x 1220–1840, y 170–570** | See §T4 |
| **Kitchen pass** | wall | **x 1420–2200, y 590–800** | Top edge ≥ 590 so it sits *below* the text like a baseline. Two gestural cooks visible from the chest up, with warm heat-lamp light. Visible up to x 1892 at the final hold |
| Wainscot / floor line | wall | y 700–840 / 840 | Floor perspective vanishing point ≈ (960, 520) |
| Pendant lamp | mid | shade centre x ≈ 1080, y 140–230; a second lamp may hang at x ≈ 250 | **No lamp or cord inside x 1220–1840** |
| Café tables + 2 guests | mid | x 40–560, y 700–1000 (guests); a small table at x 640–1000, y 800–960 | Gestural, backs or three-quarter away, no faces |
| **Hero table** | near | cloth ellipse centre ≈ (1330, 800), rx ≈ 460; apron to y ≈ 910; legs off the bottom edge | Brightest surface in the lower half |
| **Table card face** | near | **x 1180–1310, y 650–780** | Blank, flat, evenly lit linen-50; QR drawn at x 1193–1298, y 664–769 |
| Cup, vase | near | x 1420–1600, y 700–810 | Small, keep them right of the card |
| Right chair back | near | **remove**, or place entirely beyond x 1900 | The placeholder chair at x 1760 blocks the kitchen |

## C.3 Relationship between the window and the former finder

- It is the same square: the finder aperture (110 units at night) is the glass (360 units in the restaurant).
- The ring of 24 star-white dabs around the finder returns as 24 Kerinti-blue dabs around the glass.
- The wall painting's job is to make this read as **a real window that happens to have a tiled blue frame**:
  - plain plaster band,
  - believable sill and curtains,
  - light obviously pouring through it along the beam.

## C.4 Sunlight

- The sun is **off-frame, upper left** of the view.
- The beam enters through the glass and travels **down-right at ~32° below horizontal**, from the glass centre (620, 400) toward the card (1245, 715).
- **The beam path passes through x 600–920, y 380–660.** That is where the gold modules hover (t 3.1–3.7), so the path must be visually calm: no strong objects, no dark accents.
- Warm key light on the table cloth and card. The wall right of the window is in soft sun; the kitchen is warm tungsten-lit and darker.
- Shadows are soft and violet-brown, falling to the lower right.

## C.5 People

At most 4 figures, all gestural and backlit-soft, with no faces or identifiable features:
- 2 cooks in the pass (wall plate),
- 2 seated guests at the left café table (mid plate).
- No people near the card, in the beam path, or in the text zone.

## C.6 Depth layers and foreground framing

| Plane | Content | Depth |
|---|---|---|
| Far | Window view | +2.2 |
| Architecture | Wall, window band, floor, shelf, plant, kitchen pass + cooks | 0 |
| Atmosphere | Sunbeam | −0.06 |
| Middle | Café tables, guests, pendant lamp | −0.12 |
| Foreground | Hero table, card, cup, vase | −0.28 |
| (optional) Near edge | Soft dark leaves or chair at the lower left | −0.4 |

**Foreground framing.** The hero table enters from the lower right during the pull-back, which is the strongest parallax in the film. Its edges must be soft enough to pass at 3–4× without looking like a cut-out.

## C.7 Layer breakdown (Master C)

| Layer | File | Why separate | Parallax (vs. wall) | Magnification | Margin | Alpha | Transformed | Must align with |
|---|---|---|---|---|---|---|---|---|
| Window view | `02-portal/window-view.webp` | Outside world with the least motion; also the crossover plate | 0.31 | ~1.0–1.42× | see Master B | No | Yes | Glass hole |
| 01 Wall | `03-nexa-morning/room-wall.webp` | Portal plane; carries the glass hole | 1.00 | 1.0–5.5× | canvas bleed 340 / 210 units, all spare | Glass hole only | Yes | **Glass hole = portal B; frame band = code dab ring; text zone** |
| 02 Beam | `03-nexa-morning/light-beam.webp` | Soft light volume with screen blend; separating it lets code control its strength (42%) | 1.06 | fades above 3.8× | — | Yes | Yes | Starts at the glass, ends at the card |
| 03 Mid | `03-nexa-morning/room-mid.webp` | Middle depth and people. Passes the camera during the pull-back | 1.14 | up to 6.5× (fades) | — | Yes | Yes | Table legs meet the wall's floor. Parallax slides them up to ~20 units at the final hold, so use **soft contact shadows** and no crisp contact lines |
| 04 Near | `03-nexa-morning/table-near.webp` | Strongest parallax; landing surface | 1.39 | up to 7× (fades) | — | Yes | Yes | **Card face = QR landing rectangle** |
| Code | — | Blue frame dabs, gold, dust, table QR | — | — | — | — | — | Glass, band, beam path, card |

---

# TEXT SAFE AREAS (Task 6)

> **Paint around these areas; do not cover them.** Each zone is given as the screen area the text occupies (design units, 16:9 frame) and as its footprint on every painting it overlaps. Because the camera moves while text is visible, footprints are the union over the whole time the text is on screen, plus padding.
>
> **Implementation (Phase 2.6).** Text is laid out in the same cover-fitted 1920×1080 design frame as the artwork (`TEXT_BOXES` in `lib/prototype/sceneConfig.ts`), so its position relative to the paintings is identical on every desktop aspect ratio. The placed text boxes sit inside **both** their zone below **and** the region visible from 4:3 to 21:9 (x 240–1680, y 135–945), with ≥ 60 units of inset. Verified at 1920×1080, 2560×1080, 1440×1080 and 1440×900.
>
> | Box | Placed text box (design units) | Zone |
> |---|---|---|
> | Kerinti intro | x 300–800, y 330–643 | T1 |
> | Chapter 1 second line | x 300–760, y 640–684 | T2 |
> | NeXa block | x 1220–1620, y 200–528 | T4 |

## T1 — Kerinti H1 + supporting line (Chapter 1)

| | |
|---|---|
| Visible | t 0 – 0.52 (on screen at page load; wipes out as assembly begins) |
| Content | Eyebrow "Kerinti Soft" · H1, 3–4 lines, display serif · supporting line, 2 lines |
| Screen zone | **x 110–780, y 330–790** (H1 upper, supporting line lower from y ≈ 640) |
| Footprint on sky (δ 1.6, 0.97–1.0×) | x 80–800, y 300–820 |
| Footprint on horizon | Must stay **below y 830** in x 80–800 |
| Painting requirement | Deep nocturne-900/800, short horizontal low-contrast strokes, no stars. Text is `#EAF0F7` / `#B9CBE3` and must hold ≥ 4.5:1 contrast everywhere in the zone |

## T2 — Chapter 1 second line ("It starts with something small.")

| | |
|---|---|
| Visible | t 1.02 – 1.74 |
| Screen zone | **x 130–720, y 620–740** |
| Footprint on sky (1.0–1.06×, slight pan) | x 120–760, y 570–760 |
| Painting requirement | Same as T1, which already covers most of it. No ribbon crest crossing directly behind the line |

## T3 — Portal copy: removed

The optional "Step inside." line was removed in Phase 2.6. The portal moment is communicated visually only, so there is **no text zone during the pull-back** (t 2.58–3.92). The paintings need no calm area for it.

## T4 — NeXa eyebrow, title and supporting text (Chapter 3)

| | |
|---|---|
| Visible | t 3.92 → end (the final hold) |
| Content | Eyebrow "NeXa Restaurant Order Management" · H2, 2 lines · 3 short supporting lines |
| Screen zone | **x 1180–1830, y 130–520**: title x 1180–1830, y 130–360; supporting text y 370–520 |
| Footprint on wall (1.12–1.14×) | **x 1220–1840, y 170–570** |
| Footprint on mid | Same area: **no lamps, cords or tables** |
| Footprint on near (1.21×) | x 1260–1810, y 220–550: **empty** |
| Footprint on beam | The beam must not reach this area (it ends at the table) |
| Painting requirement | Plain warm plaster in soft side-light (linen-100 → linen-50), with hatch strokes kept low-contrast and fine. The kitchen pass top edge at y ≈ 590 acts as the text's visual baseline. Title `#1E2430`, body `#3B3328`, contrast ≥ 4.5:1 |
| Result | **The `.glaze` backdrop is removed.** The painting itself provides the calm |
