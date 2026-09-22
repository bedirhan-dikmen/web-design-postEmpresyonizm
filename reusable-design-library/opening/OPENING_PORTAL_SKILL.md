# Portal Skill — Crossing a Threshold

The most important file in this archive. A portal is what makes a scroll sequence feel like entering
a world rather than changing a background.

---

## 1. PURPOSE

Move the reader from one world (or one level of the story) to another, continuously, through a real
object that exists in the first world.

## 2. VISUAL RESULT

A square object in the scene — the lit aperture of a code's finder pattern, a window, a status tile —
is approached by the camera. Warm light and the next place become visible inside it. It grows past
the edges of the viewport. When it has covered the screen completely, the world behind it is
replaced. The camera then pulls back and the object is revealed to be a feature of the new world
(the aperture the camera flew through is the window it is now looking at from inside).

## 3. REQUIRED INGREDIENTS

- The camera model from `shared/CAMERA_GRAMMAR.md` — one square, described the same way in both
  worlds.
- Both worlds fully loaded and decoded *before* the approach starts.
- A "covers the viewport" predicate.
- An irregular/brushy aperture path, not a rectangle.
- A warm glow sprite and a short flare.

## 4. THE SEVEN STEPS

```text
SOURCE            the object sits in the scene, at rest, doing its normal job
  ↓ hold
APPROACH          the camera moves toward it; nothing else changes
  ↓
ALIGN             the object's centre reaches the centre of the frame — BEFORE the final push
  ↓
FILL FRAME        it grows until its edges pass every viewport edge
  ↓ (destination visible inside throughout)
DESTINATION VISIBLE  the next place renders inside the aperture, at the right camera
  ↓
CROSS THRESHOLD   under full cover, the world is switched / the camera is cut
  ↓
ARRIVE            the world beyond is now the whole frame
  ↓
PULL BACK / SETTLE the camera eases back; the object is re-read as part of the new world
```

Steps are not optional and their order is not negotiable. Every failure mode below is a violation of
one of them.

## 5. SCENE / DOM STRUCTURE

Two arrangements, depending on whether you are switching worlds or changing level inside one world.

### A — World switch (the opening)

```text
<stage>
  <plates world="view">     the destination's backdrop, in destination space, at large depth
  <worldB>                  destination world               display: none until crossed
  <worldA>                  source world                    clip-path: a hole at the aperture
    <glow>                  warm light behind the aperture
  <canvas>                  module field, drawn over both
  <flare>                   screen-blend bloom at the threshold
```

The "view" plate is the key piece: it lives in destination space but is rendered **outside** the
World A container, so the hole punched in World A reveals it. Nothing is layered or faded — the
source world literally has a hole in it.

```ts
const hole = APERTURE.map(([u, v], i) =>
  `${i ? 'L' : 'M'}${cx + u * hs} ${cy + v * hs}`).join(' ');
worldA.style.clipPath = hs > 0.5
  ? `path(evenodd, "M0 0H${vw}V${vh}H0Z ${hole}Z")`
  : 'none';
```

`APERTURE` is a seeded, slightly irregular polygon (points pushed outward by up to 7%) so the edge
hides under the painted module texture.

### B — In-world level change (a mid-film portal)

```text
<portalClip>                clip-path: inset(...) shaped to the object's projected rectangle
  <portalStage>             the destination's own 3D orientation matrix
    <innerPlates>           the destination rendered by a SECOND camera
    <innerWorld>            the same world component, second instance
  <portalHaze>              a little of the place being left, glowing at the rim
<portalRim>                 the object's own frame — border/box-shadow, not a UI chrome
```

The destination is rendered by an independent camera that drifts from "first glimpse" to "arrival"
as the portal opens. The main camera is cut to the arrival shot only under full cover.

## 6. STATE VARIABLES

| Channel | Meaning |
|---|---|
| `px, py, logS` | the camera (the portal square on screen) |
| `world` | 0 = source, 1 = destination — switched **only** under full cover |
| `aperture` | 0…1, how open the object is (light leaking → full square) |
| `glow` | warm light behind the aperture |
| `flicks` | painted speed streaks during the passage |
| `flare` | the threshold bloom |
| `goldCarry` | the carried subset: 0 = part of the source formation, 1 = held by the camera |

For in-world portals, one channel per portal (`gMgmt: 0…1`) plus constants:

```ts
const CUT      = 0.93;  // portal progress at which the camera behind is cut
const PHYSICAL = 0.55;  // up to here the window is exactly the object
const COVER    = 0.86;  // from here it covers the whole viewport
```

## 7. TIMELINE STAGES

Proportions of the crossing beat:

| Phase | Share | What moves |
|---|---|---|
| source hold | 0–10% | nothing; the object is simply there |
| approach + align | 10–40% | centre → frame centre; zoom begins |
| carry detaches | 15–40% | `goldCarry → 1` |
| push to cover | 40–85% | `logS` on `power2.inOut`; flicks fade in |
| flare | 80–90% | up on `power2.in` |
| **switch** | ~88% | `set(world: 1)` — instant, under full cover |
| flare down, flicks out | 88–100% | `power1.out` |
| pull back | next beat, 0–75% | `logS`, centre → destination rest, `power2.inOut` |

Note that the flare peaks *before* the switch and decays *after* it, straddling the moment. That is
what makes the instant change unnoticeable.

## 8. CAMERA BEHAVIOUR

- **Align before you accelerate.** Move the square's centre to the frame centre during the first
  third of the approach. A push that is still correcting sideways at 60× zoom reads as a lurch.
- **Interpolate log zoom.** See `shared/CAMERA_GRAMMAR.md`.
- **One continuous gesture.** The lean that begins in the first beat of the act is the same gesture
  that becomes the push. Do not stop and restart the camera before a threshold.
- **The pull-back is part of the portal.** Budget roughly as much scroll for arriving as for
  crossing.

## 9. EASING / PACING PRINCIPLES

| Element | Ease | Why |
|---|---|---|
| approach centring | `power2.inOut` | settles the aim before the push |
| the push | `power2.inOut` | accelerates into the threshold, decelerates as it fills |
| an in-world approach that must feel like commitment | `t²` | the object comes *up to the lens* |
| glow rise | `sine.in` | light grows, it does not switch on |
| flare up / down | `power2.in` / `power1.out` | fast bloom, slow decay |
| aperture open | `power1.inOut` | |
| arrival pull-back | `power2.inOut` | lands, does not bounce |

## 10. SOURCE → TRANSITION → DESTINATION LOGIC

```text
SOURCE        the object is a normal part of the scene and has been for a while
TRANSITION    the object is the only thing changing
DESTINATION   the object is re-read as a normal part of the new scene
```

The last line is what makes a portal meaningful rather than decorative. The aperture flown through
becomes the window being looked at. The ring of modules that framed it becomes the window's frame.
The reader can reconstruct the geometry, so they trust the space.

If your portal object has no counterpart in the destination, either give it one or use camera travel
instead.

## 11. REVERSE-SCROLL REQUIREMENTS

- The world switch is a `set()` on a numeric channel, read as `world >= 0.5`. Scrubbing backwards
  through the switch point restores the source world on exactly the same frame.
- The aperture path is recomputed from `logS`, `px`, `py` and `aperture` every frame. Nothing about
  the hole is remembered.
- The carried subset's positions are `lerp(formationPosition, carriedPosition, ease(goldCarry))` —
  reversible by construction.
- For in-world portals: when no portal channel is strictly between 0 and 1, run a **full clear** of
  the portal layer (hide the clip, hide the rim, reset transforms). Otherwise a reverse scroll past
  the portal leaves its rim on screen.
- Both world containers must be toggled by `display`, driven purely by `world` and `covers`. Do not
  fade them.

```ts
const showA = (inB || covers) ? 'none' : 'block';
const showB = (inB && !covers) ? 'block' : 'none';
```

Note that **both** are hidden while the portal covers the screen — the portal's own layer is drawing
at that moment.

## 12. FAST-SCROLL REQUIREMENTS

- Keep the crossing beat short relative to approach and arrival. A flung reader who lands mid-flare
  sees one confusing frame; a flung reader who lands in an approach or an arrival sees a legible one.
- Guarantee cover by construction, not by timing: choose `CUT` so that the object has been at the
  full gate rectangle for several percent of the beat before the cut. Then no scroll speed can catch
  the switch uncovered.

## 13. COMMON FAILURE MODES

### DO NOT

- **Do not fade between two worlds.** A crossfade says "these are two pictures". A portal says "these
  are two places".
- **Do not instantly replace the background.** Even one frame of replacement without cover is visible
  as a flash.
- **Do not open a generic fullscreen UI.** A rounded rectangle that scales to fill the viewport is a
  modal, not a threshold. The portal must keep the object's own shape, texture and rim until its
  corners are off screen.
- **Do not teleport the camera.** The only legal cut is under full cover, and there should be at most
  one or two in a whole film.
- **Do not hide the old world too early.** It must be visible, with a hole in it, right up to the
  moment its own geometry leaves the frame.
- **Do not use a portal for ordinary movement.** See `shared/CAMERA_GRAMMAR.md` — portals stay rare.

### Diagnosis table

| Symptom | Cause | Fix |
|---|---|---|
| Visible flash at the crossing | Switch happened before full cover | Verify the cover predicate at the switch time; move the switch later |
| The aperture reads as a UI element | Perfect rectangle, clean edges | Brushy path; keep the object's own rim |
| The crossing feels like a wipe | Destination not visible inside before cover | Render the destination plate through the hole from the moment the aperture opens |
| Arrival feels like being dropped | No pull-back | Add an arrival beat of comparable length |
| The camera lurches sideways at high zoom | Alignment still running during the push | Align in the first third |
| The rim stays on screen after scrolling back | Portal layer not cleared when inactive | Clear whenever no portal channel is in (0, 1) |
| Rounded corners leak the old world at full cover | Radius still applied when the rect is past the edges | Shrink the radius to 0 as the rect passes the edges |
| The destination pops in | Images not decoded | Decode-gate the whole destination before the film starts |

## 14. MINIMAL PSEUDOCODE

```ts
// --- timeline ---
tl.to(st, { logS: log(PEAK), duration: D, ease: 'power2.inOut' }, T0);
tl.to(st, { px: CX, py: CY,  duration: D * 0.4, ease: 'power2.inOut' }, T0);   // align first
tl.to(st, { glow: 1, aperture: 1 }, T0);
tl.to(st, { goldCarry: 1, duration: D * 0.3, ease: 'sine.inOut' }, T0 + D * 0.1);
tl.to(st, { flare: 1, duration: D * 0.12, ease: 'power2.in' }, SWITCH - D * 0.1);
tl.set(st, { world: 1 }, SWITCH);                       // instant, under full cover
tl.to(st, { flare: 0, flicks: 0, ease: 'power1.out' }, SWITCH);
tl.to(st, { logS: log(REST_B), px: BX, py: BY, duration: D2, ease: 'power2.inOut' }, SWITCH);

// --- render ---
const covers = portalCovers(st, vp);
const inB    = st.world >= 0.5;
worldA.style.display = (inB || covers) ? 'none' : 'block';
worldB.style.display = (inB && !covers) ? 'block' : 'none';
if (!inB && !covers) {
  worldA.style.clipPath = holePath(st, vp);             // brushy aperture
  glow.style.opacity = st.glow * falloff(size);
}
flare.style.opacity = st.flare * 0.8;
```

## 15. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| Portal squares for both worlds | `lib/prototype/sceneConfig.ts → PORTAL`, `QR_A`, `GLASS_B` |
| Camera from the square; `portalCovers` | `lib/prototype/camera.ts` |
| The crossing timeline, `WORLD_SWITCH`, `PEAK_SIZE` | `lib/prototype/timeline.ts` (Chapter 2 block) |
| Brushy aperture, hole clip, world toggling, glow, flare | `components/prototype/PortalFilm.tsx` (`APERTURE`, `render`) |
| Speed flicks, carried gold subset | `lib/prototype/moduleField.ts` (`flickSeeds`, `GOLD` block) |
| In-world portal definition and constants | `lib/prototype/chapter4/portals.ts` (`PORTALS`, `CUT`, `PHYSICAL`, `COVER`) |
| In-world portal rendering (clip, inner camera, rim, haze) | `components/prototype/Chapter4Layers.tsx` (portal-window section) and `Chapter4Portal` |
| Portal timing helper (`portal()`, `approach()`, `flare()`) | `lib/prototype/chapter4/timeline.ts` |
