# Jett Williams Site Rebuild — Design Spec

**Date:** 2026-07-15
**Status:** Draft for review
**Owner:** Bo (rebuilding for Jatin "Jett" Williams)

## 1. Goal

Rebuild `jatinwilliams.com` — currently a Squarespace portfolio/booking site for
Jatin "Jett" Williams, an international model & actor (Dallas–Fort Worth + Dubai) —
as a clean, fast, maintainable Astro + Tailwind site that can eventually **replace
the live site**. Priorities, in order:

1. **Easy for Jett to tweak** — colors and fonts changeable in one file, one line,
   no component edits. This is the top constraint and drives the architecture.
2. **Visual wow-factor** — a high-end "Dark Editorial" look worthy of a working
   model/actor.
3. **Performance & polish** — fast loads, optimized responsive imagery, smooth
   galleries, mobile-first.
4. **Portfolio & comp cards** — strong galleries + downloadable comp card / résumés.
5. **Discoverability & booking** — SEO, OG cards, structured data, a working
   contact form.

## 2. Approach (decided)

- **Hybrid**: a faithful static **mirror** of the current site was captured first as
  a reference archive (`_mirror/` — 5 pages of HTML + 51 source images incl. the
  high-res comp cards and résumés). We then **rebuild** the good parts fresh.
- **Stack**: Astro (static output) + Tailwind CSS. Same stack as Bo's
  `portfolio-website`, reusing its proven patterns: content collections,
  `astro:assets` image optimization, `@astrojs/sitemap`, Playwright smoke tests,
  and a `safe-check` gate.
- **Deploy** (later): Vercel + custom domain `jatinwilliams.com`.

## 3. Design system — the "easy to tweak" contract

This is the defining feature of the build. All theming lives in **one place**.

### Colors — CSS custom properties at `:root` (in `src/styles/theme.css`)

| Variable     | Default (Dark Editorial) | Role                              |
|--------------|--------------------------|-----------------------------------|
| `--bg`       | `#0a0a0a`                | page background (near-black)      |
| `--surface`  | `#141414`               | cards, raised panels              |
| `--text`     | `#f5f4f2`               | primary text (warm white)         |
| `--muted`    | `#9b9b97`               | secondary text, captions          |
| `--accent`   | `#c9a86a`               | links, highlights (subtle gold)   |
| `--line`     | `rgba(255,255,255,.12)`  | borders, dividers                 |

Changing the whole site's palette = editing these 6 values. Tailwind is configured
to read these variables (e.g. `bg-bg`, `text-text`, `text-muted`, `text-accent`,
`border-line`) so components never hard-code a hex.

### Fonts — 3 variables + self-hosted via `@fontsource`

| Variable         | Default                     | Role                             |
|------------------|-----------------------------|----------------------------------|
| `--font-display` | Fraunces (light, editorial) | headlines, hero                  |
| `--font-body`    | Public Sans                 | body copy, UI                    |
| `--font-mono`    | Martian Mono                | small-caps labels / kickers      |

Wired into Tailwind's `fontFamily` as `font-display`, `font-body`, `font-mono`.
Swapping a font = change one `@fontsource` import in `src/styles/fonts.css` and the
matching variable. (Public Sans + Martian Mono are already used in Bo's portfolio.)

### `THEME.md`

A plain-language guide at repo root: "To change a color, open `src/styles/theme.css`
and edit the value next to `--accent`…". Includes a short list of nice preset
palettes Jett can paste in.

## 4. Information architecture

Five pages (parity with current site, good for SEO), each improved:

| Route         | Purpose                                                             |
|---------------|---------------------------------------------------------------------|
| `/`           | Hero, stats, "Featured By" credits, representation, IG strip, CTA   |
| `/portfolio`  | Category-tabbed galleries + lightbox                                |
| `/comp-cards` | Inline previews + downloadable comp card & résumés + Actors Access  |
| `/about`      | "The Man Behind the Motion" bio, credits, background                |
| `/contact`    | Inquiry form + full booking details                                 |

All shared content is centralized (see §5) so contact info, credits, and taglines
are defined once and reused everywhere.

## 5. Data model

- **`src/data/site.ts`** — single source of truth: name, nicknames, taglines, the
  stat line (65k views/quarter, 76% retention), reps (Bareface Management, eModels),
  emails/phones (US + Dubai), locations, Instagram handle, credits list
  (The Chosen S6, Lioness, Frisco King, Runway 817, Supercuts, Toyota Music Factory),
  and download filenames.
- **`src/content/gallery/`** (content collection) — each portfolio image declared
  with `src`, `alt`, `category` (Editorial / Fashion Week / Studio / Conceptual),
  and optional `caption`. No directory-scan fallback — every image is declared, so
  nothing appears by accident (mirrors the portfolio's discipline).
- **Comp card / résumé downloads** — declared as a small list (label + file), served
  from `public/downloads/`.

## 6. Key components

- **Gallery** — responsive masonry/grid, category tabs, keyboard-accessible
  **lightbox** (arrow-key nav, focus trap, ESC to close). Lazy-loaded.
- **Comp cards** — inline preview thumbnails that open full-size, plus one-click
  downloads: Modeling Résumé '26, Acting Résumé '26, Comp Card, and an external
  Actors Access link.
- **Image pipeline** — all portraits run through `astro:assets` → responsive WebP
  with width descriptors. The ~30 MB of source images load as a few hundred KB.
  The large comp card / résumé PNGs (5–7 MB) stay full-res only on their download
  links; previews are optimized.
- **Contact form** — **Web3Forms** (free, static-friendly, access-key only; posts
  and emails Jett). Honeypot + basic validation. Upgrade path noted: Vercel
  serverless function + Resend if a backend is ever wanted.
- **Instagram** — a curated "Follow the Adventure" strip of hand-picked shots
  linking to `@Jatinwilliams`. No live/embedded feed (deprecated API, fragile).
- **Motion** — tasteful, reduced-motion-respecting fade/rise on scroll. No heavy JS.

## 7. SEO & discoverability

- Per-page `<title>`/`<meta description>`, canonical URLs, `@astrojs/sitemap`.
- Open Graph + Twitter cards per page (hero-derived OG images).
- **`Person` structured data** (JSON-LD): name, `jobTitle`, `sameAs` → Instagram +
  agency pages — strong signal for casting/agency search.

## 8. Content, rights & safety

- Real likeness → ship with `noindex, nofollow` until Bo **and Jett** approve which
  photos/credits are public (same guard pattern as the portfolio repo).
- Confirm with Jett the featured photo set and that agency/credit mentions are OK.
- `_mirror/` is reference only and is excluded from the published build.

## 9. Testing & quality gates (reuse portfolio patterns)

- `astro check` (types + content schema).
- `astro build` (static output into `dist/`).
- Playwright smoke test: each route returns 200, hero renders, nav works, a gallery
  image and the contact form are present.
- `safe-check` script: fail the build if any `{{placeholder}}`, TODO, or the
  `noindex` flag state is inconsistent with intent.

## 10. Non-goals (YAGNI)

- No CMS/admin UI — content lives in typed files.
- No live Instagram feed, no e-commerce/cart (the current site's cart is vestigial).
- No blog.
- No custom serverless backend at launch (Web3Forms covers the form).
- No pixel-perfect clone of Squarespace markup — we keep the content, not the HTML.

## 11. Open questions for review

1. Accent color — is subtle **gold** (`#c9a86a`, nods to his "Golden Boy" set) the
   right default, or start neutral (off-white) and let Jett add color?
2. Display font — **Fraunces** (soft editorial serif) vs a sharper high-fashion
   serif (e.g. Cormorant)? Both are one-line swaps regardless.
3. Contact form — OK to use **Web3Forms** (needs a free access key tied to Jett's
   email), or prefer a plain `mailto:` to start?
