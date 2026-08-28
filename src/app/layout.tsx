import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

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
    <html lang="en" className={onest.variable}>
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
