# ART DIRECTION — Kerinti Soft Homepage

> Phase 1 planning document. Companion files: `STORYBOARD.md`, `TECHNICAL_PLAN.md`, `COPY_DRAFT.md`.
> Status: **draft for approval**.

---

## 1. The Idea Behind the Style

> **"Operations, painted."**

Restaurant software usually looks like dashboards. Kerinti's homepage should look like **a painting of a living restaurant day**, where the software is part of the scene.

The visual concept rests on three linked ideas:

1. **A QR code is made of brushstrokes.** Every QR module is a square impasto dab of paint. The motif and the art style are one thing, not two layers stacked on each other.
2. **Brushstrokes show flow.** In post-impressionist painting, stroke direction carries energy. Here, stroke direction always follows *operational flow*: toward the portal, along the order's path, and upward into the report. The painting's movement *is* the product's movement.
3. **Light shows time.** A single service day, from night to morning to sunset to night, gives the page an emotional arc and a natural progression of color.

---

## 2. Visual Style Description

### 2.1 Overall character
- **Painterly, not illustrative-flat.** Visible, directional strokes; thick paint in focal areas; thinner paint and visible canvas in quiet areas.
- **Slightly surreal, not fantastical.** Real spaces (a sky, a restaurant, a kitchen, a storeroom) are handled with dreamlike freedom: the sky is alive with strokes, light pours like liquid, and paper tickets float. There are no dragons, floating islands, or cartoon mascots.
- **Premium restraint.** Each frame has **one** area of high painterly energy and plenty of calm, soft surface. Energy lives in skies and light, while UI and text areas stay quiet.
- **Cinematic framing.** Compositions use depth (foreground, midground, background), rule-of-thirds placement, and camera-like crops.

### 2.2 World A — Kerinti ("Nocturne")
- Deep night blues with swirling but *ordered* sky strokes: long, flowing ribbons plus small spirals around light sources.
- Light sources: star-dabs, the QR glow, and later lit windows.
- Mood: calm, intelligent, mysterious, confident.
- Texture: heavy impasto in the sky, smooth darkness near the horizon.

### 2.3 World B — NeXa ("Daylight Service")
- Warm cream, ochre, terracotta, and sage, with sky-blue light through windows.
- Strokes: shorter and more lively; dappled light on surfaces; visible canvas in highlights.
- Mood: welcoming, human, busy but orderly.
- Texture: lighter paint, more air, crisp painted edges on "interface" objects.

### 2.4 The bridge between worlds
- **Gold** is shared by both worlds (starlight in A, sunlight in B) and marks the story's focal object.
- **Module dabs** look the same in both worlds. Only their lighting changes.
- **Stroke language** is the same system in both worlds, at a different tempo (A: long and slow; B: short and lively).

---

## 3. Color Palette Direction

> These are proposals. If Kerinti has existing brand colors, the World A palette should be tuned toward them (see Open Question 1 in `STORYBOARD.md`).

### 3.1 World A — Nocturne

| Token | Hex | Use |
|---|---|---|
| `nocturne-900` | `#070F24` | Deepest sky, page background fallback |
| `nocturne-800` | `#0B1B3F` | Main sky body |
| `nocturne-700` | `#13294B` | Secondary sky ribbons |
| `nocturne-500` | `#2A4B9B` | Cobalt stroke highlights |
| `nocturne-300` | `#6F93C9` | Cool mid-highlights |
| `mist-200` | `#9CC7E0` | Pale cyan star halos, rim light |
| `starlight-100` | `#EAF0F7` | Text on dark, QR modules (resting) |

### 3.2 World B — Daylight Service

| Token | Hex | Use |
|---|---|---|
| `linen-50` | `#FBF6EC` | Brightest canvas highlights |
| `linen-100` | `#F4EAD5` | Walls, UI glaze panels |
| `ochre-400` | `#E3A83B` | Warm light, wooden surfaces |
| `terracotta-500` | `#C8643B` | Accents, tiles, warmth |
| `sage-500` | `#8A9A5B` | Plants, "done" status |
| `daysky-300` | `#7FB3D5` | Window light, cool balance |
| `ink-900` | `#1E2430` | Text on light, painted outlines |

### 3.3 Shared

| Token | Hex | Use |
|---|---|---|
| `gold-400` | `#E8C66A` | **The focal accent.** One "thing to follow" per frame |
| `gold-600` | `#C99A2E` | Gold shadow side, pressed states |
| `ember-500` | `#E0784A` | Sunset transition, cooling embers |
| `dusk-600` | `#5B3F7A` | Sunset violet between worlds |

### 3.4 Time-of-day grading (Ch4)
A color-grade layer shifts the whole World B scene through four key points. All stages share the same underlying painting, and only the grade changes:

| Stage | Temperature | Shadows | Highlights |
|---|---|---|---|
| Morning (4.1–4.2) | Neutral-cool | `#3E4A5C` | `#FBF6EC` |
| Midday (4.3–4.4) | Neutral-warm | `#4A3F36` | `#FFF1CF` |
| Late afternoon (4.5–4.6) | Warm | `#4F3528` | `#F6C77A` |
| Sunset (4.7) | Hot → violet | `#3A2748` | `#F19A63` |

### 3.5 Color rules
- **One gold element per frame.** If two things are gold, one of them is wrong.
- **UI and text zones** use the quietest color in the frame: `linen-100` glaze in World B, `nocturne-900` glaze in World A.
- **Contrast.** All body text meets WCAG AA (4.5:1) against its *actual* painted background. That is why text sits on glaze zones built into the painting.
- **No neon.** Glows are painted halos (soft, textured), never digital bloom with pure saturated color.

---

## 4. Typography Direction

### 4.1 Pairing concept
A **characterful editorial serif** for story headlines (the "painting's title card") with a **precise, modern grotesk** for UI, body, and product labels (the "software").

### 4.2 Proposed typefaces (all free/open-license, all support Turkish characters: ç ğ ı İ ö ş ü)

| Role | Primary proposal | Alternative | Why |
|---|---|---|---|
| Display / headlines | **Fraunces** (variable; opsz, SOFT, WONK axes) | Instrument Serif | Soft, slightly quirky serif. Its optical-size and "softness" axes can be tuned toward a brushed, humane feel. Artistic without being decorative. |
| Body / UI | **Inter Tight** | Geist | Neutral, highly legible, compact. Reads as "software." |
| Numeric / data labels (Ch4) | **JetBrains Mono** or Inter Tight tabular figures | IBM Plex Mono | Adds the "system" voice to tickets, KDS, and ledgers. Use sparingly. |

> If Kerinti has a brand typeface, it replaces the body/UI role. The display serif can stay as the storytelling voice.

### 4.3 Scale (desktop → mobile)

| Style | Desktop | Mobile | Font / weight | Tracking |
|---|---|---|---|---|
| `display-xl` (H1) | 72–88px | 40–46px | Fraunces 400, opsz 144, SOFT 50 | -1.5% |
| `display-l` (chapter H2) | 56px | 34px | Fraunces 400 | -1% |
| `title` | 28px | 22px | Fraunces 500 | -0.5% |
| `eyebrow` | 13px | 12px | Inter Tight 600, uppercase | +8% |
| `body-l` | 20px | 18px | Inter Tight 400, line-height 1.5 | 0 |
| `body` | 17px | 16px | Inter Tight 400, line-height 1.6 | 0 |
| `ui-label` | 14px | 13px | Inter Tight 500 | +1% |

Use `clamp()` fluid sizing between breakpoints. Turkish copy runs ~15–25% longer than English, so headline containers need room.

### 4.4 Typographic motion
- Headline reveals use a **brush-mask wipe**: a textured stroke-shaped mask sweeps across the words along the scene's stroke direction. No bouncing letters and no per-character spin.
- Text is always real, selectable DOM text. It is never baked into images or canvas.
- At most one headline and one supporting line on screen during pinned scenes.

---

## 5. Painterly / Van Gogh-Inspired Adaptation Rules

### 5.1 What we take from post-impressionism (principles only)
1. **Directional, rhythmic brushwork**: strokes follow form and energy.
2. **Impasto texture**: thick, visible paint in focal areas.
3. **Expressive color** over literal color: skies can be cobalt with gold halos, and shadows can be violet.
4. **Halos and concentric strokes** around light sources.
5. **Broken color**: adjacent strokes of related hues instead of flat fills.
6. **Emotional atmosphere**: the environment itself feels alive.

### 5.2 Stroke vocabulary (our system)
Define a small, consistent set of stroke types so every painted asset feels like the same hand:

| Stroke | Shape | Where |
|---|---|---|
| **Ribbon** | Long, curving, parallel bands | Skies, flow paths |
| **Halo** | Short strokes in concentric rings | Around light sources, QR glow, gold focal object |
| **Dab** | Square-ish impasto mark | **QR modules**, star points, windows, bars |
| **Hatch** | Short parallel strokes, tight rhythm | Walls, floors, wood, fabric |
| **Flick** | Quick tapering mark | Speed and motion (portal passage, ticket travel) |

### 5.3 Rules for applying the style
- **Energy follows story.** High-energy strokes (ribbons, halos, flicks) appear only where the viewer's attention should go.
- **Quiet zones are mandatory.** Every composition reserves ~30–40% of its area as low-texture glaze for text and UI.
- **Interfaces are painted, but legible.** Menu, ticket, KDS, POS, ledger, and chart are painted objects with clean hierarchy: brush texture on surfaces and edges, crisp typography on top (DOM or high-resolution texture).
- **People are gestural.** Hands, silhouettes, and figures in motion; no detailed faces. That keeps the style universal and avoids stock-illustration tropes.
- **Texture is a layer, not noise.** Canvas grain and impasto normal/height hints are subtle overlays (≤8% opacity) and never compete with content.

---

## 6. How to Stay Original (Not Derivative)

Van Gogh's works are in the public domain, but the brief asks for an **original** Kerinti experience, and the reference websites (pear.no, Shopify Editions) are protected designs. These rules keep the work clearly ours.

### 6.1 Relative to Van Gogh
**Do not:**
- Reproduce or closely paraphrase any recognizable composition: no swirling night sky over a village with a church spire, no cypress tree in the foreground, no sunflower vases, no café terrace at night with yellow awning, no wheatfields with crows, no bedroom interior.
- Use his signature color combinations *as a set* (e.g., the specific ultramarine + chrome yellow + cypress green triad of one painting).
- Imitate his signature or reference him in on-page copy.

**Do:**
- Take the *principles* (§5.1) and apply them to **our subject matter**: QR modules, restaurants, kitchens, tickets, data.
- Use **our stroke vocabulary** (§5.2), which is built around the square dab. Square dabs are not a Van Gogh signature, so this becomes Kerinti's own mark.
- Base skies on **our flow logic** (strokes point toward the story's next destination), not on reference paintings.

### 6.2 Relative to pear.no and Shopify Editions
**Do not:**
- Use a single fruit/object mascot that moves through scenes (our motif is a *system of modules* that re-forms, not a single object).
- Recreate their scene order, camera moves, illustration style, backgrounds, color schemes, or typography.
- Reuse their layout grid, their nav patterns, or their section structure.

**Do:**
- Borrow only *techniques*: pinned scenes, scrubbed timelines, object continuity, masked world transitions.
- Keep our own structural devices: finder-square portals, time-of-day arc, one-order protagonist, brushstroke flow-lines.

### 6.3 Originality review gate
Before any illustration is approved, answer:
1. Could someone name a specific painting or website this frame came from? → If yes, redesign.
2. Does the frame contain at least one Kerinti-specific device (square dabs, finder shapes, flow-line, gold focal object)? → If no, strengthen it.
3. Would the frame still make sense for *another* company? → If yes, it's too generic.

---

## 7. Illustration Principles & Production

### 7.1 Principles
1. **Layered for motion.** Every scene is painted as separate depth layers (sky / far / mid / near / FX) with generous bleed for camera moves.
2. **One continuous world.** The Ch3–Ch4 restaurant is designed as **one connected cross-section** (dining room → pass → kitchen → counter → storeroom → office → rooftop), so the camera path is physically plausible.
3. **Same hand.** All plates use the same stroke vocabulary, canvas texture, and palette tokens.
4. **Grade-ready.** World B plates are painted in neutral, mid-day light so the time-of-day grade (§3.4) can move them to morning or sunset.
5. **Designed quiet zones.** Text zones are planned into the composition before painting starts.

### 7.2 Production options (decision needed)

| Option | Quality / originality | Speed | Risks |
|---|---|---|---|
| **A. Commissioned illustrator** (digital painting) | Highest, fully owned | Slowest (weeks) | Cost; needs tight briefing with this document |
| **B. AI-assisted concepts + human overpaint** | High if overpainted thoroughly | Medium | Licensing and terms of the tool used; style drift; must pass the §6.3 gate; final assets must be substantially human-painted |
| **C. Procedural/shader-painted** (code-generated strokes) | Good for skies and abstract layers, weak for interiors | Fast for skies | Can look "generative-art generic" if overused |

**Recommendation:** Use **C for skies and atmospheric layers** (they need to be animated anyway) and **A (or a carefully managed B) for interiors and objects**. For the **Phase 2 prototype**, use procedural skies plus simplified placeholder interior plates to validate motion and motif before committing art budget.

### 7.3 Asset style specs
- Canvas texture: one shared tileable linen/canvas scan, 1024×1024, used everywhere.
- Brush dab atlas: 12–16 square dab variations (256×256 each), grayscale with alpha, tinted at runtime.
- Plates: painted at 2× final display size, exported per layer with alpha.
- Stroke direction maps (for animated skies): low-resolution vector fields painted by hand to control flow direction per scene.

---

## 8. Motion Aesthetics (visual side)

- **Weight, not bounce.** Objects move like they have mass, with slow starts and gentle landings. No elastic or bounce easings.
- **Paint-like transitions.** Reveals happen through brush-shaped masks, smears, and dab assembly. They never use geometric wipes or glitch effects.
- **Calm idle.** When scrolling stops, the world breathes subtly (sky drift, light shimmer, module twinkle) at very low amplitude. It never loops noticeably.
- **Speed lines are strokes.** Fast motion is shown with painted flicks, not motion blur.

---

## 9. Anti-Patterns (visual)

- ❌ Flat vector illustration with a "painterly" filter on top
- ❌ Isometric SaaS illustrations, 3D blobs, glassmorphism cards
- ❌ Stock photo people or detailed cartoon faces
- ❌ Realistic QR codes as flat black-and-white images (except the functional final QR, which is still rendered in painted modules)
- ❌ Multiple competing gold/accent elements in one frame
- ❌ Heavy texture behind body text
- ❌ Recognizable Van Gogh compositions or motifs (§6.1)
