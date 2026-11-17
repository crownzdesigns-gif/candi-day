# Candy Landing Page — Motion & Interaction Engineering Spec

> Paste this whole file into Claude Code. It is **additive only** — it layers motion and interaction onto an existing, finished candy landing page. Do not rebuild the page.

---

## 0. STACK & GROUND RULES

- **Framework:** React / Next.js (App Router).
- **Declarative animation:** Framer Motion (entrances, hover/tap variants, scroll reveals, orchestrated sequences).
- **Per-frame animation:** a single native `requestAnimationFrame` loop per continuous system (toast, cursor, candy-rain physics, background). No GSAP — it is not needed and would duplicate Framer Motion + RAF.
- **Simple loops:** pure CSS (`@keyframes` + `transform`/`opacity`) for the conveyor divider, card breathing, cloud drift.
- **Optional haptics:** `web-haptics` (`npm i web-haptics`) for the "sound-ready" interaction hooks. Feature-detect with `WebHaptics.isSupported`, gate behind `prefers-reduced-motion`, fire only on press/submit. Never block on it.
- Every animated component is `"use client"`. All `window`/DOM/pointer access lives inside `useEffect`. No `Math.random()` during render (seed it inside an effect) to avoid hydration mismatch.

---

## 1. DO NOT TOUCH (mandatory)

Preserve exactly, byte-for-byte where possible:
- Layout, grid structure, DOM order, spacing, padding, margins.
- Colors, gradients, typography, copy, image sources/paths, breakpoints.
- Existing class names and component boundaries used for layout.

You may **wrap** elements in new motion containers and **add** absolutely-positioned overlay layers (cursor, candy rain, sticker parallax). You may not restructure or restyle existing content. If an effect needs a new nesting layer, add it *around* the element without changing the element's own box.

---

## 2. GLOBAL MOTION SYSTEM

### 2.1 Transform Composition Contract (read first — this is the #1 failure risk)

**Rule: exactly one writer per element's `transform`.** Multiple systems writing the same element's transform silently overwrite each other and cause jank.

Resolve every multi-effect element with **layered nesting** — each nested layer owns one transform — OR a **single shared-state RAF** that composes all values and writes them once. The Toast is the worst offender and uses the shared-state pattern below. Apply the same discipline everywhere.

### 2.2 Two-System Architecture (never mix on one element)

| System | Owns |
|---|---|
| **Framer Motion (declarative)** | Loader sequence, navbar slide + stagger, hero word/element entrance, SVG arrow draw, CTA squash/stretch, card hover variants, scroll reveals (`whileInView`), footer letter ripple, newsletter focus, Join-button marshmallow |
| **RAF loop (imperative, `useRef` values, no re-render)** | Toast float/tilt/parallax/breathe, custom cursor + particle trail, candy-rain physics, background drift |
| **CSS only** | Conveyor divider, card-2 background breathe, card-7 cloud drift |

Per-frame physics values live in `useRef`, never `useState`. Use `useState` only for discrete UI state (loader done, easter-egg active, input focused).

### 2.3 Motion Tokens (use these names everywhere — no ad-hoc values)

Framer Motion springs:
```ts
const spring = {
  pillowy:     { type: "spring", stiffness: 260, damping: 18, mass: 0.9 }, // soft settle, tiny overshoot
  bouncy:      { type: "spring", stiffness: 400, damping: 12, mass: 0.8 }, // clear single bounce
  jelly:       { type: "spring", stiffness: 180, damping: 8,  mass: 1.0 }, // multi-oscillation wobble
  snappy:      { type: "spring", stiffness: 500, damping: 30, mass: 0.6 }, // underline swipe, fast feedback
};
```
CSS easing custom properties:
```css
--ease-candy-out:   cubic-bezier(0.22, 1, 0.36, 1);   /* soft arrival */
--ease-candy-inout: cubic-bezier(0.65, 0, 0.35, 1);
--ease-overshoot:   cubic-bezier(0.34, 1.56, 0.64, 1); /* back-out */
```
Timing scale: fast 150ms · normal 250ms · slow 400ms · stagger 40–60ms. **Exit animations run at ~70% of their enter duration.**

### 2.4 Performance constraints (non-negotiable)

- Animate **only `transform` and `opacity`**. Never animate `width`, `height`, `top`, `left`, `margin`, `padding`, or `filter` on large rasters.
- For glow, do **not** use `filter: drop-shadow` on big images — use layered `box-shadow`, a blurred pseudo-element behind the element, or a pre-baked glow asset.
- `will-change: transform` only on currently-animating elements; remove it when idle.
- Add `contain: content` (or `layout paint`) on animated card containers to scope repaints.
- Particle systems (cursor trail, candy rain) use a **fixed object pool** with a hard cap. No per-frame DOM creation/removal.
- Every RAF loop is stored in a ref and **cancelled in the effect cleanup** (`cancelAnimationFrame`) on unmount / route change.

### 2.5 Accessibility & input guards

- `prefers-reduced-motion: reduce` → kill all continuous motion (toast float, background drift, conveyor, cursor trail, candy rain). Reduce entrances to a 200ms opacity fade. Skip the easter egg.
- Coarse / touch pointer → no custom cursor (show native), no hover-only effects; map card interactions to a tap state. Keep min 44×44px touch targets.
- Preserve real focus states (visible outline with `outline-offset`) on nav links, inputs, buttons. Keyboard reachable.
- Create one shared `useReducedMotion()` hook and one `usePointerFine()` hook; every system reads them.

### 2.6 Hydration safety

- Loader is client-only and must not change document layout height (overlay, `position: fixed`, removed from flow on exit).
- No layout shift (CLS = 0): reserve space for revealed elements; reveals animate `opacity` + `translateY`, never `display`/height.

---

## 3. SECTION SPECS

### 3.1 Loader (overlay, `position: fixed`, z-top)
- **Wrapper twist:** candy wrapper element rotates `±8deg`, 0.5s per swing, `--ease-candy-inout`, 2 full cycles (loops until progress completes).
- **Rainbow gummy bar:** width via `transform: scaleX()` (origin left) 0→1. Tie `scaleX` to real asset/font load progress; if unavailable, simulate over 1.8–2.4s with `--ease-candy-out`.
- **Text cycle:** swap "Unwrapping sweetness…" → "Loading sugar rush…" → "Almost chewy…" every 0.8s with a 150ms crossfade.
- **Exit:** loader `scale 1 → 0.92` + opacity → 0 over 0.3s; simultaneously page reveals `scale 1.02 → 1` + opacity 0 → 1 with `spring.pillowy`. Then unmount loader. Total exit ≤ 0.5s.

### 3.2 Navbar (Framer Motion)
- Container slides `y: -100% → 0` with `spring.pillowy`.
- Menu items `staggerChildren: 0.05`, each `y: -12 → 0` + opacity, `spring.bouncy`.
- Link hover: underline swipe via a child `scaleX 0 → 1` (origin left) `snappy`, plus parent `rotate` wiggle keyframe `[0, -2, 2, 0]deg` over 0.3s.
- "Join for free" button: hover = `spring.pillowy` `scale 1.06`; tap `scale 0.96`. Optional `trigger("nudge")` on tap.

### 3.3 Hero entrance (Framer Motion, orchestrated, one timeline)
Sequence with delays:
1. Headline reveals **word-by-word**, `staggerChildren: 0.06`, each `y: 24 → 0` + opacity, `--ease-candy-out` 0.5s. (Split into word spans; keep line wrapping intact.)
2. Subtext `y: 16 → 0` + opacity, 0.4s `--ease-candy-out`, starts after headline.
3. CTA `scale 0.6 → 1` + `rotate [-4, 0]deg`, `spring.bouncy`.
4. Toast image enters `x: 80 → 0` + `rotate: 6 → 0`, `spring` `{stiffness:200,damping:16}`.
5. Curved arrow draws via `stroke-dasharray`/`stroke-dashoffset` (`pathLength` in Framer Motion) 0→1, 0.8s `--ease-candy-inout`, after toast lands.

### 3.4 Toast continuous interaction (SINGLE shared-state RAF)
**Nesting (each layer = one transform writer):**
```
.toast-float   → translate3d(0, floatY, 0) rotate(baseRot)      // idle drift
  .toast-tilt  → perspective(800px) rotateX(tiltX) rotateY(tiltY) translate(parallaxX, parallaxY)
    .toast-img → scale(breatheScale)                            // breathing
  .toast-sticker[i] (siblings, absolute) → translate3d(stickerX*depth, stickerY*depth, 0)
```
One RAF reads one `pointerRef` and one `toastStateRef`, computing per frame (`t` = elapsed ms):
- `floatY   = Math.sin(t * 0.0011) * 10`  (≈5.7s period, ±10px)
- `baseRot  = Math.sin(t * 0.0008) * 2`   (±2deg)
- `breathe  = 1 + Math.sin(t * 0.0013) * 0.012` (±1.2%)
- On hover, target `tiltX = -py * 6`, `tiltY = px * 6` where `px,py` = pointer offset from toast center normalized to `[-1,1]`. Lerp current→target at `0.08`.
- Sticker parallax: same lerped pointer offset × per-sticker `depth` of `0.04 / 0.08 / 0.12`.
- On pointer leave, targets return to 0 (lerp handles the settle).

Write all six values to their owning layers **once per frame**. No Framer Motion on these layers.

### 3.5 CTA button squash/stretch (Framer Motion)
- Hover: `scaleX 1.06 / scaleY 0.94` (squash) `spring.pillowy`; arrow child `x: 0 → 6`.
- Release/tap-up: keyframe `scaleY [0.94, 1.12, 1]`, `scaleX [1.06, 0.92, 1]` (stretch then settle), `--ease-overshoot` 0.4s.
- Shadow grows via a pseudo-element opacity (not `filter`).

### 3.6 Grid + cards
**Shared base hover (all 7), `spring.pillowy` ~0.35s:** frame has `overflow: hidden`; inner image `scale 1.06`; card `translateY -6px`; `box-shadow` grows; `filter: brightness(1.05)` (small element only). Cards reveal on scroll (see §3.8).

**Unique layer per card (additive on top of base):**
1. **Rainbow gummy:** `spring.jelly` wobble on hover-enter — keyframe `scale [1, 1.04, 0.98, 1.02, 1]` + `skewX [0, 1.5, -1, 0]deg`; optional `border-radius` morph for wave.
2. **Text card:** text `scale 1 → 1.03` slow CSS loop (paused under reduced-motion); background `scale 1.0 ↔ 1.02` + opacity breathe, 6s CSS.
3. **Wrapped candy:** candy `rotate 0 → 4deg`; two wrapper-end children rotate `+6deg` / `-6deg` (opposite), `spring.pillowy`.
4. **Bubble gum:** `rotate 0 → 12deg` + `scale 1.08`, `spring.bouncy`.
5. **Candy landscape:** background pan — RAF or pointer-driven CSS var; bg `translate` = pointer offset × `0.06`, clamped to card bounds.
6. **Club card:** text `translateY -6px` + soft glow (layered `box-shadow`/`text-shadow`, no `drop-shadow`).
7. **Sky card:** clouds CSS `translateX` loop (20–30s linear); lollipop `rotate` slow loop (`±6deg`, 8s).

### 3.7 Section divider — conveyor (CSS only)
Duplicate the pixel strip into a track of 2× width; animate `transform: translateX(0 → -50%)` `linear` infinite (~12s), seamless loop. Pause under reduced-motion.

### 3.8 Scroll effects (Framer Motion `whileInView`, `once: true`, `IntersectionObserver`)
Distinct reveal per section (no repeats):
- **Hero:** stagger entrance (already covered, on mount).
- **Grid:** cards `whileInView` stagger `0.06`, each `scale 0.92 → 1` + `y 20 → 0`, `spring.bouncy`.
- **Footer:** rises `y: 40 → 0` + opacity, `--ease-candy-out`.
- **Wordmark:** elastic reveal `scale 0.8 → 1`, `spring.jelly`.

### 3.9 Custom cursor + trail (RAF, fine-pointer only)
- Hide native cursor on `.page` (fine pointer only); render a fixed candy cursor that lerps toward pointer at `0.35`.
- Trail: object pool, hard cap **18** particles; spawn one per ~30px of movement. Each particle fades `opacity 1 → 0` + `scale 1 → 0.4` over 600ms via the same RAF, transform-only, then recycled. No new DOM nodes per frame.

### 3.10 Newsletter input
- Focus: border glow via `box-shadow` transition (pink→purple) 0.25s.
- Candy icon drops in: `y: -12 → 0` + opacity, `spring.bouncy`.
- Placeholder shifts to a floated label via `transform: translateY` + `scale` 0.2s (no layout shift).

### 3.11 Join button — marshmallow (Framer Motion, the important one)
On hover (and `whileTap`), one keyframe sequence, `times [0, 0.2, 0.45, 0.7, 1]`, duration 0.6s, `--ease-candy-inout`:
- `scaleY: [1, 0.82, 1.12, 0.96, 1]` (compress → stretch → overshoot → settle)
- `scaleX: [1, 1.14, 0.92, 1.03, 1]`
- Optional `trigger("nudge")` on submit-success use `trigger("success")`.

### 3.12 Footer wordmark "candi-licious" (hero interaction)
- Split into **individual letter spans**. **Apply the gradient + `background-clip: text` to each letter span directly, not the parent** — a gradient on the transformed parent will not paint onto transformed children.
- Hover (ripple, left→right): each letter `delay = index * 0.04s`; per letter keyframe `scaleY [1, 0.7, 1.3, 1]` + `y [0, 4, -8, 0]` (squish before bounce), `spring.jelly`.
- Shimmer: animate `background-position` across the gradient during motion (cheap, no layout/`filter`). No real "noise distortion."
- Click: stronger jelly wave — same ripple, larger amplitude (`scaleY [1, 0.6, 1.45, 0.9, 1]`), propagated left→right.

### 3.13 Easter egg — candy rain (RAF physics)
- Trigger: 5 logo clicks within a 1.5s rolling window (track timestamps in a ref).
- Spawn ~40 pooled candy elements at top with randomized x and velocity (seed random inside the effect). Per frame: gravity, integrate velocity, bounce off all four viewport edges with restitution `~0.7`. Single RAF, transform-only.
- After 4s: fade all `opacity → 0` over 0.6s, then stop RAF and unmount. Skip entirely under reduced-motion.

### 3.14 Background grid (RAF or CSS, barely perceptible)
- Opacity breathe `0.9 ↔ 1` over ~20s.
- Soft drift: `transform: translate` a few px on an absolutely-positioned background layer (or animate `background-position`). Never animate layout. Disable under reduced-motion.

---

## 4. IMPLEMENTATION ORDER (build + verify phase by phase)

- **Phase 0 — Foundation:** add motion tokens, `useReducedMotion()`, `usePointerFine()`, optional haptics wrapper. No visual change yet.
- **Phase 1 — Entrances (lowest risk):** navbar, hero sequence, SVG arrow, scroll reveals (§3.2–3.3, §3.8). Confirm Do-Not-Touch layout unchanged.
- **Phase 2 — Hover microinteractions:** nav links, CTA squash, all card base + unique hovers, Join marshmallow, newsletter focus (§3.5–3.6, §3.10–3.11).
- **Phase 3 — Continuous RAF/CSS systems:** toast shared-state loop, conveyor, background, card-2/5/7 loops (§3.4, §3.7, §3.14). One system at a time; profile each.
- **Phase 4 — Cursor system:** custom cursor + pooled trail (§3.9).
- **Phase 5 — Footer wordmark + easter egg physics:** (§3.12–3.13).
- **Phase 6 — Loader:** built last so dev isn't gated behind it (§3.1).
- **Phase 7 — Polish pass:** reduced-motion audit, touch audit, perf profiling, transform-collision audit.

Build and run a clean build after each phase before moving on.

---

## 5. VERIFICATION CHECKLIST (pass/fail before done)

- [ ] **Transform-collision audit:** every animated element has exactly one transform writer (layer or shared-state RAF). Toast confirmed composed in one loop.
- [ ] **60fps:** each continuous system holds 60fps in DevTools → Performance (toast, cursor, candy rain, background). No long tasks / layout thrash.
- [ ] **Only `transform`/`opacity` animated.** No `width/height/top/left/margin/filter` on large rasters in any animation.
- [ ] **Clean `next build`** with zero hydration warnings in console.
- [ ] **CLS = 0:** loader and all reveals cause no layout shift.
- [ ] **`prefers-reduced-motion`:** continuous motion off, entrances become fades, easter egg skipped — verified.
- [ ] **Touch / coarse pointer:** native cursor shown, no broken hover-only states, tap fallbacks work, 44px targets.
- [ ] **RAF cleanup:** all loops cancelled on unmount/route change (no leaked loops, no rising CPU after navigation).
- [ ] **Do Not Touch intact:** layout, spacing, colors, copy, image sources unchanged vs original.
- [ ] **Wordmark gradient** paints on each transformed letter (clip applied per-letter).

---

## DECISIONS BAKED IN (flag if you disagree)
1. **No GSAP** — Framer Motion + one RAF per system covers everything here and matches the rest of the stack.
2. **Toast uses the shared-state single-RAF pattern**, not separate effect loops, because float + tilt + parallax + breathe all touch the same subtree.
3. **Haptics are optional and feature-detected** — the "sound-ready hooks" line is satisfied by `web-haptics` presets on press/submit, gated behind reduced-motion. Drop it if you want zero new deps.
