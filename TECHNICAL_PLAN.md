# TECHNICAL PLAN — Kerinti Soft Homepage

> Phase 1 planning document. Companion files: `STORYBOARD.md`, `ART_DIRECTION.md`, `COPY_DRAFT.md`.
> Status: **draft for approval** — nothing here is implemented yet.

---

## 1. Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router)** + **React** + **TypeScript** (strict) | Server-rendered content, client-only story engine |
| Styling | **Tailwind CSS** | Design tokens from `ART_DIRECTION.md` §3–4 live in the Tailwind theme and as CSS variables |
| Animation | **GSAP** + **ScrollTrigger** + **`@gsap/react`** (`useGSAP`) | GSAP and all its plugins are free for commercial use, including MotionPathPlugin, CustomEase, SplitText, and ScrollSmoother |
| Extra GSAP plugins | `MotionPathPlugin` (ticket travel), `CustomEase` (camera curves), `SplitText` (headline reveals, optional) | Registered once in `lib/gsap.ts` |
| Motif rendering | **Canvas 2D** (baseline) → optional **WebGL instanced renderer** | See §4 |
| Painted sky animation | **Small WebGL fragment shader** (raw WebGL or `ogl`, ~10KB) | No Three.js / R3F unless a later need justifies it |
| QR generation | `qrcode-generator` (or similar tiny lib) at **build time** | Produces the module matrix for `qr.hero` / `qr.final` |
| Smooth scroll | **Native scroll first**; evaluate ScrollSmoother or Lenis in the prototype | Only adopt if it clearly improves feel without hurting accessibility or mobile |
| i18n | Next.js `[locale]` routes (`/tr`, `/en`) | Copy lives in typed content files |
| Physics libs | **None** | The brief asks to avoid them. Formations are deterministic. |

---

## 2. Component Structure

```
app/
  [locale]/
    layout.tsx                 # fonts (next/font), <html lang>, metadata
    page.tsx                   # SERVER component: renders story DOM + static content
  api/demo-request/route.ts    # (Phase 3) form handler

components/
  story/
    StoryExperience.tsx        # CLIENT root: mounts Stage, builds master timeline, owns matchMedia
    StoryProvider.tsx          # React context: stage refs, motif controller, reduced-motion flag
    Stage/
      Stage.tsx                # position:fixed full-viewport layer stack
      SkyLayer.tsx             # WebGL shader canvas (fallback: static plate <img>)
      PlateLayer.tsx           # parallax painted plates for a world (A or B)
      MotifLayer.tsx           # canvas that renders the Module Field
      PortalMask.tsx           # brush-edged SVG mask used for world transitions
      GradeLayer.tsx           # time-of-day color grade (CSS blend / shader uniform)
      GrainLayer.tsx           # canvas texture overlay
    chapters/
      ch1-intro/
        Ch1Intro.tsx           # DOM text for the chapter (server-renderable markup)
        ch1.timeline.ts        # buildCh1(ctx): gsap.core.Timeline
        ch1.config.ts          # beats, scroll lengths, formation keys
      ch2-portal/ ...
      ch3-nexa/ ...
      ch4-journey/ ...         # (Phase 3)
      ch5-about/ ...           # (Phase 3)
      ch6-finale/ ...          # (Phase 3)
    ui/
      ChapterRail.tsx          # 6-square progress indicator
      SkipLink.tsx             # "Skip to demo"
      MotionToggle.tsx         # user-facing reduce-motion switch
      BrushReveal.tsx          # brush-mask headline reveal helper
    static/
      StaticStory.tsx          # reduced-motion / no-JS layout (key frames + text)

lib/
  gsap.ts                      # plugin registration, defaults, CustomEase definitions
  story/
    storyConfig.ts             # SINGLE SOURCE OF TRUTH: chapters, lengths (vh), labels
    director.ts                # builds master timeline + scroll track from storyConfig
    types.ts                   # SceneContext, ChapterModule, Formation types
  motif/
    ModuleField.ts             # typed-array state for all modules
    formations/                # pure functions: (layout) => Float32Array targets
      scatterStars.ts
      qrHero.ts
      finderDive.ts
      portalWindow.ts
      tableTent.ts
      ...
    morph.ts                   # interpolate between two formations by progress
    renderers/
      Canvas2DRenderer.ts
      WebGLRenderer.ts         # optional upgrade path
    qrMatrix.ts                # build-time generated QR matrices
  hooks/
    useReducedMotion.ts
    useStageSize.ts
  perf/
    deviceTier.ts              # capability detection → 'high' | 'mid' | 'low'

content/
  copy.en.ts
  copy.tr.ts

public/art/
  shared/  (canvas texture, dab atlas, noise)
  world-a/ (plates, flow maps)
  world-b/ (plates, flow maps)
  keyframes/ (static reduced-motion images)
```

### 2.1 Key contract: a chapter module

```ts
// lib/story/types.ts (sketch, not final)
export interface ChapterModule {
  id: 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5' | 'ch6';
  length: { desktop: number; mobile: number };   // in vh units of scroll
  startFormation: FormationKey;
  endFormation: FormationKey;
  build(ctx: SceneContext): gsap.core.Timeline;  // duration MUST equal length (1 unit = 100vh)
}

export interface SceneContext {
  stage: StageRefs;                // DOM/canvas refs of Stage layers
  motif: MotifController;          // morphTo(), setCamera(), highlight()
  world: WorldController;          // setWorld('A'|'B'), portal progress, grade(time)
  text: TextController;            // reveal/hide chapter copy
  tier: 'high' | 'mid' | 'low';
  isMobile: boolean;
}
```

Chapters **never** create their own ScrollTriggers for story motion. They return a timeline, and the **Director** puts it in place.

---

## 3. Animation Architecture

### 3.1 Overall model: "Fixed Stage + Scroll Track + Master Timeline"

```
┌──────────────────────────────────────────────┐
│ Stage (position: fixed, 100svh, z-0)         │  ← all painted layers + Module Field canvas
│   Sky → Plates → Grade → Motif → Grain       │
├──────────────────────────────────────────────┤
│ Story overlay (sticky, z-10)                 │  ← chapter headlines/text for pinned beats
├──────────────────────────────────────────────┤
│ Scroll Track (normal flow)                   │  ← empty spacer sections sized from storyConfig
│   #ch1 220vh | #ch2 140vh | #ch3 180vh | ... │     (also anchor targets for rail / skip link)
├──────────────────────────────────────────────┤
│ Native content (normal flow, z-10)           │  ← About/Team body, contact form, footer
└──────────────────────────────────────────────┘
```

**Why this model**
- The Stage never moves in the DOM, so there are no pin-spacer jumps, nested pins, or layout thrash. Continuity is guaranteed because every chapter draws on the *same* canvas and layers.
- Scroll position maps to **one master timeline progress**, so reverse scrolling is trivially correct.
- Readable content (About, Team, Form) scrolls natively for accessibility and comfortable reading, while the Stage keeps living behind it.

### 3.2 Acts
The storyboard's scroll budget becomes three scrubbed segments:

| Act | Chapters | Driver | Scroll region |
|---|---|---|---|
| **Act I — Cinematic** | Ch1 → Ch5.2 | `masterTimeline` scrubbed by one ScrollTrigger over the Act I track | ~1400vh desktop |
| **Act II — Reading** | Ch5.3 (About/Team) | `backdropTimeline`: a gentle sky pan/drift scrubbed over the native content height | content height |
| **Act III — Finale** | Ch6.1–6.3 | `finaleTimeline` scrubbed over a 140vh track, followed by native form/footer | 140vh + native |

Each act's first state is exactly the previous act's last state (§3.4).

### 3.3 Master timeline composition (Director)

```ts
// lib/story/director.ts (sketch)
const UNIT = 1; // 1 timeline second = 100vh of scroll

export function buildActI(ctx: SceneContext, chapters: ChapterModule[]) {
  const master = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  for (const ch of chapters) {
    master.addLabel(ch.id);
    const tl = ch.build(ctx);
    assertDuration(tl, lengthFor(ch, ctx) / 100); // dev-only guard
    master.add(tl, ch.id);
  }
  ScrollTrigger.create({
    trigger: '#act-1-track',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.6,                 // tuned in prototype; small lag = cinematic smoothness
    animation: master,
    onUpdate: (self) => ctx.rail.set(self.progress),
    invalidateOnRefresh: true,
  });
  return master;
}
```

- The **scroll track heights** are generated from the same `storyConfig` lengths, so track and timeline always agree.
- Labels allow `ScrollTrigger.labelToScroll` for the chapter rail and skip links.
- `scrub` is a number (a smoothing lag), not `true`, which gives a camera-like feel.
- Easing lives **inside** chapter tweens (e.g., the Ch2 camera `power3.in` → `power3.out`), because scroll itself is linear.

### 3.4 Continuity enforcement
Continuity is the heart of the brief, so it is enforced in code, not only by discipline:

1. **Formations are pure functions.** `formation(layout) → Float32Array` of targets (x, y, size, rotation, hue, opacity, depth) for every module.
2. **Morphs only between declared keys.** A chapter declares `startFormation` / `endFormation`, and the Director asserts `ch[n].endFormation === ch[n+1].startFormation`.
3. **Single morph proxy.** GSAP never tweens 775 objects. It tweens **one proxy** `{ from, to, t }`, and the renderer interpolates typed arrays each frame. This is cheap, reversible, and deterministic.
4. **World and camera state are explicit.** Stage state (`camera {x,y,z}`, `world`, `portal`, `timeOfDay`, `gold target`) lives in one serializable object. Every chapter tweens that object, so any scroll position can be reproduced.
5. **Dev tool: boundary scrubber.** A debug overlay (`?debug=story`) shows the current label, formation keys, and a button to jump ±1px across each chapter boundary to check for visual pops.

### 3.5 Module Field morphing detail
- Each module has a **stable identity** across all formations: module #i in the QR is the same dab that later becomes a menu tile fragment, a ticket line, a bar segment, and so on. That is what makes transformations feel physical.
- **Assignment strategy:** when formations have different counts, modules not needed go to an *ambient* pool (drifting motes/stars) instead of disappearing. Assignments are precomputed with a nearest-neighbor sort to avoid crossing paths.
- **Paths:** interpolation adds a per-module curved offset (a quadratic bezier control point from a seeded noise function) so modules sweep instead of sliding linearly.
- **Stagger:** per-module delay from a stagger map (e.g., finder squares first in `qr.hero`), implemented as a remap of `t` per module: `ti = clamp((t - delay_i) / span)`.
- **Camera:** a 2.5D camera (translate + scale + depth-based parallax factor per module) handles the Ch2 dive and Ch4 camera travel.

### 3.6 Portal transition (Ch2, Ch4→Ch5)
- World B's layers render into a container that is **masked by `PortalMask`**: an SVG `<mask>` holding a brush-edged square image, positioned on the finder square's screen rectangle.
- Mask growth uses `transform: scale()` on the mask content (GPU-friendly), not `clip-path` path recomputation.
- World A layers get the matching inverse scale/translate so the camera push is consistent across both worlds.
- **Pre-warm:** World B textures are decoded (`img.decode()` / GPU upload) during Ch1 so the first frame of the portal never stutters.
- The high-tier alternative does the mask inside the WebGL sky compositor with a painted edge texture. It is decided in the prototype after measuring.

### 3.7 Text choreography
- Chapter copy lives in the DOM inside a sticky overlay. The text controller exposes `reveal(id)` / `hide(id)` tweens that the chapter timeline places.
- Brush-mask reveal: CSS `mask-image` (a brush-stroke PNG) with animated `mask-position`. It is cheap and not tied to per-letter DOM.
- Hidden text is `visibility: hidden` + `aria-hidden` when fully out. All copy remains in the SSR HTML for SEO.

### 3.8 Avoiding the brief's anti-patterns

| Anti-pattern | Guard |
|---|---|
| IntersectionObserver-triggered one-off animations | None used for story motion. Everything is scrubbed from the master timeline. |
| Independent section animations | Chapters can't create ScrollTriggers. The Director owns all of them. |
| Fade-only transitions | Code review checklist + continuity checklist (`STORYBOARD.md` §4) |
| Slide-like behavior | No snapping by default. Optional very soft `snap` to chapter labels only at rest, evaluated in the prototype. |

---

## 4. Rendering Strategy: SVG vs Canvas vs Images vs WebGL

| Layer | Technology | Why |
|---|---|---|
| **Painted plates** (interiors, horizons) | `<img>` / CSS layers with AVIF/WebP, transformed with `translate3d`/`scale` | Best quality per byte; GPU-composited; easy parallax |
| **Animated sky** | **WebGL fragment shader** on one fullscreen canvas: flow-field UV distortion of a painted base texture + stroke-direction map + palette uniforms | Lets the painted sky actually *move* in brushstroke directions cheaply. Rendered at 0.5–0.75× resolution and upscaled; the painterly look hides it. |
| **Sky fallback** (low tier / reduced motion) | Static plate image | Zero cost |
| **Module Field** | **Canvas 2D**: `drawImage` from a tinted dab atlas, ≤ ~900 draws/frame | Easily 60fps on mid devices; simple to debug. Upgrade to **WebGL instancing** only if profiling demands it. |
| **Portal mask** | SVG mask + brush-edge PNG, scaled via transform | Crisp painted edges, GPU transforms |
| **Flow-line (Ch4)** | SVG path with a painted stroke texture via `pattern`, drawn with `stroke-dashoffset`; ticket moves with `MotionPathPlugin` along the same path | Path doubles as animation guide and visual |
| **Painted UI objects** (menu, ticket, KDS, POS, ledger) | DOM elements with painted background images + real text | Legible, accessible, translatable, crisp |
| **Chart columns** | Module Field (dabs stacked) | Continuity: bars are made of modules |
| **Grain** | Single tiled PNG with `mix-blend-mode: soft-light` | Cheap |
| **Final QR** | Module Field, crisp mode (high contrast, minimal rotation) + a hidden accessible `<a>` link | Must scan (§6.3) |

**Render loop**
- One shared `gsap.ticker` callback renders sky + motif **only when state is dirty** (scroll moved, idle breath active, resize).
- Idle "breathing" runs at a reduced rate (e.g., 30fps) and stops entirely when the tab is hidden or the Stage is covered by opaque native content.

---

## 5. Asset Strategy

### 5.1 Asset list (full site)

| Group | Assets | Format | Size target |
|---|---|---|---|
| Shared | canvas texture, dab atlas (16 dabs), noise tex, brush mask strokes (4) | PNG/WebP | ≤ 300KB total |
| World A | night sky base, flow maps (Ch1, Ch2, Ch5, Ch6 variants), horizon plate, skyline plate | AVIF + WebP fallback | ≤ 900KB total desktop |
| World B | restaurant cross-section plates (tiled), light beam, table near-plate, painted UI surfaces, flow-line texture | AVIF + WebP | ≤ 2.2MB total desktop, lazy by chapter |
| Key frames | 6 static images for reduced-motion/no-JS | AVIF + WebP, responsive `srcset` | ≤ 250KB each |

### 5.2 Loading plan
1. **First paint:** HTML text + CSS gradient approximating the night sky (instant) → small sky base (≤150KB) → shader starts.
2. **Idle after load:** Module Field atlas, horizon plate.
3. **During Ch1 (progress > 30%):** preload and `decode()` World B plates for Ch2–Ch3.
4. **During Ch3:** preload Ch4 assets in order of beats.
5. **Before Ch4 ends:** preload skyline/Ch5 assets.

All preloading is driven by master timeline progress (via callbacks on labels), respects `navigator.connection.saveData`, and uses mobile-specific crops.

### 5.3 Responsive art
- Desktop plates at 2560w; tablet at 1600w; mobile at **portrait crops** (1080w, recomposed, not just scaled), with separate flow maps where compositions differ.
- `next/image` is used for static key frames. Stage plates are managed manually (precise decode/preload control).

### 5.4 Prototype placeholders (Phase 2)
- Sky: procedural shader with generated noise flow, no painted base required.
- Restaurant: 3–4 simplified painted placeholder layers (blockouts with texture).
- Dab atlas: generated procedurally (noise-shaped square masks) until final art exists.

---

## 6. Special Technical Topics

### 6.1 Reduced motion & accessibility
- **Baseline is static.** `page.tsx` server-renders `StaticStory` (key frames + all copy, semantic headings). The client story engine *enhances* it only when:
  - JS is available, **and**
  - `prefers-reduced-motion` is not `reduce`, **and**
  - the user hasn't chosen "Reduce motion" (stored in `localStorage`, wrapped in try/catch).
- `gsap.matchMedia()` contexts for `(prefers-reduced-motion: reduce)` automatically revert all story animations if the preference changes live.
- Headings form a correct outline (H1 in Ch1, H2 per chapter). Canvases are `aria-hidden="true"`.
- **Skip link** ("Skip to demo request") is the first focusable element.
- Keyboard: focusing a CTA or link inside a pinned region scrolls to its chapter label; focus is never trapped behind the Stage.
- Contrast is tested on real frames (sampled backgrounds under text), not only on tokens.

### 6.2 SEO
- All copy is in server HTML. Painted UI text is DOM text.
- Structured data: `Organization` (Kerinti Soft) + `SoftwareApplication` (NeXa).
- `hreflang` for `/tr` and `/en`.

### 6.3 Functional QR (Ch6)
- The matrix is generated at build time from the demo URL with **error correction level Q or H**, so the painterly irregularity stays within tolerance. Keep the encoded URL short (e.g., `kerinti.com/demo`): at ECC H, Version 2 holds only 14 bytes, so the final QR will likely be Version 3–4 (29×29 / 33×33). The Module Field pool must be sized for that.
- Crisp mode rules: module rotation ≤ 3°, fill coverage ≥ 85% of cell, contrast between dab and background ≥ 7:1, quiet zone of 4 modules kept clear of sky texture.
- Verified with real phone cameras (iOS + Android native camera apps) under several screen brightness levels before launch.

### 6.4 Resize and refresh
- `ScrollTrigger.config({ ignoreMobileResize: true })` avoids refreshes on mobile URL-bar show/hide.
- Stage uses `100svh`; layout recalculations are debounced; formations are recomputed from the new viewport (they are functions of layout).
- `invalidateOnRefresh` on all triggers; function-based values for anything viewport-dependent.

### 6.5 Next.js specifics
- `StoryExperience` is a client component loaded with `dynamic(..., { ssr: false })` *after* the static baseline renders, which keeps LCP on server HTML.
- GSAP registered once in `lib/gsap.ts`; all animation code is inside `useGSAP` scopes for automatic cleanup (important for React Strict Mode double-mount and route changes).
- Fonts via `next/font` (Fraunces, Inter Tight) with `subsets: ['latin', 'latin-ext']` for Turkish characters, `display: 'swap'`.

---

## 7. Performance Considerations

### 7.1 Budgets

| Metric | Target |
|---|---|
| LCP (desktop / mobile 4G) | < 2.0s / < 2.5s |
| CLS | < 0.05 |
| INP | < 200ms |
| Initial JS (story engine, gzip) | < 90KB (GSAP core + ScrollTrigger ≈ 40KB) |
| Scroll frame rate | 60fps desktop mid-tier; ≥ 50fps mid-range Android |
| Main-thread work per frame | < 8ms |

### 7.2 Techniques
- **Device tiers** (`deviceTier.ts`): combine `hardwareConcurrency`, `deviceMemory`, a WebGL capability probe, and a first-seconds frame-time sample.
  - `high`: WebGL sky, full module count, DPR up to 2
  - `mid`: WebGL sky at 0.5×, ~70% ambient modules, DPR 1.5
  - `low`: static sky plates, QR-only modules, DPR 1, fewer parallax layers
- Animate only `transform` and `opacity` on DOM; everything else goes into canvas/WebGL.
- Canvas: pre-tinted dab sprites cached per palette key; no per-frame `shadowBlur`; batch by atlas.
- Typed arrays for module state; zero allocations inside the render loop.
- Limit `will-change` to Stage layers only, and only while Act I is active.
- Pause the render loop on `visibilitychange` and when Act II content fully covers the Stage.
- Monitor in the prototype with Chrome Performance panel + a small in-page FPS/debug overlay (dev only).

---

## 8. Mobile Adaptation Approach

Desktop-first design, deliberately *re-directed* for mobile rather than shrunk.

| Aspect | Desktop | Mobile (≤ 768px) |
|---|---|---|
| Scroll lengths | Storyboard values | ~70% (from `length.mobile` in config) |
| Composition | Landscape, text left/right third | Portrait crops; text top or bottom third; QR/object in the other |
| Module count | ~775 | QR modules (625) + ~60 ambient |
| Sky | Shader | Shader at 0.5× (mid tier) or static plate (low tier) |
| Parallax layers | 4–5 | 2–3 |
| Pointer effects | Gentle parallax, QR hover lift | None |
| Ch4 margin notes | In-world annotations | Reduced to one per beat, shorter labels |
| Ch4 camera | Pans across a wide cross-section | Mostly vertical travel (restaurant cross-section re-stacked vertically) |
| Scrub smoothing | `scrub: 0.6` | `scrub: 0.3–0.4` (touch already has momentum) |
| Portal | Full mask dive | Same concept, simpler edge texture |

Implementation: `gsap.matchMedia()` with conditions `{ isDesktop, isMobile, reduceMotion }`. Chapters receive `ctx.isMobile` and choose layout functions. **Formations and timelines stay structurally identical**, and only parameters differ, so the story is the same everywhere.

Mobile-specific cautions:
- Test `ScrollTrigger.normalizeScroll()` only if iOS address-bar jitter appears. It is not on by default.
- Never rely on hover; tap targets ≥ 44px; the CTA stays reachable with a small sticky button after Ch3 on mobile.

---

## 9. Phase 2 Prototype Plan (Ch1–Ch3) — for approval

### 9.1 Scope
- Project scaffold (Next.js, TS, Tailwind, GSAP, lint/format)
- Stage + Director + storyConfig architecture (the real one, not throwaway)
- Module Field with formations: `scatter.stars`, `qr.hero`, `qr.finderDive`, `portal.window`, `qr.tableTent`
- Procedural painted sky shader (World A) + static/placeholder World B plates
- Portal mask transition
- Ch1–Ch3 text with brush reveals (EN, with TR toggle to test length)
- Chapter rail, skip link, reduced-motion static baseline for Ch1–Ch3
- Desktop + mobile layouts for the three chapters
- Debug overlay (`?debug=story`)

### 9.2 Out of scope for prototype
Ch4–Ch6, final illustrations, form handling, CMS, analytics, full i18n routing polish.

### 9.3 Acceptance criteria
1. Scrolling from top to the end of Ch3 and back shows **no visual pops** at chapter boundaries.
2. The QR is recognizably the same object in Ch1, Ch2 (portal), and Ch3 (table tent).
3. The portal feels like a camera move through a window, not a crossfade.
4. ≥ 55fps average during Ch1–Ch3 scroll on a mid-range laptop and a mid-range Android phone.
5. Reduced-motion mode shows readable static key frames with all copy.
6. Lighthouse (mobile): Performance ≥ 85, Accessibility ≥ 95.
7. Stakeholders confirm the painterly direction and QR motif before Phase 3 art production starts.

### 9.4 Suggested milestones
| Step | Output |
|---|---|
| P2.1 | Scaffold + Stage + Director + debug overlay, with dummy colored formations |
| P2.2 | Module Field renderer + Ch1 formations + sky shader |
| P2.3 | Ch2 portal (mask, camera, pre-warm) |
| P2.4 | Ch3 World B placeholder plates + table tent formation |
| P2.5 | Text, rail, reduced-motion baseline, mobile pass, performance pass → review |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Illustration production is the long pole | Prototype with procedural skies + placeholders; lock art direction early with one "hero frame" per world |
| Painterly textures hurt text contrast | Designed glaze zones; contrast tests on real frames |
| Scroll length feels exhausting | Scroll budget in config; user testing in the prototype; chapter rail + skip link |
| Mobile performance | Device tiers, fewer modules, static sky fallback, shorter tracks |
| Stylized final QR doesn't scan | ECC level H, crisp mode, real-device tests |
| Scope creep in Ch4 | Fixed seven beats; secondary features as margin notes only |
| Visual resemblance to reference sites/paintings | Originality review gate (`ART_DIRECTION.md` §6.3) at each art milestone |
