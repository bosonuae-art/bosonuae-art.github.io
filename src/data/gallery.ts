// ── Portfolio gallery ─────────────────────────────────────────────────────
// Every portfolio image is declared here with real alt text and a category —
// nothing appears by accident. Images live in src/assets/portraits and are
// optimized at build time by astro:assets. To add an image: drop the file in
// that folder and add an entry below.

import type { ImageMetadata } from "astro";
import imageColors from "@/data/imageColors.json";

const colors = imageColors as Record<string, string>;
const DEFAULT_COLOR = "#c9a86a";

export type Category = "Editorial" | "Fashion Week" | "Studio" | "Conceptual";

export const categories: Category[] = ["Editorial", "Fashion Week", "Studio", "Conceptual"];

export interface GalleryItem {
  src: ImageMetadata;
  alt: string;
  category: Category;
  featured?: boolean;
  /** representative color extracted from the photo — drives the evolving accent */
  color: string;
}

const files = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/portraits/*.{jpg,jpeg,png}",
  { eager: true }
);

function img(name: string): ImageMetadata {
  const key = Object.keys(files).find((k) => k.endsWith("/" + name));
  if (!key) throw new Error(`Gallery image not found: ${name}`);
  return files[key].default;
}

const entries: { file: string; category: Category; alt: string; featured?: boolean }[] = [
  // Editorial
  { file: "editorial-red-chains.jpg", category: "Editorial", featured: true,
    alt: "Jett Williams in black with layered chains against a deep red backdrop." },
  { file: "editorial-red-portrait.jpg", category: "Editorial", featured: true,
    alt: "Close, dramatic portrait of Jett Williams with chains lit against deep red." },
  { file: "editorial-bw-leather.jpg", category: "Editorial",
    alt: "Black-and-white portrait of Jett Williams in a leather jacket, hand resting on his head." },
  { file: "editorial-red-drape.jpg", category: "Editorial",
    alt: "Editorial look in black against a red backdrop." },
  { file: "editorial-sunset-profile.jpg", category: "Editorial",
    alt: "Jett Williams in sunglasses, turtleneck and blazer, leaning against a wall at sunset." },
  { file: "editorial-indoor-blazer.jpg", category: "Editorial",
    alt: "Jett Williams in sunglasses, black turtleneck and brown blazer, posing indoors." },
  { file: "editorial-outdoor.jpg", category: "Editorial",
    alt: "Moody outdoor portrait of Jett Williams." },
  { file: "beauty-white-1.png", category: "Editorial",
    alt: "Beauty portrait of Jett Williams in white with gold jewelry." },
  { file: "beauty-white-2.png", category: "Editorial",
    alt: "Beauty portrait of Jett Williams in white holding a white rose." },

  // Fashion Week
  { file: "fashion-week-1.jpg", category: "Fashion Week", featured: true,
    alt: "Jett Williams walking the runway at Dallas Fashion Week, Day 1 2026." },
  { file: "fashion-week-2.jpg", category: "Fashion Week",
    alt: "Runway walk at Dallas Fashion Week, Day 1 2026." },

  // Studio
  { file: "studio-chains-1.jpg", category: "Studio", featured: true,
    alt: "Shirtless studio portrait of Jett Williams with silver chains, arm raised, on black." },
  { file: "studio-chains-2.jpg", category: "Studio",
    alt: "Shirtless studio portrait of Jett Williams with silver chains against black." },
  { file: "studio-leather.jpg", category: "Studio",
    alt: "Low-key studio portrait of Jett Williams in a studded leather jacket." },
  { file: "studio-portrait.jpg", category: "Studio",
    alt: "Low-key shirtless studio portrait of Jett Williams." },
  { file: "studio-intl.jpg", category: "Studio",
    alt: "Dark studio portrait of Jett Williams." },

  // Conceptual
  { file: "conceptual-gold-1.jpg", category: "Conceptual", featured: true,
    alt: "Jett Williams in gold body paint standing in water at sunset." },
  { file: "conceptual-gold-2.jpg", category: "Conceptual",
    alt: "Gold-painted figure in water, arm bent and head lowered." },
  { file: "conceptual-gold-3.jpg", category: "Conceptual",
    alt: "Gold editorial location portrait in water." },
];

export const gallery: GalleryItem[] = entries.map((e) => ({
  src: img(e.file),
  alt: e.alt,
  category: e.category,
  featured: e.featured,
  color: colors[e.file] ?? DEFAULT_COLOR,
}));

/** Look up an extracted color by portrait filename (for hero/about/etc.). */
export const colorFor = (file: string): string => colors[file] ?? DEFAULT_COLOR;

export const featured: GalleryItem[] = gallery.filter((g) => g.featured);
