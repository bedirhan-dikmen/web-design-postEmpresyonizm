# Loading / Dark Transition Skill

A reusable skill for the moment between a cinematic act and ordinary page content:
**CINEMATIC → DARK → STANDARD PAGE.**

---

## 1. PURPOSE

Cover the handover between two rendering models (a fixed canvas/DOM stage and a normal document) with
a dark moment that reads as a title card, and guarantee that no reader ever sees a white flash, a
stuck overlay, or a page that will not accept scroll or clicks.

## 2. VISUAL RESULT

The final cinematic frame calms. The screen darkens smoothly to the page's own background colour. For
a short, held moment there is nothing but that colour and — optionally — a small mark or word. Then
the first normal section emerges from the same colour.

## 3. REQUIRED INGREDIENTS

- A single global background colour set on `html` and `body`.
- A document-flow block that scrolls over the fixed stage (preferred), **or** a fixed overlay whose
  opacity is driven by scroll (fallback).
- The film's render guard.

## 4. TWO IMPLEMENTATIONS

### A — Document block (recommended)

The dark region is a block in normal flow, above the stage in z-order. As it scrolls up, it covers
the stage. There is no overlay to manage and nothing to get stuck.

```text
<stage  z-0  fixed>
<content z-20 relative>
  <darkBridge>   height: 70vh; background: gradient → page colour; contains an optional mark
  <firstSection> background: page colour
```

**Advantages:** no overlay state, reverses for free, cannot get stuck, no pointer-event trap.
**Limitation:** the cover follows the scrollbar exactly — it cannot lag or ease.

### B — Scroll-driven fixed overlay (only when you need a scrub-eased cover)

```tsx
<div data-bridge className="pointer-events-none fixed inset-0 z-30"
     style={{ background: '#050b1e', opacity: 0 }} />
```

driven by a channel on the film state, so it is scrubbed with the same easing as the film:

```ts
tl.to(st, { bridge: 1, duration: 0.4, ease: 'power1.inOut' }, BRIDGE_IN);
tl.to({},  { duration: 0.2 }, BRIDGE_HOLD);              // the held dark
tl.to(st, { bridge: 0, duration: 0.4, ease: 'power1.out' }, BRIDGE_OUT);
```

```ts
bridgeEl.style.opacity = String(st.bridge);
bridgeEl.style.pointerEvents = 'none';                   // ALWAYS. No exceptions.
```

**Advantages:** inherits the film's scrub weight; can hold while the reader is between positions.
**Risks:** every failure mode in §11 belongs to this form. Use A unless you need B.

## 5. STATE VARIABLES

| Channel | Range | Meaning |
|---|---|---|
| `bridge` | 0 → 1 → 0 | overlay opacity (form B only) |
| `calm` | 0 → 1 | ambience amplitude wind-down; runs *before* `bridge` |
| `label` | 0 → 1 → 2 | optional mark in the dark, using the standard 0/1/2 copy channel |

## 6. TIMELINE STAGES

As fractions of the bridge's scroll length:

```text
0.00 ─ 0.25   calm → 1          ambience, vignette, grade wind down; camera already still
0.25 ─ 0.70   bridge → 1        the cover reaches full opacity by 0.70, not 1.00
0.40 ─ 0.80   label → 1         the mark fades in inside the dark
0.70 ─ 0.85   HOLD              nothing animates; screen is the page colour
0.80 ─ 0.95   label → 2
0.85 ─ 1.00   page emerges      the first section rises/fades in from the same colour
```

Reaching full cover at 0.70 rather than 1.00 guarantees a band of scroll where the cover is complete
regardless of scroll speed.

## 7. Z-INDEX AND STACKING

```text
 0   fixed stage (film)
10   film's text frame            pointer-events: none (except the film's own CTA)
20   normal page content          position: relative — this is what covers the stage
30   dark bridge overlay          form B only; pointer-events: none
40   initial load cover           see §9
```

Rules:

- Anything above the stage that is not meant to be clicked is `pointer-events: none`.
- The normal content wrapper needs `position: relative` (or any stacking context) for its z-index to
  apply over a fixed sibling.
- Never put the bridge overlay above the normal content; it belongs between the stage and the content.

## 8. AVOIDING WHITE FLASHES

White flashes come from three places. Fix all three:

1. **The document background.** Set it globally, not on a component:

```css
html, body { background: #050b1e; color: #eaf0f7; }
```

2. **The gap between two blocks.** Overlap by a pixel (`-mt-px` / `pb-px`). Sub-pixel rounding
   otherwise shows a line of whatever is behind.

3. **First paint, before the film is ready.** Cover the viewport with an opaque element from the
   first HTML byte and fade it out only when the first frame has rendered:

```tsx
<div className={`pointer-events-none fixed inset-0 z-40 flex items-center justify-center
                 bg-[#050b1e] transition-opacity duration-700
                 ${ready ? 'opacity-0' : 'opacity-100'}`}>
  <span className="eyebrow text-[0.8rem] opacity-70">BRAND</span>
</div>
```

`ready` is set only after every image has loaded *and decoded* and the first `render()` has run. It
is `pointer-events: none` from the start, so even if it never faded it could not trap input.

## 9. THE INITIAL LOAD COVER

Gate on decode, not on load, and race a timeout so a background tab cannot hang:

```ts
const settle = (img) => Promise.race([
  (img.complete ? Promise.resolve()
                : new Promise(r => { img.onload = img.onerror = () => r(); }))
    .then(() => img.decode().catch(() => undefined)),
  new Promise(r => setTimeout(r, 2500)),
]);

Promise.all(images.map(settle)).then(() => {
  bindScroll(); render(now); setReady(true);
});
```

`decode()` can stall indefinitely in a background tab; the 2.5s race means the worst case is a
slightly unpolished first frame, never a permanently covered page.

## 10. HANDING OVER POINTER AND SCROLL CONTROL

Checklist:

- [ ] The stage and every overlay are `pointer-events: none` by default.
- [ ] Interactive elements inside the film opt in individually (`pointer-events-auto`).
- [ ] `html`/`body` `overflow` is never modified. Native scroll is used throughout.
- [ ] The normal content is in document flow with a stacking context above the stage.
- [ ] Focus order is correct: the film's content is `aria-hidden` where it is decorative, so keyboard
      users reach the normal page's controls without traversing the scene.
- [ ] The overlay's opacity is derived from state, never from a `setTimeout` chain.

## 11. HOW TO PREVENT A STUCK OVERLAY

This is the classic failure of form B. Four defences, apply all of them:

1. **Derive opacity from state, every frame.** Never `overlay.classList.add('hidden')` in a callback.
   If the opacity is written from `st.bridge` on every frame, there is no path where it is stale.
2. **Always `pointer-events: none`.** Then even a stuck overlay is cosmetic, not a lockout.
3. **Clamp.** `opacity = clamp01(st.bridge)` — a channel overshooting past 1 (from an elastic ease)
   must not produce `opacity: 1.04` that some engine treats oddly.
4. **Hard-gate by time range.** If the current timeline time is outside the bridge's range, force
   `opacity: 0` and `visibility: hidden` regardless of the channel. This is the same hard-gating rule
   as `shared/REVERSE_SCROLL_SAFETY.md`.

```ts
const inRange = now > BRIDGE_IN - 0.05 && now < BRIDGE_OUT + 0.05;
if (!inRange) { overlay.style.opacity = '0'; overlay.style.visibility = 'hidden'; }
else          { overlay.style.visibility = 'visible';
                overlay.style.opacity = String(clamp01(st.bridge)); }
```

## 12. REVERSE SCROLL

- Form A reverses for free: the block simply scrolls back down.
- Form B reverses because `bridge` is a tweened channel read every frame. Verify by scrubbing
  backwards through the whole range and comparing rendered opacity with the forward pass.
- The film's render guard must use the same threshold in both directions.

## 13. FAST SCROLL

- Full cover must exist over a band of scroll, not at a point (see §6).
- The held dark should be at least ~15vh so it is not skipped entirely at a fling; it may be skipped,
  and that is fine — what must not happen is a partially-covered frame showing both layers.

## 14. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| Page cannot be clicked after the transition | Overlay left at `pointer-events: auto` | Always `none` |
| Overlay never disappears | Opacity set once in a callback that did not re-run | Write opacity from state every frame |
| White flash mid-transition | Default white document background | Global `html, body` background |
| One-pixel seam | Sub-pixel rounding between blocks | 1px overlap |
| Overlay reappears when scrolling up past it | Correct — that is the intent | If not wanted, the bridge is in the wrong place |
| The dark reads as a crash | Empty, and too long | Add a mark; 15–25vh |
| Scroll locks up | `overflow: hidden` applied to `body` | Never touch document overflow |
| Load cover never fades | `decode()` stalled in a background tab | Race a 2.5s timeout |

## 15. WHICH KERINTI FILES IMPLEMENT IT

The live site uses **form A** (document block) plus the initial load cover. There is no mid-page dark
overlay in production.

| Concern | File |
|---|---|
| Initial load cover, `ready` state, decode gating with timeout race | `components/prototype/PortalFilm.tsx` |
| Global background (no white flash) | `app/globals.css` |
| Document-flow cover block, 1px overlap, `z-20` | `components/site/ContactSection.tsx` |
| `pointer-events: none` stage and text frame; opt-in CTA | `components/prototype/PortalFilm.tsx`, `components/prototype/Chapter5Layers.tsx` (`.pointer-events-auto` on the CTA link) |
| Hard-gating a layer to a time range (the pattern in §11.4) | `components/prototype/Chapter4Layers.tsx` (surface clear outside `CH4.start … CH4.end`) |
