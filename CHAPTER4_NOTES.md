# CHAPTER 4 — One Order, One Day: Implementation Notes

> Phase 4 prototype → 4.1 polish → 4.2 directional rework → 4.3 story restructure → 4.4 continuity repair → 4.5 bug fix, staging repair and visual lift → 4.6 pacing rebalance and operations portal → 4.7 room-based rebuild and fast-scroll clarity → 4.8 cinematic camera, portal grammar and bird's-eye overview → 4.9 final cinematic simplification and visual cohesion → **4.10 order-ticket flow restored, Chapter 4 locked**. Branch `chapter4-prototype`. Chapter 5 is **not** implemented.
> Art is placeholder (see `CHAPTER4_ARTWORK.md`).

## Phase 4.10 — the order ticket is the protagonist again · Chapter 4 LOCK

One visual change, nothing else reopened.

**What changed.** In 4.9 the order crossed the restaurant as a gold light carrying the "7" badge. 4.10 restores
the earlier idea: the **physical order ticket** is the object the camera follows.

| | 4.9 | 4.10 |
|---|---|---|
| table → till (`t1`) | gold pulse with the "7" badge | the same pulse, **light only** — no badge travels between zones |
| till → kitchen (`t2`) | gold "7" spark along the wall to the arch | **the ORDER TICKET**: MUTFAK · 12:41 · MASA 7 · 1 × Köfte · 1 × Ayran · Not: Az acı olsun · QR · masadan geldi |
| extra order (`t4`) | gold "7" spark to the KDS | a small **EK SİPARİŞ ticket** (MASA 7 · + 1 × Künefe) that lands on the kitchen pass under the KDS |

**The `t2` sequence (2.0 units, was 1.8):**

1. `t2` 0 → 0.12 — SOURCE: the camera holds on the till; the Masa 7 row produces the ticket, which slides up out of the screen (drawn in front of it).
2. 0.12 → 0.86 — the camera follows the ticket: `cashierRow → ticketCounter → passThrough → ticketKitchen → kitchenTicket`, over the counter, through the service arch, along the kitchen. The ticket path (`geometry.json → ticket.path`) has **one waypoint per camera waypoint** and is evaluated with the **same Catmull-Rom curve and the same smoothstep** as the camera (`pathAt` is shared), so ticket and camera stay locked: measured, the ticket never leaves the frame and never gets smaller than 219 design px tall.
3. 0.86 → 0.94 — it goes down into the printer's slot.
4. 0.92 → c1 — the printed slip comes out, and the KDS lights Masa 7 with the note (the KDS glow peaks with the print).
5. `c1` — DESTINATION HOLD on `kitchenTicket` (printer + slip + KDS in one frame), copy "Sipariş mutfağa notuyla birlikte ulaşır."

The ticket lives on the wall plane (depth 0): at x ≈ 6000 a depth offset of only −0.06 parallaxes an object ~360
units off its route, which the first 4.10 frames showed. The gold "7" stays on the ticket as a secondary mark next
to MASA.

**Small consequential fixes.** `spark` → `ticket` channel (0 row · 1 lifted · 2 at the printer · 3 in the printer);
`kitchenDeep` and `passApproach` removed (replaced by `ticketCounter`, `ticketKitchen`, `kitchenTicket`); the
`tKitchen` copy box moved to (380, 185) because the KDS now sits top-right of the arrival frame; the extra-order
ticket is cleared off the pass once the camera has left (`e3`). Chapter 4 is **4420vh** (t 4.40 → 48.60).

### Verification (Phase 4.10 lock pass)

| Check | Result |
|---|---|
| Forward / reverse / fast scroll — path independence, 67 channels × 45 checkpoints at Δ0.005, 0.02, 0.4, 1.2, each forward and reverse | **0 differences** |
| Real scroll in the browser (wheel-driven ScrollTrigger scrub): forward through `t2`, fast jump to t 45.8, reverse to t 16.9 and t 14.4 | Ticket lifts, crosses the counter and the arch, lands, prints; after the jump it is gone; in reverse it is back in flight at the right place; before its range it does not exist |
| Ticket outside its valid range (forward, reverse, fling, fling reverse) | **0 samples** for the order ticket (t2 only) and the extra ticket (t4 → e3 only) |
| Masa 7 identity | MASA + 7 on the travelling ticket (≥ 219 design px tall), on the printed slip and on the KDS card |
| Ticket → kitchen handoff | ticket = 3 (inside the printer) at t2 0.95; printer = 1 and KDS Masa 7 card fully on by c1 0.5 |
| Waiter / table staging, payment, management portal, final frame | PASS at `served`, `update`, `paid`, `closed`, `portal-mgmt`, `ops`, `final` |
| Pop scan (4,433 samples × 67 channels) | the single portal cut (t 40.84) + 5 hidden re-anchors — unchanged |
| Copy vs camera motion | 0 px/unit for all 8 blocks |
| Plate coverage, 5 viewports | 0 uncovered probes |
| Chapters 1–3 vs HEAD (`c8e7230`), 880 samples × 15 channels | **0 differences**; no Chapter-4 channel moves before t 4.4. (Revisiting t = 0 exactly after a late seek rounds `logS` by 2·10⁻⁷ in GSAP — identical in HEAD, the known pre-existing artifact) |
| Typecheck / production build | Pass |

**Chapter 4 is locked.** Chapter 5 has not been started.

## Phase 4.9 — final cinematic simplification and visual cohesion

The 4.7/4.8 story is unchanged: same beats, same product facts, same UI states. What changed is the
**transition language**, the **ending**, and the **architecture of the rooms**.

### Portals are special: two in the whole film

| # | Where | Source → destination |
|---|---|---|
| 1 | Chapter 2 (untouched) | QR → finder square → window → **inside the restaurant** |
| 2 | Chapter 4, beat `p2` (`gMgmt`) | the closed table's own green **"Hesap kapandı" tile** → the **management workstation** |

**Removed in 4.9:** `gOrder` (phone → cashier), `gKitchen` (row → kitchen), `gHatch` (hatch → waiter),
`gExtra` (adisyon → cashier), `gBill` (bill → cashier), `gPos` (paid panel → table). Six of the seven 4.8
portals are gone, together with their channels, their frame styles (`phone`, `opening`, `device`, `paper`,
`screen`, `qr`) and their camera cuts. The chapter now contains **exactly one camera cut**, inside portal 2,
while its window covers the whole viewport.

Portal 2 deliberately does **not** reuse the QR/finder visual of portal 1. Its source is the finished order
itself — the status tile standing on Masa 7 — with a green rim and a warm bloom, and it runs the same
emotional grammar: SOURCE → APPROACH → GATEWAY → REVEAL → CROSS → ARRIVAL → SETTLE.

### Everything else is camera travel through one restaurant

`travel()` in `chapter4/timeline.ts` is the whole transition vocabulary: a continuous move along a path of
waypoints, interpolated with Catmull-Rom in look space (target point, orientation, **log** zoom) so a
multi-room move has no kink at a waypoint and keeps its aim point through a 3–4× zoom change.

| Beat | Move | Path | What carries the story |
|---|---|---|---|
| `t1` | table → counter | `scan → tableBack → hatchArch → kitchenPass → zoneCounter` | the send confirmation throws a gold order pulse (`orderPulse`) that runs just ahead of the camera along the ceiling and lands on the cashier screen |
| `t2` | counter → kitchen | `cashierRow → passApproach → passThrough → kitchenDeep` | `spark` leaves the Masa 7 row for the service arch; the camera goes **through** the arch and the ticket is already printing when the kitchen opens up |
| `t3` | kitchen → dining side | `hatchSide → hatchThrough → waiterArrive` | the camera follows the ready dish through the hatch arch onto the waiter's side |
| `d2` | the walk | `waiterArrive → walkMid → table` | low tracking shot beside the waiter; a chair and a plant pass in the foreground |
| `t4` | table → both rooms | `tableWide → hatchArch → bothWide` | a pull-back until counter and kitchen are both in frame, while the addition reaches the row and then the KDS |
| `e3` | back to the table | `bothWide → hatchArch → tableWide` | |
| `t5` | table → payment end | `table → hatchArch → kitchenPass → paymentArrive` | the order's own modules travel with us along the flow line (`orderS` → `pos`) |
| `t6` | payment → table | `payClose → kitchenPass → hatchArch → tableDoneWide` | the green tile is already standing on Masa 7 when we arrive |
| `h5` | workstation → the whole business | `officePull → officeWide → officeLife` | the final pull-back |

Foreground occlusion does the work a portal used to do: `fg-hatch` (the arch pillar), `fg-counter` (the
counter's near edge), `fg-crates`, `fg-rail`, `fg-stools`, `fg-chair`, `fg-plant`. They are film-time gated so
each one is present exactly while the camera passes it.

### Background cohesion — the rooms are one building now

`scripts/art/chapter4-plates.mjs` gained a `SHARED` block and five shared routines that kitchen, counter and
office all call, so the paintings cannot drift apart:

| Shared | What it is |
|---|---|
| `SHARED.plaster` | one warm plaster gradient above the tiling, identical stops in every room |
| `cornice()` | the moulding band directly under the ceiling — the strongest continuity cue between rooms; the office gets the same band at its own ceiling |
| `SHARED.tileA/tileB` + `SHARED.tileTop` | the same glazed teal tile on the kitchen walls **and** behind the counter (and as an accent behind the office desk) |
| `dado()` + `SHARED.wood/brass` | one walnut dado rail with a brass edge at one height, from the kitchen through the counter to the office panelling |
| `terracotta()` | one terracotta floor across kitchen and front of house, with a single wood threshold (brass-edged) marking the service zone |
| `pendantLine()` | the same pendant, at the same height, on one line, in both ground-floor rooms |
| `archOpening()` | **one routine paints both sides of every opening**, so the kitchen side and the counter/dining side of the same wall match exactly |

**Real openings instead of hatches.** `geometry.json → kitchen.hatch` and `kitchen.passWindow` are now
full-height arches (y 300 → 840, springing at `archHead` 430) with a service shelf across them, brighter
than any wall around them, with a dark reveal on each jamb and warm spill into **both** rooms. The camera
travels through them; nothing fades or slides.

**Seams fall on structure.** The kitchen plate is now cut transparent left of the hatch wall
(`cutRect(p, [[p.x, p.y, K.hatchWall[0], …]])`), so the approved Chapter 1–3 dining room owns the image up to
its own wall and the plate seam lands exactly on the arch jamb. At the other end the kitchen plate paints the
first strip of the counter room in the counter room's own materials, so the two paintings meet with no step
in tone.

**Richer, less washed out.** Counter: espresso machine, chalk menu board, tiled splashback, deeper key pool,
stronger shade (`roomShade` 0.56 → 0.62). Kitchen: unchanged warmth plus the shared tile/dado/pendants.
Office: glazed partition with the restaurant's warmth behind it, a desk return carrying a second display, a
cup, dockets, a plant, a stronger lamp pool and `roomShade` 0.66 → 0.78.

### The ending: no bird's-eye, no 2D plan

The 4.8 ending (the section tipping away on its ground line while `plan.webp` swung up into a top-down view
of the restaurant) is **removed completely**: the `orbit` and `plan` channels, `Chapter4Plan`, the plan
painter, `plan.webp`, the hinge maths in `stage3d.ts` and the plan-space `geometry.json → plan` block are all
gone. The report no longer lifts off the monitor and rises through the roof either — `form` 6 → 7 now settles
the day's report **onto the manager's screen** and stays there.

Chapter 4 ends inside the dimensional world:

- `h1` arrive at the workstation (`office`), text `tOps`
- `h2` stok · `h3` cari / e-Fatura, camera moving round to `deskWide` · `h4` rapor (`officePull`)
- `h5` the pull-back to `officeLife` — the manager and the glowing monitor on the upper floor, and the
  restaurant still working underneath: kitchen, chefs, KDS, the counter, the till showing **ÖDENDİ**, the
  waiter. The large **NeXa · Operasyon** panel rises beside it with KPIs, the twelve table states and the
  module row (Siparişler · Masalar · Mutfak · Stok · Cari · e-Fatura · Rapor), and three thin links reach
  **down into the real rooms** it describes (aktif sipariş → the till, mutfakta → the KDS, hesap bekleyen →
  the counter). The same operation, drawn twice — but in the building, not on a plan.
- `h6` the closer, and the Chapter 5 finder square forming quietly bottom-left in screen space.

### Copy (`chapter4/content.ts`)

Seven blocks, one per stage, in plain Turkish, each stating what just happened. `tOrder`, `tPaid`, `tStock`,
`tCari`, `tReport` and `tWhole` were removed; `tTable` now carries the whole QR-ordering idea and `tBill`
carries the payment consequence.

| Key | Eyebrow | Primary | Supporting |
|---|---|---|---|
| `tTable` | MASADAN SİPARİŞ | Her masanın kendi QR kodu var. | Misafir menüyü açar, ürününü seçer ve siparişini kendisi gönderir. |
| `tSystem` | SİPARİŞ SİSTEMDE | Sipariş doğrudan kasaya düşer. | Masa, ürün, saat ve sipariş notu tek ekranda görünür. |
| `tKitchen` | MUTFAK | Sipariş mutfağa notuyla birlikte ulaşır. | Ekip siparişi ekrandan veya fiş üzerinden takip eder. |
| `tWaiter` | SERVİS | Garson sipariş toplamaz; hazır olanı masaya getirir. | — |
| `tExtra` | EK SİPARİŞ | Yeni ürün aynı masanın adisyonuna eklenir. | — |
| `tBill` | HESAP | Misafir hesabı masadan ister. | Kasa talebi görür, ödeme tamamlandığında masa kapanır. |
| `tOps` | OPERASYON TEK YERDEN | Restoranın tüm akışını tek yerden yönetin. | Siparişler, masa durumları, mutfak, stok, cari ve raporlar aynı sistemde. |

Closer: **"Sipariş masadan başlar. / İşletmenin tamamı tek yerden yönetilir."**

**Timing.** Every block appears only after the camera has stopped and leaves before the next move begins.
Measured over the whole chapter, camera speed while a block is fully on screen is **0 px per unit of scroll
for all eight blocks** (4.8 had drift on two of them).

### Length and fast scroll

| | 4.8 | 4.9 |
|---|---|---|
| Chapter 4 | 4880vh (t 4.40 → 53.20) | **4400vh** (t 4.40 → 48.40) |
| Portals inside the chapter | 7 | **1** |
| Camera cuts | 7 | **1** (inside the portal, under full cover) |
| Settled, readable scroll | 44% (4.7 figure) | **57%** |
| Anchor frames (settle ≥ 15vh) | — | **23**, totalling 2494vh |
| Landing on a settled frame when flung at 120vh/frame | 59% (4.7 figure) | **57%** |

The chapter is 480vh shorter than 4.8 and still reads as table → cashier → kitchen → waiter → table →
payment → management under a fling, because each stage is SOURCE HOLD → CAMERA MOVE → DESTINATION HOLD and
the holds are long (72–361vh each).

## Verification (prototype, desktop, Phase 4.9)

Run in node against the real master timeline (`buildFilm`), plus a real browser pass on the dev server.

| Check | Result |
|---|---|
| Path independence (all 67 FilmState channels, 42 checkpoints) at slow Δ0.005, normal Δ0.02, fast Δ0.4, fling Δ1.2, each forward and reverse | **0 differences at every speed** |
| Pop scan (t 4.30 → 48.42, Δt 0.01, 4,413 samples × 67 channels) | 8 isolated jumps: the **single** camera cut at t = 40.64 (px, py, pitch) inside the management portal, plus 5 hidden re-anchors (`ch4` start, `orderS` twice under a surface / off screen, `phone2` and `ops` off screen) |
| Portal cut coverage | At CUT = 0.93 the window has been at the full gate rect since p = 0.86, so it covers the viewport by construction |
| Copy vs camera motion while fully shown | **0 px per unit of scroll for all 8 blocks** |
| Plate coverage — 1920×1080, 1280×800, 1440×900, 2560×1080, 1024×768, 25 probes per sample over the whole chapter | **0 uncovered probes** |
| Chapters 1–3 | `lib/prototype/timeline.ts` untouched; every 4.9 transform is identity while `ch4 < 0.5`; no Chapter-4 channel is non-zero before t = 4.4 |
| Typecheck / production build | Pass |
| Real browser pass (dev server, `?t=<label>` freeze frames) | Run: table, to-cashier, counter, to-kitchen, kitchen, to-waiter, closed, portal-mgmt, ops, final all render as designed |
| Full real-scroll run (slow / normal / fast / reverse) in a visible browser | **Not run** — freeze-frame inspection only |

## Phase 4.8 — cinematic camera, portal grammar, bird's-eye overview

The 4.7 story is unchanged (same beats, same product facts, same UI states). Phase 4.8 changes how it is filmed.

- **Length:** 48.8 units = **4880vh** (4.7: 4010vh), t = 4.40 → 53.20. `CHAPTERS.journey` in `sceneConfig.ts` matches it, so the scroll speed of Chapters 1–3 is unchanged.
- **Beats:** `timeline.ts` (zones Z1–Z7, 7 portals `p1…p7`). Labels for `?t=`: `table scan menu … portal-order counter cashier spark portal-kitchen kitchen … overview`.

### Camera orientation (`lib/prototype/chapter4/stage3d.ts`)

The section is a flat painted plane with depth layers, so until 4.7 every room was seen square-on. In 4.8 the whole
section is a rigid plane in 3D: one projective matrix (CSS `matrix3d` on `[data-wall]`, and the same matrix applied point
by point to the canvas modules) turns it under the camera. Shots in `geometry.json → camera` are
`[x, y, zoom, yaw, pitch, roll]`.

| Zone | Personality | Orientation |
|---|---|---|
| Masa | warm, human height, close to the guest | yaw +4…6°, pitch −2…−3° (slightly down onto the table) |
| Kasa | three-quarter, from the street side; foreground stools + counter edge | yaw −16…−11°, roll −0.6° |
| Mutfak | side-on from the other direction, deeper; foreground rail + crates, second cook | yaw +13…+5° |
| Servis | low tracking shot beside the waiter; chair and plant pass in front | pitch +5° (looking slightly up) |
| Ödeme | three-quarter again, closer | yaw −12…−10° |
| Yönetim | square-on at the monitor, then the camera **rises** | `orbit` 0 → 64° |

`orbit` rotates the section about its ground line (world y = 840) while the floor plan (`plan.webp`, hinged on the same
line, plan coordinates `x = world x`, `d = depth from the back wall`) swings up from edge-on. It is a real hinge: the
building tips away and the floor it stands on comes up under the camera. The section fades 30° → 50° and is removed from
rendering past that (a plane that steep can fold past the eye).

### Portal grammar (`lib/prototype/chapter4/portals.ts`)

Portals only where the context changes. Each one is a real object and runs SOURCE → APPROACH → FRAME → REVEAL → CROSS →
ARRIVAL → SETTLE. The window is the object's projected rectangle under the live camera until p = 0.55, then opens past the
viewport edges (covered from p = 0.86), and the camera behind it is cut at p = 0.93 to exactly the frame the window
already shows. The next place is rendered by a second copy of the world (`<Chapter4Portal>`: plates + `<Chapter4World
inner>`) with its own camera, clipped to the window.

| # | Source object | Frame | Destination (first glimpse → arrival) |
|---|---|---|---|
| p1 `gOrder` | the guest's phone glass (the camera pushes into it; the phone is at table depth, so it really comes up to the lens) | phone bezel | cashier, three-quarter; the Masa 7 row arrives while seen through the glass |
| p2 `gKitchen` | the pass window between counter and kitchen, after the gold spark carries the order from the row to it | wooden opening, warm spill | kitchen from the other side; the ticket prints while seen through it |
| p3 `gHatch` | the service hatch with the ready dish | wooden opening | the waiter waiting on the dining side, low camera |
| p4 `gExtra` | the adisyon on the phone (screen-space surface) | device edge | the same Masa 7 row at the cashier, now "+ Künefe" |
| p5 `gBill` | the bill in the guest's hand | gold paper edge | cashier: "Masa 7 · Hesap istendi" |
| p6 `gPos` | the cashier screen's paid panel (ÖDENDİ) | green screen edge | Masa 7 with "Hesap kapandı" |
| p7 `gMgmt` | the table card's own QR, where the chapter began | gold square | the manager's monitor, from inside Masa 7's "Kapandı ✓" tile outward |

### Movements that are not portals

- the dish tracked down the whole pass from the stove to the hatch (c5)
- the waiter's walk to Masa 7 (d2): low tracking camera; he walks out of the depth of the room (depth −0.04 → −0.2,
  scale 0.74 → 0.8) while a chair and a plant pass in the foreground
- the pull-back over counter and kitchen that shows the addition reaching the KDS (e3), and the glide back to the table (e4)
- the look around the office, the rise over the building and the orbit onto the plan (h1–h5)

### Bird's-eye overview (h5–h6)

The final frame is a high bird's-eye (64°) of the whole ground floor: twelve tables, kitchen, counter, hatch, pass
window, staff seen from above. The table states on the floor are the same list (`TABLE_STATES` in `content.ts`) the
operations screen shows; Masa 7's route (table → cashier, cashier → kitchen through the pass window, kitchen → hatch →
table) draws itself in gold, other tables have quieter teal activity paths. The management panel floats over the plan
and is linked down to it: Masa 7 tile → Masa 7, "Mutfakta" → the KDS, "Aktif sipariş" → the cashier, Masa 5
("Hesap istendi") → Masa 5. The Chapter 5 finder forms quietly in the bottom-left, rising from Masa 7.

### Copy

One heading + one sentence per stage (13 stages), shown only on the arrival hold and gone before the next move; a soft
frosted pool behind each block keeps it legible over the busier rooms. The 4.7 stock line "Satılan ürün stoktan otomatik
düşer." contradicted the claims table (automatic deduction not claimed); 4.8 uses the stated claim "Satış ve stok
hareketlerini aynı sistemden takip edin."

## Verification (prototype, desktop, Phase 4.8)

| Check | Result |
|---|---|
| Path independence (all FilmState channels + every visible layer's transform/opacity/clip, 41 checkpoints) at slow Δ0.005, normal Δ0.02, fast Δ0.4, fling Δ1.2, reverse Δ0.02, reverse fling Δ1.2 | **0 differences at every speed** |
| Pop scan (t 4.30–53.20, Δt 0.01, 4,891 samples × 61 channels) | Camera jumps only at the 7 portal cuts; every other jump is a hidden re-anchor under a surface or off screen |
| Portal cut coverage | At all 7 cuts the portal window covers the full viewport (`inset(0px)`, opacity 1) just before the cut |
| Copy vs surfaces / management panel — 1280×800, 1440×900, 1920×1080, 2560×1080, 1024×768 | 0 overlapping frames |
| Copy cropped | 0 at all five viewports (boxes moved inside x 280–1660) |
| Camera motion while copy is on screen | 0 for 7 of 13 stages; slow drift (≤ 7 px/vh) during the waiter's tracking walk and the office rise |
| Chapters 1–3 | Code path unchanged (every 4.8 transform is identity while `ch4 < 0.5`); frame comparison against the 4.7 commit differs only in time-animated star/dust dabs |
| Typecheck / production build | Pass |
| Real-scroll run in a visible browser | Not run in this session (headless only) |

## The story (Phase 4.7)

**Main product truth:** the guest orders directly from the table's own QR; the order drops straight into the
system tied to that table; cashier and kitchen see it (table, items, time, note); the waiter only delivers;
extra orders and the bill request come from the same table; the business then runs cashier, stock, cari and
reports from the same system.

- **Duration:** Chapter 4 adds **40.1 units = 4010vh** (4.6: 2070vh), t = 4.40 → 44.50.
- **Structure:** one ScrollTrigger, one scrubbed master timeline. Every action is a fraction of its beat.
- **Six rooms, 35 beats.** The chapter is staged as a walk through distinct rooms rather than a chain of
  events on one stage, and every beat is built as **approach → transform → settle**.

### The world (Phase 4.7 widening)

The building east of the approved Chapters 1–3 dining room was rebuilt wider so each room has interior space
to move through instead of being exactly one screen wide:

| Room | Before | After | Why |
|---|---|---|---|
| Dining (Ch. 1–3 plate) | −340 … 2260 | unchanged | approved artwork, not touched |
| Kitchen | 2200 … 4500 | 2200 … 5100 | the cooking half moved right, opening a long pass |
| Counter / payment | 4380 … 6600 | 5080 … 8000 | the whole counter block moved +700 and gained a service floor |
| Office | 2100 … 6500 | 2100 … 7900 | spans the widened building |
| Storeroom | 3700 … 6600 | 3700 … 7700 | same |

Each zone also gained its own **establishing look** (`zoneTable`, `zoneKitchen`, `zoneCounter`,
`zoneService`, `zonePayment`, `zoneOffice`) at zoom 0.72–1.15, so every room is seen whole before we work
inside it. That is what makes the rooms read as separate places.

### Zones and beats

| Zone | Beats | vh | What happens |
|---|---|---|---|
| 1 · Masa | z1a…z1f | 720 | arrive · scan the table's QR · menu opens · two dishes chosen · the note typed · sent |
| — | **p1 PORTAL** | 150 | the sent order card becomes the gateway; we cross it and come out at the counter |
| 2 · Kasa / Sistem | z2a, z2b | 240 | arrive in the counter room · the Masa 7 row: table, items, time, note, source |
| — | **g1 GLIDE** | 120 | a tracking move through the pass into the kitchen |
| 3 · Mutfak | z3a…z3e | 550 | arrive · the fiş prints and is read · the KDS card · the chef cooks to the note · ready |
| — | **p2 PORTAL** | 110 | through the ready dish at the hatch onto the waiter's tray |
| 4 · Servis | z4a…z4c | 310 | the handoff · a glide with him to Masa 7 · served |
| 5 · Aynı masa | z5a…z5d | 420 | the tab on the phone · Künefe added · it lands on the same tab · settle |
| 6 · Hesap / Ödeme | z6a…z6f | 640 | requested from the table · the bill · **PORTAL** through it · paid · closed · **PORTAL** back to the table |
| — | **p6 PORTAL** | 170 | the closed table's own QR opens the control layer |
| 7 · Yönetim | z7a…z7e | 480 | the operations overview · stock · cari · the whole building · report → sunset |

### Transition language (Phase 4.7)

Deliberately mixed, so that a portal still means something:

- **Portal (through an object, crossing a threshold):** p1 (order card), p2 (the ready dish), z6c (the bill),
  z6f (the POS), p6 (the table's QR). All five cross the same gateway rectangle — the panel's frame sweeps
  1.14× past the viewport edge like a door frame passing us — with a warm threshold bloom (`portalFlare`)
  at the crossing and a camera travel running behind it, so we always come out somewhere new.
- **Glide (the story simply continues in space):** g1 counter → kitchen, z4b the walk to the table,
  z5c the extra order reaching the counter.
- **Local push-in / pull-back (inside one room):** every zone arrival, z3b reading the printed ticket
  (which now lifts off the printer and settles back onto it), z6d moving in on the payment.

### Fast-scroll clarity

The design rule is that **every beat ends in a settle**: the camera stops, at most one thing is still easing,
and one idea sits on screen. Measured over the whole chapter:

| Metric | Chapters 1–3 (the reference section) | Chapter 4 after 4.7 |
|---|---|---|
| Scroll that is a settled, readable frame | 24% | **44%** |
| Anchor frames (settles ≥ 15vh) | 2 | **35** |
| Total settled scroll | 66vh | **1632vh** |
| Landing on a settled frame when flung at 120vh/frame | 25% | **59%** |

### How THROUGH transitions work (Phase 4.4)

A THROUGH panel is an **object held in the room**, never a full-screen takeover:

- It grows out of the projected rectangle of a real object (phone screen, Masa 7 row, printer slip, cashier screen, office monitor) to an **object-sized peak**: 0.5–0.72 of the viewport height, at most 0.66 of its width, so the room always frames it. Measured peak coverage over the whole chapter stays around half the screen.
- Its centre stays half-way between the object it came from and its staging anchor, and it never crosses the side where the beat text sits.
- It keeps the **tilt** of the object it grew out of (the phone leans in the guest's hand, the ticket and bill sit slightly askew) and settles almost upright at the peak.
- It keeps a body: device bezel for phone and dashboard, paper for order card, kitchen ticket and bill, plus a drop shadow, a **warm rim glow tinted by the current time of day**, a room-light gradient across it and a glass sheen.
- Behind it the room stays **visible and legible**: a veil dims by only ~0.24–0.40 alpha (never a blackout) and defocuses with a 3.5–15px blur that rises with camera speed, so fast travel reads as depth of field.
- **There are no camera cuts.** While a panel is at its peak, the camera travels continuously to the next place through the interior (mid-points in the kitchen, at the pass and beside the stair), with a zoom-out in the middle. Every frame remains a pure function of scroll position.
### Phase 4.6 — pacing and the operations portal

**Why the post-QR half felt rushed.** The measurable difference between the approved opening and the rest of
Chapter 4 is how many things move per screen of scrolling. Counting the state channels that animate inside each
section and dividing by its height gives a density figure:

| Section | Before 4.6 | After 4.6 | Reference |
|---|---|---|---|
| Ch1 QR formation | — | — | 2.8 per 100vh |
| Ch3 arrival at the table | — | — | 2.1 per 100vh |
| a1 scan | 7.8 | 3.5 | |
| a2 phone | 6.2 | 3.3 | |
| a3 cashier | 5.0 | 3.1 | |
| a4 kitchen | 5.3 | 3.6 | |
| a5 delivery | 2.5 | 2.1 | |
| a6 extra | 5.9 | 3.3 | |
| a7 bill | 5.0 | 3.2 | |
| b1 portal | — (beat rebuilt) | 2.3 | |

The "before" column for a1–a7 is the same channel count over the old heights; b1 was rebuilt, so only its new figure is measured.

Every post-QR beat was lengthened (Block A 900 → 1480vh, Block B 450 → 590vh, chapter 1350 → 2070vh) until the
busiest ones sit near 3 per 100vh — the band the approved opening runs in. Nothing was removed and no action was
retimed relative to its own beat; each beat simply has more scroll to happen in.

**The operations transition is now a portal, not a slide.** It is built from the same grammar as the Chapter 2
window without reusing its effect:

1. **Source object** — the camera pushes in on the cashier screen where Masa 7 has just closed (`cashierClose`),
   so the thing we are about to enter is a real, named object in the room.
2. **Approach** — its content opens out of Masa 7's own tile into the full operations grid.
3. **Gateway** — the screen grows until its bezel passes just beyond the edges of the frame (1.14× the viewport),
   so we cross a door frame rather than watch a fullscreen UI appear. Full cover lasts ~80vh; the Chapter 2
   portal's is 68vh.
4. **Threshold** — a warm bloom (`portalFlare`) peaks as we cross.
5. **Arrival** — behind the gateway the camera is already travelling through the interior by the stair to
   `officeTight`, and we come out *inside the office*; the panel settles onto the manager's monitor and the
   camera pulls back to the office and then to the whole building.

The beat text arrives only after the panel has settled, so it never sits on top of it.

**Reverse-scroll fix.** The veil's defocus is driven by measured camera speed, and the measurement only ran when
time increased — scrolling back left a stale blur. It is now direction-agnostic.

### Phase 4.5 repairs

**Reverse-scroll lifecycle.** The film state always reversed correctly; what leaked was DOM state. The updater returned early whenever Chapter 4 was off screen and left every prop, panel and veil with its last inline style, so a panel could still be visible while scrolling back into Chapter 3. Now leaving Chapter 4 runs a full reset (all props hidden, surface cleared, veil zeroed), the surface is hard-gated to Chapter 4's time range, and the phone is gated to the two beats where the guest holds it. A 175-point forward-vs-reverse comparison of every layer is part of the test set.

**The dish is one physical object.** It used to be drawn into the waiter's walk sprite. The waiter now carries an **empty tray**, and the dish is a single prop that travels: chef slides it along the pass → it lifts onto the tray at the hatch (with the tray's own world position, depth and scale) → it rides the tray while he walks → it is set down on Masa 7. No teleport, no floating.

**Order artifacts.** The kitchen ticket, printer slip and order card are tactile paper: torn thermal edges (clip-path), letterspaced small caps for the station, a large MASA with the gold "7" tile, dotted leaders on the items, a gold-barred note block, and the line "Garson almadı · masadan geldi". The order card is paper stock with an ink rule and a gold inner border instead of a flat white card.

**Payment.** The cashier screen now changes state unmistakably: the Masa 7 row turns amber on request and green when closed, and an **ÖDENDİ** stamp lands (rotating and scaling in) on the detail panel with "Masa kapandı" beneath it.

**Operations transition.** Instead of sliding in, the operations view **opens out of Masa 7's own tile**: the dashboard starts zoomed on that one closed table and scales back to the full 12-table grid while the KPI tiles and the other tables build up around it.

**Post-QR smoothing.** All panel opens/lands run on long sine eases (0.17–0.30 of their beat instead of 0.10–0.20 with power2), the sends and row arrivals ease out, and the camera travels overlap them further.

**Visual lift.** Kitchen: warm key pools over pass and stove, deeper corner shade, hanging herbs, copper pans, vegetable crates. Counter: bottle shelf, cups, plant, brass foot rail, warmer pool, deeper shade. Office: desk-lamp pool and monitor spill, a rug under the desk, framed photographs, deeper wall shading.

**Figures.** Guest at 0.84 scale (was 0.72), waiter 0.8 and repositioned to the table's near side so he no longer stands on the tablecloth; every figure sprite gained a contact shadow so nobody floats.

### Human staging (Phase 4.4)

| Moment | Staging |
|---|---|
| Counter, while the order arrives | Cashier behind the counter turned to the screen; the waiter stands aside with an **empty tray** — he never takes an order |
| Kitchen | Chef reads the slip, cooks, passes the plate along the pass to the service hatch |
| Delivery | The waiter waits at the hatch on the dining side, carries the plate to Masa 7 (own depth −0.2, 0.74 scale, so he reads as standing behind the table), sets it down in front of the guest at (1560, 700) and steps back |
| After delivery | From beat a6 he walks out of frame and fades, so the extra-order and bill moments stay uncluttered: guest + phone only |
| Bill / payment | No crowding: the guest requests the bill at the table; the camera then travels to the counter where only the cashier is present as the Masa 7 row turns "Hesap istendi" → "Ödendi ✓ · Masa kapandı" |

## Debug
- `?t=<number|label>` freezes the film. `&debug` shows label, formation, order position, time of day.
- `?hideText=1` hides beat copy; `?hideText=2` also hides every in-world and surface UI text (shapes, colours and states remain).

## Product claims

The Phase 4.3 brief states the core flow as product truth. Those statements are classified **STATED BY CLIENT (4.3 brief)** — still to be matched against real NeXa screens before launch. UI layouts, numbers and names remain **VISUAL METAPHOR ONLY**.

| Where | Copy / visual | Classification | Note |
|---|---|---|---|
| a1 | "Her masanın kendi QR kodu var." | STATED BY CLIENT | Per-table QR |
| a2 | "Misafir seçer, notunu ekler ve siparişi kendisi gönderir." · phone menu, note field, send | STATED BY CLIENT (flow) · VISUAL METAPHOR (UI) | Order notes from the guest |
| a2 | "garson beklemeden kasaya ve mutfağa iletildi" | STATED BY CLIENT | Order reaches cashier + kitchen directly |
| a3 | "Sipariş doğrudan sisteme düşer: masa, ürün, saat ve not." · cashier list tied to the table | STATED BY CLIENT (flow) · VISUAL METAPHOR (layout) | |
| a4 | "Mutfak siparişi notuyla birlikte doğrudan alır." · printer slip + KDS | STATED BY CLIENT ("kitchen can see or print the ticket with notes") | KDS status names / timers illustrative |
| a5 | "Garson sipariş toplamaz; hazır olanı masaya getirir." | STATED BY CLIENT | |
| a6 | "Ek sipariş aynı masanın adisyonuna eklenir." · "Adisyonum", "Mutfağa iletildi" | STATED BY CLIENT (flow) · VISUAL METAPHOR (UI) | Whether the guest sees an adisyon view on the phone must be confirmed |
| a7 | "Hesap da masadan istenir." · bill, "Ödendi · Masa kapandı" | STATED BY CLIENT (bill request) · NEEDS CONFIRMATION (how payment is taken; **no payment method is shown or claimed**) | |
| b1 | "Siparişler akarken işletme tek ekrandan yönetilir." · operations overview | STATED BY CLIENT ("manage operations from the same system") · VISUAL METAPHOR (numbers, grid) | |
| b2 | Stock is named in the 4.9 management line ("… stok, cari ve raporlar aynı sistemde") and shown as levels on the monitor | STATED BY CLIENT (stock visibility) · VISUAL METAPHOR (levels) | **Automatic / recipe-level deduction and automatic reordering not claimed** |
| b3 | "Fatura ve cari takibini aynı yerden yönetin." · ledger rows, e-Fatura paper | STATED BY CLIENT (cari, invoice/finance) · VISUAL METAPHOR (document, rows) | **e-Arşiv and automatic accounting not claimed** |
| b4 | "Tüm günü tek bakışta görün." · weekly bars | STATED BY CLIENT (day-end report) · VISUAL METAPHOR (data) | |
| Closer | "Masadan siparişten gün sonuna, tek sistem." | STATED BY CLIENT (one system) | Brand line |
| Menu / prices | Mercimek, Köfte, Salata, Pide, Ayran, Künefe · ₺ | VISUAL METAPHOR ONLY | Illustrative |

## Verification (prototype, desktop, Phase 4.7)

| Check | Result |
|---|---|
| Path independence (71 channels, 30 checkpoints) at slow Δ0.005, normal Δ0.02, fast Δ0.4, fling Δ1.2, reverse Δ0.02 and reverse fling Δ1.2 | **0 differences at every speed** |
| Forward vs reverse DOM, 1,113 grid points × 726 elements, visible elements only | Only the surface veil differs (speed-reactive blur by design); every other visible element identical |
| Pop scan (t 4.30–44.50, Δt 0.01, 4,021 samples × 65 visual channels) | 0 isolated jumps |
| Beat text vs panel overlap — 2560×1311 and 2560×1080 | 0 overlapping frames |
| Beat text vs panel overlap — 1280×800, 1440×900, 1920×1080 | ~20 frames each of ≤10% edge grazing; no text obscured |
| Cropped text boxes, all five viewports | 0 |
| Portal full-screen cover, summed over all five crossings | 230vh (≈46vh each; the Chapter 2 portal is 68vh) |
| Text hidden (`?hideText=1`) | Renders correctly |
| Typecheck / production build | Pass |
| Real-scroll run in a visible browser | Still not run in this session (a hidden window suspends GSAP's ticker) |

## Verification (prototype, desktop, Phase 4.6)

| Check | Result |
|---|---|
| Pacing density, every Chapter 4 section | 2.1–3.6 channels per 100vh (was 2.5–7.8); Ch1 2.8 / Ch3 2.1 |
| Path independence (60 channels, 24 checkpoints; slow Δ0.002, normal Δ0.02, fast Δ0.25, reverse Δ0.02 and Δ0.25) | 0 differences |
| Forward vs reverse DOM, 1,256 grid points × 694 elements, visible elements only | Only the surface veil differs (speed-reactive blur, median 0px, p90 3.4px); every other visible element identical |
| Pop scan (t 4.30–25.10, Δt 0.01, 2,081 samples × 54 visual channels) | 0 isolated jumps |
| Camera cuts | 0 |
| Beat text vs panel overlap — 1280×800, 1440×900, 1920×1080, 2560×1080, 2560×1311 | 0 overlapping frames, 0 cropped text boxes |
| Portal full-screen cover | 80vh (Chapter 2 portal: 68vh) |
| Text hidden (`?hideText=1`) | Renders identically without text |
| Typecheck / production build | Pass |
| Real-scroll run in a visible browser | Still not run in this session (a hidden window suspends GSAP's ticker) |

## Verification (prototype, desktop, Phase 4.5)

| Check | Result |
|---|---|
| Reverse-scroll DOM lifecycle (175 checkpoints over the whole film, every Chapter 4 prop + surface + veil) | 0 leaks: reverse state is identical to a direct jump everywhere, including Chapters 1–3 |
| Path independence (59 channels; slow Δ0.002, normal Δ0.02, fast Δ0.25, reverse Δ0.02) | Identical to direct jumps at all 16 checkpoints |
| Camera cuts | 0 |
| Pop scan (t 4.35–17.90, Δt 0.01, 1,354 samples) | 0 spikes |
| Typecheck / production build | Pass |
| Real-scroll run in a visible browser | Still not run in this session (hidden window suspends GSAP's ticker) |

## Verification (prototype, desktop, Phase 4.4)

| Check | Result |
|---|---|
| Panel coverage of the screen (whole chapter) | **max 23%** — the room keeps at least ~77% of the frame at every peak (before this pass a panel covered the whole screen) |
| Veil behind a panel | Dims by ~0.16 effective alpha at most and defocuses 3.5–15px with camera speed; the room stays legible in every transition |
| Camera cuts | **None.** Isolated-jump test over t 4.4–17.9 at Δt 0.001 finds 0 discontinuities; the four former cuts are continuous interior travels |
| Surface appear / disappear | Every on/off happens at opacity 0.01, i.e. invisible — no panel ever blinks in or out |
| Pop scan (t 4.35–17.90, Δt 0.005, 2,710 samples) | 0 isolated canvas spikes |
| Frame coverage (whole chapter, 4 viewports) | 0 gaps, travels included |
| Hold coverage (4 viewports) | Each hold shows only its own room |
| Beat text vs. panels (4 viewports × 15 checkpoints, 52 rows) | 0 overlaps, 0 out-of-frame |
| Path independence (59 channels; slow Δ0.002, normal Δ0.02, fast Δ0.25, reverse Δ0.02) | Identical to direct jumps |
| Chapters 1–3 | 441/441 state samples identical; only Chapter 4 files changed |
| Runtime robustness | All Chapter 4 layer lookups are now null-safe, so a hot reload can no longer freeze the film |
| Real-scroll run in a visible browser | Still **not run** (this session's browser window stays hidden, which suspends GSAP's ticker) |
| Typecheck / production build | Pass |
## Verification (prototype, desktop, Phase 4.3)

| Check | Result |
|---|---|
| Chapters 1–3 timeline state (441 samples, 15 channels) | 0 mismatches vs. the approved baseline |
| Chapters 1–3 render (21 frames, canvas + non-Chapter-4 DOM) | Identical to the Phase 4.1 reference, forward and after visiting t = 17.9; only the known pre-existing t = 0 revisit artifact |
| Chapter 3 → 4 hand-off (t 4.3995 vs 4.4005) | Identical canvas |
| Formation hand-overs (k − ε → k, k = 1…7) | Pixel-identical |
| Camera cuts | Exactly 4 (6.836, 8.185, 12.910, 13.918); at every cut, on both sides, the THROUGH surface is visible, fully covers the viewport and is fully opaque |
| Pop scan (t 4.35–17.90, Δt 0.005, 2,710 samples) | 0 visible canvas pops (the 4 spikes are the cuts, under the surface). Surface-to-screen content swaps, plate hand-over and phone appearance were softened with cross-fades after this scan |
| Background coverage of world holds (4 viewports × 375 samples) | Every hold covered by its own room (dining shots re-framed so the hatch wall no longer peeks in) |
| Path independence (59 state channels; slow Δ0.002, normal Δ0.02, fast Δ0.25, reverse Δ0.02; 19 checkpoints) | Identical to direct jumps |
| Text (4 viewports × 12 checkpoints) | Inside the safe frame; no overlap with surfaces, devices or figures after fixes (remaining flags were transparent sprite boxes, checked visually) |
| Ambient life at rest (10 holds) | Every hold moves: canvas Δ 0.35–4.98, 2–20 moving DOM layers |
| Story without copy (`?hideText=1`) | Reads completely (all UI text on phones, screens, tickets kept) |
| Strict no-text (`?hideText=2`) | Roles, devices and the flow read; table identity survives through the gold "7" badge; items, notes and bill amounts need UI words |
| Real-scroll run in a visible browser (slow / normal / fast / reverse) | **Not run**: the browser window stayed hidden, which suspends GSAP's ticker. Needs a manual pass |
| Typecheck / production build | Pass |
