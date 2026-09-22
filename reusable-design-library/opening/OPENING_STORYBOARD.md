# Opening Storyboard

Shot by shot. Timing is given as a **proportion of the opening act**; the reference implementation's
absolute timeline values appear in brackets for cross-checking against the source only.

Reference act length: 440vh = 4.40 timeline units (1 unit = 100vh).

```text
Beat 1 — Atmosphere & assembly     30%
Beat 2 — Finder activation         11%
Beat 3 — Approach & crossing       18%
Beat 4 — Arrival & settle          17%
Beat 5 — Descent & landing         24%
```

---

## BEAT 1 — ATMOSPHERE & ASSEMBLY · 30% [t 0.00 → 1.30]

**Visual state.** A nocturne: deep cobalt sky plate far behind, a low horizon plate, a field of
scattered pale modules twinkling at mixed depths. Nothing is legible as a shape yet.

**Camera.** A single slow lean toward the upper-right region where the code will form. Zoom rises
about 16% over the whole beat, on `sine.inOut`. The move spans beats 1 and 2 as one gesture — the
camera never restarts.

**Modules.** From ~10% of the beat, the code-bearing modules fly from their scattered positions to
their cells. Per-module stagger derived from **distance to the nearest finder corner**, so the three
finder squares resolve first and the data field sweeps in from them. Each flight arcs
(`sin(πe) * curve`) and the module shrinks/grows into its cell size. Free modules twinkle; the
twinkle damps to zero as they land.

**Text.** The main headline block is already on screen at t = 0 and leaves at ~10% of the beat, on an
`power1.in` exit. A second short line enters at ~78% and leaves at the end of the beat.

**Background.** Static plates; parallax only, from the camera lean.

**Transition trigger.** Assembly completes (`assemble → 1`) before the beat ends, leaving a genuine
hold on the finished code.

**Destination state.** A legible code, still, in the upper-right of frame.

---

## BEAT 2 — FINDER ACTIVATION · 11% [t 1.30 → 1.80]

**Visual state.** The code is complete. Warm light begins to leak from behind the top-left finder
square — the first warm colour in a cool world.

**Camera.** Still leaning in, same gesture, no new move.

**Modules.** Static in the code. The finder's 3×3 gold core reads as a distinct colour from the rest.

**Text.** The second line exits at the start of this beat. From here to the end of the crossing there
is **no copy at all**.

**Background.** A radial warm glow sprite behind the finder, opacity rising to ~0.6. Its size is tied
to the portal square, and it fades out as the square grows past ~3000 design units, so it does not
become a full-screen wash.

**Transition trigger.** `aperture` opens to ~0.42 — the source world's container gains a hole punched
exactly at the finder's inner square, through which the destination world's plate is already visible.

**Destination state.** A code with a lit, open square in its corner. The reader can see something on
the other side.

> The aperture hole is drawn as an **irregular, brushy path** (points pushed outward by up to 7% with
> a seeded RNG), never a perfect rectangle. A clean rectangular hole reads as a UI element; a brushy
> one reads as light between painted modules.

---

## BEAT 3 — APPROACH & CROSSING · 18% [t 1.80 → 2.58]

**Visual state.** The aperture grows from ~110 design units to ~7000 — a 60× push. The destination
interior fills more and more of the frame. Painted speed flicks streak outward from the centre.

**Camera.** `logS → log(7000)` on `power2.inOut`, while the square's centre moves to dead centre of
frame (`px, py → 960, 540`) on `power2.inOut` over the first third. **Alignment happens before the
final acceleration**, so the last stretch is a pure axial push.

**Modules.**
- The finder ring modules hold their cells (they are about to become the window frame).
- The gold core detaches: `goldCarry → 1` over the first ~25% of the beat, moving them to a fixed
  screen-space formation around the centre. They are now travelling *with the camera*, not with the
  world.
- Speed flicks (a separate seeded set of elongated dabs) fade in at ~28% and out after the switch.

**Text.** None.

**Background.** `glow → 1`; a full-frame warm flare rises on `power2.in` just before the switch and
falls on `power1.out` just after. Keep it brief and under ~0.8 alpha — it is a light bloom at a
threshold, not a white flash.

**Transition trigger.** The **world switch** is an instant `set(world: 1)` at the moment the portal
square fully contains the viewport:

```ts
portalCovers(st, vp) =>
  px - half <= centreX - halfViewportW && px + half >= centreX + halfViewportW &&
  py - half <= centreY - halfViewportH && py + half >= centreY + halfViewportH
```

At that instant both worlds render an identical frame, so the switch is invisible.

**Destination state.** The camera is inside World B, still at enormous zoom.

---

## BEAT 4 — ARRIVAL & SETTLE · 17% [t 2.58 → 3.32]

**Visual state.** The warm interior. The square just flown through is revealed as a window in the
room's wall, its frame built from the same ring modules that were the code's finder ring.

**Camera.** `logS` and centre ease back to the destination portal's rest values on `power2.inOut`
over ~75% of the beat. This is the **pull-back that gives the crossing a landing** — without it the
arrival feels like being dropped.

**Modules.** Ring modules render at the window-frame cells in the destination's ink colour. Gold
modules still held at camera-carried positions. Dust modules drift in the room.

**Text.** None until the camera has fully stopped.

**Background.** World B plates: back wall, mid-ground, a screen-blend light beam at low opacity, a
near table layer at negative depth.

**Transition trigger.** The camera reaching rest.

**Destination state.** A settled, readable wide shot of the destination interior.

---

## BEAT 5 — DESCENT & LANDING · 24% [t 3.32 → 4.40]

**Visual state.** Gold modules float free in the light beam, then descend with the ambient dust onto
a small object on a table. A code forms on the object's face.

**Camera.** One gentle re-framing toward the table region (~14% zoom increase over ~23% of the act,
`sine.inOut`), then **completely still** for the rest of the beat.

**Modules.**
- `goldLand: 0 → 1` — released from the camera into the beam, drifting (≈ the first fifth of the beat).
- `settle: 0 → 1` — dust and data modules travel from their drift positions to their cells on the
  object's face, staggered by distance from the code's centre.
- `goldLand: 1 → 2` — the gold modules land last, into the object's own finder, and deepen in colour.

**Text.** The destination's copy block enters only after the landing is essentially complete
(~55% into the beat), over ~10% of the act, and stays.

**Background.** Unchanged; ambient dust continues on the wall clock.

**Transition trigger.** None — the act ends on a hold.

**Destination state.** A still frame: warm room, object on the table carrying a code, one block of
copy, nothing moving except dust.

The final ~3% of the act is an explicit empty tween — a **hold with nothing animating**. Budget it
deliberately; it is the frame a fast scroller is most likely to land on.

---

## BEAT BOUNDARIES AS A TABLE

| Beat | Camera | Module channel | Copy | Ends on |
|---|---|---|---|---|
| 1 | slow lean in | `assemble 0→1` | headline out, line in/out | finished code |
| 2 | same lean, continuing | — | none | lit aperture |
| 3 | push 60×, align to centre | `goldCarry 0→1`, `flicks` | none | world switch under full cover |
| 4 | pull back to rest | ring → window frame | none | settled wide shot |
| 5 | one small re-frame, then still | `goldLand 0→1→2`, `settle 0→1` | destination block in, stays | still frame |

## IF YOU MUST SHORTEN IT

Cut in this order: beat 1 assembly duration, then beat 5 descent. Never cut beat 4 (the arrival
pull-back) or the terminal hold — those are what make the crossing legible. A shorter approach in
beat 3 is acceptable; a shorter arrival is not.
