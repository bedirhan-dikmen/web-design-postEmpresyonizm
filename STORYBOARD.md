# STORYBOARD — Kerinti Soft Homepage

> Phase 1 planning document. Companion files: `ART_DIRECTION.md`, `TECHNICAL_PLAN.md`, `COPY_DRAFT.md`.
> Status: **draft for approval** — no implementation yet.

---

## 0. The Story in One Paragraph

A painted night sky over an unseen city. Square dabs of paint drift like stars, then gather into a QR code: Kerinti's mark. The camera flies into one of the QR's three corner squares. That square opens like a window onto a warm, painted morning inside a restaurant. The QR lands on a table as a real table QR. Then one service day plays out in a single continuous shot. A guest scans, the menu becomes an order, the order goes to the kitchen, the meal becomes a payment, the payment updates the stock and the books, and the books rise as a report. As the report finishes, the painted sun sets. The report's bars break back into paint dabs, which become the stars of Kerinti's night, now dotted with the lit windows of restaurants Kerinti serves. We meet the people behind it. In the last scene, every dab gathers one more time into a large, scannable QR code: the invitation to request a demo.

**The story's backbone is three continuous threads, not a list of sections:**

| Thread | What it does | Where it changes |
|---|---|---|
| **The Module Field** (QR motif) | One persistent set of square "paint-dab modules" that never disappears. It only re-forms. | Every chapter |
| **Time of day** | Night → dawn/morning → midday service → sunset → night | Ch1 → Ch2 → Ch3/4 → end of Ch4 → Ch5/6 |
| **Brushstroke direction** | The direction of painted strokes always follows where the story is flowing (toward the portal, along the order's path, upward into the report) | Every chapter |

Because all three threads run through the whole page, any scroll position looks like the middle of one story, never the start of a new slide.

---

## 1. Persistent Motifs

### 1.1 The Module Field ("the dabs")
- A fixed pool of square modules. The stylized QR uses a **25×25 grid** (QR Version 2), with up to ~625 modules plus ~150 ambient "loose" modules. The functional final QR in Ch6 probably needs a larger version (29×29 or 33×33, depending on URL length and error correction). The extra modules come from the ambient pool.
- Each module is a **square impasto brush dab**, not a flat pixel. It has slight rotation, texture, and color variation. This one idea ties the QR motif to the painterly style: *a QR code is made of brushstrokes.*
- The field moves through **formations** (named end states). Every transition is a morph from one formation to the next:

| Formation key | Description | Chapter |
|---|---|---|
| `scatter.stars` | Modules spread across the sky as star-like dabs, drifting slowly | 1 |
| `qr.hero` | A stylized QR code centered in the sky, glowing at the edges | 1 |
| `qr.finderDive` | The camera scales toward the top-left finder pattern, and the other modules fly past the lens | 2 |
| `portal.window` | The finder square becomes a painted window frame into World B | 2 |
| `qr.tableTent` | A small QR on a table tent in the restaurant | 3 |
| `menu.tiles` | Modules lift off the tent and tile into a menu grid | 4.1 |
| `ticket.order` | Tiles collapse into an order ticket (adisyon) | 4.2 |
| `kds.grid` | The ticket docks into a kitchen display grid | 4.3 |
| `pos.receipt` | The ticket folds into a receipt, and payment dabs spark out | 4.4 |
| `stock.bins` | Dabs pour into shelf bins, and bin levels change | 4.5 |
| `ledger.lines` | Bin labels line up as invoice and ledger rows | 4.6 |
| `chart.columns` | Ledger rows stand up into bar-chart columns built from modules | 4.7 |
| `scatter.embers` | The columns dissolve into warm embers that cool into stars | 5 |
| `constellation.city` | Stars settle into a skyline of lit windows (restaurants) | 5 |
| `qr.final` | A large, **actually scannable** QR (links to the demo request) | 6 |

### 1.2 The Three Finder Squares
A QR's three corner "eyes" are its most recognizable part. They are the story's structural device:
- **Top-left eye**: the **portal** from Kerinti's world into NeXa (Ch2).
- **Top-right eye**: shows up as the **kitchen pass window** frame (Ch4.3). This is a quiet echo, not a portal.
- **Bottom-left eye**: the **return portal** at sunset, from NeXa back to Kerinti (Ch4 → Ch5).

Following the brief's rule, portals appear **only** at the two changes between worlds. At every other point the finder shapes are just echoes in the composition.

### 1.3 The Golden Accent
One warm "starlight gold" color marks *the thing to follow* in every scene: the first module to move, the portal rim, the guest's chosen dish, the order ticket, the payment, the tallest report bar, and the CTA. The eye always has a lead to follow.

---

## 2. Scroll Budget

The brief warns against an exhausting page, so the length is budgeted from the start. Units are viewport heights of scroll (vh) on desktop. Mobile targets are about 70% of these values (see `TECHNICAL_PLAN.md`).

| Chapter | Pinned scroll | Native scroll | Notes |
|---|---|---|---|
| 1 — Kerinti Intro | 220vh | — | Includes the first-screen hold |
| 2 — Portal | 140vh | — | Must feel like one breath |
| 3 — NeXa Intro | 180vh | — | |
| 4 — Product Journey | 600vh | — | 7 beats × ~80vh, plus the sunset return |
| 5 — About Kerinti | 160vh | ~150–250vh | Pinned return, then readable native content over the living backdrop |
| 6 — Finale / CTA | 140vh | ~100vh | Pinned formation, then the native contact form and footer |
| **Total** | **~1440vh** | **~300vh** | About 1.5–2 minutes of steady scrolling |

A persistent **chapter progress rail** (six small squares that fill in) and a **"Skip to demo"** link let impatient users jump ahead.

---

## 3. Chapters

Each chapter below uses the same template: **Purpose · Start state · End state · Beats · Motion direction · Transition logic · Text · Art direction · Background logic · Connection to the next chapter.**

---

### CHAPTER 1 — KERINTI INTRO ("Nocturne")

**Purpose**
Introduce Kerinti Soft as a thoughtful, premium technology company. Set the tone that this page is a story. Show the QR motif before explaining it.

**Start state (scroll 0)**
- Full-bleed painted night sky in deep ultramarine and Prussian blue with slow, directional swirling brushwork. The swirls are our own spiral-and-ribbon pattern, not a copy of any specific painting (see `ART_DIRECTION.md` §6).
- ~775 modules in `scatter.stars`, twinkling and drifting slowly. A few are gold.
- A low horizon of dark painted hills or rooftops, barely visible.
- Kerinti wordmark (small, top-left), chapter rail, "Skip to demo" link.
- Hero headline visible without scrolling. It must be server-rendered, readable, and the LCP element.
- A subtle scroll cue: a single gold module bobbing gently.

**End state**
- `qr.hero`: a stylized QR formed at center-right with a soft, painted glow at the edges.
- The headline has given way to the supporting statement.
- The sky strokes near the QR have started to curve *toward the top-left finder square*. That foreshadows the portal.

**Beats**

| # | Scroll | Visual | Text |
|---|---|---|---|
| 1.1 | 0–40vh | Idle drift. Scrolling adds a gentle parallax push-in (the camera moves forward about 5%). | Headline + short intro |
| 1.2 | 40–130vh | Modules gather in waves: finder squares first (gold, then settling to cream), then timing lines, then data modules. Loose modules keep drifting. | Headline lifts away. Statement line 1 fades in, word by word, with a brush-mask reveal. |
| 1.3 | 130–190vh | The QR locks into place, followed by a single "breath" pulse of glow. The sky strokes bend toward the top-left eye. | Statement line 2 |
| 1.4 | 190–220vh | Hold. The camera starts drifting toward the top-left eye. | Text clears |

**Motion direction**
Slow, weighty, and calm. Easing is mostly `power2.inOut`, with no bounce. Modules travel on slight curves, not straight lines, as if carried on the painted wind. On desktop, the pointer adds gentle parallax to the sky layers (max 1–2% offset). There is no parallax on touch.

**Transition logic → Ch2**
No cut. The camera push-in that starts in 1.4 simply keeps going into Ch2. The formation is already `qr.hero`, and Ch2 starts from that exact state.

**Text content (see `COPY_DRAFT.md` §2)**
- H1: "We build digital systems that simplify restaurant operations."
- Supporting line: "From service flow to reporting, Kerinti turns complexity into clarity."

**Visual art direction**
Night-blue palette, heavy impasto texture in the sky, muted cool highlights, gold used sparingly. The mood is quiet, confident, and slightly mysterious.

**Background logic**
Layered plates: `sky.far` (shader-animated strokes) → `stars` (Module Field) → `horizon.mid` → `grain` overlay. The sky's stroke-direction map is swapped/blended to lead toward the QR.

**Connection to next**
The top-left finder square is visually "lit from behind" by a thin warm rim of light. Before the portal opens, it shows that something bright is on the other side.

---

### CHAPTER 2 — PORTAL TRANSITION ("Through the Eye")

**Purpose**
Move from World A (Kerinti) to World B (NeXa) in one seamless, surprising motion. This is the page's signature moment.

**Start state**
`qr.hero` with a warm rim on the top-left eye. The camera is already drifting toward it.

**End state**
- The viewer is *inside* World B: a warm, painted morning restaurant interior.
- The top-left finder square has become `portal.window`, a painted window frame in the restaurant's wall. Morning light pours through it.
- All other QR modules have flown past the camera and are now drifting through World B's air like **dust in a sunbeam**. The motif survives.

**Beats**

| # | Scroll | Visual |
|---|---|---|
| 2.1 | 0–40vh | The camera accelerates toward the top-left eye. The QR grows. The rest of the modules start to separate slightly in depth: near ones grow faster (pseudo-3D). |
| 2.2 | 40–80vh | The eye fills the screen. Its inner square is a **mask**: through it, World B is visible at small scale, not a flat image but already in parallax. The outer ring's brushstrokes smear with speed (a directional blur along the stroke direction, painted rather than digital). |
| 2.3 | 80–115vh | We pass *through*. The mask grows past the viewport edges. The night sky drops away behind the frame. Modules streak past the lens like brush flicks. |
| 2.4 | 115–140vh | The camera slows down. Looking back, the painted window frame on the restaurant wall is the same square we flew through. Dust-motes (modules) settle. |

**Motion direction**
Starts slow, peaks in the middle (2.2–2.3), then decelerates like a camera dolly. That gives one `power3.in` → `power3.out` curve across the whole chapter. Because scroll scrub is linear, **the easing lives in the timeline itself**.

**Transition logic**
- The one justified **mask/portal** transition in the first half of the page.
- World B is rendered *before* it is revealed (a pre-warmed layer under the mask), so reverse scrolling is perfect. Scrolling up flies you back out through the window into the night.
- Color temperature crosses over *inside* the mask edge, never as a full-screen crossfade.

**Text content**
Minimal, one line at most, placed at 2.4 as the camera settles:
- "Now step inside the restaurant."
It can also be left out. The motion carries the moment.

**Visual art direction**
The portal edge is **not** a clean vector square. It has a painted, bristly edge that softens as it scales, like wet paint. At the moment of passage, the warm gold rim flares briefly.

**Background logic**
World A plates stay pinned behind until 2.3 and then unload from the render loop. World B plates load before 2.1 begins (preloaded during Ch1).

**Connection to next**
The window frame and the drifting dust-modules continue straight into Ch3. The camera is already turning toward the tables.

---

### CHAPTER 3 — NeXa INTRO ("Morning Service")

**Purpose**
Introduce NeXa as the product: a calm, human-centered restaurant platform. Establish the restaurant as the world where the product lives.

**Start state**
Just inside the restaurant: the window frame behind us, morning light, dust-modules drifting.

**End state**
- Mid-shot of one table near the window. A folded table tent with **`qr.tableTent`**: the dust-modules have settled onto it and assembled into the QR.
- NeXa wordmark and positioning statement.
- The first guest's hand/phone silhouette entering from frame edge (painted, not photographic, no identifiable face).

**Beats**

| # | Scroll | Visual | Text |
|---|---|---|---|
| 3.1 | 0–50vh | Slow pan across the painted interior: warm walls, wooden tables, plants, a glimpse of the kitchen pass at the far end (which foreshadows Ch4.3). | — |
| 3.2 | 50–110vh | The dust-modules gather in the light beam and float down onto the table tent. The QR assembles small, but it is recognizably *the same* QR from Ch1. | NeXa wordmark resolves. The "Ne" and "Xa" letters can each use a tiny module accent. |
| 3.3 | 110–160vh | The camera pushes toward the table. Other tables in the background show their own tiny QRs lighting up in sequence (one system, many tables). | Headline + 3 short positioning points |
| 3.4 | 160–180vh | A guest's phone enters the frame. Its screen is a soft glow, not a detailed UI yet. | Text clears |

**Motion direction**
Lighter and more buoyant than Ch1. Easing is `sine.inOut`. Camera moves are lateral pans and gentle dollies. Modules settle like falling dust (slightly stochastic arrival, eased).

**Transition logic → Ch4**
The phone's scan is the first beat of Ch4. There is no gap: the same pinned stage, the same table, the same light.

**Text content**
- Eyebrow: "NeXa Restaurant Order Management"
- H2: "One system for every table, ticket and till."
- Three short points: QR ordering · kitchen-to-cash flow · real-time control.

**Visual art direction**
World B palette: cream, ochre, terracotta, sage, soft sky-blue light. Brushwork is looser and airier than World A, with visible canvas in the light areas. People are gestural silhouettes with no detailed faces, which keeps the scene universal and avoids "stock illustration" people.

**Background logic**
Interior plates: `room.far` (back wall + kitchen pass) → `room.mid` (tables) → `light.beam` (additive, animated) → `table.near` (hero table) → Module Field → `grain`.

**Connection to next**
The phone scans the table tent, and the modules lift off the tent. Ch4 has begun.

---

### CHAPTER 4 — CONTINUOUS PRODUCT JOURNEY ("One Order, One Day")

**Purpose**
Show what NeXa does as **one uninterrupted operational story**, following a single order from scan to report. This is the most important chapter.

**Unifying devices**
1. **One order** (the gold ticket) is the protagonist. The camera follows it.
2. **One continuous camera path** travels through one painted restaurant: table → kitchen pass → kitchen → counter → back storeroom → office → rooftop. The restaurant is a single connected painted world, not a string of slides.
3. **Time of day advances** from morning to sunset across the chapter. Light direction and color shift continuously.
4. **The brushstroke "flow line"**: a painted ribbon that the order travels along. It is the visible path of data, like a brushstroke drawn by the process itself.
5. **Margin notes**: secondary features (reservations, table management, shift management, caller ID, purchase records) appear as small hand-painted annotations *in the world*, not as cards.

**Start state**
The phone is over `qr.tableTent`.

**End state**
- Sunset rooftop / high vantage. The report (`chart.columns`) stands as a painted skyline of module-built bars.
- The bottom-left finder square forms in the sky, framing the dusk. It is the return portal to Ch5.

**Beats**

| # | Scroll | From → To | Physical transformation | Margin notes (secondary features) | Text (short, one line + one sub) |
|---|---|---|---|---|---|
| 4.1 | 0–80vh | **QR → Menu** | The phone "scans": a sweep of light passes over the tent. The modules lift off the tent and tile into `menu.tiles` floating above the table, beside the phone. Each tile shows a painted dish. | *Table 7 · 4 guests* (table management) | "Scan. Browse. Order." |
| 4.2 | 80–160vh | **Menu → Order** | The guest taps a dish tile. It turns gold. The other chosen tiles fold into it, and the stack **collapses into `ticket.order`**, a paper-like order ticket with module-bars as line items. | *Reservation 19:30 confirmed* (reservation) — a small painted card pinned to the wall in the background | "Orders go straight from the table to the system." |
| 4.3 | 160–250vh | **Order → Kitchen** | The ticket lifts and **travels along the painted flow-line** (motion path) across the room and through the kitchen pass. The pass's frame echoes the top-right finder square. The ticket docks into `kds.grid`, the kitchen display, where status bars move from ochre to sage. A plate is plated. | *Incoming call: known guest* (caller ID) — a small phone glow at the counter along the way | "The kitchen sees every order the moment it's placed." |
| 4.4 | 250–330vh | **Kitchen → Cash Register** | The finished plate leaves. The ticket **folds into `pos.receipt`**, which slides to the counter POS. On payment, the receipt emits a burst of small gold dabs. | *Shift: evening team clocked in* (shift management) | "Payment closes the loop. No re-entry, no paper." |
| 4.5 | 330–410vh | **Payment → Inventory** | The gold dabs rain down through the floor into the storeroom and **drop into `stock.bins`**. The bins for used ingredients drop a level. One bin falls below a line and a painted "reorder" flag rises. | *Purchase order drafted* (purchase records) | "Every sale updates your stock automatically." |
| 4.6 | 410–490vh | **Inventory → Invoice / Account** | Bin labels peel off and **line up into `ledger.lines`**: an e-invoice document plus a current account ledger. A seal/stamp dab closes the invoice. | *Supplier account balanced* (current account) | "E-invoices and accounts, kept in step." |
| 4.7 | 490–600vh | **Account → Reporting** | The ledger rows **stand up into `chart.columns`** while the camera rises through the building to the rooftop. The columns form a painted bar chart that, from far away, reads like a city skyline at sunset. The tallest (gold) bar is today. | — | "See the whole day at a glance." |

**Motion direction**
- The camera always **leads with the gold object**. It frames it at roughly the left or right third, never dead center, so there is room for the next destination.
- Each beat has an internal rhythm: **anticipation (10%) → travel/transform (60%) → settle (30%)**. Text enters during the settle and leaves during the next anticipation.
- Transformations are always **physical**: fold, collapse, travel, pour, peel, stand up. Nothing fades in from nothing.
- Background activity is limited to one element at a time, which keeps the motion from getting noisy.

**Transition logic**
- There are **no masks or portals inside Ch4**. It is one world, one camera, and one path.
- Between beats, the current formation's *end* equals the next formation's *start* (enforced in code, see `TECHNICAL_PLAN.md` §3.4).
- Light and time-of-day are one continuous tween across all 600vh, not per-beat.
- **Return transition (last ~40vh of 4.7):** the bottom-left finder square forms in the dusk sky from the highest modules. The camera tilts up toward it. Ch5 begins.

**Visual art direction**
- The painted world gets warmer and more golden as the day goes on: morning cream → midday ochre → late afternoon amber → sunset rose and violet.
- UI elements (menu, ticket, KDS, POS, ledger, chart) are **painted interpretations of real NeXa screens**. They are recognizable as software (legible hierarchy, a few real labels) but rendered with brush texture and slightly irregular edges. They should *suggest* the product and never become fake screenshots.
- A real-screenshot option could be added as a small inset card later, but it is off by default because it would break the painted world.

**Background logic**
One wide, continuous painted "location strip" (restaurant cross-section) that the camera travels across and up. Implementation can split it into tiled plates. Lighting is handled by a color-grade layer driven by time of day, not by separate paintings per time.

**Connection to next**
The bar chart dissolves into warm embers that rise through the bottom-left portal square into the night sky. The world is Kerinti blue again.

---

### CHAPTER 5 — ABOUT KERINTI ("The Lit Windows")

**Purpose**
Return from the product world to the company's identity: who Kerinti is, how they work, why they care about restaurants. Build trust.

**Start state**
The camera passes through the bottom-left finder frame from dusk into night. `scatter.embers` rise and cool from gold to starlight.

**End state**
- `constellation.city`: the stars settle into a **night skyline of warm lit windows**. Each window is a module, and each suggests a restaurant running on NeXa.
- The stage has become a calm, living backdrop. The readable About/Team content scrolls natively over it.

**Beats**

| # | Scroll | Mode | Visual | Content |
|---|---|---|---|---|
| 5.1 | 0–80vh | Pinned | Pass through the return portal. Embers cool into stars. Palette returns to World A, **but warmer than Ch1**: night blue with warm window lights. The story has changed the world. | — |
| 5.2 | 80–160vh | Pinned | Stars drift down into windows of a painted skyline. | "Behind every lit window, a service running smoothly." |
| 5.3 | native | Native scroll over fixed backdrop | Backdrop slowly scrubs: the sky pans upward, and constellations drift. Content blocks sit on painted "glaze" panels (soft translucent areas that belong to the painting, not boxed cards). | Who we are · Our approach · Philosophy · Who we build for · Team |

**Motion direction**
Slow and reflective. Text blocks use a subtle brush-mask reveal *once*, with no repeated entrance animations. Readability comes first in this chapter.

**Transition logic**
- The second (and last) portal passage, justified by the world change.
- Pinned → native handoff: the stage stays `position: fixed` behind the content, so there is no visual break when pinning ends.

**Text content**
See `COPY_DRAFT.md` §5. Team presentation depends on what material is available (see Open Questions).

**Visual art direction**
World A palette with warm window accents in ochre and gold. Team portraits, if used, are **consistent painterly treatments** applied to photos with consent, or name + role only with no portraits.

**Background logic**
`sky.night.warm` shader variant → `skyline` plate → Module Field (`constellation.city`) → content layer.

**Connection to next**
As the About content ends, the lit windows begin to go out one by one. Their modules lift back into the sky and gather toward center, anticipating the finale.

---

### CHAPTER 6 — FINALE / DEMO / CONTACT ("Scan the Future")

**Purpose**
End with a clean, confident, memorable call to action.

**Start state**
Modules rising from the skyline and converging on center.

**End state**
- `qr.final`: a large, crisp, **functional QR code** (it encodes the demo request URL) made of the same painted modules, on a cleaner, calmer version of the night sky. The painterly energy is still there but quieter.
- CTAs next to it: primary **Request a Demo**, secondary **Talk to Us**, tertiary links **Discover NeXa · About Kerinti · Contact**.
- Native section below: a short demo request form, contact details, and footer.

**Beats**

| # | Scroll | Mode | Visual | Content |
|---|---|---|---|---|
| 6.1 | 0–70vh | Pinned | Every module in the page's pool converges. The three finder squares (portal, pass window, return portal) arrive last, in that order. It is a small recap of the journey. | — |
| 6.2 | 70–120vh | Pinned | The QR locks, with one pulse of gold light. The sky strokes calm down to a gentle radial flow around the QR. | H2 + CTA buttons |
| 6.3 | 120–140vh | Pinned → release | Hold. On desktop, hovering the QR makes nearby modules lift slightly. | "Or just scan it." caption |
| 6.4 | native | Native | The form and footer scroll up over a darker, quieter sky. | Demo form · contact · footer |

**Motion direction**
Decisive and satisfying. Convergence uses `expo.out` for the lock. There is no idle looping after the lock except a very subtle shimmer, so the page feels finished.

**Transition logic**
A formation morph only, with no portal. The story ends where it began (a QR in the night sky), but now the viewer knows what it means.

**Text content**
- H2: "Let's make your restaurant run like this."
- Primary CTA: "Request a Demo" · Secondary: "Talk to Us"
- Caption near QR: "Or scan it — it's real."

**Visual art direction**
The cleanest composition on the page, with generous negative space. The QR modules keep their brush texture but render with higher contrast so the code actually scans (see `TECHNICAL_PLAN.md` §6.3).

**Background logic**
`sky.night.calm` shader variant (lower stroke turbulence) → Module Field → CTA layer → native form/footer.

**Connection**
End of story. The footer's small Kerinti mark is a tiny static QR, the same motif at rest.

---

## 4. Continuity Checklist (applies to every transition)

- [ ] The Module Field is visible and doing something meaningful.
- [ ] The end state of scene N is pixel-identical to the start state of scene N+1 (verified by scrubbing back and forth across the boundary).
- [ ] Brushstroke direction points toward where the story is going next.
- [ ] The gold accent marks exactly one "thing to follow."
- [ ] No full-screen crossfade is the *only* transition mechanism.
- [ ] Reverse scrolling tells the story backward without glitches.
- [ ] Text never covers the object being transformed.

---

## 5. Reduced-Motion Storyboard

For `prefers-reduced-motion: reduce` (or the on-page "Reduce motion" toggle), the same six chapters are shown as **still painted key frames with text**, one per chapter, stacked in normal scroll with no pinning or scrub:

1. Night sky with the formed QR (Ch1 end frame)
2. The window-portal view from inside the restaurant (Ch2 end frame)
3. The table with the table-tent QR (Ch3 end frame)
4. A single wide illustrated "journey map" showing the seven steps along the flow line, with short captions. This stays one image, not seven cards.
5. Night skyline of lit windows + About/Team content
6. The final scannable QR + CTAs + form

Only simple opacity changes (≤200ms) are allowed.

---

## 6. Open Questions for Approval

1. **Brand assets.** Does Kerinti Soft have an existing logo, brand colors, or fonts that must be respected? The palette in `ART_DIRECTION.md` is a proposal.
2. **Primary language.** Should the site be Turkish-first with English secondary, or the other way around? This affects copy length and layout.
3. **Team content.** Real names, roles, and photos (with consent), or a values-only About section?
4. **Claims and numbers.** Do we have verified figures (restaurants served, years, orders processed)? No numbers will be invented. Placeholders are marked in `COPY_DRAFT.md`.
5. **Demo request.** Where should the form submit (email, CRM, WhatsApp)? What URL should the final QR encode?
6. **Illustration production.** Commission a human illustrator, use AI-assisted concept art that is then hand-painted over, or a mix? This affects the timeline and licensing (see `ART_DIRECTION.md` §7).
7. **Product screens.** Can we reference real NeXa UI screens to base the painted interfaces in Ch4 on?
8. **Chapter 4 length.** Are seven beats right, or should reservation/table management become a full beat instead of margin notes?
