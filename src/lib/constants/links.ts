/** External destinations used across the marketing pages. */
export const DOCS_URL = "https://docs.dexxify.com";

/**
 * The product list, shared by the navbar's Products menu and the footer's
 * Products column so the two always match. Each product is a tab of the
 * products page, /products?tab=<slug>; `soon` marks one that isn't available
 * yet, shown with a "Soon" label and no link.
 */
export type ProductLink =
  | { label: string; href: string; soon?: false }
  | { label: string; soon: true };

export const PRODUCT_LINKS: ProductLink[] = [
  { label: "Checkout", href: "/products?tab=checkout" },
  { label: "Swap", href: "/products?tab=swap" },
  { label: "Payouts", href: "/products?tab=payouts" },
  { label: "Invoices", href: "/products?tab=invoices" },
  { label: "Payment Links", soon: true },
];
