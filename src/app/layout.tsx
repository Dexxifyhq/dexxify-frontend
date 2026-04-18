import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dexxify — Crypto Infrastructure API for Africa",
  description:
    "One API to add crypto wallets, Naira settlement, swaps and KYC to your product. Stop integrating 5 vendors. Start building.",
  openGraph: {
    title: "Dexxify — Crypto Infrastructure API for Africa",
    description:
      "One API to add crypto wallets, Naira settlement, swaps and KYC to your product.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased bg-[#09090B] text-[#FAFAFA]">
        <QueryProvider>{children}</QueryProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#111113",
              border: "1px solid #1C1C1F",
              color: "#FAFAFA",
            },
          }}
        />
      </body>
    </html>
  );
}
