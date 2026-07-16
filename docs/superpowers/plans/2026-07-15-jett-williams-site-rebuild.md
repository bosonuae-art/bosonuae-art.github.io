# Jett Williams Site Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, chosen by Bo) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `jatinwilliams.com` as a fast, maintainable Astro + Tailwind "Dark Editorial" site whose colors and fonts a non-developer can change in one file.

**Architecture:** Static Astro site. All theming lives in `src/styles/theme.css` (6 color vars) + `src/styles/fonts.css` (3 font vars) wired into Tailwind's theme, mirroring `portfolio-website`. All copy/contact/credits live in `src/data/site.ts`. Portfolio images are a typed content collection rendered through `astro:assets`. Reference material stays in `_mirror/` and is never built.

**Tech Stack:** Astro 4, Tailwind 3, `@astrojs/tailwind`, `@astrojs/sitemap`, `@fontsource-variable/*`, Playwright (smoke tests), Web3Forms (contact form).

## Global Constraints

- Node 18+; package `type: module`; Astro static output (no SSR adapter).
- **Theming single-source:** components never hard-code a hex or font-family — only Tailwind tokens (`bg-bg`, `text-text`, `text-muted`, `text-accent`, `border-line`, `bg-surface`) and font utilities (`font-display`, `font-body`, `font-mono`).
- **Content single-source:** contact info, credits, taglines, socials come from `src/data/site.ts` only.
- **Default palette (Dark Editorial):** `--bg:#0a0a0a` `--surface:#141414` `--text:#f5f4f2` `--muted:#9b9b97` `--accent:#c9a86a` `--line:rgba(255,255,255,.12)`.
- **Default fonts:** display=Fraunces, body=Public Sans, mono=Martian Mono (all `@fontsource-variable`).
- **Privacy:** every page renders `<meta name="robots" content="noindex, nofollow">` while `SITE_READY=false` (default). Flip one flag to go live.
- **Verbatim copy** comes from `_mirror/` + the extracted content in the design spec. No invented biographical facts.
- **Contact details:** email `Jettwilliams.svc@gmail.com`, US `+1 (469) 416 0894`, Dubai `+971 (53) 583-9444`, IG `@Jatinwilliams`, reps Bareface Management + eModels, locations Dallas–Fort Worth TX + Dubai UAE.
- Commit after each task with a `feat:`/`chore:` message.

---

## File Structure

```
package.json, astro.config.mjs, tailwind.config.mjs, tsconfig.json, vercel.json
THEME.md                      # non-dev guide: change a color / a font
README.md
src/
  styles/theme.css            # 6 color vars + presets (THE tweak file)
  styles/fonts.css            # 3 @fontsource imports + font vars
  styles/global.css           # tailwind layers + shared component classes
  data/site.ts                # all copy/contact/credits/socials
  data/siteReady.ts           # SITE_READY flag + computeNoIndex()
  content/config.ts           # gallery collection schema
  content/gallery/*.md        # one file per portfolio image (declared)
  assets/portraits/*          # curated, optimized-at-build source images
  layouts/BaseLayout.astro    # head/SEO/JSON-LD/noindex + Nav + Footer
  components/Nav.astro Footer.astro Section.astro Eyebrow.astro Button.astro
  components/CreditGrid.astro Representation.astro InstagramStrip.astro
  components/ContactDetails.astro Gallery.astro Lightbox.astro
  components/CompCard.astro ContactForm.astro
  pages/index.astro portfolio.astro comp-cards.astro about.astro contact.astro 404.astro
public/downloads/             # comp card + resume PDFs/PNGs (from _mirror)
public/favicon.svg, og/*      # icons + OG images
tests/smoke.spec.ts           # Playwright: routes 200, hero, nav, gallery, form
scripts/safe-check.mjs        # fail build on placeholders / bad ready-state
```

---

### Task 0: Scaffold project + prove build

**Files:** Create `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `src/styles/global.css`, `src/pages/index.astro` (temporary).

- [ ] **Step 1:** Write `package.json` (deps: astro, @astrojs/tailwind, @astrojs/sitemap, tailwindcss, @tailwindcss/typography, @fontsource-variable/fraunces, @fontsource-variable/public-sans, @fontsource-variable/martian-mono, typescript; dev: @playwright/test). Scripts: `dev`, `build`, `preview`, `check`, `safe-check`, `test:smoke`, `test:all`.
- [ ] **Step 2:** `astro.config.mjs` — `site: "https://www.jatinwilliams.com"`, integrations `[tailwind({applyBaseStyles:false}), sitemap()]`, `build.inlineStylesheets:"auto"`.
- [ ] **Step 3:** `tsconfig.json` with `@/*` → `src/*` path alias (Astro strict base).
- [ ] **Step 4:** `tailwind.config.mjs` — map `colors` {bg,surface,text,muted,accent,line} → CSS vars; `fontFamily` {display,body,mono} → vars; `maxWidth` {content:1200px,prose:68ch}.
- [ ] **Step 5:** Temporary `src/pages/index.astro` returning `<h1>ok</h1>`.
- [ ] **Step 6:** `npm install`. Run `npx astro build`. Expected: build succeeds, `dist/index.html` exists.
- [ ] **Step 7:** Commit `chore: scaffold astro + tailwind`.

### Task 1: Theme system + THEME.md (the tweak contract)

**Files:** Create `src/styles/theme.css`, `src/styles/fonts.css`; rewrite `src/styles/global.css`; create `THEME.md`.
**Produces:** CSS vars `--bg --surface --text --muted --accent --line`, `--font-display --font-body --font-mono`; utility classes `.eyebrow .container-content .btn-accent .chip .reveal`.

- [ ] **Step 1:** `fonts.css` — three `@import "@fontsource-variable/..."` + `:root` font vars.
- [ ] **Step 2:** `theme.css` — `:root` with the 6 default color vars, `color-scheme:dark`, plus 2–3 commented preset palette blocks (e.g. `Onyx`, `Ivory-invert`, `Noir-gold`) a user can copy over the defaults.
- [ ] **Step 3:** `global.css` — import fonts.css + theme.css, `@tailwind base/components/utilities`, base body (bg/text/font-body/line-height/antialias), `::selection`, `:focus-visible` (accent), headings→display, and component classes `.eyebrow` (mono, tracked, uppercase, muted), `.container-content` (max-w-content, responsive padding), `.btn-accent` (outline→fill on hover), `.chip`, `.hairline`, `.reveal`/`.reveal-in` + reduced-motion guard.
- [ ] **Step 4:** `THEME.md` — plain-language: "Change a color → edit the value beside `--accent` in `src/styles/theme.css`." "Change a font → swap the `@fontsource-variable/...` import + the `--font-*` value in `src/styles/fonts.css`; browse fonts at fontsource.org." Include the preset palettes and a font-pairing shortlist.
- [ ] **Step 5:** Point temp index at a token (`class="bg-bg text-accent font-display"`), `astro build`, confirm the accent color appears in `dist` CSS.
- [ ] **Step 6:** Commit `feat: theme tokens + THEME.md tweak guide`.

### Task 2: Site data + ready flag

**Files:** Create `src/data/site.ts`, `src/data/siteReady.ts`.
**Produces:** `site` object; `SITE_READY:boolean`, `computeNoIndex():boolean`.

- [ ] **Step 1:** `site.ts` — typed object: `name`, `nickname`, `role`, `taglineHero`, `statLine`, `qualityHeading`, `credits[]` ({name, work, img?}), `reps[]` ({name, phone?, email?, logo?}), `email`, `phoneUS`, `phoneIntl`, `instagram` ({handle,url}), `locations[]`, `url`, `ogImage`, `franklinQuote`, `downloads[]` ({label, file, external?}), `about` ({heading, tagline, paragraphs[], stats[], interests[]}).
- [ ] **Step 2:** Fill every field from the design spec / `_mirror` verbatim (credits: The Chosen S6, Lioness, Frisco King, Runway 817, Supercuts, Toyota Music Factory).
- [ ] **Step 3:** `siteReady.ts` — `export const SITE_READY = false;` + `computeNoIndex = () => !SITE_READY;`.
- [ ] **Step 4:** `astro check` passes (types valid). Commit `feat: centralized site data + ready flag`.

### Task 3: BaseLayout + Nav + Footer

**Files:** Create `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`. Adapt portfolio's head block.
**Consumes:** `site`, `computeNoIndex`. **Produces:** `<BaseLayout title description ogImage?>` slot shell.

- [ ] **Step 1:** BaseLayout head — charset/viewport, font preload (Fraunces/Public Sans/Martian Mono woff2 `?url`), favicon, `<title>`, description, conditional `noindex`, canonical, OG + Twitter tags, `Person` JSON-LD (name, jobTitle "Model & Actor", `sameAs:[instagram.url]`, image). Guard JSON-LD `</`→`\\u003c`.
- [ ] **Step 2:** Nav — fixed, brand ("Jett" / logo), links PORTFOLIO / COMP CARDS Q2'26 / CONTACT / ABOUT (from route list), mono uppercase, mobile toggle (details/summary or small inline script), hide-on-scroll-down via `data-nav`.
- [ ] **Step 3:** Footer — © 2025–2026 line from `site`, IG link, quick contact.
- [ ] **Step 4:** Reveal-on-scroll: small inline IntersectionObserver adding `.reveal-in` (reduced-motion → immediate).
- [ ] **Step 5:** Repoint temp index through BaseLayout; `astro build`; confirm `noindex` present, title correct. Commit `feat: base layout, nav, footer`.

### Task 4: Curate images + gallery collection

**Files:** Create `src/content/config.ts`, `src/content/gallery/*.md`, copy curated images into `src/assets/portraits/`, copy downloads into `public/downloads/`.

- [ ] **Step 1:** Review `_mirror/assets/images`; pick the strong portraits (Jett-54, Jett-72, Golden Boy set, Jet2545/2548, editorial/outdoor/studio), give them clean kebab-case names in `src/assets/portraits/`.
- [ ] **Step 2:** Copy comp card + résumé PNGs to `public/downloads/` with clean names (comp-card-q2-2026.png, modeling-resume-2026.png, acting-resume-2026.png).
- [ ] **Step 3:** `content/config.ts` — `gallery` collection schema: `image()` src, `alt`, `category` enum (Editorial|Fashion Week|Studio|Conceptual), `order:number`, `caption?`, `featured?:boolean`.
- [ ] **Step 4:** One `.md` per portfolio image with real alt text + category. Commit `feat: curated portraits + gallery collection`.

### Task 5: Shared content components

**Files:** Create `Section.astro`, `Eyebrow.astro`, `Button.astro`, `CreditGrid.astro`, `Representation.astro`, `InstagramStrip.astro`, `ContactDetails.astro`.
**Produces:** reusable blocks consumed by pages. Each reads only from `site` + props; no hard-coded copy.

- [ ] **Step 1:** `Section` (eyebrow + heading + slot, `.container-content`, `.reveal`), `Eyebrow`, `Button` (accent/ghost variants, `href`).
- [ ] **Step 2:** `CreditGrid` (maps `site.credits`, uses title-card imagery where available), `Representation` (maps `site.reps`), `ContactDetails` (email/phones/locations from `site`), `InstagramStrip` (curated shots → `site.instagram.url`).
- [ ] **Step 3:** `astro check` + build. Commit `feat: shared content components`.

### Task 6: Home page

**Files:** Rewrite `src/pages/index.astro`.

- [ ] **Step 1:** Sections top→bottom: full-bleed hero (portrait + `taglineHero`, primary CTA "Book Now"→/contact, secondary "View Portfolio"), stat band (`statLine`), "Quality Is Not an Accident" statement, `CreditGrid` ("Featured By"), `Representation`, `InstagramStrip` ("Follow The Adventure"), contact CTA band, Franklin quote.
- [ ] **Step 2:** All imagery via `astro:assets <Image>` (responsive widths, `loading` eager only for hero).
- [ ] **Step 3:** Build; visually verify via `/run` skill later. Commit `feat: home page`.

### Task 7: Portfolio page + lightbox

**Files:** Rewrite `src/pages/portfolio.astro`; create `Gallery.astro`, `Lightbox.astro`.

- [ ] **Step 1:** `Gallery` — reads gallery collection, renders responsive grid grouped by category with filter tabs (buttons toggling `data-category`); `<Image>` optimized thumbs.
- [ ] **Step 2:** `Lightbox` — click opens overlay with full image; keyboard: ←/→ navigate, ESC close; focus trap; `aria-modal`; body scroll lock; reduced-motion safe. Vanilla TS in a module script.
- [ ] **Step 3:** Page: eyebrow "Selected editorial work / q3'25–q1'26", gallery, contact CTA. Build. Commit `feat: portfolio gallery + lightbox`.

### Task 8: Comp Cards page

**Files:** Rewrite `src/pages/comp-cards.astro`; create `CompCard.astro`.

- [ ] **Step 1:** Heading "Comp Cards Q2'26 — Résumés & More". Preview cards (optimized `<Image>` of comp card + résumés) each with a download button → `public/downloads/*` (`download` attr), plus external "Actors Access" link from `site.downloads`.
- [ ] **Step 2:** Build; verify download links resolve. Commit `feat: comp cards + downloads`.

### Task 9: About page

**Files:** Rewrite `src/pages/about.astro`.

- [ ] **Step 1:** "The Man Behind the Motion" hero + tagline; bio paragraphs (nickname origin, 4y modeling/2y acting, credits); stat chips (17y martial arts, football, athletic training); interests list; portrait; contact CTA. All from `site.about`.
- [ ] **Step 2:** Build. Commit `feat: about page`.

### Task 10: Contact page + form

**Files:** Rewrite `src/pages/contact.astro`; create `ContactForm.astro`.

- [ ] **Step 1:** "Reach Out" heading + the verbatim intro paragraph; `ContactForm` (name, email, production/company, project type, message) POSTing to Web3Forms with `access_key` from `PUBLIC_WEB3FORMS_KEY` env (empty → form disabled with a note, so it builds without a key); honeypot field; success/error states via small inline script (fetch → JSON). `ContactDetails` alongside.
- [ ] **Step 2:** `.env.example` with `PUBLIC_WEB3FORMS_KEY=`. Build. Commit `feat: contact page + web3forms form`.

### Task 11: SEO polish, favicon, 404, OG

**Files:** Create `public/favicon.svg`, `src/pages/404.astro`, OG image(s) in `public/og/`, `vercel.json`.

- [ ] **Step 1:** Favicon (monogram "J"), apple-touch. `404.astro` (on-brand, link home). Set `site.ogImage` to a real portrait-derived OG in `public/og/`.
- [ ] **Step 2:** `vercel.json` (static build, security headers, cache for assets). Build; confirm sitemap emitted. Commit `feat: seo, favicon, 404, vercel config`.

### Task 12: Smoke tests + safe-check + full gate

**Files:** Create `tests/smoke.spec.ts`, `playwright.config.ts`, `scripts/safe-check.mjs`.

- [ ] **Step 1:** `safe-check.mjs` — scan `dist/` for `{{`, "TODO", "lorem"; assert `noindex` present iff `SITE_READY===false`; nonzero exit on violation.
- [ ] **Step 2:** `playwright.config.ts` (webServer: `astro preview`, baseURL 4321). `smoke.spec.ts`: each of 5 routes → 200 + `<h1>`/hero visible; nav has 4 links; `/portfolio` renders ≥1 gallery img + lightbox opens on click; `/contact` has form with name/email/message; footer © present.
- [ ] **Step 3:** `npm run test:all` (check + build + safe-check + smoke). Fix failures. Commit `test: smoke suite + safe-check gate`.

### Task 13: README + deploy notes

**Files:** Create `README.md`; ensure `THEME.md` linked.

- [ ] **Step 1:** README — what it is, run/build/test commands, where to edit (site.ts / theme.css / gallery), how to add a portfolio image, how to set the Web3Forms key, how to flip `SITE_READY` to go live, Vercel deploy steps + domain.
- [ ] **Step 2:** Commit `docs: readme + deploy guide`. Final `npm run test:all` green.

---

## Verification

Run the site with the `/run` skill (or `npm run dev`) and confirm each page renders in the browser, the lightbox works, the form validates, and switching `--accent` in `theme.css` visibly recolors the whole site. Screenshot the home + portfolio pages for Bo.

## Self-Review notes

- Spec coverage: theming (T1, THEME.md), IA/5 pages (T6–T10), data model (T2,T4), galleries+lightbox (T7), comp cards (T8), image pipeline (T4,T6 astro:assets), form (T10), IG strip (T5), SEO/JSON-LD (T3,T11), noindex/rights (T2,T3), tests (T12) — all mapped.
- No placeholders left in tasks; env-keyless build path defined for the form so CI/build never needs a secret.
- Types consistent: `site` shape defined in T2 is the only contract pages consume.
