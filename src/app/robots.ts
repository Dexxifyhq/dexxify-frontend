import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

/**
 * Served at /robots.txt.
 *
 * Crawlers may index the marketing site and auth pages. The signed-in app is
 * kept out: those routes only redirect a crawler to /login, so crawling them
 * spends crawl budget on redirects and nothing else. /invoices$ is anchored so
 * it blocks the dashboard list without also blocking /invoices/pay/..., whose
 * pages carry their own noindex tag (a crawler has to be allowed in to read it).
 */
const APP_ROUTES = [
  "/dashboard",
  "/balance",
  "/bank-accounts",
  "/checkouts",
  "/crypto-wallets",
  "/customers",
  "/developers",
  "/invoices$",
  "/payment-pages",
  "/pos-terminals",
  "/refunds",
  "/settings",
  "/transactions",
  "/welcome",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...APP_ROUTES],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
