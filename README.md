# Jett Williams — jatinwilliams.com

A fast, editorial rebuild of the portfolio & booking site for **Jatin "Jett"
Williams**, international model & actor. Built with [Astro](https://astro.build)
and Tailwind CSS as a clean, static site — replacing the original Squarespace
build. Dark, image-forward, and designed so the colors and fonts can be changed
in a single file.

## Run it

```bash
npm install
npm run dev          # http://localhost:4321
```

Other scripts:

```bash
npm run build        # static build into dist/
npm run preview      # serve the built site locally
npm run check        # type + content-schema check
npm run safe-check   # audit dist for placeholders + noindex/ready-state
npm run test:smoke   # Playwright smoke tests
npm run test:all     # full gate: check + build + safe-check + smoke
```

## Where everything lives

Day-to-day edits happen in a handful of files:

| I want to change… | Edit |
|-------------------|------|
| **Colors or fonts** | `src/styles/theme.css` / `src/styles/fonts.css` — see **[THEME.md](./THEME.md)** |
| **Any text, contact info, credits, links** | `src/data/site.ts` (single source of truth) |
| **Which portfolio photos show** | `src/data/gallery.ts` + images in `src/assets/portraits/` |
| **Comp cards / résumés** | PDFs in `public/downloads/`, previews in `src/assets/downloads/`, list in `site.ts` → `downloads` |

Everything reads from `site.ts` — no copy is hard-coded in a page.

### Add a portfolio image

1. Drop the image into `src/assets/portraits/` (kebab-case name).
2. Add an entry in `src/data/gallery.ts` with its `alt` text and a `category`
   (`Editorial`, `Fashion Week`, `Studio`, or `Conceptual`).

Astro optimizes it to responsive WebP automatically. Nothing appears in the
gallery unless it's declared — so no image shows up by accident.

## The contact form

The "Reach Out" form uses [Web3Forms](https://web3forms.com) (free, no backend).
Until a key is set, the form is inert and points visitors to the email address —
so the site builds and deploys without any secret.

To turn it on:

1. Create a free access key at web3forms.com tied to Jett's inbox.
2. Copy `.env.example` to `.env` and paste the key:
   `PUBLIC_WEB3FORMS_KEY=your-key-here`
3. On Vercel, add the same variable under **Project → Settings → Environment
   Variables**.

## Going live

The site ships with `noindex, nofollow` on every page so it stays private during
development. **One switch** opens it to search engines:

1. Confirm with Jett which photos and credits are public.
2. In `src/data/siteReady.ts`, set `SITE_READY = true`.
3. Rebuild. `safe-check` verifies the `noindex` tags are gone.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — the framework
   auto-detects as Astro (config is in `vercel.json`).
3. Add `PUBLIC_WEB3FORMS_KEY` under Environment Variables.
4. Add the `jatinwilliams.com` custom domain under **Settings → Domains** and
   point the DNS as Vercel instructs.

`site` in `astro.config.mjs` is already set to `https://www.jatinwilliams.com`
(drives canonical URLs, OG tags, and the sitemap).

## Reference archive

`_mirror/` holds a captured snapshot of the original Squarespace site (HTML +
images) used as source material for the rebuild. It is not part of the build.

## Design & planning docs

- `docs/superpowers/specs/2026-07-15-jett-williams-site-rebuild-design.md`
- `docs/superpowers/plans/2026-07-15-jett-williams-site-rebuild.md`
