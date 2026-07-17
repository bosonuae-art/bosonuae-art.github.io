// ── Accessibility audit ────────────────────────────────────────────────────
// Runs axe-core (WCAG 2.1 A/AA) against every page and prints a compact
// violations summary — rule id, impact, count, and an example selector.
//   node scripts/a11y.mjs
// Self-serves the built site on 127.0.0.1:4487, or reuses a running server.

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = 4487;
const HOST = "127.0.0.1";
const BASE = `http://${HOST}:${PORT}`;
const isWin = process.platform === "win32";
const astroEntry = "node_modules/astro/astro.js";

const PAGES = ["/", "/about", "/portfolio", "/comp-cards", "/contact", "/press"];

async function isUp() {
  try {
    const r = await fetch(BASE + "/", { signal: AbortSignal.timeout(1500) });
    return r.ok || r.status < 500;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isUp()) {
    console.log(`• using the server already on ${BASE}`);
    return null;
  }
  if (!existsSync("dist/index.html")) {
    spawnSync(process.execPath, [astroEntry, "build"], { stdio: "inherit" });
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

const server = await ensureServer();
const browser = await chromium.launch();
const context = await browser.newContext(); // axe-core/playwright requires an explicit context
const page = await context.newPage();
let total = 0;
const byRule = new Map();

try {
  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 25000 });
    // Reveal-on-scroll content starts at opacity:0 and fades in over 700ms.
    // Force it fully visible *instantly* (no transition) so axe measures true
    // colors — not a mid-fade, half-transparent composite over black.
    await page.addStyleTag({
      content: ".reveal{opacity:1 !important;transform:none !important;transition:none !important}",
    });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const count = violations.reduce((n, v) => n + v.nodes.length, 0);
    total += count;
    console.log(`\n${path} — ${violations.length} rule(s), ${count} node(s)`);
    for (const v of violations) {
      console.log(`  [${v.impact}] ${v.id} ×${v.nodes.length} — ${v.help}`);
      byRule.set(v.id, (byRule.get(v.id) || 0) + v.nodes.length);
      for (const node of v.nodes.slice(0, 3)) {
        const sel = node.target?.join(" ");
        const d = node.any?.[0]?.data;
        if (v.id === "color-contrast" && d) {
          console.log(`      ${sel}  fg=${d.fgColor} bg=${d.bgColor} ratio=${d.contrastRatio} need=${d.expectedContrastRatio} (${d.fontSize}, ${d.fontWeight})`);
        } else if (sel) {
          console.log(`      ${sel}`);
        }
      }
    }
  }
} finally {
  await browser.close();
  stopServer(server);
}

console.log(`\n── summary ── ${total} total node violation(s)`);
for (const [id, n] of [...byRule.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${id}: ${n}`);
}
