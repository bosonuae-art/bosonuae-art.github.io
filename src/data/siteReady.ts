// ── Go-live flag ──────────────────────────────────────────────────────────
// While false, every page renders <meta name="robots" content="noindex,
// nofollow"> so the site can be developed and reviewed without being indexed.
// Flip to true (and confirm with Jett which photos/credits are public) to go
// live. This is the ONE switch that opens the site to search engines.

export const SITE_READY = false;

export const computeNoIndex = (): boolean => !SITE_READY;
