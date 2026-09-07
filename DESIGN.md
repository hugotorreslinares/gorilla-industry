# Design notes — Gorilla Industry

Source of truth: Figma file "🦍 Gorilla Industry" (fileKey `J3F3Jnogu2Ee0mMxKG1CQ7`), node `17:820` ("Desktop", 1728×5608). Only a Desktop frame exists — no Mobile/Tablet frames were designed, so every responsive decision below is our own judgment call, not a 1:1 Figma reference.

## Tokens

Colors and type scales came from `get_variable_defs` on the Figma node, defined as CSS custom properties in [src/styles/global.css](src/styles/global.css):

| Token | Value | Use |
|---|---|---|
| `--bg-dark` | `#19150a` | page / hero / services background |
| `--bg-light` | `#ffc000` | about background, highlighted service card |
| `--text-body-light` / `--text-body-dark` | `#fff2cc` / `#19150a` | body copy on dark / light backgrounds |
| `--text-heading-light` / `--text-heading-dark` | `#ffc000` / `#2a2311` | headings on dark / light backgrounds |
| `--font-heading` | Changa One | display type |
| `--font-body` | Work Sans | body copy, nav, buttons |

Fonts loaded via Google Fonts in [Layout.astro](src/layouts/Layout.astro) (Changa One, Work Sans 400/700, Space Mono for the scroll indicator).

## Fluid typography

Figma gave exact px values for one fixed canvas width (1728). To scale those across viewports without a pile of breakpoints, every big heading uses `clamp()` derived from two anchor points — 360px viewport → a hand-picked minimum size, 1728px viewport → the exact Figma size — solved as a linear `px + vw` function:

```
slope = (max - min) / (1728 - 360)
intercept = min - slope * 360
clamp(min, intercept + slope*vw, max)
```

`letter-spacing` is expressed in `em` (Figma's px value ÷ its own font-size) and `line-height` unitless (Figma's leading ÷ font-size), so both scale automatically with the clamped font-size instead of needing their own breakpoints.

Applied to: Hero `h1` (230px display), About/WhatWeDo `h2` headlines (120px), Service `.title` (44px).

**Gotcha hit once:** writing `clamp(x, Yvw + Zvw, W)` instead of `clamp(x, Ypx + Zvw, W)` silently collapses to a flat `vw` value (no px offset) — check clamp expressions have exactly one `vw` term.

**Another gotcha:** `h1`/`h2` have no default browser margin reset in most starters, and Astro's `minimal` template doesn't add one either. At a 230px font-size, the UA-default `margin-block` (~0.67em) adds ~150px of invisible space per side. [global.css](src/styles/global.css) resets `p, h1, h2, h3 { margin: 0 }` — if a section's height looks unexplainably large, check this first before touching padding.

## Decorative layers pinned to the Figma frame — `DecorFrame`

The hero lianas/doodle and the About background wave are positioned with Figma's exact pixel coordinates (from `get_metadata`, e.g. liana-2 at `x:842, y:-87`). Those coordinates are only meaningful relative to a 1728px-wide canvas. If they're positioned as a percentage of a *fluid* section width, they drift out of alignment with the text the moment the viewport isn't exactly 1728px (true on almost every real monitor — 1920px is the common case).

Fix: [DecorFrame.astro](src/components/DecorFrame.astro) is a fixed 1728px-wide box, horizontally centered (`left:50%; margin-left:-864px`), that decorative children are positioned inside using Figma's raw px values verbatim. Used by [Hero.astro](src/components/Hero.astro) (doodle + 3 lianas) and [About.astro](src/components/About.astro) (the wave background).

**Do not use `transform: translateX(-50%)` to center this kind of wrapper.** `transform` creates a new stacking context, which silently caps every descendant's `z-index` — a child can never out-rank an ancestor-level sibling (like the sticky header) no matter how high its own `z-index` is set. That's why centering uses `margin-left: -864px` instead — it achieves the same visual centering without creating a stacking context, so `.liana { z-index: 60 }` can genuinely paint above `.header { z-index: 50 }`.

## The About wave transition

`about-bg.svg` is a flattened export of Figma's "About bg" layer: a yellow wave shape with a gorilla-face watermark, transparent above the wave line. The wave line's screen position is fixed at ~415px (from the SVG's own path data — the highest dip in the wave), independent of viewport width, because the image is rendered at its native 1816×1401 size inside `DecorFrame`, not stretched with `object-fit: cover`.

This means **`.about`'s own background must be `--bg-dark`, not `--bg-light`.** The image's transparent region reveals whatever sits behind it — if the section background were already yellow, the wave would be invisible (yellow-on-yellow). Below the 1200px breakpoint the image is hidden entirely and the section background is switched to solid `--bg-light` instead.

Padding on `.about` has a `@media (min-width: 1201px)` override that pushes `padding-top` up to 652px and `padding-bottom` to 350px (both exact Figma values, same clamp-derivation method as typography) — enough to clear the ~415px dark band so the headline never sits on top of the transition. If you touch this section's spacing again, keep the headline's top edge comfortably past 415px or it'll re-clip into the dark band.

## Breakpoints

No Figma reference below 1728px, so these are our own calls:

- **1200px** — hero lianas and the About wave image hide (both are pinned-canvas decoration that only makes sense at large widths); About switches to a solid-yellow background.
- **900px** — header nav collapses to a hamburger drawer.
- **640px** — hero doodle and the scroll indicator hide; gallery grid drops from 3 to 2 columns.

## Scroll-snap

`html { scroll-snap-type: y proximity }` (global.css) with `scroll-snap-align: start` on `#hero`, `#about`, `#services`, `.gallery`. `proximity` (not `mandatory`) so it doesn't fight the user on a long section like the gallery. `scroll-margin-top: var(--header-height, 104px)` on each target so a snapped section doesn't end up hidden under the sticky header. Disabled under `prefers-reduced-motion: reduce`.

## Liana hover animation

Each of the 3 lianas swings on hover with a **different** keyframe animation so they don't read as one repeated effect:

- `liana-sway-1` (big vine) — pure rotation pendulum around its tilted base angle (-6.44deg), slowest (1.4s).
- `liana-sway-2` (thin vine) — rotation + `translateX` "whip" with more oscillation steps, fastest (0.8s).
- `liana-sway-3` (bushy vine) — rotation + `scaleY` "bounce" for a heavier feel, mid speed (1.3s).

Triggered via JS (`pointerenter` adds `.is-swaying`, `animationend` removes it) rather than pure CSS `:hover`, so a quick mouse-past still plays the full settle animation instead of cutting off. All respect `prefers-reduced-motion`.

## Services — hover accordion

Only the first service ("Web Design") is open by default. Hovering any other row opens it (yellow background, dark text, its `items` list expands) and closes whichever was open; leaving the whole `.services` list resets to the first row. Implemented in [WhatWeDo.astro](src/components/WhatWeDo.astro)'s inline script (`pointerover` / `pointerleave` on the list container toggling a single `.open` class), styled in [Service.astro](src/components/Service.astro). Every service now carries a 4-item `items` list (the original Figma only had copy for "Web Design"; the rest were written to match — see below).

## Content

The Figma file's own English copy ("We are a creative design studio...") was kept as-is. Actual `Lorem ipsum` placeholder blocks (hero subtitle, the big About headline, and the 5 services that had no copy) were rewritten with real agency positioning copy — see git history on `Hero.astro`, `About.astro`, `WhatWeDo.astro` for the exact wording if it needs revisiting.

## Verifying changes in this environment

The Claude Code browser preview pane runs the tab in a backgrounded/hidden state most of the time. Two known artifacts to not mistake for real bugs:

1. **CSS transitions freeze while the tab is hidden.** `getComputedStyle` on a transitioned property (e.g. `.service` background-color) can report the pre-change value indefinitely, even seconds later, even with `document.hidden === false` after `tabs_select`. To check the *end-state* logic is correct, temporarily set `el.style.transition = 'none'` before toggling the class, then read `getComputedStyle` — the real animation works fine for actual users in a visible tab.
2. **Cross-session dev-server cache collisions.** Reusing the same `localhost` port across different Astro dev server restarts (or different projects, in this environment) can serve a stale cached document/stylesheet to an already-open tab even after a hard navigate. If a change isn't showing up despite `curl` confirming the server has the right HTML/CSS, bump the port in [.claude/launch.json](.claude/launch.json) and restart the preview rather than debugging further — it's the environment, not the code.
