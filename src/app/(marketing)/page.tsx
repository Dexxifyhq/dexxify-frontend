import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/landing/Hero";
import AssetMarquee from "@/components/landing/AssetMarquee";
import Announcement from "@/components/landing/Announcement";
import Infrastructure from "@/components/landing/Infrastructure";
import UseCases from "@/components/landing/UseCases";
import TrustSecurity from "@/components/landing/TrustSecurity";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import { DOCS_URL } from "@/lib/constants/links";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants/site";

// The homepage is the canonical page for the brand. openGraph is restated in
// full on purpose: Next.js replaces a nested metadata object rather than
// merging it, so setting only `url` here would drop the layout's title,
// description and site name from the homepage's share card.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_NG",
  },
};

/**
 * Structured data (schema.org). Organization tells Google the brand's name,
 * site and logo — the logo it may show beside results — and WebSite names the
 * site for the search result header. The logo points at the square icon, as
 * Google requires a crawlable image of at least 112×112.
 *
 * No sameAs social profiles: add them once the accounts exist, as they help
 * Google tie the brand together.
 */
const STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: SITE_DESCRIPTION,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    isPartOf: { "@type": "WebSite", url: SITE_URL },
    relatedLink: DOCS_URL,
  },
];

export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <script
        type="application/ld+json"
        // "<" is escaped so the JSON can never close the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(STRUCTURED_DATA).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />
      <Hero />
      <AssetMarquee />
      <Infrastructure />
      <UseCases />
      <TrustSecurity />
      <Announcement />
      <FAQ />
      <Footer />
    </main>
  );
}
