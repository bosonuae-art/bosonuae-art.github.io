// ── Screenshot harness ────────────────────────────────────────────────────
// Captures every page at phone / tablet / desktop widths so changes can be
// reviewed as rendered images instead of by eye-in-the-dark editing.
//
//   node scripts/shots.mjs                 # all pages, all sizes → ./.shots
//   node scripts/shots.mjs --out <dir>     # write PNGs somewhere else
//   node scripts/shots.mjs --pages /,/about
//   node scripts/shots.mjs --sizes mobile,desktop
//   node scripts/shots.mjs --above-fold    # viewport-height shots, not full page
//
// Server: if something already answers on :4487 (e.g. a running `astro dev
// --port 4487` or `astro preview`), it screenshots that — so during active work
// the shots always reflect your live source. Otherwise it builds fresh and
// serves `dist/` via `astro preview`, then shuts that server down when done.

import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 4487;
// Pin to IPv4 — astro preview binds 127.0.0.1, but `localhost` resolves to the
// IPv6 [::1] on some Windows boxes, so a `localhost` probe can miss a live server.
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;
const isWin = process.platform === "win32";
// Launch Astro's JS entry with `node` directly — spawning the `.cmd` shim via a
// shell is flaky on Windows (quoting) and leaves a process tree to clean up.
const astroEntry = "node_modules/astro/astro.js";

// ── args ──
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const OUT = opt("out", process.env.SHOTS_OUT || ".shots");
const fullPage = !flag("above-fold");

const ALL_PAGES = [
  { slug: "home", path: "/" },
  { slug: "about", path: "/about" },
  { slug: "portfolio", path: "/portfolio" },
  { slug: "comp-cards", path: "/comp-cards" },
  { slug: "contact", path: "/contact" },
  { slug: "press", path: "/press" },
];
const ALL_SIZES = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
];

const pages = filterBy(ALL_PAGES, opt("pages", ""), (p) => [p.slug, p.path]);
const sizes = filterBy(ALL_SIZES, opt("sizes", ""), (s) => [s.name]);

function filterBy(list, csv, keysOf) {
  if (!csv) return list;
  const want = csv.split(",").map((s) => s.trim()).filter(Boolean);
  const hit = list.filter((item) => keysOf(item).some((k) => want.includes(k)));
  return hit.length ? hit : list;
}

// ── server ──
async function isUp() {
  try {
    const res = await fetch(BASE + "/", { signal: AbortSignal.timeout(1500) });
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isUp()) {
    console.log(`• using the server already on ${BASE}`);
    return null; // not ours — leave it running
  }
  if (!existsSync("dist/index.html")) {
    console.log("• no build found — running `astro build`…");
    const built = spawnSync(process.execPath, [astroEntry, "build"], { stdio: "inherit" });
    if (built.status !== 0) throw new Error("astro build failed");
  }
  console.log(`• starting astro preview on ${BASE}…`);
  const child = spawn(process.execPath, [astroEntry, "preview", "--port", String(PORT), "--host", HOST], {
    stdio: "ignore",
  });
  for (let i = 0; i < 60; i++) {
    if (await isUp()) return child;
    await sleep(500);
  }
  stopServer(child);
  throw new Error(`preview server never came up on ${BASE}`);
}

function stopServer(child) {
  if (!child) return;
  if (isWin) spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"]);
  else child.kill("SIGTERM");
}

// ── settle: fonts + a full scroll pass to trigger lazy images / scroll effects ──
// Every wait here is bounded — off-screen lazy images that never fire load/error
// must not be able to hang the run.
async function settle(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) { try { await document.fonts.ready; } catch {} }
    // Force lazy images to fetch even while off-screen — otherwise a full-page
    // capture paints them black (their fetch is deferred until near-viewport).
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = "eager"; });
    for (let y = 0; y <= document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    // Force scroll-reveal elements into their shown state. They start at
    // opacity:0 (still occupying layout) and fade in via IntersectionObserver on
    // real scroll; fast programmatic scrolling doesn't reliably trigger them, so
    // a static capture would show finished pages as black voids. This makes the
    // shot represent the fully-revealed page a real visitor sees.
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("reveal-in"));
    // Decode every image so offscreen ones paint in a full-page capture instead
    // of rendering black — a large image can be "complete" (loaded) yet not
    // decoded, which a full-page screenshot captures as an empty box.
    await Promise.allSettled(
      Array.from(document.images).map((img) => (img.decode ? img.decode().catch(() => {}) : null))
    );
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// ── main ──
const server = await ensureServer();
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
let count = 0;

try {
  for (const size of sizes) {
    const ctx = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: 2,
    });
    for (const p of pages) {
      const page = await ctx.newPage();
      try {
        const res = await page.goto(BASE + p.path, { waitUntil: "domcontentloaded", timeout: 25000 });
        if (!res || res.status() >= 400) {
          console.warn(`  ! ${p.path} → ${res?.status() ?? "no response"} (skipped)`);
          continue;
        }
        await settle(page);
        const file = `${OUT}/${p.slug}__${size.name}.png`;
        await page.screenshot({ path: file, fullPage });
        console.log(`  ✓ ${file}`);
        count++;
      } catch (err) {
        console.warn(`  ! ${p.path} @ ${size.name} failed: ${err.message}`);
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
  stopServer(server);
}

console.log(`\n${count} screenshot(s) → ${OUT}`);
