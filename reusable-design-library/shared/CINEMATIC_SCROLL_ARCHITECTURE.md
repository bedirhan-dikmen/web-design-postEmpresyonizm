# Cinematic Scroll Architecture

The structural model every other pattern in this archive depends on. Build this first.

---

## 1. PURPOSE

Drive a long, continuous, film-like sequence from the page's own scroll position, such that any
scroll position produces one deterministic frame — whether the reader arrived there by scrolling
slowly, flinging, scrolling backwards, or jumping to a URL anchor.

## 2. VISUAL RESULT

The page scrolls normally. The viewport shows a fixed scene that transforms continuously: camera
moves, worlds change, objects assemble. There are no section snaps, no "slides", no re-entry
animations replaying, and no state that depends on how the reader got there.

## 3. REQUIRED INGREDIENTS

- A tweening engine that can scrub a paused timeline to an arbitrary time. (Reference: GSAP
  timeline + ScrollTrigger in `scrub` mode. Any engine exposing `timeline.time(t)` works.)
- A canvas 2D context for the particle/module layer.
- Ordinary DOM/CSS for text, UI and device mock-ups.
- Pre-rendered artwork plates (raster), sized in design-space units.

## 4. SCENE / DOM STRUCTURE

```text
<root>                                    position: relative
  <stage>                                 position: fixed; inset: 0; overflow: hidden
    <wallGroup>                           optional 3D orientation group (matrix3d)
      <plates world="view">               the destination seen through the portal
      <worldB>                            destination world plates + props    (display toggled)
    <portalLayer>                         clip + inner scene + rim            (mid-act portals)
    <worldA>                              source world plates                 (display toggled)
      <glow>
    <canvas motif>                        the module field — one canvas, whole viewport
    <gradeLayers>                         colour grade / veil / vignette
    <surfaceLayer>                        held objects shown large (screen space)
    <flare> <grain>
  <textFrame>                             position: fixed; above stage; pointer-events: none
  <chrome>                                progress rail, header
  <loadCover>                             opaque until the first frame is ready
  <track>                                 height: TOTAL_VH + tail; contains only anchors
</root>
```

Two rules about this tree:

- **The stage never scrolls.** It is `position: fixed`. Scroll moves the playhead, not the scene.
- **The track contains nothing visible.** It is pure height. Anchors (`#top`, `#products`) are
  absolutely positioned zero-size spans *on the track*, so following a link just moves the playhead
  to that time rather than restarting anything.

## 5. STATE VARIABLES

One flat object of **plain numbers only** — no booleans, no strings, no objects, no arrays. The
timeline tweens its fields; the renderer reads them.

```ts
interface FilmState {
  // camera, expressed as a rectangle on screen (see CAMERA_GRAMMAR.md)
  px: number; py: number; logS: number;
  // discrete-feeling channels are still numbers
  world: number;      // 0 = source world, 1 = destination
  assemble: number;   // 0…1 scatter → formation
  aperture: number;   // 0…1 how open the portal is
  // multi-stop channels use ranges, not separate flags
  goldLand: number;   // 0 carried · 1 floating · 2 landed
  textIntro: number;  // 0 before · 1 shown · 2 after
}
```

Why numbers only: a number can be tweened, interpolated, reversed and sampled. A boolean cannot be
half-true, so it creates a discontinuity that behaves differently forward and backward. Where a
channel genuinely has stages, use a range (`0→1→2→3`) and read it with `clamp01(v - 1)` style maths.

The reference implementation carries ~110 channels in one interface
(`lib/prototype/camera.ts → FilmState`). That is fine. A wide flat state is far easier to reason
about than a nested scene graph.

## 6. TIMELINE STAGES

```text
buildFilm(state):
  tl = timeline({ paused: true, defaults: { ease: 'none' } })
  buildAct1(tl, state)     // absolute times, in timeline units
  buildAct2(tl, state)
  buildAct3(tl, state)
  return tl
```

- **1 timeline unit = 100vh of scroll.** Keep this fixed. It makes every duration readable as a
  scroll distance, which is the only unit that matters for pacing.
- Each act is built by its own module and appended at a start time derived from the previous act's
  end (`const ACT5_START = ACT4.end`). Acts never reach back into earlier acts' channels.
- Beats inside an act are declared as a `DURATIONS` map and accumulated, so inserting or re-timing
  a beat shifts everything after it automatically:

```ts
const DURATIONS = { a1: 1.0, a2: 1.2, t1: 2.2, b1: 1.2 };
const BEATS = accumulate(DURATIONS, START);
const at = (beat, frac) => BEATS[beat].start + BEATS[beat].dur * frac;
```

- Write tweens with fractional positions inside a beat (`to('a2', 0.3, 0.24, { scan: 1 })` = start
  at 30% of beat `a2`, last 24% of it), never with hand-typed absolute times. Re-timing then stays
  local instead of rippling through the file.

## 7. RENDER LOOP

```ts
ticker.add((clock) => render(clock));

function render(clock) {
  const vp = viewportFor(innerWidth, innerHeight);   // design space → device px
  // 1. derive cameras from state
  // 2. position every plate
  // 3. toggle world containers
  // 4. draw the canvas module field
  // 5. update DOM prop/text layers
}
```

Two clocks, kept strictly separate:

| Clock | Drives | Must be |
|---|---|---|
| **scroll → timeline time** | story: camera, formations, copy, world switch | pure function of scroll |
| **wall clock** | ambience: twinkle, dust drift, steam, LED blink, breathing | never story-bearing |

Ambience on the wall clock is what keeps a frozen frame alive while the reader stops scrolling. It
must never change what the frame *means*, because it is not reproducible.

## 8. SCROLL BINDING

```ts
ScrollTrigger.create({
  trigger: trackElement,
  start: 'top top',
  end: 'bottom bottom',
  scrub: reducedMotion ? true : 0.7,   // 0.7s eased catch-up; exact under reduced motion
  animation: film,
});
```

- `scrub: 0.7` gives the camera weight — a fling decelerates instead of teleporting.
- Under `prefers-reduced-motion`, bind exactly (`scrub: true`) so the frame tracks the scrollbar
  with no residual motion.

## 9. WHY ONE MASTER TIMELINE BEATS MANY SCROLLTRIGGERS

| Many independent triggers | One scrubbed master timeline |
|---|---|
| Each has its own enter/leave lifecycle | No lifecycle at all; only `time(t)` |
| Firing order depends on scroll direction and speed | Order is the timeline's own order, always |
| A fling can skip an `onEnter` and leave state stale | Nothing to skip; state is re-derived |
| Overlapping animations fight over the same property | One tween per channel, positioned explicitly |
| Reverse needs an `onLeaveBack` mirror of every trigger | Reverse is free |
| Debugging means reconstructing which triggers fired | Debugging means printing the state object |

The cost is that you must express everything as state, including things that feel like events
("the order was sent"). That cost is paid once. The benefit compounds over every beat you add.

## 10. REVERSE-SCROLL REQUIREMENTS

- Render must depend on **nothing but** state, viewport size, and the ambience clock.
- Any DOM element the renderer writes inline styles to must be written **every frame it can be
  visible**, and explicitly reset when its act is out of range. See `REVERSE_SCROLL_SAFETY.md`.
- Never use an instant `set()` on a channel whose object is visible at that moment; only under full
  cover or off screen.

## 11. FAST-SCROLL REQUIREMENTS

Semantic events must be spread over scroll distance, not stacked. Structure every beat as
`SOURCE HOLD → MOVE → DESTINATION HOLD`. See `FAST_SCROLL_READABILITY.md`.

## 12. COMMON FAILURE MODES

| Symptom | Cause | Fix |
|---|---|---|
| Layers flash through each other during a fast pull-back | The compositor cannot rasterise a huge scaled layer in time | Lay each plate out at its **image's natural pixel size** and carry the design-size ratio in the transform |
| A prop is still visible after scrolling back past its act | The renderer returned early when the act was inactive, leaving inline styles behind | Full reset on leaving an act; hard-gate layers to a time range |
| A blend-mode layer loses its blend where it is clipped | Some browsers drop `mix-blend-mode` under a `clip-path: path()` | Build the hole out of four sibling rectangles instead of a clip path |
| Jumping to an anchor replays an intro | The anchor is a DOM section, not a point on the track | Put anchors on the track as zero-size absolutely positioned spans |
| The destination world pops in at the crossing | Its images had not decoded | Decode-gate before starting, with a timeout race for background tabs |

## 13. HOW TO CUSTOMIZE

Replaceable: design-space dimensions, act count and lengths, the channel list, the artwork, the
number of worlds.

Do not change: pure-state rendering, one master timeline, numbers-only state, fixed stage + empty
track, the two-clock split.

## 14. MINIMAL PSEUDOCODE

```ts
const st = initialState();
const film = buildFilm(st);              // paused master timeline

bindScroll(track, film);                 // scrub

ticker.add((clock) => {
  const vp = viewportFor(innerWidth, innerHeight);
  renderPlates(st, vp);
  renderWorlds(st, vp);
  field.draw(ctx, st, vp, dpr, clock);   // ambience uses `clock`
  renderDom(st, vp, clock);
});
```

## 15. WHICH KERINTI FILES IMPLEMENT IT

| Concern | File |
|---|---|
| Stage tree, render loop, scroll binding, load gate | `components/prototype/PortalFilm.tsx` |
| State interface + camera maths + viewport mapping | `lib/prototype/camera.ts` |
| Master timeline, acts 1–3 | `lib/prototype/timeline.ts` |
| Design space, plates, portals, text boxes, scroll budget | `lib/prototype/sceneConfig.ts` |
| Act 4 timeline (beat map, travel, portal helpers) | `lib/prototype/chapter4/timeline.ts` |
| Act 5 timeline | `lib/prototype/chapter5/timeline.ts` |
| Canvas module field | `lib/prototype/moduleField.ts` |
| Act 4 / 5 DOM layers and updaters | `components/prototype/Chapter4Layers.tsx`, `Chapter5Layers.tsx` |
