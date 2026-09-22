# Opening — Customization Guide

What to replace when carrying Pattern A into a new project, and what must stay as it is.

---

## REPLACE

### Brand and identity

| Item | Where it lives (reference) | Notes |
|---|---|---|
| Brand name, product name | copy blocks, `lib/site/site.json` | |
| Logo / mark | the finder motif itself | See "Choosing a motif" below |
| Palette | `COLORS` in the module field; plate artwork | Keep the warm/cool opposition |
| Typography | `app/layout.tsx` fonts, `.display` / `.eyebrow` | |
| Copy | the three text blocks | Keep them short; see `shared/TEXT_TIMING_SKILL.md` |

### Worlds and artwork

| Item | Notes |
|---|---|
| Source world (World A) | Any abstract brand space. Needs: depth (at least two plates at different depths), one quiet region for copy, and a place for the motif to assemble |
| Destination world (World B) | Any concrete place where the product lives. Needs: a **window or opening** whose geometry can be the portal's other side, a directional light, and a near surface at negative depth |
| The plate set | Replace files, keep `PLATES[]` structure: `{ id, world, src, x, y, w, h, depth, blend, opacity }` |
| Grain / texture overlay | Optional but strongly recommended; ties raster plates and canvas dabs together |

### Geometry constants

| Constant | What to reconsider |
|---|---|
| `DESIGN` | 1920×1080 is a good default. Change only with a reason |
| `QR_A` | grid origin, cell size and module count for your motif |
| `PORTAL.A` | **derive it** from your motif's geometry, never place it independently |
| `PORTAL.B` | the destination's window: centre and side length at rest |
| `GLASS_B` | window rectangle; the frame cell should be one module wide |
| `TENT_B` | the focal object, its code placement, and its **negative** depth |
| `PEAK_SIZE` | large enough that the portal square covers your widest supported ratio |
| `TEXT_FRAME` / `TEXT_BOXES` | recompute from the aspect ratios you support |

### Module colours

```ts
const COLORS = {
  star:  '#eaf0f7',   // the field at rest in the source world
  mist:  '#9cc7e0',   // a minority tint, ~20% of stars
  gold:  '#e8c66a',   // THE SUBJECT — must be unique in the frame
  cream: '#fff1cf',   // the field in the destination world, before landing
  ink:   '#1f3263',   // the field after landing (reads as printed)
};
```

The only constraint: the subject colour must appear nowhere else.

### Choosing a motif

The opening code can be any geometry with:

1. a **recognisable silhouette** at a glance,
2. a **sub-feature that can plausibly be entered** (a square, an aperture, a counter-form),
3. a **countable distinguished subset** (9 is ideal) that can travel and land,
4. a **counterpart in the destination world** for the sub-feature's frame.

Codes work naturally. So do: a grid monogram whose counter becomes a doorway; an icon with a solid
core; a modular logotype. A wordmark usually does not — it has no enterable feature.

### CTA / destination semantics

The opening's landing object should be the thing the product *is about*, not a call to action. Save
the call to action for the closing (see `closing/`). If the opening lands on "contact us", the film
has nowhere to go.

---

## KEEP UNCHANGED

These are mechanics, not style. Changing them breaks the pattern.

### Structural

- Fixed stage + empty scroll track + one paused master timeline.
- Numbers-only state; rendering as a pure function of it.
- Two clocks: scroll for story, wall clock for ambience.
- Design-space cover mapping for artwork, canvas and text alike.

### Camera

- The camera **is** the portal square (`px`, `py`, `logS`); both worlds described the same way.
- Always interpolate `log(size)`.
- Align to frame centre before the final push.
- The arrival pull-back is roughly as long as the push.
- One continuous gesture from the first frame to the threshold.

### Portal

- Seven steps, in order: source → approach → align → fill → destination visible → cross → settle.
- The world switch is instant, and only under full cover, verified by a predicate.
- The source world keeps a **hole** in it; the destination is never faded in.
- The aperture edge is irregular, never a clean rectangle.
- The portal object has a counterpart on the other side.

### Module field

- Persistent identity; roles fixed at construction.
- A distinguished subset that the camera carries through.
- Seeded determinism, separate seed per act.
- Finder-first assembly order; centre-out landing order.
- Ambience damped to zero as a formation completes.
- Near-fade for modules passing the lens.

### Timing

- Copy only on a settled frame; no copy during the crossing.
- Every beat ends with slack.
- An explicit, budgeted hold at the end of the act.
- The approach : crossing : arrival ratio near 2 : 1 : 2.

---

## A MINIMAL PORTING CHECKLIST

```text
[ ] Design space chosen; cover mapping implemented and verified at 4:3, 16:9, 21:9
[ ] Motif geometry defined; PORTAL.A derived from it
[ ] Destination window defined; PORTAL.B set; the ring's counterpart identified
[ ] Plates authored at their natural pixel size, with overscan beyond the widest shot
[ ] Dab atlas authored (N square cells, grey on transparency)
[ ] Module roles assigned; subset colour is unique
[ ] Assembly staggered finder-first; ambience damped by progress
[ ] Aperture path irregular; hole punched in the source world
[ ] Destination plate renders through the hole before cover
[ ] Cover predicate verified at the switch time, at every supported ratio
[ ] Arrival pull-back present and long enough
[ ] Focal object at negative depth, with a large cell-size ratio vs the opening motif
[ ] Terminal hold budgeted as an explicit empty tween
[ ] Copy: three blocks maximum, none during the crossing
[ ] Reverse-scroll comparison pass (shared/REVERSE_SCROLL_SAFETY.md)
[ ] Fast-scroll settle-landing pass (shared/FAST_SCROLL_READABILITY.md)
[ ] prefers-reduced-motion: exact scrub
```
