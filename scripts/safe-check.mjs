// Fast safety audit of the built site. Fails (nonzero exit) when:
//  - a built page contains a placeholder / banned string, or
//  - the noindex state doesn't match SITE_READY (protects against shipping the
//    site to search engines before it's approved, or leaving it hidden after).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    out = statSync(p).isDirectory()
      ? out.concat(walk(p))
      : p.endsWith(".html")
        ? out.concat(p)
        : out;
  }
  return out;
}

const ready = /SITE_READY\s*=\s*true/.test(readFileSync("src/data/siteReady.ts", "utf8"));
const banned = ["{{", "lorem ipsum", "todo:", "fixme", "placeholder-"];
const errors = [];

let files;
try {
  files = walk(DIST);
} catch {
  console.error("safe-check FAILED: no dist/ — run `astro build` first.");
  process.exit(1);
}

for (const f of files) {
  const html = readFileSync(f, "utf8");
  const lower = html.toLowerCase();
  for (const b of banned) {
    if (lower.includes(b)) errors.push(`${f}: contains banned string "${b}"`);
  }
  const hasNoIndex = /noindex/.test(html);
  if (!ready && !hasNoIndex) errors.push(`${f}: SITE_READY=false but page is missing the noindex tag`);
  if (ready && hasNoIndex) errors.push(`${f}: SITE_READY=true but page still has a noindex tag`);
}

if (errors.length) {
  console.error("safe-check FAILED:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`safe-check OK — ${files.length} pages scanned, SITE_READY=${ready}`);
