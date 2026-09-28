/**
 * Site identity for metadata, robots, sitemap and structured data.
 *
 * SITE_URL is the canonical origin. Every canonical tag, Open Graph URL and
 * sitemap entry is built from it, so search engines consolidate on one host
 * (www) instead of splitting ranking signals between www and the bare domain.
 */
export const SITE_URL = "https://www.dexxify.com";

export const SITE_NAME = "Dexxify";

/**
 * Wording is held to what the product does: checkout, invoices, payment links
 * and payouts, settling in Naira. It deliberately avoids claims the rest of
 * the site no longer makes (asset counts, settlement timings, fees).
 */
export const SITE_TITLE = "Dexxify — Crypto payments and payouts, settled in Naira";

export const SITE_DESCRIPTION =
  "Accept crypto payments and pay out in Naira with one API. Checkout, invoices, payment links and payouts for Nigerian businesses.";
