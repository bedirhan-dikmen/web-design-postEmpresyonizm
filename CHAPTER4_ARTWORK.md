# CHAPTER 4 — Artwork, Geometry & Mobile Notes

> Phase 4.2 directional rework, restructured in Phase 4.3 (guest-driven ordering first, business control second), unified in Phase 4.9 (one restaurant, physically connected). Companion to `ASSET_MANIFEST.md` and `ARTWORK_REPLACEMENT_CONTRACT.md` (Chapters 1–3).
> Chapter 4 art is still **placeholder**: script-painted plates, gestural figure sprites and device bodies. It validates staging, legibility and pacing, not final quality.
> **Single source of truth for all coordinates:** `lib/prototype/chapter4/geometry.json`. The plate painter (`scripts/art/chapter4-plates.mjs`), the sprite painter (`scripts/art/chapter4-sprites.mjs`) and the engine all read it. Regenerate with `npm run art:chapter4`.

---

## 1. The building (layout since Phase 4.7)

```
 y        x: 2100          2380        4980 5080        7000  8000
−5000   ┌──────────────── sky (dusk; clouds drift; skyline) ─────────────┐
−2200   │ roof deck (not visited since 4.9: the film now ends inside the office)          │
−1980   ├── office: window · clock · cabinet · manager · MONITOR · e-invoice · binders ──┤
 −420   ├──────────── slab ─────────────────────────────────────────────┤
 −330   │ dining │ KITCHEN: printer · KDS · heat-lamp pass · chef · stove │∩│ FRONT COUNTER: cashier · cashier screen · waiter │ lift │
  840   │  (Ch3) │ terracotta floor — ONE floor, straight through the arch  │║│ terracotta + wood threshold                   │ shaft│
 1290   ├────────┴───────────── slab ────────────┬───────────────────────────────────────────────┤
 2520   │  (earth)                               │ STOREROOM: stairs · shelving + 4 bins · bulb · keeper + tablet │
 2900   └────────────────────────────────────────┴───────────────────────────────────────────────┘
```

`∩` marks the two **arches** the camera physically travels through: dining ↔ kitchen at x 2240–2380 and
kitchen ↔ counter at x 4980–5080. Both are full height (y 300–840) with a service shelf across them, and both
are painted by one shared routine so the two plates that meet there agree exactly.

Staging (Phase 4.9 — one continuous, scrubbable shot through ONE restaurant; **one** camera cut in the whole chapter,
inside the management portal, under full cover):

| Beat | Place | Staging |
|---|---|---|
| a1–a7 | Dining, Masa 7 | Warm human-height camera: the guest scans the table's own QR, the phone opens up as a surface (menu → items → note → send) and goes back into his hand |
| **t1** | Dining → counter | **Camera travel.** A gold order pulse leaves the phone and runs along the ceiling ahead of the camera; the camera pulls back, passes the hatch arch and the kitchen and settles three-quarter on the counter as Masa 7 lands on the till |
| b1–b2 | Front counter | Arrival hold, then a push-in until table, items, time and note are legible. Waiter idle with an empty tray; he never takes an order |
| **t2** | Counter → kitchen | **Camera travel through the service arch** (x 4980–5080). The order leaves the row as a spark; the ticket is already printing when the kitchen opens up |
| c1–c5 | Kitchen | Side-on, deeper: printer + slip, KDS card, the chef cooking to the note, then the dish tracked down the whole pass to the hatch |
| **t3** | Kitchen → dining side | **Camera travel through the hatch arch** (x 2240–2380) onto the waiter's side |
| d1–d3 | Service | The dish is lifted onto his tray; a low tracking shot follows him to Masa 7; he sets it down and steps back |
| e1–e2, **t4**, e3 | Same table | The adisyon on the same phone, + Künefe; then a **pull-back** until counter and kitchen are both in frame while the addition reaches the row and the KDS; then back to the table |
| f1–f2, **t5**, f3, **t6**, f4 | Bill and payment | "Hesap iste" at the table, the bill in his hand, a **travel** to the payment end of the counter (ÖDENDİ, Masa kapandı) and a **travel** back to the closed table |
| **p2** | The one portal | The green "Hesap kapandı" tile on Masa 7 becomes a window onto the management workstation |
| h1–h6 | Management | The workstation (Siparişler → Stok → Cari/e-Fatura → Rapor), then a pull-back to the office **and the restaurant still working below it**, with the large operations panel linked down into the rooms |

New sprites in 4.3: `waiter-idle` (empty tray, no notepad), `waiter-walk-a/-b` (plate on tray). The cashier reuses the `monitor` sprite at 0.75 scale as the counter screen; the POS / card-reader sprites are no longer used.

---

## 2. Plates (replaceable)

All plates sit at **depth 0** (the World B wall plane), hidden until Chapter 4 starts, lazily loaded after t = 3.0. Every plate carries overscan beyond the widest (21:9) and tallest (4:3) camera view of its beats; the automated coverage audit checks this (see `CHAPTER4_NOTES.md`).

| File (`public/prototype-assets/04-journey/`) | Design origin | Design size | Placeholder k | Notes |
|---|---|---|---|---|
| `exterior.webp` | (−2600, −5000) | 14000 × 9200 | 0.14 | Street, neighbours, earth section. **Transparent hole** x −340…2260, y −210…1290 over the dining room (the Chapter 3 window view must stay visible). Only seen in the 4.6 cut-away |
| `sky.webp` | (400, −5000) | 9400 × 3050 | 0.3 | Dusk sky, sun glow, far skyline down to −1950 (behind the roof deck) |
| `office.webp` | (2100, −2200) | 5800 × 1900 | 0.62 | Roof deck −2200…−2080, roof slab, office interior, floor line −460 |
| `storeroom.webp` | (3700, 1250) | 4000 × 1650 | 0.62 | Slab, brick vault, shelving (bins centre 5150, 2020; bins at −330/−110/110/330, 170 × 200), stairs, lift shaft |
| `service.webp` | (5080, −450) | 2920 × 1850 | 0.7 | Phase 4.7: the whole counter block moved +700 and the room gained a service floor. Counter x 5300–6460 top y 590, handoff bay x 5100–5260, pass window from the kitchen, street window, lift shaft x 7000–7260 |
| `kitchen.webp` | (2200, −450) | 2900 × 1850 | 0.7 | Phase 4.7: 600 wider, the cooking half moved right. Hatch wall x 2240–2380, printer shelf y 610, KDS mount x 3040–3640 y 60–410, heat-lamp pass x 2940–4980 y 650 (4 lamps), hood + stove x 4400–4760, chef 4560 |

### Phase 4.8 / 4.9 additions

| File | Design origin / size | Notes |
|---|---|---|
| `sprites/fg-chair.webp` | 520 × 700 | Dining chair, foreground of the waiter's tracking walk (depth −0.42, blurred) |
| `sprites/fg-counter.webp` | 1400 × 340 | Near edge of the counter for the three-quarter cashier shots (depth −0.34, blurred). In 4.9 it is also the foreground the camera passes on every travel to and from the till |

`plan.webp` (the 4.8 bird's-eye floor plan) was **removed in 4.9** together with the top-down ending; there is no plan
coordinate space any more.

Camera shots carry an orientation (`[x, y, zoom, yaw, pitch, roll]`, see `CHAPTER4_NOTES.md → Phase 4.9`). Plates keep
their overscan requirement; turned shots (yaw up to 16°) need ≈150 design units more on the receding side, which every
Chapter 4 plate already has.

### Phase 4.10 — the order ticket (DOM, never painted)

`geometry.json → ticket`: `size` 200 × 280 (design units at scale 1), `depth` 0, `path` = five `[x, y, scale]`
waypoints matching the five camera waypoints of the `t2` travel, `slot` = the printer's paper slot, `extraPass` = where
the extra-order ticket lands on the kitchen pass. Both tickets are torn thermal paper (the same `PAPER` + `TORN` style as
the printed slip) and are drawn after every device, so a ticket is always in front of the screen it comes out of.

### Phase 4.9 — one shared architecture (the cohesion contract)

The rooms must not read as separate painted backdrops. `scripts/art/chapter4-plates.mjs` defines a `SHARED` block and
shared routines that every ground-floor room calls; **final art must honour the same list**:

| Element | Where it lives | Rule |
|---|---|---|
| Ceiling line | y −330 | Identical in kitchen and counter |
| Cornice | y −330 … −234 (`cornice()`) | The same moulding band under every ceiling, including the office at its own ceiling (−1980) |
| Warm plaster | ceiling → y 280 (`SHARED.plaster`) | Identical gradient stops in kitchen, counter and office |
| Glazed teal tile | y 280 → 412 (`SHARED.tileA/tileB`) | The same tile on the kitchen walls, behind the counter, and as an accent behind the office desk |
| Walnut dado + brass edge | y 402 … 426 (`dado()`) | One height everywhere; the same walnut and brass as the counter front, the desk edge and the office skirting |
| Terracotta floor | y 840 → 1290 (`terracotta()`) | One floor across kitchen and front of house; a single brass-edged wood threshold (x 5270 … 6530) marks the service zone |
| Pendants | y 150, `pendantLine()` | The same lamp at the same height on one line: kitchen x 2800 and 4160, counter x 5600 |
| Openings | `archOpening()` | **One routine paints both sides of a wall's opening**, so the two plates that meet there agree exactly |

**Openings (`geometry.json`).** The dining ↔ kitchen hatch and the kitchen ↔ counter pass window are now full-height
**arches**, not letterbox hatches:

| Opening | Cut wall (x) | Opening (y) | Springing (`archHead`) | Shelf |
|---|---|---|---|---|
| `kitchen.hatch` | 2240 … 2380 | 300 … 840 | 430 | `hatchShelf` y 640 |
| `kitchen.passWindow` | 4980 … 5080 | 300 … 840 | 430 | `passShelf` y 650 |

Each is painted brighter than any wall around it, with a dark reveal on both jambs, a warm spill into **both** rooms and
a dark lintel above the springing. The camera physically travels through them (`hatchThrough`, `passThrough`).

**Seams.** The kitchen plate is cut transparent left of x 2240, so the approved Chapter 1–3 dining room owns the image up
to its own wall and the seam between the two paintings lands exactly on the arch jamb. At x 5080 … 5100 the kitchen plate
paints the counter room's first strip in the counter room's own materials, so the kitchen/service seam has no step in
tone. **Final art must keep both of these rules.**

### Shots (Phase 4.9)

Every shot in `geometry.json → camera` is `[x, y, zoom, yaw, pitch, roll]`. Holds are where the story is read;
the rest are waypoints that only exist inside a travel.

| Group | Shots | Personality |
|---|---|---|
| Masa | `tableHuman`, `scan`, `table`, `tableWide`, `tableDoneWide`, `tableDone` | warm, human height, close to the guest (yaw +2…6°, looking slightly down) |
| Travel waypoints | `tableBack`, `hatchArch`, `kitchenPass` | wide, turned into the room's depth; the camera passes the hatch arch and the kitchen |
| Kasa | `zoneCounter`, `cashierRow`, `paymentArrive`, `payClose` | three-quarter from the street side (yaw −8…−16°), foreground stools and counter edge |
| Following the ticket (4.10) | `ticketCounter`, `passThrough`, `ticketKitchen` | the camera stays with the order ticket over the counter, through the service arch and along the kitchen |
| Mutfak | `kitchenTicket`, `printer`, `kds`, `stove`, `passTrack`, `hatchSide` | side-on from the other direction, deeper (yaw +3…+10°); `kitchenTicket` holds printer, slip and KDS in one frame |
| Hatch arch | `hatchThrough` | through the opening onto the dining side, looking slightly up |
| Servis | `waiterArrive`, `walkMid` | low tracking shot beside the waiter (pitch +5°) |
| Both rooms | `bothWide` | the pull-back that shows counter and kitchen together |
| The one portal | `tagPush`, `monitorTile`, `monitorArrive` | push into the closed table's status tile; the workstation seen through it |
| Yönetim | `office`, `deskWide`, `officePull`, `officeWide`, `officeLife` | the workstation, then the final pull-back over the working restaurant |

### Sprites (`04-journey/sprites/*.webp`, DOM, lazy-loaded, painted at 1.5×)

| Group | Sprites | Placement |
|---|---|---|
| Figures (pose variants cross-fade, idle breathing) | `guest-rest/-reach` (dining, 0.72 scale, depth −0.28) · `chef-work/-look/-pass` (behind the pass) · `cashier-idle/-hand` (behind the counter) · `payer-down/-up` · `keeper` · `manager-idle/-lean` | Anchored at the feet (or cut at the counter / pass top) — `FIG` in `Chapter4Layers.tsx` |
| Device bodies (screens stay dark; UI is DOM) | `printer`, `kds`, `pos`, `reader`, `monitor`, `tablet` | `DEV` in `Chapter4Layers.tsx` |
| Ambient | `pendant`, `bulb` (swing), `cloud-a`, `cloud-b` (drift) | |
| Foreground parallax (depth −0.2 … −0.3) | `fg-hatch`, `fg-rail`, `fg-stools`, `fg-slab`, `fg-crates`, `fg-plant` | `fg-slab` and `fg-plant` are film-time gated so they never cross other beats |

### Product surfaces drawn as crisp DOM (illustrative, not screenshots)
Phone (viewfinder → menu → "Sipariş ver"), kitchen printer slip, KDS header + three order cards with ticking timers and status, POS amount → "Ödendi", card reader LED, stock tablet with levels + "Sipariş önerisi", office monitor tabs (e-Fatura · Cari · Stok · Rapor) with cari rows → weekly report axis, e-invoice paper, wall clock, roof chart day labels.

### Calm text areas that the paintings must keep quiet

| Beat | Screen text box (design px) | World area kept calm |
|---|---|---|
| 4.1–4.2 | x 1220–1620, y 330–~460 | Dining wall right of the shelf |
| 4.3 | x 1240–1640, y 190–~350 | Kitchen plaster x 3640–4040, y −10…240 (between KDS and hood, above the chef) |
| 4.4 | x 300–740, y 190–~340 | Counter back wall x 4820–5160, y 150…250 (above the cashier's head) |
| 4.5 | x 300–740, y 190–~340 | Storeroom wall x 4640–5080, y 1640…1850 |
| 4.6 | x 300–740, y 190–~340 | Office wall x 3960–4420, y −1300…−1130 (above the monitor) |
| 4.7 | x 1240–1640, y 190–~420 | Sky x ≈ 4810–5610, y ≈ −3100…−2640 |

Phase 4.9 copy boxes (design px, the only ones that exist now): `tTable` (280, 230), `tSystem` (280, 220),
`tKitchen` (380, 185), `tWaiter` (280, 230), `tExtra` (1080, 230), `tBill` (1090, 230), `tOps` (280, 230) and the
closer (280, 290). The Chapter 5 finder square forms in screen space at (300, 830), cell 17.

### Drawn by code, never painted
Modules in every formation, the flow line, ambient motes, the finder square and its glow, all product UI, papers (menu, ticket, receipt, slip, invoice), scan lines, lights/glows/beams, steam and flames, notes and texts, the day grade and vignette.

---

## 3. Final-art notes for later

- **Seams.** Rooms meet at x 2240–2380 (dining | kitchen), x 4980–5080 (kitchen | counter), y −460…−330 and y 1290–1400 (slabs). Final paintings should overlap by ≥ 60 units and put a structural element on each seam.
- **Figures.** Replace the gestural sprites with painted figures in the same poses, anchors and sizes; keep faces unrendered and keep a warm rim light so they separate from the rooms.
- **Magnification.** Close-ups run at 1.3–1.9× (printer, POS, monitor). Deliver rooms at k ≥ 1.25 and device bodies at ≥ 2× their design size. The exterior only needs k ≈ 0.3 (it is seen at 0.4× in the cut-away).
- **Time of day.** The runtime grade is deliberately light in interiors; only the sky is painted at dusk.

## 4. Mobile (not implemented, requirements for the mobile phase)

In portrait, the design frame crops to x ≈ 710–1210, which is too narrow for every Chapter 4 composition:
- the menu (≈ 550 units wide),
- the three KDS cards (≈ 430),
- four bins (≈ 750),
- the seven report bars (≈ 910).

**Required:**
1. Per-breakpoint camera looks (`geometry.json → camera`), with zoom around 0.6–0.7 in rooms.
2. Portrait formation variants:
   - menu 2 × 3 tiles instead of 3 × 2,
   - KDS showing only the active card plus one,
   - bins in a 2 × 2 layout,
   - five report bars.
3. Beat texts moved to a bottom sheet area that does not cover the followed object.
4. Vertical camera travel instead of horizontal where possible (the building section can be re-stacked).
5. Shorter scroll budget (about 70% of the desktop 1020vh).
