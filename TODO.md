# TODO

Tracking real gaps and pending decisions — not a wishlist. Check items off in the PR/commit that closes them, don't just delete the line.

## Blocking

- [ ] **Vercel deploy connection.** `create_git_project` failed with a 403 — Vercel's GitHub App is likely scoped to "selected repositories" and doesn't have `gorilla-industry` in its list. User needs to go to [github.com/settings/installations](https://github.com/settings/installations) → Vercel → Configure → add the repo (or switch to "All repositories") → tell Claude to retry.

## Content gaps

- [ ] **Dead `#contact` link.** [Header.astro:15](src/components/Header.astro:15) links to `#contact` but no section on the page has `id="contact"` — clicking it does nothing. Either build a real contact section/form, or point it somewhere real (email link, a `/contact` page).
- [ ] **Duplicated body copy.** The "We are a creative design studio obsessed with..." paragraph is copy-pasted verbatim in both [About.astro](src/components/About.astro:20) and [WhatWeDo.astro](src/components/WhatWeDo.astro:42). Fine as a placeholder, but should be two distinct paragraphs before this ships for real.
- [ ] **EN / ES toggle is decorative.** [Header.astro](src/components/Header.astro) renders the language switcher but there's no i18n routing behind it — clicking "ES" does nothing.
- [ ] **No footer.** The Figma "Desktop" frame declares a 5608px canvas but has no designed content below the gallery (~y:4466) — nothing to port, but a real site needs a footer (contact info, socials, legal, sitemap links) before launch.

## Design gaps (no Figma reference existed for these — see [DESIGN.md](DESIGN.md))

- [ ] **No Mobile/Tablet Figma frames.** Every responsive breakpoint (900px nav, 1200px decor, 640px gallery/scroll-indicator) is our own judgment call. Worth a design review pass once there's a real mobile audience, or once Figma gets mobile frames to match against.
- [ ] **Keyboard focus states.** Buttons and nav links have no visible `:focus-visible` treatment — currently relies on the browser default outline, which may clash with the dark background. Needs an explicit accessible focus style.

## Technical / launch checklist

- [ ] **Run a production build** (`npm run build`) before the first real deploy — this project has only been checked via `astro dev`, never built for production.
- [ ] **SEO basics missing**: no Open Graph / Twitter card meta tags, no `sitemap.xml`, no `robots.txt`. `Layout.astro` only sets `<title>` and a generic description-less head.
- [ ] **Favicon is still the Astro scaffold default** (`public/favicon.svg`) — not a Gorilla Industry mark.
- [ ] **Image weight**: gallery photos (`public/images/*.png`) are unoptimized PNG exports straight from Figma (tens to ~100KB each) — fine for now, but convert to `.webp`/`.avif` or route through Astro's `<Image>` before this needs to be fast.

## Nice-to-haves (not blocking, don't do unless asked)

- [ ] Gallery images aren't linked to anything (no case study, no lightbox) — currently pure decoration.
- [ ] The "START A PROJECT" buttons don't go anywhere (`<button>`, not a link) — needs a real destination (contact section, Calendly, mailto) once there's somewhere for them to lead.
