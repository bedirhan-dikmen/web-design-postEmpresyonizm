# ASSET MANIFEST — Chapters 1–3 Final Artwork

> Phase 2.5 production document. Companion files: `ARTWORK_COMPOSITIONS.md`, `ART_GENERATION_BRIEFS.md`, `ARTWORK_REPLACEMENT_CONTRACT.md`.
> Source of truth for geometry: `lib/prototype/sceneConfig.ts`. All numbers below were **measured from the running prototype** (timeline sampled every 0.005 s at 16:9, 21:9 and 4:3), not estimated.
> Status: **for approval**. Chapter 4 is out of scope.

---

## 0. Summary

| | Count |
|---|---|
| **Required final files** (replace a placeholder 1:1, no code change) | **9** |
| of which are major illustrations | 5 (sky, window view, restaurant wall, restaurant mid, hero table) |
| of which are supporting/utility art | 4 (horizon, light beam, dab atlas, grain) |
| Optional additions (need a one-line config entry, no animation change) | 2 |
| Mobile portrait variants | Deferred: blocked by the missing portrait camera config (see §4) |
| Elements that must **not** be painted (drawn by code) | 11 (see §3) |

Several items from the requested category list are **content painted inside an existing plate**, not separate files: distant city, atmospheric ribbons, kitchen activity, people silhouettes, and the table card. Separating them would add layers without adding parallax, because they share their plate's depth. §2 explains each one.

---

## 1. Global rules for every asset

- **Design space.** 1920×1080 per world, mapped to the viewport with *object-fit: cover*. Every plate has a **design canvas** (its size in design units) and a **design origin** (where its top-left corner sits).
- **Pixel density.** Each `<img>` is sized in CSS to its design canvas (`PortalFilm.tsx:349`). A file can therefore be exported at any density **with the exact same aspect ratio** and needs no code change.
  - Masters are painted at **2×**.
  - Delivery exports are **1.25×**, except where noted.
- **Format.** WebP, sRGB, 8-bit.
  - Opaque plates: quality 80–85.
  - Transparent plates: quality 82 with alpha quality 100.
  - Transparent pixels must carry **edge-extended color** (no black or white matte), otherwise dark fringes appear when GSAP scales the plate.
- **Depth (δ).** δ is measured relative to the world's portal plane: 0 = the QR plane in World A and the window wall in World B. δ > 0 is further away, δ < 0 is closer.
  - Lateral parallax relative to the portal plane ≈ `1 / (1 + δ)`.
  - Magnification during the dive and pull-back follows `m = (1 + δ) / (d + δ)`.
- **Transform.** Every plate uses `translate3d + scale` with `transform-origin: 0 0`. Nothing rotates or skews.
- **Budgets.** The totals below assume 1.25× delivery. Chapters 1–3 desktop total: **≈ 4.2 MB**.

---

## 2. Required assets

### A-01 · Night sky

| Field | Value |
|---|---|
| **Filename** | `public/prototype-assets/01-kerinti-night/sky.webp` |
| **Chapter** | 1, 2 (until the portal covers the screen at t = 2.58) |
| **Purpose** | The living painted night of Kerinti. Carries the ribbon strokes that lead the eye to the finder square |
| **Visual** | Deep ultramarine night painted as long horizontal-to-diagonal ribbon strokes that bend toward the QR's top-left finder. A calm, low-contrast field behind the QR and the headline. At most 5 tiny painted star points, no moon, no vortex |
| **Plane** | Background |
| **Design canvas / origin** | 2880 × 1800 at (−480, −360) |
| **Export (desktop)** | 3600 × 2250 (1.25×); master 5760 × 3600 |
| **Aspect ratio** | 8 : 5 (exact) |
| **Transparency** | None (opaque) |
| **Format / size target** | WebP q82 · **≤ 900 KB** |
| **Depth / animation** | δ = +1.6 · magnification 0.97–1.57× · lateral parallax ≈ 0.38 of the QR plane. Clipped by the portal hole from t ≈ 1.3 |
| **Extends beyond viewport** | Yes. Visible region over the whole film spans x −37…1947, y −10…1106. Everything outside that is bleed, but must still be painted |
| **Tiles** | No |
| **Replace independently** | Yes |
| **Mobile** | Portrait variant deferred (§4). The master must be fully painted across the canvas |

### A-02 · Horizon (distant hills and low city lights)

| Field | Value |
|---|---|
| **Filename** | `01-kerinti-night/horizon.webp` |
| **Chapter** | 1, 2 |
| **Purpose** | Grounds the night, adds depth against the sky, and quietly foreshadows restaurants as lit windows |
| **Visual** | Two silhouetted ridges in nocturne-900/800, painted with horizontal hatch strokes. A low, flat, distant settlement with **≤ 12** warm window dabs. Flat roofs only: no steeples, towers or cypress-like vertical forms. Soft painted top edge. Fully transparent above the ridge |
| **Plane** | Midground (World A) |
| **Design canvas / origin** | 2880 × 800 at (−480, 700) |
| **Export** | 3600 × 1000 (1.25×); master 5760 × 1600 |
| **Aspect ratio** | 18 : 5 |
| **Transparency** | Yes. Ridge tops sit between design y 840 and 900 (see composition) |
| **Format / size target** | WebP with alpha · **≤ 250 KB** |
| **Depth / animation** | δ = +0.8 · magnification 0.95–2.09× · lateral parallax ≈ 0.56 |
| **Extends beyond viewport** | Yes, horizontally (visible x −53…1960). The plate must be opaque from ridge to bottom edge |
| **Tiles** | No |
| **Replace independently** | Yes |
| **Mobile** | Deferred (§4) |

### P-01 · Window view (the world beyond the portal)

| Field | Value |
|---|---|
| **Filename** | `02-portal/window-view.webp` |
| **Chapter** | 1 (glimpse through the opening finder), **2 (fills the whole screen at the crossing)**, 3 (seen through the restaurant window) |
| **Purpose** | **The single most important image.** It is the only painting on screen when the world switch happens (t = 2.58), so it hides the switch from both scroll directions. It proves World B exists before we enter |
| **Visual** | A warm morning seen from a slightly raised interior eye-level: luminous cream-gold sky bloom (the sun itself is off-frame, upper left), soft cloud bands, a distant line of sage hills, terracotta and ochre rooftops with trees. Complete and balanced as a full-screen landscape between design x 178–1530, y 116–876 |
| **Plane** | Far background (World B space) |
| **Design canvas / origin** | 2400 × 1800 at (−580, −500) |
| **Export** | 3000 × 2250 (1.25×); master 4800 × 3600 |
| **Aspect ratio** | 4 : 3 |
| **Transparency** | None |
| **Format / size target** | WebP q82 · **≤ 800 KB** |
| **Depth / animation** | δ = +2.2 (World B space) · magnification 0.63–1.42× · lateral parallax ≈ 0.31. Visible only through the hole in World A, then through the glass hole in the wall |
| **Extends beyond viewport** | Visible union x 138…1569, y 72…923. The rest of the canvas is bleed |
| **Tiles** | No |
| **Replace independently** | Yes |
| **Mobile** | Deferred (§4) |

### B-01 · Restaurant wall (back wall, floor, window surround, kitchen pass)

| Field | Value |
|---|---|
| **Filename** | `03-nexa-morning/room-wall.webp` |
| **Chapter** | 2 (revealed during the pull-back), 3 |
| **Purpose** | The restaurant's architecture. Holds the **glass hole** that *is* the portal, the calm plaster zone for the NeXa headline, and the kitchen pass |
| **Visual** | Warm sunlit plaster wall with diagonal hatch brushwork, a terracotta wainscot, and a honey-wood floor in perspective. The window glass is a transparent hole with a plain light plaster band around it (the Kerinti-blue dab frame is drawn by code). Also: a low kitchen pass at the right with two gestural cooks, a short shelf of jars left of the text zone, and a potted plant left of the window |
| **Plane** | Background (World B portal plane) |
| **Design canvas / origin** | 2600 × 1500 at (−340, −210) |
| **Export** | 3250 × 1875 (1.25×); master 5200 × 3000. The **window surround** (design x 300–950, y 100–720) must be painted with bold strokes that survive 5× magnification |
| **Aspect ratio** | 26 : 15 |
| **Transparency** | **Glass hole only**: design x 440–800, y 220–580 must be exactly alpha 0. Everything else is opaque |
| **Format / size target** | WebP with alpha · **≤ 1.0 MB** |
| **Depth / animation** | δ = 0 · magnification 1.0–5.5× (peak during the pull-back, when only the window surround is on screen) · reference plane for lateral parallax |
| **Extends beyond viewport** | Visible union 0…1920 × 0…1080 (final hold: x 208–1892, y 84–1032). The canvas bleed of 340/210 px is spare |
| **Tiles** | No |
| **Replace independently** | Yes, as long as the glass hole and the frame-ring band match the contract |
| **Mobile** | Deferred (§4) |

### B-02 · Restaurant midground (mid tables, guests, pendant lamp)

| Field | Value |
|---|---|
| **Filename** | `03-nexa-morning/room-mid.webp` |
| **Chapter** | 2 (passes the camera during the pull-back), 3 |
| **Purpose** | Gives depth between wall and hero table. Carries the human presence of guests |
| **Visual** | Two small café tables with chairs at the left and center-left. Two seated gestural guests (no faces) at the left table. One pendant lamp hanging left of the text zone. Everything else transparent |
| **Plane** | Midground |
| **Design canvas / origin** | 2600 × 1500 at (−340, −210) |
| **Export** | 3250 × 1875 (1.25×) |
| **Aspect ratio** | 26 : 15 |
| **Transparency** | Yes (mostly transparent) |
| **Format / size target** | WebP with alpha · **≤ 350 KB** |
| **Depth / animation** | δ = −0.12 · lateral parallax ≈ 1.14 · passes the camera early in the pull-back. Magnification up to 6.5×; code fades it out above 3.8× |
| **Extends beyond viewport** | Same canvas as the wall. Content must not touch the canvas edges |
| **Tiles** | No |
| **Replace independently** | Yes |
| **Mobile** | Deferred (§4) |

### B-03 · Sunbeam

| Field | Value |
|---|---|
| **Filename** | `03-nexa-morning/light-beam.webp` |
| **Chapter** | 2, 3 |
| **Purpose** | Physical light from the portal window to the hero table. The visual path the gold modules and dust travel along |
| **Visual** | A soft, feathered wedge of warm light (#FFE6B0 → transparent) from the glass toward the table card, with faint long directional strokes along the beam and **no hard edges anywhere** |
| **Plane** | Atmosphere (between wall and mid) |
| **Design canvas / origin** | 2600 × 1500 at (−340, −210) |
| **Export** | **1300 × 750 (0.5×)**. It is soft, so low density is fine |
| **Aspect ratio** | 26 : 15 |
| **Transparency** | Yes. Composited with `screen` blend at 42% opacity (config) |
| **Format / size target** | WebP with alpha · **≤ 120 KB** |
| **Depth / animation** | δ = −0.06 · lateral parallax ≈ 1.06 · fades above 3.8× magnification |
| **Extends beyond viewport** | No |
| **Tiles** | No |
| **Replace independently** | Yes |
| **Mobile** | Deferred (§4) |

### B-04 · Hero table and table card

| Field | Value |
|---|---|
| **Filename** | `03-nexa-morning/table-near.webp` |
| **Chapter** | 2 (passes the camera late in the pull-back), 3 |
| **Purpose** | Foreground framing and the landing surface for the QR. The **table card face** receives the code-drawn QR |
| **Visual** | Round table with a cream linen cloth in the right foreground, lit by the beam. A folded card stands on it with a **blank**, evenly lit face. Beside it: a cup and a small vase of flowers. The card must be clearly the most luminous and calmest object on the table |
| **Plane** | Foreground |
| **Design canvas / origin** | 2600 × 1500 at (−340, −210) |
| **Export** | 3250 × 1875 (1.25×) |
| **Aspect ratio** | 26 : 15 |
| **Transparency** | Yes. Only the table, card, props and optional chair are opaque |
| **Format / size target** | WebP with alpha · **≤ 450 KB** |
| **Depth / animation** | δ = −0.28 · lateral parallax ≈ 1.39 (the strongest in the scene) · magnification up to 7×; code fades it above 3.8× · final hold magnification 1.21× (card QR ≈ 127 design px) |
| **Extends beyond viewport** | The table may run off the bottom and right. Content must not reach the canvas edges |
| **Tiles** | No |
| **Replace independently** | Yes, as long as the card face matches the contract |
| **Mobile** | Deferred (§4) |

### S-01 · Brush dab atlas (QR modules, stars, dust, window frame, gold)

| Field | Value |
|---|---|
| **Filename** | `00-shared/dabs.png` |
| **Chapter** | 1, 2, 3 |
| **Purpose** | The texture of **every module**: stars, QR, the 9 gold modules, dust, the Kerinti-blue window frame, the table QR and speed flicks. Tinted at runtime |
| **Visual** | 8 square impasto dabs, each a slightly ragged square of loaded paint made of 3–6 parallel bristle strokes with a single lighter impasto ridge. Grey values 170–255 (texture), transparent outside the dab |
| **Plane** | n/a (sprite) |
| **Dimensions** | 8 square cells in one row. **Final: 4096 × 512** (512-px cells, dab body ≈ 384 × 384 centered). Current placeholder: 2048 × 256. The cell size is read from the image height (`DAB_ATLAS` in `sceneConfig.ts`) |
| **Aspect ratio** | 8 : 1 |
| **Transparency** | Yes |
| **Format / size target** | PNG-24 · **≤ 600 KB** at 4096 × 512 |
| **Animation** | Drawn per module with rotation up to ±12°. Rendered from 3 to ~500 design px wide (the window frame during the pull-back), and stretched up to 40:1 for speed flicks |
| **Tiles** | No |
| **Replace independently** | Yes, at any square-cell size. Set `DAB_ATLAS.cell` to match (silences the load-time check), and review `tintCell` for sprite memory (Contract §6) |
| **Mobile** | Same file |

### S-02 · Canvas grain

| Field | Value |
|---|---|
| **Filename** | `00-shared/grain.png` |
| **Chapter** | 1, 2, 3 (full-screen overlay) |
| **Purpose** | Unifies all layers and code-drawn elements under one canvas surface |
| **Visual** | Neutral mid-grey linen canvas weave with a faint irregular tooth. No directional brushstrokes |
| **Plane** | Overlay (above everything except text) |
| **Dimensions** | 512 × 512, **seamlessly tileable** |
| **Transparency** | None. Composited with `soft-light` at 13% |
| **Format / size target** | PNG-8/24 grayscale · **≤ 200 KB** |
| **Animation** | None (static, screen-fixed) |
| **Replace independently** | Yes |
| **Mobile** | Same file |

---

## 3. Elements drawn by code: do **not** paint these into any plate

Painting any of these would double them, or leave them misaligned because they live at a different depth.

| Element | Where it's drawn | Why it must stay code |
|---|---|---|
| Star modules and QR assembly (World A) | `moduleField.ts` (canvas) | Each module has its own depth and path |
| Top-left finder ring (24 dabs) and its gap light | canvas | It is the portal frame; its geometry is the camera |
| The 9 gold core modules (+ glow) | canvas | Carried by the camera through the portal |
| Brush-edged portal hole | `PortalFilm.tsx:23, 144` (clip path) | Must match the finder aperture exactly at every scale |
| Warm light spilling from the finder | CSS radial gradient (`data-glow`) | Would misalign with the sky's parallax if painted |
| Speed flicks during the passage | canvas (stretched dabs) | Driven by camera speed |
| Threshold flare | CSS (`data-flare`) | Peaks exactly at the switch |
| Kerinti-blue window frame ring (24 dabs, 72 px cells) | canvas | Same identity as the finder ring |
| Dust motes in the sunbeam | canvas | Become the table QR |
| QR on the table card | canvas | Formed by the travelling modules |
| All text | DOM | Accessibility, translation, SEO |

The text backdrop (`.glaze`, `data-glaze`) is a **temporary** crutch. It should be removed once B-01 provides the calm zone (Contract §5).

---

## 4. Mobile: status and requirements

**Portrait assets are not independently replaceable today.**
- On a 390 × 844 viewport, cover-fit shows only design x ≈ 710–1210. That crops both the QR (x 1025–1575) and the window (x 440–800).
- The prototype has no portrait camera, portal coordinates or text zones.
- Dropping in portrait images would not help without that configuration.

**What artists do now**
- Paint every master across its full canvas, including bleed, so that portrait recompositions can be cut or extended later.
- Keep key objects as separable layers in the master file: QR zone, window, table and card, cooks, guests.

**What engineering does at the mobile gate** (not in this phase)
1. Add per-breakpoint portal positions, text zones and camera keyframes.
2. Add a responsive `src` per plate.
3. Then specify portrait canvases, estimated at ~1080 × 2340 design units per world.

---

## 5. Optional additions (config entry only)

These are not required for approval. Each needs a new entry in `PLATES` in `sceneConfig.ts`; no animation or timeline code changes.

| Filename | Chapter | Purpose | Depth | Canvas / origin | Notes |
|---|---|---|---|---|---|
| `01-kerinti-night/atmosphere.webp` | 1–2 | Translucent night-mist ribbons between sky and QR, for extra depth during the push-in and dive | +0.35 | 2880 × 1800 at (−480, −360) | Alpha. Must keep the QR and headline zones clear. Magnifies up to ~3.7× during the dive, so use soft, large strokes only |
| `03-nexa-morning/foreground-edge.webp` | 2–3 | A dark soft-focus foreground element (plant leaves or chair back) at the lower-left, passing the camera during the pull-back | −0.4 | 2600 × 1500 at (−340, −210) | Alpha. Fades automatically above 3.8×. Must never cover the window or the card |

---

## 6. Replacement priority

1. **P-01 Window view**: carries the crossing, currently the weakest placeholder, and hides the world switch.
2. **B-01 Restaurant wall**: carries the "portal becomes a window" reveal and the NeXa text zone, which is currently blocked by lamp, shelf and pass.
3. **A-01 Night sky**: first impression and LCP background.
4. **B-04 Hero table and card**: the QR landing moment.
5. **S-01 Dab atlas**: raises the quality of every module in all three chapters at once.

Then B-02, A-02, B-03 and S-02.
