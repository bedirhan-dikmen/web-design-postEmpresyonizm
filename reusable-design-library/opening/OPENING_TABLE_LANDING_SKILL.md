# Table Landing Skill — Closing the Opening

How to end a cinematic opening so it reads as *arrived* rather than *interrupted*.

---

## 1. PURPOSE

Bring the carried subject to rest on a real, physical object in the destination world, and give the
act a final frame that survives being landed on at any scroll speed.

## 2. VISUAL RESULT

The camera settles inside a warm interior. A shaft of light crosses the room with dust floating in
it. The gold modules, released from the camera, drift down that shaft. The ambient dust joins them.
Together they settle onto the face of a small object on a table — a table tent, a card, a placard —
and become a code printed on it. The camera does not move again. One block of copy appears. The dust
keeps drifting.

## 3. REQUIRED INGREDIENTS

- A destination interior with a clear light direction.
- One small, unambiguous **focal object** at a plausible human scale on a near surface.
- A near-depth foreground layer (the table edge) at negative depth.
- The carried subset from the portal.
- Ambient dust on the wall clock.

## 4. STRUCTURE

```ts
const TENT_B = {
  x0: 1180, y0: 650, x1: 1310, y1: 780,     // the object's face, design space
  qr:  { x: 1193, y: 664, cell: 4.2 },      // the code on it
  depth: -0.28,                             // in FRONT of the camera plane
};
```

Two things matter here:

- The object's code cells are **tiny** (≈4 design units vs 22 in the opening code). The same modules
  that filled a quarter of the sky now fit on a card. That size ratio is the whole point: it tells
  the reader they have travelled from an abstract scale to a human one.
- Negative depth puts the object in the foreground. It moves more than the room behind it, so the
  slightest camera motion gives it presence.

## 5. STATE VARIABLES

| Channel | Range | Meaning |
|---|---|---|
| `goldLand` | 0 → 1 → 2 | 0 carried by the camera · 1 floating free in the beam · 2 landed on the object |
| `settle` | 0 → 1 | ambient dust and data modules travel to their cells on the object |
| `textNexa` | 0 → 1 | the destination's copy block |

Three-stop channels (`0→1→2`) are read as:

```ts
if (st.goldLand <= 1) { lerp(carried, beam, ease(st.goldLand)); }
else                  { lerp(beam, landed, ease(clamp01((st.goldLand - 1 - delay) / 0.85))); }
```

## 6. TIMELINE STAGES

Proportions of the landing beat:

| Phase | Share | Channel |
|---|---|---|
| release into the beam | 0–18% | `goldLand 0 → 1` |
| camera re-frames toward the table | 5–45% | `logS`, `px`, `py`, `sine.inOut` |
| dust and data settle onto the object | 8–65% | `settle 0 → 1` |
| gold lands into the object's finder | 30–55% | `goldLand 1 → 2` |
| copy enters | 55–65% | `textNexa 0 → 1` |
| **hold, nothing animating** | 80–100% | an explicit empty tween |

The gold lands **after** the surrounding dust, and it lands into the object's *own finder* — the same
cells it occupied in the opening code. The subject the reader followed ends up exactly where it
started, at a different scale, in a different world.

## 7. CAMERA BEHAVIOUR

- **One re-frame, then nothing.** A single gentle move (≈14% zoom increase) toward the table region,
  on `sine.inOut`, ending well before the landing completes.
- **Stop before the payoff.** The camera must be at rest while the modules land. Motion during the
  landing steals the event.
- **Do not push all the way in.** Leave the room around the object. The reader needs to see *where*
  the object is, not just what it says.

## 8. AMBIENT MOTION

The settle frame is still, but not dead:

```ts
// dust, on the wall clock, damped by formation progress
x += (wob2 * 9 + Math.sin(clock * 0.2 + m.phase) * 6) * (1 - e);
```

Modules that have landed get zero wobble. Free dust keeps moving. The light beam is a `screen`-blend
plate at ~0.42 opacity; a grain overlay at ~0.13 with `soft-light` sits above everything. The frame
breathes without changing.

## 9. EASING / PACING

| Element | Ease |
|---|---|
| release into the beam | `sine.inOut` |
| camera re-frame | `sine.inOut` |
| settle | linear (`none`) with per-module staggering — the stagger *is* the easing |
| gold landing | `sine.inOut` |
| copy in | `power1.out` |

Per-module landing stagger is by **distance from the code's centre**, so the object's face fills from
the middle outward — the opposite of the opening's finder-first order. Different order, different
feeling: assembly was recognition, landing is settling.

## 10. WHY THIS CREATES CLOSURE

1. **Scale resolution.** Sky-sized → card-sized. The journey had a destination and the destination is
   small and specific.
2. **Identity resolution.** The gold subset ends in the same relative cells it began in.
3. **Physical resolution.** The subject is now printed on an object that exists in a room with a
   table, a light and dust. It is no longer abstract.
4. **Motion resolution.** The camera stops. That is the reader's cue that the act is over.
5. **Semantic resolution.** The copy can now name the thing on the table, because the thing on the
   table is on screen.

## 11. REVERSE-SCROLL REQUIREMENTS

- All three channels are monotone and interpolated; no event fires at the landing.
- The object's code cells are constants computed at construction.
- Reverse scroll re-lifts the modules along the same arcs. The only requirement is that the landed
  colour swap is a function of progress (`e > 0.88 ? ink : cream`), not a latch.

## 12. FAST-SCROLL REQUIREMENTS

- The terminal hold must be **explicitly budgeted** as an empty tween of real scroll length. Do not
  rely on "the tweens happen to have finished". A flung reader lands here more often than anywhere
  else in the act.
- Copy must be fully in before the hold begins, so the held frame is complete.

## 13. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| The act feels like it stops rather than ends | No terminal hold | Explicit empty tween at the end |
| The landing is missed | Camera still moving during it | Stop the camera before the modules land |
| The object reads as a sticker | It sits at the same depth as the room | Put it at negative depth on a near surface |
| The scale change does not register | The object's code cells are too large | Make the ratio obvious — 5× or more |
| The frame looks frozen | All ambience damped | Keep free dust and the light beam alive on the wall clock |
| Copy arrives over the landing | Text timed with the motion | Camera arrives → scene readable → text enters |

## 14. MINIMAL PSEUDOCODE

```ts
// timeline
to({ goldLand: 1 }, 0.00, 0.18, 'sine.inOut');
to({ logS: log(REST * 1.14), px: TX, py: TY }, 0.05, 0.40, 'sine.inOut');
to({ settle: 1 },   0.08, 0.57);
to({ goldLand: 2 }, 0.30, 0.25, 'sine.inOut');
to({ textNexa: 1 }, 0.55, 0.10, 'power1.out');
tl.to({}, { duration: HOLD });                       // the frame the reader lands on

// render, per module
const e   = ease(clamp01((st.settle - m.bDelay) / 0.5));
const arc = Math.sin(Math.PI * e) * m.curve * 0.4;
const pos = project('B',
  lerp(m.dx, m.tx, e) + arc + wob * 12 * (1 - e),
  lerp(m.dy, m.ty, e) - abs(arc) * 0.3 + drift * (1 - e),
  lerp(m.dd, m.td, e),
  lerp(m.ds, m.ts, e));
dab(pos, e > 0.88 ? INK : CREAM, (0.85 - shimmer * (1 - e)) * nearFade(pos.s));
```

## 15. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| Object geometry, its code, its depth | `lib/prototype/sceneConfig.ts → TENT_B` |
| Landing timeline (`goldLand`, `settle`, re-frame, hold) | `lib/prototype/timeline.ts` (Chapter 3 block) |
| Gold release → beam → landing | `lib/prototype/moduleField.ts` (GOLD block in `draw`) |
| Dust settle path | `lib/prototype/moduleField.ts` (World B branch in `draw`) |
| Destination plates (wall, mid, light beam, near table) | `lib/prototype/sceneConfig.ts → PLATES` (`03-nexa-morning/*`) |
| Destination copy box | `lib/prototype/sceneConfig.ts → TEXT_BOXES.nexa`, `components/prototype/PortalFilm.tsx` |
