/**
 * Content for the product pages (/products?tab=<slug>). Every tab renders the
 * same layout (components/products/ProductPage.tsx) with one of these.
 *
 * Rule for this file: every feature and tile must be something the product
 * actually does. Checkout's were checked against dexxify-backend/src:
 * payment sessions take amount, currency, crypto_asset, network,
 * expires_in_minutes, metadata, success_url and cancel_url
 * (payment-sessions/dto); businesses have a logo and a "show branding on
 * checkout" setting; payment links, invoices, QR codes and webhooks exist.
 */

export type TileIcon = "clock" | "tag" | "coins" | "redirect" | "shield" | "bell" | "users" | "doc";

export type ProductContent = {
  slug: string;
  tabLabel: string;
  /** Page title and description for search and sharing. */
  meta: { title: string; description: string };
  hero: { title: string; text: string; image: string };
  api: { title: string; text: string };
  /** 4–6 numbered cards. */
  features: { title: string; text: string; image: string }[];
  /** "Your X, your rules" block, with 4 tiles. */
  rules: {
    title: string;
    text: string;
    image: string;
    tiles: { icon: TileIcon; title: string; text: string }[];
  };
};

/**
 * The tab menu on every product page, in order. KYC is not a product page.
 * Tabs without an entry in PRODUCTS yet still show; clicking one does a
 * normal navigation (a 404 until its content is added).
 */
export const PRODUCT_TABS = [
  { slug: "checkout", label: "Checkout" },
  { slug: "swap", label: "Swap" },
  { slug: "payouts", label: "Payouts" },
  { slug: "invoices", label: "Invoices" },
];

const I = "/illustrations/products/";

export const PRODUCTS: ProductContent[] = [
  {
    slug: "checkout",
    tabLabel: "Checkout",
    meta: {
      title: "Checkout",
      description:
        "Accept crypto payments with branded checkout pages or payment links created straight from the API.",
    },
    hero: {
      title: "Accept crypto with branded checkout pages.",
      text: "Accept crypto payments with branded checkout pages or payment links created straight from the API.",
      image: "/illustrations/hero/checkout.svg",
    },
    api: {
      title: "Plug into our API for crypto checkout.",
      text: "Create a payment session in one call and get a checkout page, a payment link and a QR code for it.",
    },
    features: [
      {
        title: "Branded checkout pages",
        text: "Send customers to a checkout page with your name and logo on it.",
        image: I + "checkout.svg",
      },
      {
        title: "Payment links",
        text: "Create payment links straight from the API and share them anywhere.",
        image: I + "link.svg",
      },
      {
        title: "QR payments",
        text: "Every payment session comes with a QR code of its payment link, so customers can scan and pay at the counter.",
        image: I + "qr.svg",
      },
      {
        title: "Invoices",
        text: "Create, send and track invoices your customers pay in crypto.",
        image: I + "invoices.svg",
      },
      {
        title: "Settle to one balance",
        text: "Collect through checkout, payment links, invoices or QR, and settle to one balance.",
        image: I + "naira.svg",
      },
      {
        title: "Webhooks",
        text: "Get notified when a payment lands.",
        image: I + "webhooks.svg",
      },
    ],
    rules: {
      title: "Your checkout, your rules.",
      text: "Set the amount, currency and expiry for every session, attach your own order data, and choose where customers land after paying.",
      image: I + "controls.svg",
      tiles: [
        { icon: "clock", title: "Expiry", text: "Choose how long each payment session stays open." },
        { icon: "tag", title: "Metadata", text: "Attach your order ID or any data to a session." },
        { icon: "coins", title: "Currency", text: "Price in Naira and pick the crypto asset and network." },
        { icon: "redirect", title: "Redirects", text: "Send customers to your success or cancel page." },
      ],
    },
  },

  // Swap — checked against modules/swaps (GET /swaps/estimate: live rate, not
  // locked; POST /swaps/quotation: locks the rate for 15 seconds; execute;
  // history filtered by currency and date; from NGN, USDT, USDC, ETH, BNB,
  // SOL, TRX to NGN, USDT, USDC), modules/offramp (crypto to Naira to a bank
  // recipient, via a quotation) and swap.completed / swap.failed webhooks.
  {
    slug: "swap",
    tabLabel: "Swap",
    meta: {
      title: "Swap",
      description: "Convert between crypto and Naira at a rate that's locked when you ask for a quote.",
    },
    hero: {
      title: "Swap crypto and Naira at a locked rate.",
      text: "Convert between crypto and Naira at a rate that's locked when you ask for a quote.",
      image: "/illustrations/hero/swap.svg",
    },
    api: {
      title: "Plug into our API for swaps.",
      text: "Get a live estimate, lock a quote, then execute it, all from the API.",
    },
    features: [
      {
        title: "Live estimates",
        text: "Check the live rate for a swap before you commit, without locking it.",
        image: I + "swapcoins.svg",
      },
      {
        title: "Locked quotes",
        text: "Request a quote to lock the rate, then execute it before it expires.",
        image: I + "lock.svg",
      },
      {
        title: "Crypto to Naira",
        text: "Swap USDT, USDC, ETH, BNB, SOL or TRX into Naira, or move between Naira and stablecoins.",
        image: I + "naira.svg",
      },
      {
        title: "Off-ramp to a bank",
        text: "Sell crypto and send the Naira to a saved bank recipient in one request.",
        image: I + "bank.svg",
      },
      {
        title: "Swap history",
        text: "See every swap, filter by currency and date, and check its status.",
        image: I + "batch.svg",
      },
      {
        title: "Webhooks",
        text: "Get notified when a swap completes or fails.",
        image: I + "webhooks.svg",
      },
    ],
    rules: {
      title: "Your swaps, your rules.",
      text: "Choose the currencies and the amount, check the rate first, and execute only when you're happy with the quote.",
      image: I + "controls.svg",
      tiles: [
        { icon: "coins", title: "Currencies", text: "Swap from NGN, USDT, USDC, ETH, BNB, SOL or TRX." },
        { icon: "clock", title: "Quote window", text: "Each quote locks the rate for 15 seconds." },
        { icon: "doc", title: "History", text: "Filter past swaps by currency and date." },
        { icon: "bell", title: "Notifications", text: "Webhooks for completed and failed swaps." },
      ],
    },
  },

  // Payouts — checked against modules/offramp (crypto to Naira to a bank
  // recipient, using a locked quote), modules/deposit-accounts (stablecoin
  // withdrawals to saved wallet addresses; local-currency withdrawals),
  // saved bank recipients with a primary flag (bank entity), the business's
  // default payout method, payout statuses, payout.* webhooks, and test mode.
  // No batch payouts: the backend has none.
  {
    slug: "payouts",
    tabLabel: "Payouts",
    meta: {
      title: "Payouts",
      description: "Settle crypto to Nigerian bank accounts, or pay out to wallets in stablecoins.",
    },
    hero: {
      title: "Pay out to any bank or wallet.",
      text: "Settle crypto to Nigerian bank accounts, or pay out to wallets in stablecoins.",
      image: "/illustrations/hero/payouts.svg",
    },
    api: {
      title: "Plug into our API for payouts.",
      text: "Send Naira to bank accounts or stablecoins to wallets, and track every payout from the API.",
    },
    features: [
      {
        title: "Bank payouts",
        text: "Convert crypto to Naira and send it to a Nigerian bank account.",
        image: I + "bank.svg",
      },
      {
        title: "Stablecoin withdrawals",
        text: "Withdraw stablecoins from your balance to a saved wallet address.",
        image: I + "swapcoins.svg",
      },
      {
        title: "Saved recipients",
        text: "Save bank accounts and wallet addresses once, then pay them again.",
        image: I + "batch.svg",
      },
      {
        title: "Locked rates",
        text: "Each bank payout uses a locked quote, so you know the Naira amount before it's sent.",
        image: I + "lock.svg",
      },
      {
        title: "Track every payout",
        text: "See the status of every payout, from processing to completed or failed.",
        image: I + "naira.svg",
      },
      {
        title: "Webhooks",
        text: "Get notified when a payout is created, succeeds or fails.",
        image: I + "webhooks.svg",
      },
    ],
    rules: {
      title: "Your payouts, your rules.",
      text: "Choose where your money goes, save the recipients you pay often, and decide how your balance pays out.",
      image: I + "controls.svg",
      tiles: [
        { icon: "users", title: "Recipients", text: "Save bank accounts and wallets, and mark a primary one." },
        { icon: "coins", title: "Payout method", text: "Set a default payout method for your business." },
        { icon: "shield", title: "Test mode", text: "Try payouts with test keys before going live." },
        { icon: "bell", title: "Notifications", text: "Webhooks for every payout status." },
      ],
    },
  },

  // Invoices — checked against modules/invoices (customer name, email, phone;
  // line items with quantity and unit price; tax rate; discount; due date;
  // notes; metadata; currency; hosted page /invoices/pay/:number where the
  // payer picks an asset and network; statuses draft, sent, viewed, paid,
  // overdue, cancelled, void; mark paid / cancel / void) and invoice.*
  // webhooks.
  {
    slug: "invoices",
    tabLabel: "Invoices",
    meta: {
      title: "Invoices",
      description: "Create, send and track invoices your customers pay in crypto.",
    },
    hero: {
      title: "Invoices your customers pay in crypto.",
      text: "Create, send and track invoices your customers pay in crypto.",
      image: "/illustrations/hero/invoices.svg",
    },
    api: {
      title: "Plug into our API for invoices.",
      text: "Create an invoice in one call and get a hosted page where your customer pays in crypto.",
    },
    features: [
      {
        title: "Line items",
        text: "Add items with quantities and prices, plus tax and discounts.",
        image: I + "invoices.svg",
      },
      {
        title: "Hosted payment page",
        text: "Every invoice has its own page where your customer picks a crypto asset and network to pay with.",
        image: I + "checkout.svg",
      },
      {
        title: "Customer details",
        text: "Attach the customer's name, email and phone to every invoice.",
        image: I + "link.svg",
      },
      {
        title: "Track every invoice",
        text: "See which invoices are sent, viewed, paid or overdue, and cancel or void the ones you don't need.",
        image: I + "batch.svg",
      },
      {
        title: "Settle to one balance",
        text: "Invoice payments land in the same balance as the rest of your payments.",
        image: I + "naira.svg",
      },
      {
        title: "Webhooks",
        text: "Get notified when an invoice is created, paid or expires.",
        image: I + "webhooks.svg",
      },
    ],
    rules: {
      title: "Your invoices, your rules.",
      text: "Set the currency, due date, tax and discounts, add notes, and attach your own data.",
      image: I + "controls.svg",
      tiles: [
        { icon: "clock", title: "Due date", text: "Set when each invoice is due." },
        { icon: "coins", title: "Currency", text: "Bill in the currency you choose." },
        { icon: "tag", title: "Metadata", text: "Attach your own reference or any data." },
        { icon: "doc", title: "Notes", text: "Add notes or terms to the invoice." },
      ],
    },
  },
];
