# Opening — Camera and Timing

Concrete pacing values for Pattern A, and the reasoning behind each one, so they can be re-derived
for a different act length.

---

## 1. THE SCROLL BUDGET

Reference: **440vh** for the whole opening (4.40 timeline units at 1 unit = 100vh).

That is a deliberate choice, not a minimum. The opening has five semantic beats. At roughly 90vh per
beat, a reader scrolling at a typical 60–120vh per flick sees each beat as a distinct moment. Below
about 60vh per beat, beats blur into each other; above about 200vh, the act starts to feel like it is
waiting for the reader.

To rescale for a different act length, keep the **proportions**, not the absolute values.

| Beat | Share | Reference span | vh |
|---|---|---|---|
| 1 Atmosphere + assembly | 30% | 0.00 → 1.30 | 130 |
| 2 Finder activation | 11% | 1.30 → 1.80 | 50 |
| 3 Approach + crossing | 18% | 1.80 → 2.58 | 78 |
| 4 Arrival + settle | 17% | 2.58 → 3.32 | 74 |
| 5 Descent + landing + hold | 24% | 3.32 → 4.40 | 108 |

## 2. CAMERA MOVES, IN ORDER

| # | Move | Span | Ease | Values |
|---|---|---|---|---|
| 1 | Slow lean toward the finder | 0% → 41% of the act | `sine.inOut` | zoom ×1.16; centre drifts ~40 units left, ~34 down |
| 2 | Align to frame centre | 41% → 55% | `power2.inOut` | centre → (960, 540) |
| 3 | The push | 41% → 59% | `power2.inOut` | portal size 110 → 7000 units (≈64×) |
| — | **world switch** | 59% | instant | under full cover |
| 4 | Arrival pull-back | 59% → 76% | `power2.inOut` | portal size → 360 (destination rest) |
| 5 | Table re-frame | 75% → 98% | `sine.inOut` | zoom ×1.14 toward the table |
| — | **hold** | 97% → 100% | — | nothing animates |

Observations worth carrying over:

- **Move 1 and move 3 are the same gesture.** The lean does not stop before the push; the push is the
  lean accelerating. One continuous camera from the first frame to the threshold.
- **Alignment finishes before the push peaks.** Centring completes at ~55%, the push at ~59%. The last
  stretch is purely axial.
- **The pull-back is as long as the push.** 17% vs 18%. This is the ratio that makes a crossing land.
- **Only two of the five beats contain a large camera move.** Beats 1, 2 and 5 are nearly static.

## 3. THE ZOOM CURVE

Always tween `log(size)`:

```ts
tl.to(st, { logS: Math.log(PEAK_SIZE), duration: D, ease: 'power2.inOut' }, T);
```

`PEAK_SIZE = 7000` design units against a 1920-unit-wide design frame means the portal square is
about 3.6× the frame width at the switch — comfortably covering every aspect ratio from 4:3 to 21:9.
Do not compute the peak from the viewport at runtime; pick a constant that covers the widest ratio
you support, and verify with the cover predicate.

## 4. SECONDARY CHANNEL TIMING

| Channel | Start | Duration | Ease | Note |
|---|---|---|---|---|
| `textIntro → 2` | 2% | 10% | `power1.in` | headline leaves early; the field is the subject |
| `assemble → 1` | 3% | 30% | linear | staggered per module; the stagger is the easing |
| `textSmall → 1` | 23% | 6% | `power1.out` | second line, over the assembling field |
| `textSmall → 2` | 34% | 5% | `power1.in` | out before the finder lights |
| `glow → 0.6` | 25% | 16% | `sine.inOut` | first warm colour |
| `aperture → 0.42` | 30% | 11% | `sine.inOut` | light leaks between the core modules |
| `glow → 1` | 41% | 9% | `sine.in` | |
| `aperture → 1` | 41% | 7% | `power1.inOut` | full 5×5 square |
| `goldCarry → 1` | 43% | 10% | `sine.inOut` | subject detaches |
| `flicks → 1` | 46% | 7% | `power1.in` | speed streaks |
| `flare → 1` | 54% | 5% | `power2.in` | fast bloom |
| `world = 1` | 59% | instant | — | **under full cover** |
| `flare → 0` | 59% | 9% | `power1.out` | slow decay past the switch |
| `flicks → 0` | 59% | 8% | `power1.out` | |
| `goldLand → 1` | 71% | 11% | `sine.inOut` | released into the beam |
| `settle → 1` | 77% | 19% | linear | staggered |
| `goldLand → 2` | 83% | 13% | `sine.inOut` | lands last |
| `textNexa → 1` | 89% | 8% | `power1.out` | after the landing |

## 5. RULES ENCODED IN THAT TABLE

1. **Copy never overlaps a large camera move.** Text is absent from 39% to 89% of the act — exactly
   the span containing the push, the crossing and the arrival.
2. **The flare straddles the switch.** Peak before, decay after. It is the only thing that touches
   the discontinuity.
3. **Nothing new starts during the crossing.** Between 46% and 59%, only flare and flicks change.
4. **The subject detaches before the frame fills**, so the reader sees it leave the code and then
   sees it in flight.
5. **Every beat has slack.** No channel finishes at exactly the beat boundary; each one lands a few
   percent early, producing a hold.

## 6. SCRUB SETTINGS

```ts
scrub: 0.7        // seconds of eased catch-up
scrub: true       // under prefers-reduced-motion
```

0.7s is enough weight that a fling decelerates like a camera and not enough that the frame lags
behind deliberate scrolling. Below ~0.4 the camera feels nervous; above ~1.2 it feels disconnected
from the wheel.

## 7. RESPONSIVE BEHAVIOUR

Everything above is in **design space** (1920×1080), cover-fitted:

```ts
const b  = Math.max(vw / 1920, vh / 1080);
const ox = vw / 2 - 960 * b;
const oy = vh / 2 - 540 * b;
```

So no timing value changes with viewport size. What changes is how much of the design frame is
visible. Keep every composition-critical element inside the intersection of the widest and tallest
supported ratios — in the reference, `x 240…1680, y 135…945`.

Portrait viewports crop that frame to roughly `x 710…1210`, which hides both the code and the
window. Portrait therefore needs its **own** camera composition, portal placement and text boxes — it
is not a scaling problem. Treat it as a second edit of the same film, not a responsive tweak.

## 8. HOW TO RESCALE FOR A DIFFERENT ACT LENGTH

1. Pick the total (vh) from beat count × 70–110vh per beat.
2. Apply the percentage shares in §1.
3. Keep every ease.
4. Keep the approach : crossing : arrival ratio at roughly 2 : 1 : 2.
5. Re-verify the cover predicate at the switch time, and the hold length at the end.

## 9. WHICH KERINTI FILES CARRY THESE VALUES

| Value | File |
|---|---|
| Act durations, all tween positions and eases | `lib/prototype/timeline.ts` |
| `WORLD_SWITCH`, `PEAK_SIZE`, chapter labels | `lib/prototype/timeline.ts` |
| Design space, portal rest values, scroll budget per chapter | `lib/prototype/sceneConfig.ts` (`DESIGN`, `PORTAL`, `CHAPTERS`) |
| Scrub setting and reduced-motion branch | `components/prototype/PortalFilm.tsx` |
| Text safe frame and boxes | `lib/prototype/sceneConfig.ts` (`TEXT_FRAME`, `TEXT_BOXES`) |
