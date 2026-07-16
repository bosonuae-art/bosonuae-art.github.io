// Extract a representative, accent-friendly color from each portrait so the
// site's palette can "evolve" with his work. Writes src/data/imageColors.json
// { "<filename>": "#rrggbb" }. Re-run whenever portraits change:
//   node scripts/extract-colors.mjs
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

// Use Python + Pillow (already used elsewhere) for robust color quantization.
const py = `
import os, json, colorsys
from PIL import Image

SRC = "src/assets/portraits"
EXTRA = [("public/videos/hero-poster.jpg", "hero-leather.jpg")]

def accent_for(path):
    im = Image.open(path).convert("RGB")
    im.thumbnail((120, 120))
    q = im.quantize(colors=10, method=Image.MEDIANCUT).convert("RGB")
    counts = {}
    for c in q.getdata():
        counts[c] = counts.get(c, 0) + 1
    best, best_score = None, -1
    for (r, g, b), n in counts.items():
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        # favour vivid, frequent colors; avoid near-black / near-white / muddy
        if v < 0.12 or v > 0.97:
            continue
        score = n * (0.15 + s) ** 1.6
        if score > best_score:
            best_score, best = score, (h, s, v)
    if best is None:
        return "#c9a86a"
    h, s, v = best
    # Normalise for use as an accent on a dark canvas: keep hue, floor/cap
    # saturation and lift value so it reads clearly.
    s = min(max(s, 0.05), 0.72)
    v = min(max(v, 0.62), 0.9)
    if s < 0.12:  # near-grayscale (B&W work) -> warm neutral
        s, v = 0.10, 0.82
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return "#%02x%02x%02x" % (round(r*255), round(g*255), round(b*255))

out = {}
for f in sorted(os.listdir(SRC)):
    if f.lower().endswith((".jpg", ".jpeg", ".png")):
        out[f] = accent_for(os.path.join(SRC, f))
for path, key in EXTRA:
    if os.path.exists(path):
        out[key] = accent_for(path)
print(json.dumps(out, indent=2))
`;

const json = execFileSync("python", ["-c", py], { encoding: "utf8" });
writeFileSync(join("src", "data", "imageColors.json"), json.trim() + "\n");
const map = JSON.parse(json);
console.log(`Wrote src/data/imageColors.json — ${Object.keys(map).length} colors`);
for (const [k, v] of Object.entries(map)) console.log(`  ${v}  ${k}`);
