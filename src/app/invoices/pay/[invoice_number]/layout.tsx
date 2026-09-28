import type { Metadata } from "next";

// Invoice payment links are private to the invoiced customer and carry invoice
// details; they must never be indexed. The page is a client component and
// can't declare metadata, so it lives here.
export const metadata: Metadata = {
  title: "Invoice payment",
  robots: { index: false, follow: false },
};

export default function InvoicePaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
