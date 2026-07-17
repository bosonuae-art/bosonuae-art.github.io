import type { APIRoute } from "astro";
import { site } from "@/data/site";

// One-tap "save contact" — a vCard generated from site.ts so it never drifts.
// Served at /jatin-jett-williams.vcf; the download link lives in ContactDetails.
const digits = (p: string) => p.replace(/[^+\d]/g, "");

export const GET: APIRoute = () => {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${site.name}`,
    "N:Williams;Jatin;;;",
    `NICKNAME:${site.nickname}`,
    `TITLE:${site.role}`,
    `TEL;TYPE=CELL,VOICE:${digits(site.phoneUS)}`,
    `TEL;TYPE=CELL,VOICE:${digits(site.phoneIntl)}`,
    `EMAIL;TYPE=INTERNET:${site.email}`,
    `URL:${site.url}`,
    `X-SOCIALPROFILE;TYPE=instagram:${site.instagram.url}`,
    "ADR;TYPE=WORK:;;Dallas–Fort Worth, Texas;;;;United States",
    "ADR;TYPE=WORK:;;Dubai;;;;United Arab Emirates",
    `NOTE:Represented by ${site.reps.map((r) => r.name).join(" & ")}`,
    "END:VCARD",
    "",
  ].join("\r\n");

  return new Response(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="jatin-jett-williams.vcf"',
    },
  });
};
