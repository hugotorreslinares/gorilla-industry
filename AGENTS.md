## Project

Gorilla Industry ("GRL") — a marketing/branding agency landing page, built in Astro from a Figma design. See [DESIGN.md](DESIGN.md) for the design decisions, fidelity tradeoffs, and known environment quirks behind this codebase — read it before touching layout, typography, or the decorative Hero/About backgrounds.

## Stack & conventions

- Astro, no framework islands, no Tailwind — plain scoped `<style>` per component.
- Section components live in `src/components/`, one file per Figma section (`Hero`, `About`, `WhatWeDo`, `Gallery`, `Header`), plus small reusable pieces (`Button`, `Service`, `ScrollIndicator`, `DecorFrame`).
- `DecorFrame.astro` is the shared pattern for anything positioned with Figma's raw pixel coordinates (decorative backgrounds bled outside the normal content flow) — reuse it rather than re-deriving the fixed-1728px-centered-frame math per component. See DESIGN.md § "Decorative layers pinned to the Figma frame."
- Colors, fonts and the header-height offset are CSS custom properties in `src/styles/global.css` — don't hardcode hex values in components.
- Images live in `public/images/`, downloaded once from Figma's asset export (those URLs expire in ~7 days, so re-fetching from Figma is not an option if a file goes missing — check git history instead).

## Development

Dev server config lives in `.claude/launch.json`. **If the browser preview shows stale content that doesn't match the source** (a very reliable local symptom: `curl localhost:<port>` shows the right HTML/CSS but the browser tab doesn't), don't debug the CSS — bump the port number in `.claude/launch.json` and restart the preview. This environment has repeatedly shown cross-session cache bleed on reused ports. See DESIGN.md § "Verifying changes in this environment" for this and one other sandbox-specific artifact (CSS transitions freezing in a backgrounded tab) before concluding a hover/animation feature is broken.

When starting the dev server directly (outside the browser-preview tool), use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Deployment

GitHub: [github.com/hugotorreslinares/gorilla-industry](https://github.com/hugotorreslinares/gorilla-industry), `main` branch.

Vercel: not yet connected. `create_git_project` failed with a 403 the first time — Vercel's GitHub App is likely scoped to "selected repositories" and doesn't have access to this repo yet. Fix is on the user's side (GitHub → Settings → Installations → Vercel → add `gorilla-industry` to repository access), not something to retry blindly from this side.

## Content & i18n

All copy lives in `src/i18n/en.json` / `src/i18n/es.json`, not inline in components — see DESIGN.md § "Internationalization." Editing a component's text means editing the JSON key it reads, in **both** files (no per-key fallback, only a whole-locale one). Real agency copy, not lorem ipsum — see DESIGN.md § "Content" for what was rewritten and why. If asked to add more sections/services, keep the same voice (short, confident, no filler) and follow the existing services' shape: a title plus a 4-item bullet list, added to the `services` array in both JSON files.

Spanish is a first-pass translation the user hasn't reviewed yet (see TODO.md) — don't treat `es.json` as authoritative copy to build further Spanish content from without flagging that.

## Documentation

Full Astro documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
