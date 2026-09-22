# Closing — Camera and Timing

Pacing values for Pattern C, and the reasoning that lets them be re-derived for a different act
length.

---

## 1. THE SCROLL BUDGET

Reference: **565vh** (5.65 timeline units), four beats.

| Beat | Share | Reference span | vh |
|---|---|---|---|
| k1 Return to the brand world | 35% | 2.00 units | 200 |
| k2 Company | 22% | 1.25 units | 125 |
| k3 Team | 16% | 0.90 units | 90 |
| k4 Final CTA / code | 27% | 1.50 units | 150 |

Beat lengths decrease then rise again for the finale. The shrinking middle is what makes the act feel
like it is closing; the longer final beat is what gives the payoff room.

## 2. THE DECELERATION PRINCIPLE

The camera's energy must decrease beat by beat:

```text
k1   pull-back over a city, 3 waypoints, large distance      ← the widest move of the film
k2   diagonal descent, 3 waypoints, medium distance
k3   one small push, no waypoints                            ← the quietest
k4   rise through 4 waypoints, then STOP and never move again
```

Beat 4 is an exception that proves the rule: it travels, but it travels *to a rest position* and
settles at 47% of the beat, leaving 53% of the act's final beat with a completely still camera.

Measured as "scroll with a moving camera":

| Beat | Camera moving | Camera still |
|---|---|---|
| k1 | ~66% | ~34% |
| k2 | ~46% | ~54% |
| k3 | ~35% | ~65% |
| k4 | ~47% | ~53% (all at the end) |

## 3. CAMERA MOVES, IN ORDER

| # | Move | Beat / span | Type | Waypoints |
|---|---|---|---|---|
| 1 | Pull-back to the brand sky | k1, 6–66% | `travel`, smoothstep, 24 samples | workplace → city pull → brand sky |
| 2 | Diagonal descent into the studio | k2, 6–46% | `travel` | brand sky → tower face → studio wide |
| 3 | Push to the team | k3, 5–40% | `look`, `sine.inOut` | — |
| 4 | Rise to the final sky | k4, 5–47% | `travel` | team desk → studio wide → tower rise → final sky |

All four interpolate `[x, y, log z, yaw, pitch, roll]` along a Catmull-Rom spline through named
shots, baked as keyframes so the path stays a pure function of scroll.

## 4. CHANNEL TIMING

As fractions of each beat.

### k1 — Return

| Channel | Start | Duration | Ease | Note |
|---|---|---|---|---|
| previous act's copy → out | 0% | 5% | `power1.in` | **first**, before anything else |
| panel → 0, `dissolve` → 1 | 2% | 20% | `sine.inOut` | the frame empties |
| camera travel | 6% | 60% | smoothstep | only now |
| `night` → 1 | 6% | 46% | `sine.inOut` | warm recedes, cool returns |
| `k5` → 1 | 12% | 56% | `sine.inOut` | modules rise into the sky |
| copy block 1 → in | 68% | ~10vh | `power1.out` | after arrival |

### k2 — Company

| Channel | Start | Duration | Ease |
|---|---|---|---|
| copy block 1 → out | 3% | ~7vh | `power1.in` |
| camera travel | 6% | 40% | smoothstep |
| `markDim` → 1 | 10% | 30% | `sine.inOut` |
| copy block 2 → in | 50% | ~10vh | `power1.out` |

### k3 — Team

| Channel | Start | Duration | Ease |
|---|---|---|---|
| copy block 2 → out | 3% | ~7vh | `power1.in` |
| camera push | 5% | 35% | `sine.inOut` |
| copy block 3 → in | 44% | ~10vh | `power1.out` |

### k4 — Final

| Channel | Start | Duration | Ease | Note |
|---|---|---|---|---|
| copy block 3 → out | 2% | ~7vh | `power1.in` | |
| `markDim` → 0 | 4% | 20% | `sine.inOut` | the carried mark returns |
| camera travel | 5% | 42% | smoothstep | **settles at 47%** |
| `k5` → 2 | 24% | 36% | `sine.inOut` | assembly; mostly on a still camera |
| `qr` → 1 | 38% | 26% | `sine.inOut` | card + crisp code |
| `calm` → 1 | 42% | 32% | `sine.inOut` | ambience winds down |
| CTA copy → in | 58% | ~10vh | `power1.out` | stays to the end |
| **hold** | 74% | 26% | — | explicit empty tween |

## 5. RULES ENCODED IN THOSE TABLES

1. **Copy always leaves before the camera moves.** Every beat begins with an exit at 2–3% and the
   camera at 5–6%.
2. **Copy always enters after the camera stops.** 44–68% in every beat.
3. **The source frame resolves before the move.** In k1 the panel dissolves (2–22%) before the travel
   (6–66%) has gone anywhere meaningful.
4. **The assembly happens on a still camera.** Camera settles at 47%, assembly runs 24–60%, the card
   38–64%.
5. **Every beat ends with slack.** The last channel in each beat finishes before the beat does.
6. **The terminal hold is a quarter of the final beat.**

## 6. TEXT IN / OUT DURATIONS

Copy uses fixed **scroll** durations, not fractions of a beat:

```ts
tl.to(st, { [key]: 1, duration: 0.10, ease: 'power1.out' }, pos(beat, inF));   // ≈10vh in
tl.to(st, { [key]: 2, duration: 0.07, ease: 'power1.in'  }, pos(beat, outF));  // ≈7vh out
```

Fixed scroll distances mean copy reads at the same rate everywhere in the film, regardless of how
long the beat is. Entry is slower than exit — copy should arrive gently and leave decisively.

## 7. AMBIENCE VS CALM

Everything ambient is multiplied by `calm`:

```ts
const calm = 1 - 0.8 * st.calm;          // props, runners
const calmField = 1 - 0.7 * st.calm;     // module drift and twinkle
```

Never to zero. The residual 20–30% is what keeps the final frame alive.

The vignette meanwhile *increases*:

```ts
vignetteOpacity = 0.75 * st.night + 0.2 * st.calm;
```

Motion down, framing up. Together they say "rest here".

## 8. HOW TO RESCALE

1. Pick the total from 4 beats × 90–200vh.
2. Apply the shares in §1; keep the shrink-then-grow shape.
3. Keep every copy in/out at a fixed ~10vh / ~7vh.
4. Keep the "camera settles before the payoff" relationship: the final camera move must end at or
   before the midpoint of the final beat.
5. Keep the terminal hold at ~25% of the final beat.

## 9. WHICH KERINTI FILES CARRY THESE VALUES

| Value | File |
|---|---|
| Beat durations, all tween positions and eases, `travel`, `look`, `text` helpers | `lib/prototype/chapter5/timeline.ts` |
| `CH5_START = CH4.end`, `CH5.end`, freeze labels | `lib/prototype/chapter5/timeline.ts` |
| Named camera shots | `lib/prototype/chapter5/geometry.json → camera` |
| Shared shot helpers (`shotVars`, `pathAt`, `lookB`) | `lib/prototype/chapter4/timeline.ts` |
| `calm` / `night` applied to ambience and vignette | `components/prototype/Chapter5Layers.tsx`, `lib/prototype/moduleField.ts → drawAmbient5` |
| Act scroll budget | `lib/prototype/sceneConfig.ts → CHAPTERS` (`kerinti-finale`, 565vh) |
