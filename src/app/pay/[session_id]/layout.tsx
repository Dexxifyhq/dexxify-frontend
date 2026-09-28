import type { Metadata } from "next";

// Checkout links are one-off, per-customer URLs. They must never be indexed or
// surface in search. The page is a client component and can't declare
// metadata, so it lives here.
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
