# Theming guide — colors & fonts

Everything about how the site *looks* (its colors and fonts) lives in **two small
files**. You don't need to touch any page or component to restyle the whole site.

---

## Change a color

Open **`src/styles/theme.css`**. At the top you'll see six lines:

```css
:root {
  --bg: #0a0a0a;        /* page background        */
  --surface: #141414;   /* cards / raised panels  */
  --text: #f5f4f2;      /* main text              */
  --muted: #9b9b97;     /* secondary text         */
  --accent: #c9a86a;    /* links, buttons, accents*/
  --line: rgba(255,255,255,.12); /* borders/lines */
}
```

Change a value on the right, save, and the whole site updates.
Example — make the accent a deep red instead of gold:

```css
  --accent: #b5485a;
```

Colors are standard hex codes (`#rrggbb`). Pick any at a site like
[coolors.co](https://coolors.co) or Google "hex color picker".

### Ready-made palettes

The bottom of `theme.css` has a few **preset palettes** (Onyx, Bordeaux, Ivory).
To use one, copy its six values over the six in `:root`. Ivory turns the site
light instead of dark — follow the note next to it.

---

## Change a font

Open **`src/styles/fonts.css`**. There are two parts:

```css
@import "@fontsource/bebas-neue";             /* the headline font   */
@import "@fontsource-variable/public-sans";   /* the body text font  */
@import "@fontsource-variable/martian-mono";  /* the small label font*/

:root {
  --font-display: "Bebas Neue", sans-serif;                /* headlines */
  --font-body: "Public Sans Variable", sans-serif;         /* body      */
  --font-mono: "Martian Mono Variable", monospace;         /* labels    */
}
```

To swap the headline font (for example, to **Cormorant**):

1. Browse fonts at **[fontsource.org/fonts](https://fontsource.org/fonts)** and
   copy the package name (e.g. `@fontsource-variable/cormorant`).
2. Install it: in a terminal in this folder run
   `npm install @fontsource-variable/cormorant`
3. In `fonts.css`, change the display line to
   `@import "@fontsource-variable/cormorant";`
   and set `--font-display: "Cormorant Variable", serif;`

Save, and every headline changes. Same idea for body and label fonts.

### Font pairings that work on a dark, editorial site

| Headline (display) | Body        | Feel                    |
|--------------------|-------------|-------------------------|
| Bebas Neue *(default)* | Public Sans | tall, condensed, bad-boy fashion |
| Anton              | Public Sans | ultra-heavy rock-poster |
| Archivo Black      | Inter       | bold modern grotesque   |
| Fraunces           | Public Sans | warm, refined editorial |

## The evolving accent (color from his work)

The gold accent isn't fixed — as you scroll, it **morphs to the dominant color of
whichever photo is on screen** (red editorials → red, gold-in-water → teal, runway
→ purple), and each gallery photo casts a soft glow in its own color. Those colors
are extracted from the images automatically.

- The **starting/default** accent is still `--accent` in `theme.css` — change it to
  set the base color (shown in the hero and anywhere no photo is in view).
- If you **add or change portrait photos**, re-run the extractor so the new colors
  are picked up: `node scripts/extract-colors.mjs`
- Prefer a **fixed** gold everywhere instead of the evolving effect? Tell me and I'll
  switch it off in one place (visitors who set "reduce motion" already get the fixed
  accent automatically).

---

## After changing something

Run `npm run dev` and open the local address it prints — you'll see your changes
live as you edit. When you're happy, `npm run build` produces the final site.
