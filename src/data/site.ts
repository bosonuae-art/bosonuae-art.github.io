// ── Site data ─────────────────────────────────────────────────────────────
// Single source of truth for all copy, contact details, credits, and links.
// Edit values here and they update everywhere. No copy is hard-coded in pages.
// Facts are taken verbatim from the current jatinwilliams.com — do not invent.

export interface Credit {
  name: string;
  work: string;
  /** optional title-card / logo in /public/credits */
  img?: string;
  /** true when img is a brand logo (rendered contained + inverted white on dark) */
  logo?: boolean;
}

export interface Rep {
  name: string;
  email?: string;
  phone?: string;
  url?: string;
  /** optional logo in /public/reps */
  logo?: string;
}

export interface Download {
  label: string;
  /** short descriptor shown under the label */
  note?: string;
  /** local file in /public/downloads, or an external URL when external=true */
  file: string;
  /** preview image filename in src/assets/downloads for the on-page thumbnail */
  preview?: string;
  external?: boolean;
}

export const site = {
  name: 'Jatin "Jett" Williams',
  nickname: "Jett",
  role: "International Model & Actor",

  // ── Home ──
  taglineHero:
    "Quality is intentional. I combine proven methods, strategic organization, and operational insight to produce high quality content designed to perform.",
  statLine:
    "My platforms generate over 65,000 views per quarter with an average 76% retention rate, reflecting consistent, measurable engagement and sustained audience attention.",
  qualityHeading: "Quality Is Not an Accident",
  franklinQuote: {
    text: "Well done is better than well said.",
    source: "Benjamin Franklin, Poor Richard's Almanack, 1737",
  },

  // ── Featured credits ──
  credits: [
    { name: "The Chosen", work: "Season 6", img: "/credits/the-chosen.jpg" },
    { name: "Lioness", work: "Television", img: "/credits/lioness.jpg" },
    { name: "Frisco King", work: "Film", img: "/credits/frisco-king.jpg" },
    { name: "Runway 817", work: "Runway", img: "/credits/runway-817.png" },
    { name: "Supercuts", work: "Brand campaign", img: "/credits/supercuts.png", logo: true },
    { name: "Toyota Music Factory", work: "The Pavilion" },
  ] satisfies Credit[],

  // ── Representation ──
  reps: [
    {
      name: "Bareface Management",
      email: "Hello@bareface.com",
      phone: "+971 50 591 9770",
      url: "https://bareface.com",
      logo: "/reps/bareface.png",
    },
    {
      name: "eModels",
      email: "Bookings@emodels.me",
      phone: "+971 04 360 4842",
      url: "https://emodels.me",
    },
  ] satisfies Rep[],

  // ── Booking / contact ──
  email: "Jettwilliams.svc@gmail.com",
  phoneUS: "+1 (469) 416 0894",
  phoneIntl: "+971 (53) 583-9444",
  locations: [
    "Dallas–Fort Worth, Texas, United States",
    "Dubai, United Arab Emirates",
  ],
  instagram: { handle: "@Jatinwilliams", url: "https://www.instagram.com/jatinwilliams" },

  contactIntro:
    "Thank you for your interest! Please take some time to fill out the info form below so that we can better understand your production's needs. We will get back to you as soon as possible. Thank you again, and I look forward to discussing details. — Jett",

  // ── Comp cards & résumés ──
  downloads: [
    {
      label: "Comp Card Q2 '26",
      note: "Front & back — measurements, contact, portfolio",
      file: "/downloads/comp-card-q2-2026.pdf",
      preview: "comp-card-cover.png",
    },
    {
      label: "Modeling Résumé '26",
      note: "Stats, experience, and representation",
      file: "/downloads/modeling-resume-2026.pdf",
      preview: "modeling-resume.png",
    },
    {
      label: "Acting Résumé '26",
      note: "Screen credits, training, and skills",
      file: "/downloads/acting-resume-2026.pdf",
      preview: "acting-resume.png",
    },
    {
      label: "Actors Access",
      note: "Live casting profile",
      file: "https://resumes.actorsaccess.com/AAJatinJettWilliams",
      external: true,
    },
  ] satisfies Download[],

  // ── About ──
  about: {
    heading: "The Man Behind the Motion",
    tagline:
      "Actor, model, and multidisciplinary creative — shaped by movement, discipline, and story.",
    paragraphs: [
      'Jatin "Jett" Williams is an actor, model, and multidisciplinary creative working across film, television, runway, editorial, commercial, and brand campaigns. The name "Jett" began as a nickname from one of his high school football teams after a coach struggled to pronounce Jatin (pronounced Juh-thin). The name stuck because it fit: he was fast, driven, and always in motion.',
      "That sense of motion has followed him into his work. With four years of modeling experience and two years of acting experience, Jett has built a versatile body of work across screen, fashion, and commercial production. His credits include work on productions such as The Chosen and Frisco King, along with campaign work for brands including Toyota and Supercuts. He has walked regional fashion shows and continues to expand his work across domestic and international markets.",
      "As an artist, Jett is drawn to projects that explore identity, morality, spirituality, mortality, and the tension between light, time, and transformation. His creative perspective is grounded in discipline, lived experience, and a deep respect for the story being told. Whether on set, on camera, or on the runway, he brings presence, adaptability, and a strong understanding of visual storytelling to every production.",
      "Jett is known professionally for his versatility, dependability, and ability to elevate the environment around him. His physical foundation includes years of athletic training, football experience, and 17 years of martial arts experience, giving him a natural command of movement, timing, and body awareness. This allows him to move fluidly between commercial performance, character-driven work, fashion presentation, and editorial imagery.",
      "Outside of set, Jett is often playing guitar, working on creative projects, designing products, studying, maintaining his motorcycle, or staying sharp through freeform martial arts practice. He is drawn to conversations about art, philosophy, science, culture, and the deeper questions that shape human experience.",
    ],
    availability:
      "Jett is currently available for domestic and international bookings across runway, print, editorial, commercial campaigns, film, and television.",
    stats: [
      "4 yrs modeling",
      "2 yrs acting",
      "17 yrs martial arts",
      "Football & athletics",
    ],
    interests: [
      "Guitar",
      "Product design",
      "Motorcycle maintenance",
      "Martial arts",
      "Studying",
      "Art & philosophy",
    ],
  },

  // ── Meta ──
  url: "https://www.jatinwilliams.com",
  ogImage: "/og/jett-williams.jpg",
  copyright: '© 2025–2026 Jatin "Jett" Williams. All rights reserved.',
} as const;

export type Site = typeof site;
