import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/site";

/**
 * Served at /sitemap.xml and referenced from robots.txt. Lists only the public,
 * indexable pages. Submit this URL in Google Search Console so new pages are
 * discovered without waiting for a crawl to find them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/register`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
