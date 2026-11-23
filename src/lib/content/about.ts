/**
 * Content for the About page (/about). There was no About page before, so
 * this started from the design's sample content, corrected to match the
 * product and the site's copy rules:
 * - Slides are the homepage's use cases, with their homepage lines; the
 *   sample's Freelance (removed from the homepage), Marketplaces / KYC and
 *   "subscriptions" (no recurring billing) slides are not used.
 * - No timing claims ("in minutes"), no automatic-settlement claims (the
 *   business cashes out to its bank), no locations, investors or press.
 * - "Latest" links only to docs pages that exist; there is no blog yet.
 */

export type AboutSlide = { name: string; line: string; image: string; tile: string };
export type AboutPost = { source: string; title: string; href: string };

const H = "/illustrations/hero/";
const P = "/illustrations/products/";

export const ABOUT = {
  headline: ["Making crypto", "as easy to accept", "as any other payment."] as const,
  intro: "Dexxify is the payment infrastructure for businesses that accept, convert and settle crypto.",
  left: { label: "What we do", text: "One API to accept, convert and settle crypto" },
  right: {
    label: "With one goal",
    text: "Giving every business a single balance for crypto and Naira, with cash-outs to their bank.",
  },
  slides: [
    { name: "E-commerce stores", line: "Accept crypto from customers anywhere and settle to your bank.", image: H + "checkout.svg", tile: "#EDEDED" },
    { name: "Crypto exchanges", line: "Automate NGN withdrawals and replace manual P2P desks.", image: H + "swap.svg", tile: "#0A0A0A" },
    { name: "Payroll tools", line: "Disburse salaries in Naira from a stablecoin treasury.", image: H + "payouts.svg", tile: "#262626" },
    { name: "SaaS platforms", line: "Bill customers with crypto invoices and payment links.", image: H + "invoices.svg", tile: "#DCDCDC" },
  ] satisfies AboutSlide[],
  blocks: [
    {
      label: "Our mission",
      icon: P + "swapcoins.svg",
      text: [
        "We're building the infrastructure that lets any business accept crypto, convert it and cash it out to the bank, through one API and one balance.",
        "Crypto moves value across the internet. Getting it into a business's books shouldn't take a patchwork of exchanges, spreadsheets and manual desks.",
      ],
    },
    {
      label: "Our why",
      icon: P + "naira.svg",
      text: [
        "Our vision is a world where accepting crypto is as ordinary as accepting a card, for every business, of every size.",
      ],
    },
  ],
  cta: {
    label: "Talk to us",
    title: "Building something with crypto payments?",
    text: "Tell us what you need and we'll help you get set up.",
    button: "Contact us",
    href: "mailto:hello@dexxify.com",
  },
  marquee: {
    label: "Assets we support",
    // Supported assets with a logo in public/crypto/ (TRX and TON have none yet).
    items: ["BTC", "ETH", "USDT", "USDC", "SOL", "BNB"],
  },
  posts: {
    label: "Latest",
    items: [
      { source: "Docs", title: "Quickstart: get an API key and create your first test deposit address", href: "https://docs.dexxify.com/quickstart" },
      { source: "Docs", title: "Authenticate with your API keys", href: "https://docs.dexxify.com/authentication" },
      { source: "Docs", title: "Test and live environments", href: "https://docs.dexxify.com/concepts/environments" },
      { source: "Docs", title: "Errors and status codes", href: "https://docs.dexxify.com/errors" },
    ] satisfies AboutPost[],
  },
};
