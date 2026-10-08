# RootKube — Project Context

> Written so a fresh AI session (or a new engineer) can be productive without
> re-explaining the project. Read this first.
>
> Keep it current: when you change architecture, motion rules, or conventions,
> update the relevant section in the same commit.

---

## 1. What this is

A single-page marketing site for **RootKube**, a digital product engineering
company (software, AI, cloud, data, automation). It is a premium B2B site whose
job is to make a technically sophisticated buyer trust that this team can build
serious systems.

- **Live editor:** connected to [Lovable](https://lovable.dev). Commits pushed
  to the connected branch sync back into the Lovable editor.
- **Deploy target:** Cloudflare (there is a `.wrangler` directory).

### The one architectural rule

From `AGENTS.md`:

> Keep the RootKube marketing experience as a **modular single-page site** —
> its navigation and narrative are designed as one continuous scroll.

Do not split sections into separate routes. Navigation is anchor-based within
one page.

### Lovable constraint (important)

**Never rewrite published git history** — no force-push, no rebase/amend/squash
of already-pushed commits. It rewrites history on Lovable's side and the user
loses project history. Also keep the connected branch in a working state,
because every push shows up in the editor.

---

## 2. Stack

| Concern | Choice |
|---|---|
| Framework | TanStack Start + TanStack Router (SSR) |
| Build | Vite 8 |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Radix) |
| Motion | GSAP 3 (incl. premium plugins) + `motion` (Framer Motion v13) |
| Smooth scroll | Lenis |
| Tests | Vitest + Testing Library (jsdom) |
| Package manager | npm (a `bun.lock` exists but `package-lock.json` is current) |

### Commands

```sh
npm run dev      # vite dev — port 8080, falls back to 8081 if taken
npm run build
npm run lint     # eslint, with prettier as a rule (formatting fails lint)
npm test         # vitest run
npx tsc --noEmit # typecheck
```

### Known gotchas

- **`tsc` can OOM** on this project. If it dies, that is the known issue, not
  your change.
- **2 routing tests fail on clean `main`** (`src/test/app-routing.test.tsx`).
  They are pre-existing and unrelated to the marketing page — do not attribute
  them to your work, and do not "fix" them as a side quest.
- **Line endings are CRLF** throughout. Scripts that rewrite files must
  preserve them (open with `newline=''` in Python).
- **Strict TS** is on, including `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, and `noImplicitReturns`. Array access returns
  `T | undefined` — the guards you see everywhere are required, not paranoia.

---

## 3. Page structure

`src/components/rootkube-site.tsx` composes the whole page in order:

```
ScrollProgress  →  SiteHeader  →  Hero  →  CapabilityMarquee  →  Introduction
→  Services  →  Problems  →  Process  →  Technology  →  WhyRootKube  →  About
→  Footer
```

Anchor ids used by the nav: `#top` (Hero), `#intro`, `#services`,
`#solutions` (Problems), `#about`, `#contact` (Footer).

Providers live in `src/routes/__root.tsx`:
`SmoothScrollProvider` → `CustomCursor` + `Preloader` → `PreloadContext.Provider`.

`PreloadContext` carries a single boolean: **true once the preloader has handed
off** (or was skipped because it already ran this session). Hero animations gate
on it via `usePreloadDone()` so nothing starts underneath the overlay.

---

## 4. Motion system

This is the heart of the site, and the easiest thing to get wrong.

### 4.1 The taste bar — read this before adding animation

The motion brief is **"refined & premium," not cinematic.** Showy motion
actively costs credibility with this B2B audience — it reads as a template, and
it undercuts the claim that this team builds serious systems. Restraint is the
product argument.

Practically: motion should feel like *engineering*, not *decoration*. Things
that respond to the user, suggest live systems, or reveal structure earn their
place. Things that just move do not.

### 4.2 Shared vocabulary

`src/motion/ease.ts` is the single source of timing truth:

- `EASE = [0.22, 1, 0.36, 1]` — the house curve. Everything lands on it.
- `GSAP_EASE = "expo.out"`, plus `DURATION` and `STAGGER` scales.

`src/components/sections/shared.tsx` exports the scroll-reveal presets. They are
deliberately **differentiated** — one shared reveal across every section reads
as no animation at all by the third screen:

- `reveal` — the default.
- `revealSoft` — supporting copy that shouldn't compete.
- `revealRise` — cards, lifted into place.
- `revealSlide` — list rows that read left-to-right.

All four share `EASE`, so the vocabulary stays coherent.

### 4.3 GSAP premium plugins are available and free

SplitText, DrawSVG, MorphSVG, and Flip are already in `node_modules` and may be
used directly. For text splitting, prefer `autoSplit` and keep an accessible
label (`aria-label` on the heading) so screen readers never see per-character
spans.

### 4.4 Three rules that are non-negotiable

**1. Reduced motion.** Every animated surface must settle into a correct static
state under `prefers-reduced-motion: reduce`. `useGsap` and most hooks skip
their effect entirely in that mode — which means anything that *starts hidden
and is revealed by an animation* needs its resolved state written in the
reduced-motion CSS block, or it stays invisible forever. See
`.process-line-fill` and `.tech-core-icon` in `src/styles.css` for the pattern.

**2. No hydration branches.** The server always renders with reduced motion
*off*. So the **JSX tree must not branch** on `useReducedMotion()` — only
durations and delays may. If an element must be hidden under reduced motion,
hide it in the CSS media query, not by conditionally rendering it. (This is why
`useReducedMotion` starts `false` and corrects in an effect.)

**3. Animate transform and opacity only.** Nothing in the motion layer should
trigger layout. Per-frame writes go through `gsap.quickSetter`/`quickTo` to
avoid allocating a tween per frame.

### 4.5 Performance discipline

Infinite loops pause when their section leaves the viewport. `useHeroParallax`
reports in-view state via ScrollTrigger, and the hero uses it to pause packet
timelines. Follow this pattern for any new looping animation.

### 4.6 Motion file map

```
src/motion/
  ease.ts                  Timing tokens. Start here.
  use-reduced-motion.ts    SSR-safe reduced-motion hook.
  use-gsap.ts              Scoped GSAP context (auto-revert, StrictMode-safe).
  smooth-scroll-provider/  Lenis, wired into ScrollTrigger.
  preloader.tsx            Once per session (sessionStorage-gated).
  preload-context.ts       usePreloadDone() — the hero's start gate.
  custom-cursor.tsx        Custom cursor.
  scroll-progress.tsx      Scroll rail (marketing page only).
  hero-network.ts          Hero diagram TOPOLOGY (data).
  use-hero-network.ts      Hero diagram SIMULATION (behaviour).
  use-hero-path-draw.ts    Hero diagram one-time DrawSVG trace.
  hero-cursor-lines.tsx    Crosshair lines tracking the pointer.
  use-hero-parallax.ts     Hero parallax + in-view reporting.
  use-active-section.ts    Nav active-state tracking.
  use-split-reveal.ts      SplitText reveals.
  use-marquee-velocity.ts  Scroll velocity modulating the marquee.

src/components/motion/
  split-heading.tsx, scramble-text.tsx, count-up.tsx,
  magnetic-button.tsx, use-magnetic.ts, use-pointer-spotlight.ts
```

---

## 5. The hero diagram (`HeroSystem`)

The signature element: a network graph of five labelled nodes — AI, SOFTWARE,
CLOUD, DATA, AUTOMATION — wired together over a grid, with a
`SYSTEMS CONNECTED` status readout. It is the visual thesis of the whole site,
so it gets more engineering than anything else on the page.

### Design intent

It must read as a **live system under load**, not an illustration of one. The
earlier version revealed itself once and then held still, which made it
decorative. The current version keeps working after the reveal.

### Architecture — separation of concerns

| File | Owns |
|---|---|
| `src/motion/hero-network.ts` | **Data.** Nodes, edges, packet routes. |
| `src/motion/use-hero-network.ts` | **Behaviour.** The live simulation. |
| `src/motion/use-hero-path-draw.ts` | **Intro.** The one-time DrawSVG trace. |
| `hero.tsx` → `HeroSystem` | **Markup.** Renders from the data. |

Node positions are **fractions of the panel** (`x: 0.17`), not pixels or
percent strings, so the layout survives any aspect ratio. Edges reference nodes
**by index**, never by coordinate — that is precisely what allows the lines to
be rebuilt from live positions every frame.

### The lifecycle (order matters)

```
preloader done  →  useHeroPathDraw traces edges  →  traced=true
                →  useHeroNetwork takes over and runs forever
```

**These two must never overlap.** DrawSVG works by setting
`stroke-dasharray`/`dashoffset` against a path's *measured length*; the
simulation rewrites `d` every frame. Run both at once and the dash values
describe a path that no longer exists, and the edges flicker. Hence
`useHeroPathDraw` returns a `traced` flag, clears the dash props on completion,
and the simulation is gated on that flag — not on `draw`.

### What the simulation does

One `requestAnimationFrame` loop drives four things:

1. **Independent drift.** Each node wanders on its own pair of sines at
   incommensurate rates, with its own phase and radius. Independent phases are
   the point: a shared bob reads as decoration. The centre node (AUTOMATION)
   has a small radius because it anchors the graph.
2. **Pointer repulsion.** Nodes are pushed away from the cursor with a squared
   falloff inside a 150px radius, and ease back when it leaves. The easing (as
   opposed to assignment) is what gives them weight. This is the beat that
   makes the graph feel like matter rather than a picture.
3. **Depth and parallax** — see below.
4. **Live edges.** Every edge's `d` is recomputed each frame from current node
   centres, so lines and boxes move as one rigid structure. Without this, lines
   would detach from their boxes the instant anything moved.

### The depth model

Every node carries a `z` (-1 back, 1 front), and the panel is a 3D stage
(`perspective: 1100px`). The scene tilts toward the pointer, and **each node
parallaxes in proportion to its own `z`** — near nodes swing wide, far nodes
barely move.

That differential parallax is the load-bearing cue. The eye reads relative
motion as depth far more strongly than it reads shading, so shadows and scale
alone produce a styled flat diagram, not a space.

`z` drives five things that must move together, or the illusion collapses:

| Cue | Effect |
|---|---|
| Parallax | swing under tilt, proportional to `z` |
| Scale | `SCALE_FAR` 0.87 → `SCALE_NEAR` 1.09 |
| Opacity | far nodes fade to `FADE_FAR` (aerial perspective) |
| Stacking | `z-index` assigned once by depth rank |
| Edge weight | `--edge-depth` per edge, from its endpoints' mean `z` |

Packets also interpolate `r` along their leg, so a dot running from a far node
to a near one grows as it comes forward.

### Hover = approach, not zoom

A hovered node is pulled toward the camera with a real `translateZ` (`HOVER_Z`),
under the panel's `perspective`. The browser then derives foreshortening and
converging edges, which is what the eye reads as *approaching*. Scaling alone
only makes a flat rectangle bigger — that's "zoomed", not "nearer", and it was
the main thing making the earlier version feel like a styled 2D diagram.

Alongside the approach: a small lift off the floor (`HOVER_LIFT`), a cast shadow
that grows **and softens** with elevation, an accent rim on the lit top edge, and
a counter-rotation so the node squares up to face the viewer as it arrives. The
hovered node is also promoted to `z-index: 40` so it paints in front of the
entire stack, not just the nodes it started behind.

The hover weight is **eased**, not switched, so the pop has the same inertia as
the rest of the scene.

#### The `overflow` trap (important)

`.hero-system` deliberately has **no `overflow: hidden`**. Per spec, any
`overflow` other than `visible` forces `transform-style: flat` on the element —
which silently collapses the Z axis and undoes the entire 3D effect. Clipping is
done with `clip-path` on the background layers instead, which also lets a node
travelling toward the camera overhang the panel edge rather than being sliced
off at it.

Depth values that never change (`z-index`, `--edge-depth`) are written **once**
on setup, not per frame.

Separately, **packet timelines** send dots along multi-hop routes. Each leg
resolves its position from live node centres on every update, so a packet stays
on its wire even while both endpoints are drifting. On arrival a packet pulses
the receiving node's core — the delivery is what sells it as *traffic* rather
than animation. Routes follow the product story (data → software → cloud), so
a viewer who actually traces a dot sees something coherent.

Hovering a node lights its incident edges and warms its border, answering
"what is this connected to?" on contact.

### Degradation

- **No JS / SSR:** edges ship with a static `d` computed from the same
  fractional coordinates against a square viewBox, so the complete, correct
  diagram renders. Packet dots start at `opacity 0` and are positioned entirely
  by JS, so they are simply absent.
- **Reduced motion:** the simulation never starts; the static diagram stands.
  Packet dots are hidden via the CSS media query (not a JSX branch — see rule 2
  above).
- **Off-screen:** packet timelines pause. The drift rAF keeps running because
  the edges would desync from the nodes otherwise.

### Gotchas

- `.system-node` is centred with `translate: -50% -50%` (the CSS `translate`
  property), **not** a transform. The simulation owns `transform` outright and
  overwrites it every frame, so any centring translate there would be destroyed
  on the first frame.
- The hovered index lives in React state (it drives the lit edges in markup) but
  the loop reads it through a **ref**. Putting `hovered` in the effect's deps
  would tear down and restart the whole simulation on every pointer enter.
- Node depth styling is applied by JS, so cleanup clears `transform`, `opacity`
  *and* `zIndex`.
- **`useHeroPathDraw` must open its `traced` gate on every exit path**, not just
  the timeline's `onComplete`. Killing the timeline in cleanup skips
  `onComplete`, so a StrictMode remount or any re-run of the effect would leave
  the gate shut forever and the simulation would never start — the diagram froze
  after its intro trace and only looked right on a lucky hard refresh. The
  cleanup and the "nothing to trace" early return both set it now.

---

## 5c. The capability marquee

`src/components/sections/capability-marquee.tsx` +
`src/motion/use-marquee-velocity.ts`.

The strip of capability labels under the hero. It travels left, speeds up with
scroll velocity and reverses when you scroll up — and each item rotates about
the vertical axis by its own live position, so the band reads as a **cylinder
turning** rather than a flat ribbon sliding.

### Why per-item rotation

Rotating the *track* rotates it as one rigid plane, which just skews the whole
strip. The cylinder effect requires each item's angle to be a function of where
*that item* currently is, which can only be computed per item, per frame.

A `FLAT_ZONE` (0.3) holds the middle of the band square to the viewer, so the
centre labels stay cleanly readable. Without it everything is permanently
angled and the effect costs legibility — not a trade worth making for a band
whose job is to be read.

### Performance: no layout reads in the loop

The obvious implementation calls `getBoundingClientRect()` per item per frame.
That is a forced synchronous reflow in a hot loop, and worse, it reads layout
*after* GSAP writes transforms — textbook layout thrash.

Instead: resting offsets are measured once per resize, and live position is
derived arithmetically from the tween. The per-frame work is pure arithmetic
and touches layout not at all.

**Gotcha:** the tween animates `xPercent`, so that is what must be read back
and converted to px. Reading `"x"` returns 0 and the strip never turns.

### The `overflow` trap again

`.capability-band` has **no `overflow: hidden`** — same reason as
`.hero-system`: it would force `transform-style: flat` and silently collapse
the rotation. It uses `clip-path` plus a horizontal mask instead, so items
dissolve at the edges rather than being cut off mid-turn.

### Tests

`src/test/marquee-wrap.test.ts` pins the wrap arithmetic — the genuinely tricky
part, since items are duplicated and the track slides a full loop. It covers
the band centre/edges, range bounds across a full loop, the wrap-around case,
and monotonic travel. These caught a real bug during development.

## 6. Styling conventions

- **All colors are `oklch`.** No hex, no rgb. To add a semantic color: add the
  variable to `:root` *and* `.dark`, then register it in `@theme inline` as
  `--color-<name>`.
- Key tokens: `--primary` is a cyan/teal, `--accent` is a yellow-green used for
  live-signal elements (status dot, packets, lit edges).
- `src/styles.css` holds the design system plus component classes, written as
  **dense single-line rules**. Match that style when adding to it.
- Fonts: `Space Grotesk` (display), `Manrope` (sans), `DM Mono` (mono). The mono
  face carries the "engineering" register — labels, status readouts, section
  indices.
- The aesthetic is a dark technical console: thin borders, grid overlays, sharp
  corners (`rounded-none` on buttons), uppercase mono microcopy with wide
  letter-spacing.

---

## 7. Code conventions

- **Comments explain *why*, not *what*.** The existing comments are unusually
  dense and document non-obvious constraints (hydration traps, StrictMode
  double-mounting, plugin interactions). This is deliberate — match it. When you
  work around a subtle constraint, write down the constraint.
- Path alias: `@/` → `src/`.
- Prettier runs as an ESLint rule, so **formatting errors fail lint.** Run
  `npx eslint --fix` before committing.
- Section components live in `src/components/sections/`, one file per section.
  `src/components/ui/` is shadcn — generally leave it alone.

---

## 8. Working agreements

- Verify with `npx tsc --noEmit` and `npm run lint` before declaring work done.
  Remember the 2 pre-existing routing test failures.
- Before adding motion, re-read §4.1. The bar is restraint.
- Commit attribution and git hygiene: see the Lovable constraint in §1.
