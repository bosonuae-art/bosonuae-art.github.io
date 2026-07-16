import { chromium } from "@playwright/test";
const BASE = "http://localhost:4487";
const OUT = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });

const p1 = await ctx.newPage();
await p1.goto(BASE + "/", { waitUntil: "load", timeout: 20000 });
await p1.waitForTimeout(2000);
await p1.screenshot({ path: `${OUT}/v2-home-hero.png` });
await p1.close();
console.log("home hero");

const p2 = await ctx.newPage();
await p2.goto(BASE + "/portfolio", { waitUntil: "load", timeout: 20000 });
await p2.waitForTimeout(1200);
await p2.screenshot({ path: `${OUT}/v2-portfolio-top.png` });
await p2.evaluate(async () => {
  for (let y = 0; y < 1700; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 130)); }
  await new Promise((r) => setTimeout(r, 500));
  await Promise.all(Array.from(document.images).filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; })));
});
await p2.waitForTimeout(800);
await p2.screenshot({ path: `${OUT}/v2-portfolio-gallery.png` });
await p2.close();
console.log("portfolio");

await b.close();
console.log("done");
