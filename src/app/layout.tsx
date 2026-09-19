import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";
// TT Interphases Pro is disabled until a licensed copy is available — see src/fonts/README.md
// import { ttInterphases, ttInterphasesMono } from '@/fonts';

export const metadata: Metadata = {
  title: "Dexxify - Crypto Infrastructure API for Africa",
  description:
    "One API to add crypto wallets, fiat settlement, swaps and KYC to your product. Stop integrating 5 vendors. Start building.",
  openGraph: {
    title: "Dexxify - Crypto Infrastructure API for Africa",
    description:
      "One API to add crypto wallets, fiat settlement, swaps and KYC to your product.",
    type: "website",
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
