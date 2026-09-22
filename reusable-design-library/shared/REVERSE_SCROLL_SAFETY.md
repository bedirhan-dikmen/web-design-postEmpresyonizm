# Reverse-Scroll Safety

A debugging playbook. In a scroll-driven film, backwards is not an edge case — it is half of all
scrolling.

---

## 1. THE INVARIANT

> For any scroll position `s`, the rendered frame must be identical whether the reader arrived at `s`
> by scrolling forwards, backwards, or by jumping directly there.

Everything in this document is a way of protecting that invariant or of finding where it has been
broken.

## 2. WHY IT USUALLY HOLDS — AND WHERE IT LEAKS

With the architecture in `CINEMATIC_SCROLL_ARCHITECTURE.md`, the **film state always reverses
correctly**. A tweened number scrubbed backwards produces the same value it produced going forwards.
That part is free.

What leaks is **DOM state**. The state object is re-derived every frame; inline styles on DOM
elements are only re-derived if some code path writes them. Every leak below is a case where a code
path did not run.

## 3. LEAK 1 — STALE INLINE STYLES FROM AN EARLY RETURN

The pattern that causes it:

```ts
function update(st) {
  if (st.act4 < 0.5) return;        // ← the bug
  placeProps(st);
  updatePanels(st);
  updateVeil(st);
}
```

Scrolling forwards into act 4 leaves props visible. Scrolling backwards out of it, the updater
returns early and **every prop, panel and veil keeps its last inline style** — so a panel is still on
screen while the reader is back in act 3.

**The fix:** leaving an act runs a full reset.

```ts
function update(st) {
  const active = st.act4 >= 0.5;
  if (!active) return hideAll();     // explicit, complete teardown
  …
}

const hideAll = () => {
  for (const el of props.values()) vis(el, false);
  for (const el of [veilOut, veilCrush, veilIn]) vis(el, false);
  clearSurface();
  clearPortal();
  setOpacity(vignette, 0);
};
```

The reset must cover **every** element the updater can write to. Enumerate them by querying the DOM
once at setup and keeping the list, rather than listing them by hand.

## 4. LEAK 2 — NO HARD TIME GATE

Even with a reset, a layer can be written by a code path that does not check whether it should exist
at all. Add a hard gate on the timeline time, independent of any channel:

```ts
if (!rect || now < ACT.start - 0.05 || now > ACT.end + 0.05) {
  clearSurface();
} else {
  …draw the surface…
}
```

Rules of thumb:

- Gate every full-screen or near-full-screen layer to its act's time range.
- Gate transient props to the beats where they can be visible (a phone in a hand: only the two beats
  where the hand holds it).
- Keep a small margin (±0.05) so a scrub landing exactly on a boundary does not flicker.

## 5. LEAK 3 — DIRECTION-DEPENDENT DERIVED VALUES

Anything computed from *change* rather than from *state* is direction-dependent. The common one is
camera speed, used for defocus:

```ts
// WRONG — sharp going back, soft going forward
const speed = (x - prevX) / dt;

// RIGHT
const speed = Math.hypot(x - prevX, y - prevY) / dt;
```

Use magnitude, never a signed delta. The same applies to motion blur, trail lengths, and any
"leading/trailing" effect.

## 6. LEAK 4 — PERSISTENT PANEL / DEVICE STATES

A panel that "opens" and "closes" must be a channel, not two events:

```ts
// th1: 0 = in the hand · 0→1 opening · 1 = open · 1→2 closing · 2 = back in the hand
rect = st.th1 <= 1 ? lerpRect(source, peak, ease(st.th1))
                   : lerpRect(peak, source, ease(st.th1 - 1));
```

and it must be **hidden outside its own range**:

```ts
if (st.th1 > 0.001 && st.th1 < 1.999) { …draw… }
```

Not `if (st.th1 > 0)`. The upper bound is what stops the panel remaining on screen after the beat.

## 7. LEAK 5 — INSTANT `set()`s ON VISIBLE THINGS

`tl.set()` is legitimate, but only for a value whose object is **covered or off screen** at that
moment:

```ts
cut('a3', 0.3, { orderS: S.cashier });   // hidden under the phone surface — fine
tl.set(st, { world: 1 }, WORLD_SWITCH);  // under full portal cover — fine
```

Any `set()` on a visible object is a pop, and it will look different forwards and backwards (the
frame before the set differs from the frame after in only one direction of approach).

Audit every `set()` in the film and justify each one in a comment. The reference film's audit found
8 jumps across 4,413 samples: 1 deliberate camera cut under full portal cover, and 5 re-anchors of
objects that were hidden or off screen. Everything else must be a tween.

## 8. LEAK 6 — CACHED WORK KEYED ON THE WRONG THING

```ts
// a cached layout that only recomputes when the string changes — correct
if (frameXf !== lastFrameXf) { el.style.transform = frameXf; lastFrameXf = frameXf; }

// a cache keyed on "have we done this yet" — suspect
if (!built) { build(); built = true; }
```

One-shot builds are acceptable only for genuinely immutable results (the encoded code, the tinted
sprite atlas). Anything that depends on state must be recomputed or keyed on that state.

## 9. LEAK 7 — BLEND AND CLIP INTERACTIONS

Not strictly a reverse-scroll issue, but it surfaces during reverse pull-backs, so it belongs here:
some browsers drop a `mix-blend-mode` layer's blend where it is clipped by a `clip-path: path()`.
A veil built as a clipped multiply layer therefore flashes the un-veiled world through during a fast
pull-back.

**Fix:** build the hole out of four sibling rectangles positioned around it, instead of clipping.

## 10. THE TEST PROTOCOL

Run all of these. The first two are scripts against the real timeline and catch most problems without
a browser.

### Test 1 — Path independence (script, headless)

For every channel, at every checkpoint, compare the value reached by scrubbing forward against the
value reached by scrubbing backward, at four speeds:

```text
slow   Δ0.005
normal Δ0.02
fast   Δ0.4
fling  Δ1.2
```

Pass criterion: **0 differences at every speed.** This is achievable — the reference implementation
reports exactly that across 67 channels and 42 checkpoints.

### Test 2 — Pop scan (script, headless)

Sample every channel every 0.01 units across the whole film. Flag any jump larger than a threshold.
Every flag must be traceable to a justified `set()`. Anything else is a bug.

### Test 3 — Direct-jump vs scrub-back (browser)

For each checkpoint: load the page fresh with the film frozen at that time, screenshot; then scroll
past it and back to the same time, screenshot; compare. Differences are DOM leaks.

This is the test that catches everything the scripts cannot see, because it compares *rendered
output*, not state.

### Test 4 — Layer comparison (browser)

At ~150–200 sample points, record the computed visibility/opacity/transform of every layer the
updaters write to, forwards and backwards. Compare. The reference project keeps a 175-point
comparison of every layer as part of its test set.

### Test 5 — Boundary oscillation (manual)

Scroll back and forth across every act boundary, every portal, and every panel open/close, in small
increments. Watch for flicker, stuck elements and pops.

## 11. A DEBUGGING CHECKLIST

When something is visible that should not be:

```text
[ ] Is the element written by an updater that returns early? → full reset on inactive
[ ] Is the layer hard-gated to a time range? → add the gate
[ ] Is the channel checked for BOTH bounds (> 0 AND < max)? → add the upper bound
[ ] Is anything computed from a signed delta? → use magnitude
[ ] Is there a one-shot `built` flag that depends on state? → key it on the state
[ ] Is there a `set()` on something visible? → make it a tween, or cover it
[ ] Does the reset list cover this element? → enumerate from the DOM, not by hand
```

When a frame looks different depending on approach direction:

```text
[ ] Freeze at the time directly (?t=) and compare with a scrub-back screenshot
[ ] Diff the state object between the two — if identical, it is a DOM leak, not a state bug
[ ] Print every inline style the updater writes, in both cases
```

## 12. WHICH KERINTI FILES DEMONSTRATE THESE PATTERNS

| Pattern | Where |
|---|---|
| Full reset on leaving an act | `components/prototype/Chapter5Layers.tsx → hideAll()`, `Chapter4Layers.tsx` (clear paths) |
| Hard time gate on a full-screen layer | `components/prototype/Chapter4Layers.tsx` (`now < CH4.start - 0.05 \|\| now > CH4.end + 0.05`) |
| Both-bounds channel checks on panels | `components/prototype/Chapter4Layers.tsx` (`st.th1 > 0.001 && st.th1 < 1.999`) |
| Portal cleared when no portal is active | `components/prototype/Chapter4Layers.tsx` (`else clearPortal()`) |
| Direction-independent camera speed | `components/prototype/Chapter4Layers.tsx` (`cam0.speed`) |
| Justified `set()`s, each commented | `lib/prototype/chapter4/timeline.ts` (`cut()` helper), `lib/prototype/timeline.ts` (`set(world: 1)`) |
| Four-rect veil instead of a clip-path | `components/prototype/Chapter5Layers.tsx → frameVeil()` |
| Plates gated by act | `components/prototype/PortalFilm.tsx` (`if (def.chapter === 4 && st.ch4 < 0.5) show = false`) |
| Recorded test results | `CHAPTER4_NOTES.md → Verification`, `→ Phase 4.5 repairs` |
