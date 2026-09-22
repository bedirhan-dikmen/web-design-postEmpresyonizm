# ART GENERATION BRIEFS — Chapters 1–3

> Phase 2.5 production document. Each brief is self-contained and can be handed to a professional digital illustrator, used to steer AI-assisted concept exploration that is then **repainted by a human**, or used for internal painting and compositing.
> Geometry is defined in `ARTWORK_COMPOSITIONS.md`; file specs are in `ASSET_MANIFEST.md`; delivery rules are in `ARTWORK_REPLACEMENT_CONTRACT.md`. When a brief and the contract disagree, **the contract wins**.

---

## 0. Shared visual language (applies to every brief)

### 0.1 The hand
All plates must look like **one painter on one canvas surface over one morning and one night.** Use the stroke vocabulary from `ART_DIRECTION.md` §5.2:

| Stroke | Shape | Use |
|---|---|---|
| **Ribbon** | Long curving parallel bands, 3–5 tones side by side | Skies, flow toward the portal, light volumes |
| **Halo** | Short strokes in broken concentric rings | Only around small light sources: lamps, heat lamp, tiny window lights. **Never large star halos** |
| **Dab** | Square-ish loaded impasto mark | QR modules (code), window lights, flower heads, jar highlights |
| **Hatch** | Short parallel strokes in a tight rhythm | Plaster, wood, cloth, ridges |
| **Flick** | Quick tapering mark | Edges of leaves, steam, the soft edges of the beam |

### 0.2 Painterly rules
- **Broken colour.** Build every surface from 2–4 adjacent related hues, never a flat fill. Shadows lean violet or blue in the night, and violet-brown in the morning.
- **Energy follows the story.** Stroke direction always points where the camera goes next: toward the finder at night, along the sunbeam toward the card in the morning.
- **Visible brush scale.** At 1× design size, the largest sky strokes are 60–140 units long and 18–40 wide. Surfaces use hatches 10–30 units long. Fine detail (≤ 6 units) is reserved for focal objects only.
- **Impasto.** Thick paint (visible ridge highlights, slight relief shading) only at focal points: ribbon crests near the finder, lit edges of the cloth and card, lamp rims, window sill. Everything else is thinner and lets the canvas tooth show.
- **Quiet zones are painted, not blurred.** Calm areas still use strokes, just shorter, closer in value and lower in contrast. Never use Gaussian blur, airbrush gradients or digital glow.

### 0.3 Palette tokens (from ART_DIRECTION.md)

| World A — Nocturne | World B — Daylight Service | Shared |
|---|---|---|
| nocturne-900 `#070F24` | linen-50 `#FBF6EC` | gold-400 `#E8C66A` (**reserved for code modules; do not paint gold accents that compete**) |
| nocturne-800 `#0B1B3F` | linen-100 `#F4EAD5` | ember-500 `#E0784A` |
| nocturne-700 `#13294B` | ochre-400 `#E3A83B` | dusk-600 `#5B3F7A` (shadow accents only) |
| nocturne-500 `#2A4B9B` | terracotta-500 `#C8643B` | Kerinti blue (code dabs) `#1F3263` |
| nocturne-300 `#6F93C9` | sage-500 `#8A9A5B` | |
| mist-200 `#9CC7E0` | daysky-300 `#7FB3D5` | |
| starlight-100 `#EAF0F7` | ink-900 `#1E2430` | |

### 0.4 Global "never" list
- Any recognizable Van Gogh composition or motif: swirling night over a village with a spire, cypress, crescent moon, big concentric star halos, café terrace at night with a yellow awning, sunflowers, wheat field with crows, the bedroom.
- Anything resembling pear.no or Shopify Editions illustrations: mascot objects, their colour schemes, their scene layouts.
- Faces or identifiable people, logos, real brand names, readable text in the paintings (menus, signs), QR codes (the QR is code-drawn).
- Digital effects: lens flare, bloom, chromatic aberration, gradient mesh, glassmorphism, photographic textures, 3D renders, vector outlines.
- Painted versions of anything code draws (see `ASSET_MANIFEST.md` §3): modules, finder glow, portal edge, blue window frame, dust, table QR, flicks.

### 0.5 Using AI-assisted concepts
- Use AI **only for thumbnails and composition or lighting exploration** at low resolution.
- **Do not** use images of Van Gogh paintings, pear.no or Shopify Editions as image prompts, style references or LoRA training data.
- Every final plate must be **substantially repainted by hand** at master resolution using the stroke vocabulary above: new strokes over the whole surface, not filters or overpainting only the edges.
- Record the tool, model version and terms for each concept used. Confirm with Kerinti that the licensing terms allow commercial use before any AI concept influences a delivered plate.
- Run the originality gate (`ART_DIRECTION.md` §6.3) on the concept **and** on the final.

### 0.6 Master file setup (all illustrations)
- Paint at **2× design density** on the full design canvas, bleed included.
- Place guides at: canvas edges, the design-frame rectangle (0,0)–(1920,1080) offset by the plate origin, and every safe zone and fixed rectangle listed in the brief.
- Keep separable elements (figures, plants, props) on their own layers inside the master file, even if they flatten into one delivered plate. Portrait recomposition later depends on it.
- A downloadable template per plate (canvas + guides) should be produced from `ARTWORK_REPLACEMENT_CONTRACT.md` §2 before painting starts.

---

## BRIEF A-01 — Kerinti Night Sky

| | |
|---|---|
| **Subject** | A living night sky. Nothing but atmosphere: long painted ribbons of night air, a few pinpoint stars, a faint cool glow rising from beyond the horizon |
| **Camera** | Standing on a low rise, looking slightly upward. Horizon low in frame (hidden behind A-02 at y ≈ 840–900). No perspective lines; the sky is a vertical painted field |
| **Composition** | Horizontal-dominant. Ribbons sweep from the upper left across the frame and **converge and bend around the QR's top-left finder at (1102, 302)**: they approach from the upper left, pass above it, and curl gently down its right side. The upper band (y < 220) and the upper-right third carry the most movement. The lower left, behind the headline, is the stillest area |
| **Lighting** | No moon, no large light source. A soft cool mist glow (mist-200 at low strength) rises behind the ridge between y 700 and 860 and lifts the lower sky slightly. Nothing warm anywhere: the warmth at the finder is added by code |
| **Palette** | nocturne-900 at the top edge → nocturne-800 body → nocturne-700 and nocturne-500 ribbons → nocturne-300 ribbon crests → mist-200 only in the horizon glow and 3–5 pinpoint stars. Violet dusk-600 whispers inside the darkest ribbons |
| **Brushwork** | Ribbon strokes 60–140 units long, laid in bands of 3–5 parallel strokes of neighbouring values. Ribbon crests near the finder get impasto ridges in nocturne-300. The headline area uses short horizontal hatches (10–25 units) of nearly equal value |
| **Texture** | Visible canvas tooth in the darkest areas; thick paint only on ribbon crests in the upper right |
| **Mood** | Calm, deep, intelligent, quietly expectant: the moment before something assembles |
| **Required empty zones** | **Headline** x 80–800, y 300–820 (low contrast, no stars, no crests). **QR** x 985–1615, y 185–815 (ribbons may pass through at ≤ 12% luminance contrast; no stars; no highlights). **Finder surround** within 250 units of (1102, 302): mid-dark, neutral, no painted glow |
| **Avoid** | Spiral vortices, concentric halos, crescent moon, star clusters, sparkle, meteor streaks, gradient banding, any warm colour, anything resembling a known painting |
| **Continuity** | Brush direction must lead into the finder, because the camera dives there next. Values must be dark enough that star-white modules (`#EAF0F7`) read clearly everywhere. The sky continues fully behind the horizon plate down to the canvas bottom |
| **Export** | `01-kerinti-night/sky.webp`, 3600 × 2250 (1.25×) from a 5760 × 3600 master, opaque, sRGB, WebP q82, ≤ 900 KB |

---

## BRIEF A-02 — Horizon (Distant Ridges and Settlement)

| | |
|---|---|
| **Subject** | Two low, overlapping dark ridges at night, with a distant flat settlement nestled between them showing a few warm lit windows: restaurants still awake |
| **Camera** | Same eye as A-01. The ridges are far away and read as silhouettes with a thin cool rim |
| **Composition** | Far ridge tops at y ≈ 840–870, near ridge at y ≈ 900–960. Gentle rolling rhythm with no peaks. **Under the QR (x 985–1615) the ridge top stays ≥ 830.** The settlement is a loose horizontal cluster between x 200 and 1700, never taller than 50 units, with flat roofs only. ≤ 12 window lights, distributed irregularly, none directly below the finder |
| **Lighting** | Rim light of mist-200 along the far ridge top. Window lights are small warm dabs (ochre-400, ember-500) with a tiny halo (≤ 10 units). The near ridge is almost black |
| **Palette** | Far ridge nocturne-800 with nocturne-700 hatches; near ridge nocturne-900; settlement nocturne-800/700; lights ochre-400 and ember-500 |
| **Brushwork** | Horizontal hatches 20–60 units long, following the ridge contour. Settlement blocks made of short square dabs. The top edge is a broken painted edge, not a clean cut-out |
| **Texture** | Low; the plate is mostly silhouette |
| **Mood** | Grounded, quiet, human presence far away |
| **Required empty zones** | Transparent above the ridge. Nothing rises above y 830 in x 80–800 (headline) or x 985–1615 (QR) |
| **Avoid** | Church spires, towers, cypress or flame-like verticals, rows of identical houses, bright city glow, reflections, roads |
| **Continuity** | Warm windows foreshadow Chapter 5's lit-window skyline, so keep them the same shape language (square dabs). The ridge must sit comfortably over the sky's horizon glow |
| **Export** | `01-kerinti-night/horizon.webp`, 3600 × 1000 (1.25×), alpha with edge-extended colour, WebP ≤ 250 KB |

---

## BRIEF P-01 — Window View (The Crossing Painting) ★ most important

| | |
|---|---|
| **Subject** | A warm, luminous morning seen through a restaurant window: bright sky bloom, soft cloud bands, a distant line of sage-blue hills, and a nearer band of terracotta and ochre rooftops among rounded trees |
| **Camera** | From inside a first-floor room, looking out slightly above the rooftops. Eye level ≈ design y 540. Mild atmospheric perspective. **The painting is also seen full-screen at 1.42× during the crossing, so it must stand alone as a finished landscape** |
| **Composition** | Distant hills line at y ≈ 520–600. Sky occupies the top ~55% of the crossing frame (x 178–1530, y 116–876). **Glimpse zone** x 840–1000, y 260–400: the brightest and warmest point, a cream-gold bloom of sky light with soft strokes radiating slightly. **Gold readability zone** x 700–1010, y 380–640: cooler mid-value daysky aqua into sage-blue hills. **Window zone** x 300–820, y 160–600: sky above, rooftop and tree tops in the lower third. Rooftops get denser toward the lower left and lower right, framing the centre |
| **Lighting** | The sun is off-frame upper left. Sky light blooms from the glimpse zone outward. Rooftops are lit from the upper left, with warm light planes and cool violet-grey shadows on the right faces. Morning haze softens the distant hills |
| **Palette** | Sky linen-50 and pale gold (bloom) → daysky-300 and a pale aqua mid-sky → sage-500 / sage-blue hills → terracotta-500 and ochre-400 roofs with linen-100 walls → sage-500 trees with ochre light edges. **No gold-400 in the gold readability zone** |
| **Brushwork** | Sky: ribbon strokes 60–120 units, soft and horizontal, with a gentle outward radiating rhythm around the bloom (a whisper of halo strokes, not rings). Clouds: layered hatches. Roofs: square dabs and short hatches. Trees: clustered dabs with flicks at the edges. Keep contrast low overall; the whole image is often seen behind moving elements |
| **Texture** | Light, airy paint with canvas tooth in the sky; thicker paint on sunlit roof planes only |
| **Mood** | Arrival. Relief and warmth after the night: "someone has opened the shutters" |
| **Required empty zones** | Gold readability zone (above). No hard shapes or high-contrast edges in the glimpse zone. No object crossing the exact centre of the window zone at (620, 400) |
| **Avoid** | A visible sun disc, lens flare, windows or glass reflections painted in, window frames or borders (the frame is code), people, text or signs, wheat fields, cypress, anything resembling a famous landscape; also dark accents near the centre |
| **Continuity** | Seen in this order: pinhole glimpse → unfolding square → full-screen crossing → framed window view. Every stage must be beautiful on its own. It must read as the **same morning** as the restaurant's sunbeam: warm light from the upper left |
| **Export** | `02-portal/window-view.webp`, 3000 × 2250 (1.25×) from a 4800 × 3600 master, opaque, WebP q82, ≤ 800 KB |

---

## BRIEF B-01 — Restaurant Wall (Architecture, Window, Kitchen Pass)

| | |
|---|---|
| **Subject** | The back wall of a small, warm neighbourhood restaurant in morning service: sunlit plaster, a window whose glass is a clean hole, a terracotta wainscot, a honey-wood floor, a short shelf of jars, a potted plant, and a low kitchen pass on the right with two cooks at work |
| **Camera** | Straight-on to the wall, eye level ≈ y 520. Floor planks converge to a vanishing point at (960, 520). Establishing frame = design frame (0,0)–(1920,1080) at 1× |
| **Composition** | Follow the map in `ARTWORK_COMPOSITIONS.md` §C.2 exactly. **Glass hole** x 440–800, y 220–580 (transparent). **Frame band** x 368–872, y 148–652: plain light plaster ≈ #F1E4C8 with very fine, low-contrast hatch (code places 24 Kerinti-blue dabs here), plus a 10–14 unit warm wood reveal just inside the glass. Sheer curtains x 300–368 and 872–940. Sill x 340–900, y 652–690. Plant x 120–340. Shelf x 930–1180, y 320–420. **Text zone x 1220–1840, y 170–570: plain wall.** Kitchen pass x 1420–2200, y 590–800 with a counter ledge at ≈ y 790. Wainscot y 700–840. Floor from y 840 |
| **Lighting** | Morning sun through the glass, down-right at ~32°. A soft trapezoid of sun lies on the wall right of the window and fades before x 1200. The wall is in gentle warm ambient light. The text zone is evenly lit with a very soft falloff to the upper right. The kitchen interior is darker, lit by a warm tungsten heat lamp with small halo strokes. Floor highlights run along the beam's path. Soft violet-brown shadows |
| **Palette** | Plaster linen-100 → linen-50 in the sun, with ochre-400 warmth and faint sage and violet in the shadows. Wainscot terracotta-500 with darker panel inlays. Floor ochre-400 → deep honey brown. Kitchen interior warm umber with ember-500 heat light. Cooks' whites linen-50 with umber shadows. Jars in small terracotta, sage, ochre and daysky dabs |
| **Brushwork** | Plaster: diagonal hatches 15–35 units in 2–3 values. Frame band and text zone: finer, closer-valued hatches (≤ 15 units). Floor: strokes following plank perspective. Wainscot: horizontal hatches. Kitchen: vertical strokes with flicks for steam. Cooks: 6–12 confident gestural strokes each, with no facial features. **Window surround (x 300–950, y 100–720): use bold, simple strokes**, because this region is first seen at 5× magnification |
| **Texture** | Canvas tooth on the plaster; impasto on the sill edge, lit floor strips and the heat-lamp rim |
| **Mood** | Welcoming, bright, human, orderly: "service has started and everything flows" |
| **Required empty zones** | Glass hole (alpha 0, exact). Frame band (plain). Text zone x 1220–1840, y 170–570 (no objects, lamps, cords or strong strokes). Beam path x 600–920, y 380–660 (keep calm: no dark accents) |
| **Avoid** | Painted window frame bars or mullions, text or menus on walls, signage, logos, clocks, busy wallpaper, faces, identical repeated objects, café-terrace-at-night references, pendant lamps (they belong to B-02) |
| **Continuity** | The glass must feel like *the* square from the night. A believable window with a tiled blue frame supplied by code. The sunlight here must match P-01 and B-03. The floor perspective must work with the mid tables and hero table (B-02, B-04) |
| **Export** | `03-nexa-morning/room-wall.webp`, 3250 × 1875 (1.25×) from 5200 × 3000, alpha only in the glass hole (hard-edged, exact), WebP ≤ 1.0 MB |

---

## BRIEF B-02 — Restaurant Midground (Café Tables, Guests, Pendant Lamp)

| | |
|---|---|
| **Subject** | Two small café tables with chairs, two seated guests in quiet conversation, and one pendant lamp hanging from above |
| **Camera** | Same as B-01. Objects are nearer than the wall, so they are slightly larger and higher-contrast |
| **Composition** | Left café table with two guests: x 40–560, y 700–1000; guests seen from behind or in three-quarter back view. Small empty table and chair: x 640–1000, y 800–960, catching sunlight on its top. Pendant lamp: cord from the canvas top down to a shade centred at x ≈ 1080, y 140–230 (a second lamp at x ≈ 250 is allowed). **Nothing in x 1220–1840, y 170–570. Nothing in the beam path x 600–920, y 380–660.** Everything else transparent |
| **Lighting** | Guests rim-lit by window light from the left. The small table top catches the beam. The lamp is lit warm from inside (ochre inner glow, halo strokes ≤ 30 units), but it is day, so the glow is subtle |
| **Palette** | Wood in warm umber and honey; guests in muted sage, daysky and terracotta clothing with linen highlights; lamp shade sage-500 with an ochre interior |
| **Brushwork** | Gestural figures from a few long strokes, with soft flicks where hair and edges meet light. Furniture with vertical hatches on legs and horizontal ones on tops. Soft contact shadows under legs, with **no crisp contact lines**, because parallax against the floor slides them slightly |
| **Texture** | Moderate; impasto on sunlit table edges only |
| **Mood** | Lived-in, calm, human |
| **Required empty zones** | Text zone, beam path, window band x 368–872, y 148–652 |
| **Avoid** | Faces, phones or screens, food detail, readable objects, dense crowds, clutter near the table card |
| **Continuity** | This layer passes the camera during the pull-back (up to 6.5×, fading above 3.8×). **Every edge must be soft-painted** so nothing looks cut out. Colours must sit between B-01 and B-04 in depth: slightly more contrast than the wall, less than the hero table |
| **Export** | `03-nexa-morning/room-mid.webp`, 3250 × 1875, alpha with edge-extended colour, WebP ≤ 350 KB |

---

## BRIEF B-03 — Sunbeam

| | |
|---|---|
| **Subject** | A soft volume of morning light travelling from the window glass down to the hero table |
| **Composition** | The wedge starts across the full glass (x 440–800, y 220–580), widens and fades as it travels down-right at ~32°, and ends softly around the table card (x 1100–1600, y 650–1000). It must not reach the text zone |
| **Lighting / palette** | #FFE6B0 core fading to transparent; slightly more saturated ochre at the far end |
| **Brushwork** | 6–12 very long, faint ribbon strokes along the beam direction inside the volume; all edges feathered with flicks; **zero hard edges** |
| **Mood** | Gentle, golden, directional |
| **Avoid** | Visible geometric polygon edges, god-ray lines, dust painted in (dust is code) |
| **Continuity** | Composited in `screen` mode at 42%, so paint it at full strength: opacity is controlled by config |
| **Export** | `03-nexa-morning/light-beam.webp`, **1300 × 750 (0.5×)**, alpha, WebP ≤ 120 KB |

---

## BRIEF B-04 — Hero Table and Table Card

| | |
|---|---|
| **Subject** | The nearest table: round, dressed in cream linen, bathed in the beam. A folded table card stands on it, with a small cup and a tiny vase of flowers beside it |
| **Camera** | Same as B-01, nearest plane. Seen slightly from above, so the tabletop is an ellipse |
| **Composition** | Cloth ellipse centre ≈ (1330, 800), radii ≈ 460 × 100, apron down to y ≈ 910, legs running off the bottom edge. **Card face x 1180–1310, y 650–780**: an upright folded card with a thin visible side fold on the left and a soft shadow falling right onto the cloth. The **face is blank**, flat, evenly lit linen-50, with at most very faint paper texture and no perspective beyond 3 units of skew. Cup x ≈ 1420–1500, vase x ≈ 1540–1600, both below y 700–810. **Remove the placeholder's chair back.** Nothing in x 1260–1810, y 220–550 |
| **Lighting** | Direct beam light from the upper left. The card face and the left half of the cloth are the brightest surfaces in the lower half of the frame. Soft violet-brown shadows under the vase and cup. Warm bounce light on the apron |
| **Palette** | Cloth linen-50 / linen-100 with ochre warmth and faint violet shadow folds; card linen-50; cup linen with a terracotta saucer; vase daysky blue; flowers ember, ochre and sage dabs |
| **Brushwork** | Cloth in long soft strokes following the drape, impasto on the lit rim. Card edges crisp but painted, not vector. Flowers as dabs. Legs with vertical hatches. **All outer edges soft-painted**: this layer rushes past the camera at up to 7× |
| **Texture** | Visible linen weave in the cloth highlights only; the card face stays smooth |
| **Mood** | Inviting, focused: "this is where it happens" |
| **Required empty zones** | Card face (blank). Text-zone footprint x 1260–1810, y 220–550. No objects between the card and the beam source |
| **Avoid** | Printed content on the card, menus, cutlery clutter, plates of food, phones, hands, shadows falling across the card face, strong texture on the face |
| **Continuity** | The code-drawn QR (Kerinti-blue modules with a gold top-left finder) lands exactly on x 1193–1298, y 664–769. It must read clearly at ≈ 127 design px at the final hold. The card is the visual end of the beam and dust path |
| **Export** | `03-nexa-morning/table-near.webp`, 3250 × 1875, alpha with edge-extended colour, WebP ≤ 450 KB |

---

## BRIEF S-01 — Brush Dab Atlas

| | |
|---|---|
| **Subject** | 8 individual square impasto dabs: the atoms of the QR motif |
| **Composition** | 8 cells of 512 × 512 in one row (4096 × 512). Each dab body ≈ 384 × 384, centred, rotated no more than ±3°, with slightly ragged edges and softly rounded corners |
| **Brushwork** | Each dab = one loaded square brush pressed and dragged: 3–6 parallel bristle tracks in one dominant direction (4 horizontal, 4 vertical), one lighter impasto ridge near one edge, slight paint thinning at one end. Variety across the 8, but the same brush |
| **Values** | **Greyscale only**, 170–255 inside the dab (texture = value variation). Code multiplies a tint over it, so no pure black and no colour |
| **Transparency** | Transparent outside the dab body; soft 1–2 px anti-aliased edge; no halo |
| **Avoid** | Round blobs, perfect squares, noise textures, drop shadows, visible letters or marks |
| **Continuity** | Used at every size from 3 to ~500 units and stretched up to 40:1 as speed flicks, so it must read as paint at every scale. The table QR must still scan as a grid, so bodies need to fill ≥ 85% of their square |
| **Export** | `00-shared/dabs.png`, PNG-24 with alpha, 4096 × 512, ≤ 600 KB (the cell size is read automatically; see Contract §2 and §6) |

---

## BRIEF S-02 — Canvas Grain

| | |
|---|---|
| **Subject** | Fine linen canvas weave with slight irregular tooth |
| **Spec** | 512 × 512 **seamlessly tileable**, neutral mid-grey (average ≈ 128), variation ± 25, no directional brush marks, no visible repeat at 1× |
| **Use** | Full-screen `soft-light` overlay at 13% over every layer except text |
| **Export** | `00-shared/grain.png`, grayscale PNG, ≤ 200 KB |

---

## Review gates for every brief

1. **Thumbnail gate** (3 options per major illustration, at 480 px wide). Checks: composition against safe zones and fixed rectangles, originality gate, energy direction.
2. **Colour key gate**. Checks: palette tokens and value structure. For P-01, the gold modules must be tested on top of the colour key.
3. **In-engine gate**. Install the draft export in `public/prototype-assets/` and review the test frames listed in `ARTWORK_REPLACEMENT_CONTRACT.md` §7 before final painting detail begins.
4. **Final gate**. Full contract checklist.
