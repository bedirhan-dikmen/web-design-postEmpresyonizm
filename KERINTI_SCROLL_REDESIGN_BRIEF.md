# KERINTI SCROLL EXPERIENCE REDESIGN BRIEF

## Project Title
Kerinti Soft Homepage Redesign — Scroll-Driven Storytelling Experience

---

## Objective

Redesign the Kerinti Soft website homepage as a premium, scroll-driven storytelling experience.

The final experience should be inspired by the **narrative continuity**, **scene transitions**, and **scroll choreography** found in websites like:

- https://pear.no/
- https://www.shopify.com/editions/winter2026#agentic

However, this project must **NOT directly copy** those websites.

We want to borrow and reinterpret:
- scroll-based storytelling logic
- pinned cinematic scenes
- seamless transitions between sections
- transformation of persistent visual elements
- immersive world-building
- premium motion design

We do **NOT** want to replicate:
- exact layouts
- exact illustrations
- exact compositions
- exact scene order
- exact backgrounds
- copyrighted visual identity

This must become an **original Kerinti experience**.

---

## Core Creative Direction

We want the homepage to feel like:

- artistic
- cinematic
- fluid
- premium
- surprising
- playful but professional
- story-driven rather than section-driven

### Important Creative Twist

We want the visuals to feel like **painted scenes**, with a strong **Van Gogh-inspired painterly energy**:

- expressive brush strokes
- vivid sky and atmospheric backgrounds
- textured painted look
- dreamlike transitions
- living illustrated environments

Important:
This should be **inspired by post-impressionist painterly aesthetics**, not a direct reproduction of any specific Van Gogh painting.

---

## Business Context

Kerinti Soft is a software company focused on digital transformation for restaurants and food-service businesses.

Its main product is:

# NeXa Restaurant Order Management System

NeXa includes:
- QR menu and QR ordering
- kitchen display workflows
- cashier / POS processes
- reservation
- table management
- inventory / stock / warehouse
- purchase / sales records
- e-invoice workflows
- current account tracking
- reporting and analytics
- shift management
- caller ID
- operational management for restaurants

The homepage should first introduce **Kerinti as a company**, then smoothly transition into **NeXa as the product**, then finish with **about / team / contact / demo request**.

---

## High-Level Storytelling Idea

The homepage should behave like a **continuous animated story**, not a normal list of webpage sections.

The user should feel like they are moving through a living visual journey.

We want one strong recurring metaphor throughout the story:

# The QR Code

Instead of Pear’s pear object, we want to use a **QR-based visual metaphor**.

But the QR should not always appear as a boring literal QR image.

It should be stylized and transformed in many ways:
- as floating square modules
- as a portal
- as a glowing frame
- as a symbolic gateway
- as a restaurant table QR
- as interface tiles
- as data blocks
- as a final CTA object

It should remain a **persistent visual motif** throughout the experience.

---

## Narrative Structure

We want the homepage to be organized into approximately 6 cinematic chapters.

---

### CHAPTER 1 — KERINTI INTRO

Goal:
Introduce Kerinti Soft.

Mood:
- dark blue
- premium
- calm
- mysterious
- high-tech but artistic

Visual Direction:
- painted night-sky or atmospheric environment
- floating square particles
- those particles slowly assemble into a stylized QR form
- subtle motion and depth

Content Ideas:
- Kerinti Soft introduction
- short company statement
- tagline about digital transformation for restaurants

Possible Text Direction:
- “We build digital systems that simplify restaurant operations.”
- “From service flow to reporting, Kerinti turns complexity into clarity.”

---

### CHAPTER 2 — PORTAL TRANSITION

Goal:
Transition from Kerinti world into NeXa world.

Mood:
- magical
- immersive
- surprising
- premium

Visual Direction:
- the QR shape enlarges and becomes a portal or transition mask
- the dark Kerinti world opens into a brighter painted world
- use portal logic only when transitioning between major worlds

Important Rule:
This transition must feel seamless and cinematic, not like a slide transition.

---

### CHAPTER 3 — NeXa INTRO

Goal:
Introduce NeXa as the main product.

Mood:
- bright
- warm
- inviting
- operational
- human-centered

Visual Direction:
- the QR becomes a table QR inside a restaurant environment
- painterly restaurant scene
- soft daylight or warm indoor light
- artistic but clear

Content Ideas:
- NeXa as a restaurant management platform
- easy order flow
- QR-driven operations
- unified restaurant control

---

### CHAPTER 4 — CONTINUOUS PRODUCT JOURNEY

Goal:
Show what NeXa does through one continuous operational journey.

This is the most important chapter.

Instead of separate feature cards, build one visual operational flow:

QR Menu
→ Order
→ Kitchen
→ Cash Register
→ Inventory
→ Invoice / Account
→ Reporting

Important:
These should not look like isolated slides.

The animation should make each state physically transform into the next.

For example:
- a QR scan leads to a menu
- a menu action becomes an order card
- the order card travels to the kitchen
- kitchen output becomes payment flow
- payment flow becomes stock / account data
- data becomes reporting visuals

This entire chapter should feel like one elegant story.

---

### CHAPTER 5 — ABOUT KERINTI

Goal:
Return from the product world back to the company identity.

Mood:
- thoughtful
- trustworthy
- professional
- visionary

Visual Direction:
- the operational visuals dissolve back into QR modules
- the world transitions back into Kerinti’s brand atmosphere
- painterly environment remains consistent

Content Ideas:
- who we are
- our team
- our approach
- our philosophy
- who we build for
- why we care about restaurant operations

---

### CHAPTER 6 — FINALE / DEMO / CONTACT

Goal:
End with a strong call to action.

Mood:
- clean
- satisfying
- memorable
- confident

Visual Direction:
- QR modules reform into a powerful final composition
- the final visual leads naturally to:
  - demo request
  - contact
  - about / team page links
  - product details links

CTA Ideas:
- Request a Demo
- Talk to Us
- Discover NeXa
- Contact Kerinti

---

## Transition Rules

This is critical.

### DO:
- keep continuity between scenes
- preserve recurring visual motifs
- use camera-like movement
- use object transformation
- use masking / portal transitions only when justified
- make the whole experience feel like one living world

### DO NOT:
- create generic section-by-section slider behavior
- use obvious “fade out / fade in” only transitions
- make each block feel disconnected
- rely on repetitive card animations
- create a PowerPoint-like experience

---

## Visual Style Rules

We want:
- painterly illustration style
- expressive brush-like textures
- slightly surreal environments
- rich sky and atmospheric transitions
- elegant motion
- premium typography
- restrained but impactful color palette

### Main Worlds

#### World A — Kerinti
- darker blue color family
- premium corporate-tech mood
- calm and immersive

#### World B — NeXa
- brighter, cleaner, warmer palette
- restaurant/product mood
- more operational and human-centered

---

## Technical Direction

Preferred stack:
- Next.js
- React
- TypeScript
- Tailwind CSS
- GSAP + ScrollTrigger

### Technical Expectations
We want:
- one master storytelling timeline where appropriate
- pinned scenes
- scrub-controlled motion
- smooth reverse scrolling behavior
- reusable scene architecture
- strong performance
- desktop-first experience, then adapted for mobile
- reduced-motion fallback for accessibility

### Avoid
- overusing simple IntersectionObserver animations
- independent section animations that break continuity
- overcomplicated physics libraries unless truly needed

---

## Deliverables We Want From You

Please do the work in phases.

### Phase 1 — Analysis
Analyze the redesign goal and produce a structured creative/technical plan.

Create:

#### 1. `STORYBOARD.md`
Include:
- all chapters
- scene purpose
- scene start state
- scene end state
- persistent motifs
- motion direction
- transition logic
- text content suggestions
- visual art direction
- background logic
- how each scene connects to the next

#### 2. `ART_DIRECTION.md`
Include:
- visual style description
- color palette direction
- typography direction
- illustration principles
- painterly / Van Gogh-inspired adaptation rules
- how to keep the style original and not derivative

#### 3. `TECHNICAL_PLAN.md`
Include:
- component structure
- animation architecture
- GSAP / ScrollTrigger plan
- asset strategy
- SVG / canvas / image recommendations
- performance considerations
- mobile adaptation approach

#### 4. `COPY_DRAFT.md`
Include:
- short homepage copy suggestions in English
- optional Turkish adaptation notes
- headlines, subheadlines, CTA suggestions
- section text ideas for Kerinti and NeXa

---

## Phase 2 — Prototype
After the markdown planning documents are complete, implement only a limited prototype:

Prototype scope:
- Chapter 1
- Chapter 2
- Chapter 3

This prototype should validate:
- QR visual motif
- painterly style direction
- Kerinti intro
- portal transition
- introduction into the NeXa world

Do not build the entire website yet.

---

## Phase 3 — Extended Build
After prototype approval, implement the remaining chapters:
- continuous product journey
- about Kerinti
- final CTA

---

## Quality Bar

The final work should feel:
- premium
- original
- artistic
- smooth
- highly intentional
- immersive
- suitable for a real software company website

We do not want:
- generic startup website templates
- disconnected blocks
- amateur transitions
- visually noisy motion
- literal feature-card dumping

---

## What You Should Avoid

Please avoid:
- directly copying Pear.no scene compositions
- directly copying Shopify illustrations
- using exact copyrighted artwork
- making the site too long and exhausting
- turning every feature into a separate card/slide
- breaking the illusion of one continuous story

---

## Final Instruction

Please begin with the planning documents only.

Do not jump directly into coding the full homepage.

Start by producing:
- `STORYBOARD.md`
- `ART_DIRECTION.md`
- `TECHNICAL_PLAN.md`
- `COPY_DRAFT.md`

Then wait for approval before implementation.