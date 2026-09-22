# Performance Guide

Keeping a long, layered, scroll-driven cinematic at frame rate without reaching for WebGL.

---

## 1. THE DIVISION OF LABOUR

| Concern | Use | Why |
|---|---|---|
| Hundreds of small moving particles | **Canvas 2D**, one full-viewport canvas | One layer, one draw pass; no layout, no style recalculation |
| Large static artwork | **DOM `<img>` with a transform** | The compositor handles it; no per-frame redraw |
| Text | **DOM** | Real text: selectable, translatable, accessible, crisp at any DPR |
| Interface mock-ups, device screens, props | **DOM** | Easier to author and restyle than canvas drawing code |
| Colour grades, veils, vignettes | **DOM with blend modes** | GPU-composited |
| A scannable code | **SVG** with `shapeRendering="crispEdges"` | Exact edges at any scale |

The mistake to avoid in both directions: drawing text into canvas (loses accessibility and
crispness), and rendering hundreds of particles as DOM elements (style recalculation dominates the
frame).

## 2. PLATES: LAY OUT AT NATURAL PIXEL SIZE

This is the highest-impact rule in the document.

A plate that is 22,000 × 10,000 *design units* must not be laid out at that size and scaled down by
the transform. The browser then keeps a composited layer of that enormous size, and during a fast
pull-back it cannot rasterise its tiles in time — the layers underneath flash through.

```ts
export function fitPlate(img, def) {
  const nw = img.naturalWidth, nh = img.naturalHeight;
  if (!nw || !nh) return [1, 1];
  if (img.dataset.fit !== `${nw}x${nh}`) {
    img.style.width  = `${nw}px`;
    img.style.height = `${nh}px`;
    img.dataset.fit  = `${nw}x${nh}`;
  }
  return [def.w / nw, def.h / nh];       // extra scale carried by the transform
}
```

Each layer is then only as large as its image. What is drawn on screen is identical.

## 3. TRANSFORMS ONLY

Every per-frame change to a DOM layer must be a `transform` and/or `opacity`:

```ts
img.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${sx}, ${sy})`;
img.style.opacity = String(a);
```

Never write `left`, `top`, `width` or `height` per frame. Set `will-change: transform` on layers that
move every frame — and **only** on those; `will-change` on everything is itself a cost.

## 4. VISIBILITY OVER MOUNTING

Toggle `visibility` (and `display` for whole world containers), never mount/unmount:

```ts
if (img.style.visibility !== v) img.style.visibility = v;
```

Guard every style write with a comparison. Writing the same value is not free, and over ~80 layers at
60fps it is measurable.

## 5. CULLING

Cull in three places:

```ts
// 1. layers behind the camera
if (den <= 0.004) return { ok: false };

// 2. props off screen, with a margin for a 3D-turned stage
const pad = Math.max(vp.vw, vp.vh) * 0.35;
if (cx + w/2*k < -pad || … ) return hide(el);

// 3. individual dabs, before any sprite work
if (px < -ps || py < -ps || px > canvas.width + ps || py > canvas.height + ps) return;
if (alpha <= 0.01 || size <= 0.3) return;
```

The alpha/size rejects come first and are the cheapest; they eliminate most of the field during
transitions.

## 6. DPR MANAGEMENT

```ts
const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
if (canvas.width !== Math.round(vw * dpr)) { canvas.width = …; canvas.height = …; }
```

Cap DPR. On a 3× display, a full-viewport canvas at native DPR is 9× the pixels of a 1× canvas for a
painterly, textured effect that gains almost nothing visually. 1.75 is a good ceiling.

Only resize the canvas when the size actually changes — resizing clears it and reallocates.

## 7. SPRITE CACHING

Tint each (variant, colour) pair once and cache the result:

```ts
const key = `${variant}|${color}`;
let c = this.tinted.get(key);
if (c) return c;
```

Memory is `tints × variants × cellSize² × 4 bytes`:

```text
7 tints × 8 variants × 256² × 4 B ≈ 15 MB
7 tints × 8 variants × 512² × 4 B ≈ 58 MB
```

Keep the cell size at 256 unless you have measured a need on target hardware. Keep the palette small
— every new tint multiplies the cache.

## 8. IMAGE FORMATS AND DIMENSIONS

- **WebP** for all plates and sprites. Broad support, good quality per byte for painterly content.
  AVIF gives smaller files but costs more to decode — for very large plates the decode cost can
  matter more than the transfer.
- **PNG** only where alpha precision matters at small size (the dab atlas, the grain).
- Author each plate at the pixel size it will actually be drawn at, at the largest camera scale it
  ever appears at. Larger is wasted memory; smaller is visibly soft.
- Include overscan beyond the widest and tallest framing of every shot the plate appears in.
- Serve one resolution. Responsive image sets fight the design-space model, which is resolution
  independent by construction.

## 9. LOADING STRATEGY

```ts
// decode everything the first act needs before starting
const settle = (img) => Promise.race([
  (img.complete ? Promise.resolve()
                : new Promise(r => { img.onload = img.onerror = () => r(); }))
    .then(() => img.decode().catch(() => undefined)),
  new Promise(r => setTimeout(r, 2500)),         // background tabs can stall decode()
]);
Promise.all(firstActImages.map(settle)).then(start);

// later acts: lazy, triggered on timeline time, well upstream
if (now > PREWARM_T) loadLaterActs();
```

- Gate on **decode**, not load: an image that has loaded but not decoded still causes a hitch on
  first paint.
- Always race a timeout. `decode()` can hang indefinitely in a background tab.
- Trigger lazy loads on timeline time (works identically in both scroll directions), roughly 100vh
  upstream of first use.

## 10. ANIMATION COST

| Cheap | Expensive |
|---|---|
| `transform`, `opacity` | `width`, `height`, `top`, `left`, `filter` per frame |
| One canvas draw pass | Many DOM elements changing style |
| `mix-blend-mode` on a few layers | `backdrop-filter` on large or many layers |
| Static `box-shadow` | Animated `box-shadow` / `border-radius` |

`backdrop-filter` is the one to watch: it is excellent for a panel veil over a busy room, and
expensive if it covers most of the viewport or appears on several layers at once. Limit it to one or
two elements, and write the filter string only when it changes:

```ts
if (el.style.backdropFilter !== next) { el.style.backdropFilter = next; }
```

## 11. ONE TICKER, ONE TIMELINE

```ts
gsap.ticker.add(tick);                      // exactly one subscriber
```

Do not create per-element ScrollTriggers, per-element tweens, or additional rAF loops. Besides the
determinism argument in `CINEMATIC_SCROLL_ARCHITECTURE.md`, many triggers means many independent
style writes per frame, each with its own bookkeeping.

## 12. REDUCED MOTION AND MOBILE

```ts
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
ScrollTrigger.create({ …, scrub: reduced ? true : 0.7 });
```

Under reduced motion: exact scrub (no residual easing), no CSS transitions on text or buttons.

For a genuine reduced-motion or low-power fallback, the cheapest credible option is a **static
sequence**: render a handful of the film's anchor frames as images and present them as an ordinary
scrolling page. The architecture already names those frames (the freeze labels), so they can be
captured directly.

**Mobile is not a scaling problem.** A portrait viewport crops a 16:9 design frame to roughly a third
of its width, which typically hides the composition's subject. Portrait needs its own camera
composition, portal placement, text boxes and crop strategy — a second edit of the same film. Budget
it, or ship a documented landscape-only experience with a static alternative.

## 13. WHY NOT WEBGL

For this class of work, Canvas 2D plus DOM is enough and costs less:

- The particle count is in the hundreds, not the hundred-thousands.
- The look is painterly and textured — pre-rendered brush sprites beat procedural shading.
- Text stays real text.
- No shader compilation, no context-loss handling, no fallback path.
- It debugs with normal browser tools.

Reach for WebGL when you need thousands of simultaneous particles with per-pixel lighting, real 3D
geometry, or post-processing that cannot be faked with a blended DOM layer. A 2.5D painted world with
a few hundred dabs is none of those.

## 14. A PERFORMANCE CHECKLIST

```text
[ ] Plates laid out at natural pixel size
[ ] Only transform/opacity written per frame
[ ] Every style write guarded by a comparison
[ ] will-change only on layers that move every frame
[ ] Canvas DPR capped (≈1.75); resized only on actual change
[ ] Dabs culled by alpha, size and bounds before any sprite work
[ ] Tinted sprites cached; palette small; cell size measured
[ ] All images WebP (PNG only for the atlas and grain)
[ ] First-act images decode-gated with a timeout race
[ ] Later acts lazy-loaded on timeline time, upstream
[ ] backdrop-filter limited to one or two elements
[ ] Exactly one ticker subscriber and one timeline
[ ] prefers-reduced-motion path implemented
[ ] Mobile/portrait decision made explicitly and documented
```

## 15. WHICH KERINTI FILES IMPLEMENT THESE

| Concern | File |
|---|---|
| Natural-pixel-size plate layout | `lib/prototype/sceneConfig.ts → fitPlate` (with the rationale in its comment) |
| Render loop, DPR cap, guarded style writes, visibility toggling | `components/prototype/PortalFilm.tsx → render` |
| Decode gating with timeout race, lazy act loading | `components/prototype/PortalFilm.tsx` |
| Dab culling, sprite cache, memory notes | `lib/prototype/moduleField.ts`, `lib/prototype/sceneConfig.ts → DAB_ATLAS` |
| Prop culling with a margin for the turned stage | `components/prototype/Chapter5Layers.tsx → place()`, `Chapter4Layers.tsx` |
| backdrop-filter used sparingly, written only on change | `components/prototype/Chapter4Layers.tsx` (surface veil) |
| Reduced-motion branch | `components/prototype/PortalFilm.tsx`, `app/globals.css` |
| Build-time checks | `npm run typecheck`, `npm run build`, `npm run check:launch` |
