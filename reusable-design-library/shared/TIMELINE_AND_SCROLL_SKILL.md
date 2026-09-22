# Timeline and Scroll Skill

How to budget scroll distance so a long cinematic reads at every speed a reader might use.

---

## 1. PURPOSE

Decide how much scroll each beat gets, and how events are distributed inside it, so the sequence is
comprehensible under slow, normal, fast and reverse scrolling.

## 2. THE UNIT

**1 timeline unit = 100vh of scroll.** Fix this and never vary it.

Everything then reads directly: `duration: 1.2` is 120vh, a beat of 0.9 is 90vh, an act of 5.65 is
565vh. Pacing conversations become concrete ("this transition is 220vh long, that is too much for one
idea") instead of abstract.

## 3. THE SEMANTIC UNIT — SOURCE / TRANSITION / DESTINATION

Every beat is three parts:

```text
SOURCE HOLD        the thing being left is on screen, still, readable
   ↓
TRANSITION         the camera moves, or the material transforms — ONE change
   ↓
DESTINATION HOLD   the thing arrived at is on screen, still, readable
```

The holds are not padding. They are where the reader understands anything. A film built only of
transitions is a blur at any speed above "deliberate".

A destination hold is also the next beat's source hold — they overlap at boundaries, which is why the
structure does not double the act's length.

## 4. ACTION DENSITY

**One semantic event per transition.** A semantic event is something a reader could describe in a
sentence: "the order was sent", "the camera went to the kitchen", "the modules became a chart".

Two events in one transition is the single most common pacing error. The symptoms are that readers
report the section as "busy" or "hard to follow", and that they cannot say what happened even after
scrolling it twice.

Where two things must happen close together, separate them by a hold — even a short one (20–30vh is
enough to register as a pause).

## 5. HOW LONG SHOULD A HOLD BE?

| Hold | Length | Purpose |
|---|---|---|
| Micro-hold between two related events | 20–40vh | registers as a pause |
| Standard destination hold | 60–120vh | the frame can be read |
| Copy hold | ≥ the copy's own in/out (≈17vh) + reading time | see `TEXT_TIMING_SKILL.md` |
| Act-ending hold | 100vh+ | the frame a reader stops on |

Measured over a 4,420vh act, the reference implementation reached **57% of scroll being settled,
readable frames**, across **23 anchor frames** (settles of ≥15vh) totalling 2,494vh. That ratio is a
useful target: **more than half of a long act should be holds.**

For comparison, the reference opening (a short, dense act) sits near 24% — acceptable for 440vh with
five beats, but it would be unreadable at 4,000vh.

## 6. TRANSITION LENGTHS

| Transition | Typical | Notes |
|---|---|---|
| A small camera adjustment inside one place | 30–60vh | |
| A move between adjacent places | 100–160vh | |
| A long travel across a whole space | 180–250vh | multi-waypoint |
| A threshold crossing | 60–100vh | shorter than its approach and its arrival |
| A material transformation (one formation → another) | 80–150vh | |

The crossing being the *shortest* item on that list is deliberate. See
`opening/OPENING_PORTAL_SKILL.md`.

## 7. THE FOUR SPEEDS

Design for all four explicitly.

### Slow (Δ ≈ 0.005 units/frame)

Everything is visible. Requirements: no stepping or quantisation in any interpolation; ambient motion
present so the frame is not dead; no frame where a value is mid-snap.

### Normal (Δ ≈ 0.02)

The intended reading. Requirements: copy readable within its hold; one event per transition.

### Fast (Δ ≈ 0.4 — a flick)

The reader samples every ~40vh. Requirements: holds long enough that samples land in them; no event
shorter than ~40vh carries meaning alone.

### Fling (Δ ≈ 1.2 — a hard swipe)

The reader samples every ~120vh. Requirements: anchor frames spread so that a sample has a good
chance of landing on one. The reference measures this directly:

> "Landing on a settled frame when flung at 120vh/frame: **57%**"

Compute it for your own film — sample the timeline at 1.2-unit intervals from many offsets and count
how many land inside a settle. Below ~50% the act needs longer holds or fewer events.

### Reverse

Every speed, backwards. See `REVERSE_SCROLL_SAFETY.md`.

## 8. THE SCRUB SETTING

```ts
scrub: 0.7          // seconds of eased catch-up
scrub: true         // exact, under prefers-reduced-motion
```

Scrub adds weight so a fling decelerates like a camera. It does **not** help comprehension — a reader
who flings past a beat has missed it whether or not the camera coasts. Do not use scrub as a
substitute for holds.

## 9. STRUCTURING AN ACT

```ts
const DURATIONS = {
  a1: 1.0, a2: 1.2, a3: 1.2,      // zone A beats
  t1: 2.2,                         // travel to zone B
  b1: 1.2, b2: 1.0,                // zone B beats
  t2: 2.0,                         // travel to zone C
};
const BEATS = accumulate(DURATIONS, START);
const at  = (b, f) => BEATS[b].start + BEATS[b].dur * f;
const to  = (b, f, d, vars, ease) =>
  tl.to(st, { ...vars, duration: BEATS[b].dur * d, ease }, at(b, f));
```

Conventions worth adopting:

- Name travel beats separately (`t1`, `t2`) so their cost is visible in the duration map.
- Every tween positioned fractionally inside its beat, never at an absolute time.
- Publish freeze labels for the settled frame of every beat and the middle of every travel:

```ts
export const LABELS = {
  table:      at('a1', 0.85),      // the settle
  'to-kitchen': at('t2', 0.45),    // mid-travel
  kitchen:    at('c1', 0.80),
};
```

Then `?t=kitchen` in development freezes the film there. This is the single highest-leverage
debugging tool in the whole architecture — build it on day one.

## 10. HOW TO AUDIT AN ACT

Run these as scripts against the real timeline, not by eye.

1. **Settle ratio.** Sample every 0.01 units; a sample is "settled" if no channel changes by more
   than a threshold over the next 0.02. Report the percentage and the list of anchor frames.
2. **Fling landing rate.** Sample at 1.2-unit intervals from 100 random offsets; count the fraction
   landing in a settle.
3. **Event density.** For each transition, count channels that start or finish inside it. More than
   one *semantic* group is a flag.
4. **Copy overlap.** For each copy block, measure camera movement (px per unit of scroll) while it is
   fully shown. The target is **0**.
5. **Pop scan.** Sample every channel every 0.01 and flag jumps. Every flagged jump must be either a
   deliberate cut under cover or a re-anchor of something off screen. Everything else is a bug.

## 11. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| "Busy", "hard to follow" | Two events per transition | Separate with a hold |
| Readers miss a key moment when scrolling fast | Event shorter than the sample interval | Lengthen it, or give it a hold |
| The act feels long but says little | Long travels, short holds | Invert the ratio |
| Making the track longer does not help | Everything scaled equally, including the holds that were already fine | Lengthen holds only; see `FAST_SCROLL_READABILITY.md` |
| Re-timing one beat breaks the rest | Absolute times hand-typed | Duration map + fractional positions |
| Cannot reproduce a reported glitch | No freeze tool | `?t=<label>` freeze + a state overlay |

## 12. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| Unit convention, act composition | `lib/prototype/timeline.ts` |
| Duration map, beat accumulation, `at`/`to`/`look`/`travel`/`text` helpers | `lib/prototype/chapter4/timeline.ts` |
| Same, for the closing act | `lib/prototype/chapter5/timeline.ts` |
| Freeze labels | `CH4_LABELS`, `CH5_LABELS`, merged as `LABELS` in `components/prototype/PortalFilm.tsx` |
| Freeze + debug tooling (`?t=`, `?debug`, `window.__film`) | `components/prototype/PortalFilm.tsx` |
| Scroll budget per act | `lib/prototype/sceneConfig.ts → CHAPTERS`, `TOTAL_VH` |
| Recorded audit results | `CHAPTER4_NOTES.md → Length and fast scroll`, `→ Verification` |
