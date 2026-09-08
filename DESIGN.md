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

## Liana physics (desktop only) — `LianaField`

The 3 lianas used to be static SVGs with a discrete CSS `@keyframes` sway triggered on `pointerenter`, then a simple 3-rope Verlet sim. Both were replaced (per explicit reference code from the user) with [LianaField.astro](src/components/LianaField.astro): a standalone, reusable canvas component simulating a whole field of vines — 14 by default, Verlet-integrated, gravity + 6-pass distance constraints, gravity 0.18 / friction 0.95, bent by the mouse's recent velocity within a 130px radius. Most vines anchor only at the top and hang straight down; up to 2 anchor at **both** ends and rest in an inverted-arch "U" shape (points initialized along a sine curve between the two anchors) — mixing the two silhouettes is what makes it read as a real curtain of vines instead of a few identical lines. Each vine also grows a handful of small branches (quadratic curve + a filled "leaf" dot at the tip) and casts a soft drop shadow.

It's intentionally generic (props: `top`, `width`, `height`, `vineCount`, all defaulted to Hero's current usage) so it can be dropped into another section later without copying the physics code — it only needs a `position: relative` ancestor. It gates its own visibility (`display:none` below 1200px and under `prefers-reduced-motion`, matching `matchMedia` in its script so the rAF loop doesn't even start there) — [Hero.astro](src/components/Hero.astro) is responsible for showing the **static** liana SVGs (`.liana-static`) as the fallback in that case; the two live in different files and share the `1200px` constant by convention, not by import.

**Gotcha hit once (still relevant with any canvas/rAF component here):** an earlier version added a continuous ambient "wind" sine force so ropes wouldn't rest perfectly straight (physically correct but visually static without pointer input). That force was a raw per-frame position delta rather than being properly integrated, and destabilized the constraint solver over a few hundred frames — ropes visibly collapsed short of their real length. Caught it by sampling `canvas.getImageData` for ink at increasing `y`, not by trusting a screenshot. Fixed by removing the ambient force and keeping only a one-time random spawn jitter per point (doesn't touch the ongoing integration).

## Internationalization

English (default, served at `/`) and Spanish (`/es/`) via Astro's native i18n routing (`astro.config.mjs`: `i18n.defaultLocale: 'en'`, `locales: ['en','es']`, `routing.prefixDefaultLocale: false`). All copy lives in [src/i18n/en.json](src/i18n/en.json) and [src/i18n/es.json](src/i18n/es.json) — same shape in both files. [src/i18n/utils.ts](src/i18n/utils.ts) exports `useTranslations(lang)`; every component that renders text calls `useTranslations(Astro.currentLocale)` itself rather than receiving strings as props, so adding a new locale-aware component is just importing that helper, no prop-drilling through parents.

Two page trees mirror each other: [src/pages/index.astro](src/pages/index.astro) (English) and [src/pages/es/index.astro](src/pages/es/index.astro) (Spanish) render the identical component tree — Astro infers `Astro.currentLocale` from which one matched. The header's language switcher uses `getRelativeLocaleUrl()` from `astro:i18n` rather than hardcoded `/es/` paths.

**Adding a new UI string**: add the key to both JSON files (same path/shape in each) before using it in a component — there's no fallback-to-English for a missing Spanish key at the field level, `useTranslations` only falls back to English if the *whole locale* is unrecognized.

**Spanish copy is a first-pass translation, not yet reviewed** — see TODO.md.

## Services — hover accordion

Only the first service ("Web Design") is open by default. Hovering any other row opens it (yellow background, dark text, its `items` list expands) and closes whichever was open; leaving the whole `.services` list resets to the first row. Implemented in [WhatWeDo.astro](src/components/WhatWeDo.astro)'s inline script (`pointerover` / `pointerleave` on the list container toggling a single `.open` class), styled in [Service.astro](src/components/Service.astro). Every service now carries a 4-item `items` list (the original Figma only had copy for "Web Design"; the rest were written to match — see below).

## Content

The Figma file's own English copy ("We are a creative design studio...") was kept as-is. Actual `Lorem ipsum` placeholder blocks (hero subtitle, the big About headline, and the 5 services that had no copy) were rewritten with real agency positioning copy. All of it now lives in [src/i18n/en.json](src/i18n/en.json) (see "Internationalization" below) rather than inline in the components.

## SEO

Deliberately kept separate from `src/i18n/` — per-locale page metadata (title, description, keywords, OG locale) lives in [src/seo/seo.json](src/seo/seo.json), read via [src/seo/utils.ts](src/seo/utils.ts)'s `getSeo(lang)`, consumed only by [Layout.astro](src/layouts/Layout.astro). That's the one file to edit for title/description/keyword changes — no component touches SEO copy directly. `Layout.astro` renders canonical + `hreflang` alternates (`en`, `es`, `x-default`) via `astro:i18n`'s `getRelativeLocaleUrl`, plus Open Graph and Twitter Card tags; both use `Astro.url.origin` for absolute URLs rather than a hardcoded domain, since none is configured yet (see TODO.md — Vercel isn't connected). `og:image`/`twitter:image` point at `public/images/poster.png` as a placeholder — swap for a real 1200×630 share graphic before launch.

## Verifying changes in this environment

The Claude Code browser preview pane runs the tab in a backgrounded/hidden state most of the time. Three known artifacts to not mistake for real bugs:

1. **CSS transitions freeze while the tab is hidden.** `getComputedStyle` on a transitioned property (e.g. `.service` background-color) can report the pre-change value indefinitely, even seconds later, even with `document.hidden === false` after `tabs_select`. To check the *end-state* logic is correct, temporarily set `el.style.transition = 'none'` before toggling the class, then read `getComputedStyle` — the real animation works fine for actual users in a visible tab.
2. **`requestAnimationFrame` doesn't tick at all while the tab is hidden** — worse than the CSS case above, this isn't throttled, it's fully paused, and `document.hidden` can report `false` right after `tabs_select` while rAF still never fires (confirmed by patching `window.requestAnimationFrame` to count invocations: 1 call — the initial schedule — then nothing, even after `tabs_select`). Hit this building [LianaField.astro](src/components/LianaField.astro): the canvas sized correctly and the script ran with zero errors, but `canvas.getImageData` showed 0 drawn pixels. Don't conclude the animation logic is broken from this alone — verify the *logic* by temporarily swapping `requestAnimationFrame(tick)` for `setTimeout(tick, 16)` in a scratch copy of the script (via `eval`, not in the real file) and re-checking pixel data; if that draws correctly, the algorithm is fine and it's this artifact, not a bug. Leave the shipped code on `requestAnimationFrame` — it's the correct choice for real users (pauses appropriately for battery in a genuinely backgrounded tab, syncs to actual display refresh).
3. **Cross-session dev-server cache collisions.** Reusing the same `localhost` port across different Astro dev server restarts (or different projects, in this environment) can serve a stale cached document/stylesheet to an already-open tab even after a hard navigate. If a change isn't showing up despite `curl` confirming the server has the right HTML/CSS, bump the port in [.claude/launch.json](.claude/launch.json) and restart the preview rather than debugging further — it's the environment, not the code.
