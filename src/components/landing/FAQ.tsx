"use client";

import { useId, useState } from "react";
import { Plus, Minus } from "lucide-react";

/**
 * Every answer is checked against dexxify-backend/src or a statement from the
 * product owner:
 * - Assets and networks: the supported set as stated by the product owner.
 * - Getting paid in Naira: payments credit the balance, swaps convert to NGN,
 *   and POST /wallets/withdrawals/local-currencies pays out to a bank.
 *   Auto-settlement is NOT mentioned — the backend accepts the flag but nothing
 *   acts on it yet.
 * - Fees: flat withdrawal fees from common/constants/fees.constants.ts
 *   (STABLECOIN_FEE 0.5, FIAT_WITHDRAWAL_FEE 100); network fees are shown on
 *   the pay page. No payment-acceptance fee is defined in code, so it stays a
 *   literal [PAYMENT FEE] placeholder.
 * - Off-ramp: offramp.service.ts — crypto_asset, crypto_amount, recipient_id
 *   (a saved NGN bank account); quotation, swap, then an automatic payout when
 *   the swap completes.
 * - Integration: API keys are created on the Developers page and sent as a
 *   Bearer token; test and live modes are separate.
 *
 * Removed: "1% per transaction", "under 2 minutes", "40+/50+ others",
 * Litecoin and Polygon, "SDKs in 8 languages", "under 30 minutes", the bank
 * brand list, and the security answer (AES-256, TLS 1.3, OAuth 2.0, AML
 * screening, audits) — unverified, and the security section now covers that
 * ground. "Can I accept crypto payments in Nigeria?" was dropped as it only
 * restated the assets and settlement answers.
 */
const FAQ_ITEMS = [
  {
    q: "Which cryptocurrencies do you support?",
    a: "Eight assets — BTC, ETH, USDT, USDC, SOL, BNB, TRX and TON — across eight networks: Bitcoin, Ethereum, BSC, Solana, Tron, Base, Arbitrum and TON.",
  },
  {
    q: "How do I get paid in Naira?",
    a: "Completed payments are credited to your Dexxify balance. From there you can swap to Naira and withdraw to a saved Nigerian bank account.",
  },
  {
    q: "What are your fees?",
    a: "Stablecoin withdrawals carry a flat fee of 0.5 USDT or USDC, and Naira withdrawals a flat fee of ₦100. Blockchain network fees are separate and shown to your customer before they pay. Accepting payments costs [PAYMENT FEE].",
  },
  {
    q: "How does the off-ramp work?",
    a: "Send the crypto asset, the amount and the ID of a saved Nigerian bank account. Dexxify converts the crypto to Naira at a quoted rate and, once the conversion completes, pays the Naira out to that account.",
  },
  {
    q: "How do I integrate?",
    a: "Create an account, generate an API key on the Developers page, and send it as a Bearer token with each request to the REST API. Build and test in test mode, then switch to live.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-q`;
  const panelId = `${id}-a`;

  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          id={buttonId}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          {/* Foreground is already the darkest ramp step, so the hover cue
              lightens to slate (n-700), which stays well above AA. */}
          <span className="text-base font-medium text-foreground transition-colors group-hover:text-slate">
            {q}
          </span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-colors duration-200 group-hover:border-foreground/40">
            {open ? (
              <Minus size={12} className="text-muted" />
            ) : (
              <Plus size={12} className="text-muted" />
            )}
          </span>
        </button>
      </h3>
      {/* Always rendered and toggled with `hidden`, so aria-controls always
          points at an element that exists. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-5 pr-10"
      >
        <p className="leading-relaxed text-muted">{a}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="relative border-b border-border">
      <div className="max-w-[1200px] mx-auto border-x border-border">
        <div className="grid gap-10 px-6 py-16 sm:py-24 lg:grid-cols-3 lg:gap-12">
          {/* Two-tone heading, same construction as the sections above */}
          <h2 className="text-2xl sm:text-3xl tracking-tight leading-[1.2]">
            <span className="font-bold text-foreground">Common questions.</span>{" "}
            <span className="font-normal text-slate-light">
              Assets, settlement, fees and getting integrated.
            </span>
          </h2>

          <div className="border-t border-border lg:col-span-2">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
