# ARTWORK REPLACEMENT CONTRACT — Chapters 1–3

> Phase 2.5 production document. This contract defines how final paintings replace the placeholders **without changing animation code**. It also contains the audit of the current prototype (Task 5).
> Companion files: `ASSET_MANIFEST.md`, `ARTWORK_COMPOSITIONS.md`, `ART_GENERATION_BRIEFS.md`.
> Geometry source of truth: `lib/prototype/sceneConfig.ts`. If this document and that file ever disagree, **stop and resolve it before painting**.

---

## 1. The principle

The camera, portal and modules are driven entirely by numbers in `sceneConfig.ts` and `timeline.ts`. A painting is a passive plate placed at a fixed **design origin**, **design size** and **depth**. As long as a new file keeps the invariants in §2–§4, it is a **drop-in replacement**: overwrite the file, reload, verify (§7).

---

## 2. Per-plate contract

`k` is the export density (design units → pixels). The CSS size of each plate is fixed in design units (`PortalFilm.tsx:349`), so **any `k` works as long as the aspect ratio is exact.** Pixel coordinates follow `px = (design − origin) × k`.

| File (under `public/prototype-assets/`) | Design size | Design origin | Allowed pixel sizes (exact aspect) | Delivery `k` | Depth | Compositing | Alpha rule |
|---|---|---|---|---|---|---|---|
| `01-kerinti-night/sky.webp` | 2880 × 1800 | (−480, −360) | 2880×1800 · **3600×2250** · 4320×2700 | 1.25 | +1.6 | normal | Opaque |
| `01-kerinti-night/horizon.webp` | 2880 × 800 | (−480, 700) | 2880×800 · **3600×1000** · 4320×1200 | 1.25 | +0.8 | normal | Transparent above the ridge; opaque below |
| `02-portal/window-view.webp` | 2400 × 1800 | (−580, −500) | 2400×1800 · **3000×2250** · 3600×2700 | 1.25 | +2.2 (World B) | normal | Opaque |
| `03-nexa-morning/room-wall.webp` | 2600 × 1500 | (−340, −210) | 2600×1500 · **3250×1875** · 3900×2250 | 1.25 | 0 | normal | Opaque **except the glass hole** |
| `03-nexa-morning/room-mid.webp` | 2600 × 1500 | (−340, −210) | as wall | 1.25 | −0.12 | normal | Transparent background |
| `03-nexa-morning/light-beam.webp` | 2600 × 1500 | (−340, −210) | **1300×750** · 2600×1500 | 0.5 | −0.06 | `screen`, 42% (config) | Transparent, feathered |
| `03-nexa-morning/table-near.webp` | 2600 × 1500 | (−340, −210) | as wall | 1.25 | −0.28 | normal | Transparent background |
| `00-shared/dabs.png` | — | — | **8 square cells in one row**: current 2048×256; final 4096×512 recommended (cell size is read from the image height; update `DAB_ATLAS.cell` to silence the check) | — | — | multiply-tinted in canvas | Transparent outside dabs |
| `00-shared/grain.png` | — | — | **512×512**, tileable | — | — | `soft-light`, 13% | Opaque |

**Invariants for every plate**
1. **Anchor.** The top-left pixel is the design origin. No offsets, trims or auto-cropping on export.
2. **Transform origin.** `0 0` (top-left). The engine applies only `translate3d` + uniform `scale`: no rotation or skew.
3. **Aspect ratio.** Exact to the pixel for the chosen `k`. A plate that is 1 px off stretches and shifts every fixed rectangle.
4. **Colour.** sRGB, 8-bit, no wide-gamut profiles.
5. **Transparency.** Straight (non-premultiplied) alpha. **RGB under fully transparent pixels is edge-extended** (dilated), so scaling produces no dark or white fringes. Required for horizon, mid, beam and near.
6. **Format.** WebP (plates) and PNG (atlas, grain). Filenames and folders unchanged. Switching to AVIF means editing only `src` in `PLATES`, no animation code.
7. **Depth, blend and opacity** belong to `sceneConfig.ts`, not to the painting. Paint at full strength.

---

## 3. Fixed rectangles (must match to the unit)

### 3.1 Portal and landing geometry: never move

| Name | Plate | Design rectangle | Pixels at k = 1.25 | Rule |
|---|---|---|---|---|
| **Finder aperture (portal A)** | sky (reference only) | x 1047–1157, y 247–357 · centre (1102, 302) | x 1909–2046, y 759–896 | Nothing painted here needs to align (the hole is code), but the sky must be neutral mid-dark here |
| **QR safe zone** | sky | x 985–1615, y 185–815 | x 1831–2619, y 681–1469 | ≤ 12% luminance contrast; no stars or highlights |
| **Ridge clearance** | horizon | ridge top ≥ y 830 for x 985–1615 | ridge ≥ px y 162, x 1831–2619 | Nothing above |
| **Glass hole (portal B)** | wall | **x 440–800, y 220–580** | **x 975–1425, y 537.5–987.5** | Alpha exactly 0 inside. Hard edge. Opaque outside |
| **Frame band** | wall | x 368–872, y 148–652 (minus the glass) | x 885–1515, y 447.5–1077.5 | Plain light plaster (≈ #F1E4C8), fine low-contrast hatch; code draws 24 dabs here |
| **Beam path** | wall, mid | x 600–920, y 380–660 | x 1175–1575, y 737.5–1087.5 | Calm, no dark accents (gold modules hover here) |
| **Card face** | near | **x 1180–1310, y 650–780** | **x 1900–2062.5, y 1075–1237.5** | Blank, flat, evenly lit linen-50; QR lands at x 1193–1298, y 664–769 |
| **Kitchen pass** | wall | x 1420–2200, y 590–800 | x 2200–3175, y 1000–1262.5 | Top edge ≥ 590 |
| Window-view glimpse | view | x 840–1000, y 260–400 | x 1775–1975, y 950–1125 | Brightest, softest area |
| Window-view gold readability | view | x 700–1010, y 380–640 | x 1600–1987.5, y 1100–1425 | Mid-value, cool; no gold, ochre or cream |
| Window-view crossing frame | view | x 178–1530, y 116–876 | x 947.5–2637.5, y 770–1720 | A complete full-screen composition |
| Window-view window zone | view | x 300–820, y 160–600 | x 1100–1750, y 825–1375 | Reads as "outside" |

### 3.2 Text safe zones (paint around these)

| Zone | Plate(s) | Design rectangle | Pixels at k = 1.25 |
|---|---|---|---|
| T1 Kerinti H1 + supporting line | sky | x 80–800, y 300–820 | x 700–1600, y 825–1475 |
| T1 (horizon clearance) | horizon | nothing above y 830 in x 80–800 | ridge ≥ px y 162, x 700–1600 |
| T2 Chapter 1 second line | sky | x 120–760, y 570–760 (inside T1's calm field) | x 750–1550, y 1162–1400 |
| ~~T3 "Step inside."~~ | — | Removed in Phase 2.6: no zone needed | — |
| **T4 NeXa block** | wall, mid, near, beam | **x 1220–1840, y 170–570** | **x 1950–2725, y 475–975** |

Full rationale and timing: `ARTWORK_COMPOSITIONS.md` → *Text safe areas*.

---

## 4. What must never be painted

Code already draws these, and painting them duplicates or misaligns them:
- modules (stars, QR, dust, gold)
- the finder ring
- the blue window frame dabs
- the portal hole edge
- the warm finder glow
- speed flicks
- the flare
- the table QR
- any text

Also never paint: window mullions or frames inside the glass hole, a frame or vignette inside the window view, or readable text or logos anywhere.

---

## 5. Text integration (required before final art is installed)

Final art removes the need for backdrops, but only if text sits exactly in the painted zones. Two small changes touch **text layout only**. They do not touch the camera, timeline, portal or module code.

1. ✅ **Done (Phase 2.6). Text is anchored to design space.**
   - Text blocks live in a 1920×1080 `data-text-frame` that uses the exact cover transform of the plates.
   - Boxes and font sizes are in design units (`TEXT_BOXES` in `sceneConfig.ts`), so text scales with the artwork.
   - Boxes stay inside their §3.2 zones and inside the 4:3–21:9 visible region (x 240–1680, y 135–945) with ≥ 60 units of inset.
   - If a painting moves a zone, only `TEXT_BOXES` changes.
2. ✅ **Done (Phase 2.7). The NeXa `.glaze` backdrop is removed.** With the pilot B-01 wall the painted T4 zone alone gives eyebrow 4.7:1, title 12.5:1 and body 9.6:1 (worst 1% of plaster pixels under each line).

---

## 6. Changes that would require code (ranked)

| # | Change | Why | Size | When |
|---|---|---|---|---|
| 1 | ✅ Text anchoring (§5.1) | Exact safe zones on all desktop aspects | Done in Phase 2.6 | — |
| 2 | ✅ Dab atlas cell size | Done in Phase 2.6. `DAB_ATLAS` in `sceneConfig.ts`: the cell size is read from the atlas image height (placeholder now 256 px cells); `tintCell` (256) sets the in-memory sprite resolution. With the final 4096×512 atlas, set `cell: 512` and decide `tintCell` (512 ≈ 58 MB of sprites) | Config only | With S-01 final |
| 3 | Remove `.glaze` (§5.2) | Artwork provides the calm | Trivial | With B-01 final |
| 4 | Optional plates (`atmosphere`, `foreground-edge`) | Extra depth | One `PLATES` entry each | Only if approved |
| 5 | Responsive `src` / AVIF / density per DPR | Bandwidth on small screens, sharpness on 2× screens | Config + `Plate` component | Performance pass |
| 6 | **Mobile portrait** camera, portal and text zones per breakpoint | Portrait cover-fit shows only design x ≈ 710–1210, which crops the QR and window | Medium (config + camera keyframes) | **Mobile gate, not this phase** |

Nothing else in the art pipeline needs code.

---

## 7. Verification procedure (every delivered file)

**Setup:** `npm run dev`, then open `http://localhost:3100/?debug&t=<t>` to freeze exact frames.

| t | Check |
|---|---|
| 0 | Headline zone calm and legible (≥ 4.5:1); horizon clear of T1; overall first impression |
| 0.9 | Star modules readable against the sky everywhere, especially over the QR zone |
| 1.3 / 1.8 | Finder surround neutral; code glow reads as light; glimpse zone glows through the ring gaps |
| 2.1 | Window view unfolding inside the square looks intentional |
| 2.3 | Portal edge just left the screen; the full frame has no plate edges, seams or empty areas |
| **2.575 vs 2.585** | **Identical frames** (world switch). Any difference is a defect |
| 2.75 | Gold modules clearly readable over the gold readability zone |
| 3.0 | Wall window surround at ~2.6× still reads as paint; no hard cut-out edges on mid or near |
| 3.32 | Establishing frame: glass hole aligned inside the blue dab frame, no plaster sliver inside the glass, no transparency outside it |
| 3.8 | Beam path calm; dust readable; floor contacts don't visibly slide |
| 4.4 | QR lands inside the card face; NeXa zone plain, with no lamp, shelf or pass intruding; text ≥ 4.5:1 |

**Then:**
1. Scroll the full film **forward and backward** in real time on a desktop at 16:9, 21:9 (e.g. 2560×1080) and 4:3 (e.g. 1440×1080). Watch for pops, edges entering the frame and fringes.
2. Budgets: file sizes ≤ `ASSET_MANIFEST.md` targets. Chapter 1–3 total ≤ 4.2 MB. Scrolling stays smooth (no long frames on a mid-range laptop in the Performance panel).
3. Run the originality gate (`ART_DIRECTION.md` §6.3).

---

## 8. Current prototype audit (Task 5)

### 8.1 Keep exactly as-is

| What | Where | Why it works |
|---|---|---|
| Story beats and scroll budget (180 / 120 / 140 vh, one scrubbed master timeline, no snapping) | `timeline.ts`, `CHAPTERS` | Approved choreography; reverse scroll is exact |
| Portal-derived 2.5D camera shared by both worlds | `camera.ts` | Makes the crossover continuous by construction |
| World switch only while the portal covers the screen (t = 2.58, size 7000) | `timeline.ts:17–18, 45`; `portalCovers` | Frames either side are identical |
| Hole in World A exactly at the finder, 36-point brushy outline | `PortalFilm.tsx:23, 144` | Physical "through the square" passage |
| Module identities: finder ring → window frame; gold core → carried → table finder; QR cells → dust → same cells on the card | `moduleField.ts` | "One physical object" continuity |
| Unified cream speed flicks | `moduleField.ts:317` | Removed the only visible difference at the switch |
| Preload and `decode()` of all plates before the film starts | `PortalFilm.tsx` load block | World B exists before entering; no first-frame stalls |
| Plates sized in CSS by design units | `PortalFilm.tsx:349` | Enables density-independent drop-in art |
| `?t=` frame freeze and `?debug` overlay | `PortalFilm.tsx` | Required for art verification (§7) |

### 8.2 Replace visually (drop-in, no code)

- All 7 plates: `sky`, `horizon`, `window-view`, `room-wall`, `room-mid`, `light-beam`, `table-near`.
- `dabs.png` (any 8-cell square-cell size, see §2) and `grain.png`.
- **Composition corrections the final wall, mid and near plates must make.** These are placeholder defects, not code issues:
  - the right pendant lamp (x ≈ 1600) and its cord sit inside T4;
  - the shelf runs to x 1430, into T4;
  - the kitchen pass top at y 330 intrudes into T4;
  - the right chair back on the near plate hides the kitchen;
  - the wall has diagonal light-patch leftovers and hard beam edges.
- **World A placeholder defects:** uniform fine-grained strokes and weak ribbon hierarchy.
- **Window-view placeholder defects:** stripe artifacts on houses; the gold modules read poorly over cream sky at the crossing.
- `scripts/paint-prototype-assets.mjs` stays as a dev-only placeholder generator. Final art is **not** produced with it, and running `npm run paint` would **overwrite** delivered art. Move final art under version control and stop using the script once the first final plate lands.

### 8.3 Refine later (after final art is installed; small value tweaks, not structural)

| Item | Current value / location | Note |
|---|---|---|
| Beam strength | `light-beam` opacity 0.42 (`PLATES`) | Tune against the final beam painting |
| Grain strength | 13% soft-light (`PortalFilm.tsx:263`) | Final plates carry their own texture, so it may drop to 6–10% |
| Finder glow colour and ramp | `data-glow` gradient, `glow` tweens 1.1–2.2 | Match the final sky's values |
| Flare peak | 0.8 × `flare` | May go lower if the window view is bright enough |
| Frame dab colour | `COLORS.ink #1F3263` | Check against final plaster |
| Gold readability | `COLORS.gold`, glow sprite alpha 0.55 | Check at t = 2.75 over the final view |
| Dust density and warm colour | 170 dust + 24 ambient; `COLORS.cream` | Tune against the final beam |
| Near-layer fade window | full ≤ 3.8×, zero at 7× (`PortalFilm.tsx:119`) | Adjust only if a final foreground edge looks cut |
| Text colours | `#EAF0F7`, `#B9CBE3`, `#1E2430` | Re-check contrast on final paintings |
| Chapter rail legibility | `mix-blend-mode: difference` | Verify on the bright world |
| Reduced-motion static baseline and SEO text baseline | Not built in the prototype | Planned in `TECHNICAL_PLAN.md` §6.1; uses the final key frames |
| Idle drift amplitudes | module wobble in `moduleField.ts` | Cosmetic |

### 8.4 Do not touch (continuity-critical)

Modifying any of these risks reintroducing section-like transitions, pops at the world switch, or broken reverse scroll. Changes require a dedicated review with the §7 frame checks.

| Code | Location | Risk if changed |
|---|---|---|
| `cameraFor`, `layerTransform`, `portalCovers`, `viewportFor` | `lib/prototype/camera.ts:75, 92, 115, 121` | Worlds stop sharing one camera; the crossover desynchronizes |
| `WORLD_SWITCH = 2.58`, `PEAK_SIZE = 7000`, `tl.set(world)` | `lib/prototype/timeline.ts:17–18, 45` | The switch becomes visible (a hard world replacement) |
| Dive and pull-back tweens on `logS`, `px`, `py` (Chapter 2) | `timeline.ts` Chapter 2 block | The portal edge may not clear the screen before the switch |
| `PORTAL`, `QR_A`, `GLASS_B`, `TENT_B` constants | `lib/prototype/sceneConfig.ts` | **All artwork rectangles in §3 derive from these. Changing them invalidates every painting** |
| World visibility and clip logic (`covers`, `display` toggles, hole path) | `PortalFilm.tsx:108, 131–147` | Plates can pop in or out at the switch |
| Module role mapping, `frameCell = 72`, gold `carryX`/`beamX`, `nearFade` | `moduleField.ts:113, 176–178, 262` | Breaks object identity across worlds, or makes modules pop instead of passing the camera |
| `PLATES` depths and origins | `sceneConfig.ts:75` | Plates drift against the fixed rectangles; parallax no longer matches the paintings |
| ScrollTrigger `scrub: 0.7` on one master timeline | `PortalFilm.tsx` load block | Splitting it into per-section triggers reintroduces section behaviour |

---

## 9. Change control

- **Art changes** (inside a plate, respecting §2–§4): no approval beyond the art gates.
- **Config value tweaks** (§8.3): allowed after art install, verified with §7.
- **Anything in §8.4, or any §3 rectangle:** requires written approval, because every affected painting must be re-checked, and possibly repainted.
