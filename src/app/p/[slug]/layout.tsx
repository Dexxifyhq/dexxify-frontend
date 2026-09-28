import type { Metadata } from "next";

// Payment page links belong to individual merchants and are shared directly
// with their customers — not Dexxify content to rank. The page is a client
// component and can't declare metadata, so it lives here.
export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default function PaymentPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
