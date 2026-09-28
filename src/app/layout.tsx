import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants/site";
// TT Interphases Pro is disabled until a licensed copy is available — see src/fonts/README.md
// import { ttInterphases, ttInterphasesMono } from '@/fonts';

/**
 * Site-wide SEO defaults.
 *
 * - metadataBase makes every relative URL (canonical, og:image, icons) absolute.
 *   Without it Open Graph images resolve to localhost and social cards break.
 * - Icons and the social card come from the file conventions in this folder —
 *   icon.png, apple-icon.png, favicon.ico, opengraph-image.png and
 *   twitter-image.png — which Next emits as <link>/<meta> tags automatically.
 * - Pages inherit the default title; the template names any page that sets
 *   its own title as "<page> — Dexxify".
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "crypto payments Nigeria",
    "accept crypto payments",
    "crypto payment gateway",
    "USDT to Naira",
    "crypto to Naira",
    "crypto payouts",
    "crypto invoices",
    "payment links",
    "stablecoin payments",
  ],
  // No canonical here: set in a root layout it would apply to every page and
  // tell Google /login and /register duplicate the homepage. The homepage
  // declares its own in (marketing)/page.tsx.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior tells the App Router that the `scroll-behavior:
    // smooth` in globals.css is deliberate. It then disables smooth scrolling
    // for route transitions only, so navigation doesn't animate a scroll up
    // the outgoing page, while in-page anchor links keep gliding.
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen antialiased bg-background text-foreground">
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
