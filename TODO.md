# TODO

Tracking real gaps and pending decisions — not a wishlist. Check items off in the PR/commit that closes them, don't just delete the line.

## Live

Deployed and auto-deploying on every push to `main`: **[gorilla-industry.vercel.app](https://gorilla-industry.vercel.app)**. Vercel Web Analytics is enabled and collecting data (see DESIGN.md § "SEO" / the Analytics commit — no domain is hardcoded anywhere, canonical/OG URLs derive from the request at render time, so this'll keep working if a custom domain gets attached later).

## Blocking

_(none right now)_

## Content gaps

- [ ] **Dead `#contact` link.** [Header.astro:15](src/components/Header.astro:15) links to `#contact` but no section on the page has `id="contact"` — clicking it does nothing. Either build a real contact section/form, or point it somewhere real (email link, a `/contact` page).
- [ ] **Duplicated body copy.** The "We are a creative design studio obsessed with..." paragraph is copy-pasted verbatim in both `about.copy` and `whatWeDo.copy` in [en.json](src/i18n/en.json) / [es.json](src/i18n/es.json). Fine as a placeholder, but should be two distinct paragraphs before this ships for real.
- [ ] **Spanish translations need human review.** [es.json](src/i18n/es.json) is a first-pass translation written by Claude, not checked by a native/professional translator yet — user explicitly asked to review it before it ships. Don't treat it as final copy.
- [ ] **No footer.** The Figma "Desktop" frame declares a 5608px canvas but has no designed content below the gallery (~y:4466) — nothing to port, but a real site needs a footer (contact info, socials, legal, sitemap links) before launch.

## Design gaps (no Figma reference existed for these — see [DESIGN.md](DESIGN.md))

- [ ] **No Mobile/Tablet Figma frames.** Every responsive breakpoint (900px nav, 1200px decor, 640px gallery/scroll-indicator) is our own judgment call. Worth a design review pass once there's a real mobile audience, or once Figma gets mobile frames to match against.
- [ ] **Keyboard focus states.** Buttons and nav links have no visible `:focus-visible` treatment — currently relies on the browser default outline, which may clash with the dark background. Needs an explicit accessible focus style.

## Technical / launch checklist

- [ ] **Run a production build** (`npm run build`) before the first real deploy — this project has only been checked via `astro dev`, never built for production.
- [x] ~~SEO basics missing~~ — title, description, keywords, canonical, hreflang alternates, Open Graph and Twitter Card tags are all in [Layout.astro](src/layouts/Layout.astro), copy sourced from [src/seo/seo.json](src/seo/seo.json) (per-locale, not hardcoded in components). Still missing: `sitemap.xml` and `robots.txt` (neither exists yet), and `og:image` points at `public/images/poster.png` — a placeholder, not a purpose-made 1200×630 social share graphic.
- [ ] **Favicon is still the Astro scaffold default** (`public/favicon.svg`) — not a Gorilla Industry mark.
- [ ] **Image weight**: gallery photos (`public/images/*.png`) are unoptimized PNG exports straight from Figma (tens to ~100KB each) — fine for now, but convert to `.webp`/`.avif` or route through Astro's `<Image>` before this needs to be fast.

## Nice-to-haves (not blocking, don't do unless asked)

- [ ] Gallery images aren't linked to anything (no case study, no lightbox) — currently pure decoration.
- [ ] The "START A PROJECT" buttons don't go anywhere (`<button>`, not a link) — needs a real destination (contact section, Calendly, mailto) once there's somewhere for them to lead.
