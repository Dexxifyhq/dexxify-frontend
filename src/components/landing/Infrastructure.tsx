"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronDown, Copy } from "lucide-react";
import { highlight } from "@/lib/utils/highlight";
import WalletQRCode from "@/components/ui/WalletQRCode";

/**
 * Request body for POST /payment-sessions, using the fields the dashboard's
 * CreatePaymentModal and the estimate endpoint actually send.
 */
const CHECKOUT_CALL = "dexxify.paymentSessions.create";
const CHECKOUT_SNIPPET = `const session = await dexxify.paymentSessions.create({
  amount: 300,
  currency: "USD",
  crypto_asset: "USDT",
  network: "tron"
});`;

/**
 * Payout rows. Mixes wallet (stablecoin withdrawal) and bank (POST /payouts)
 * destinations, the two payout types that exist. Statuses are real TxStatus
 * values. NGN amounts stay a literal placeholder; stablecoin amounts carry no
 * exchange rate, so they're shown as figures.
 */
const PAYOUT_ROWS: {
  asset: "USDT" | "USDC" | "NGN";
  recipient: string;
  amount: string;
  status: "Completed" | "Processing";
}[] = [
  { asset: "USDT", recipient: "[WALLET ADDRESS]", amount: "300.00", status: "Completed" },
  { asset: "NGN", recipient: "[BANK] ••••4417", amount: "₦[AMOUNT]", status: "Completed" },
  { asset: "USDC", recipient: "[WALLET ADDRESS]", amount: "1,250.00", status: "Completed" },
  { asset: "NGN", recipient: "[BANK] ••••[ACCT]", amount: "₦[AMOUNT]", status: "Processing" },
  { asset: "USDT", recipient: "[WALLET ADDRESS]", amount: "80.00", status: "Completed" },
];

/** 09:45, as in the reference. Illustrative only; the real window comes from
 *  the session's expires_at. */
const EXPIRES_IN_SECONDS = 9 * 60 + 45;

function formatMinutesSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Checkout widget for the floating card, modelled on the real
 * /pay/[session_id] page: amount, network, QR, deposit address, live expiry.
 * Its amount, asset and network match CHECKOUT_SNIPPET beside it.
 *
 * Two deliberate departures from the reference:
 * - The address is a bracketed placeholder, and so is what the QR encodes. A
 *   scannable, real-looking address on a marketing page is something a visitor
 *   could send funds to.
 * - The reference's "Confirmations 0 from 6" slot shows deposit status instead.
 *   The real checkout never shows a confirmation count, and a fixed "6" would
 *   state a requirement we don't publish.
 */
function CheckoutWidget() {
  const [secondsLeft, setSecondsLeft] = useState(EXPIRES_IN_SECONDS);

  // Loops back to 09:45 at zero, so a visitor who lingers never sees the demo
  // sitting on an expired 00:00. State is only set from the interval callback.
  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? EXPIRES_IN_SECONDS : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-bold tracking-tight text-foreground">
            300.00 USDT
          </p>
          <p className="mt-0.5 text-xs text-muted">$300.00</p>
        </div>
        <span className="shrink-0 text-[10px] text-muted">
          Network Tron (TRC-20)
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-border p-3">
        <div className="flex items-start gap-3">
          <div className="shrink-0 overflow-hidden rounded-lg border border-border">
            <WalletQRCode address="[DEPOSIT ADDRESS]" size={56} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted">Tron (TRC-20) address</p>
            <p className="mt-1 break-all font-mono text-xs text-foreground">
              [DEPOSIT ADDRESS]
            </p>
          </div>
          <Copy size={13} className="mt-0.5 shrink-0 text-muted" />
        </div>

        <div className="mt-3 grid grid-cols-2 divide-x divide-border border-t border-border pt-3">
          <div className="pr-3">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-border border-t-foreground motion-safe:animate-spin" />
              <span className="text-xs text-muted">Expires in</span>
            </div>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
              {formatMinutesSeconds(secondsLeft)}
            </p>
          </div>
          <div className="pl-3">
            <div className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-border border-t-foreground motion-safe:animate-spin" />
              <span className="text-xs text-muted">Status</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-foreground">
              Awaiting deposit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Shared card frame — title, optional description and link, visual below.
 *  `tone="dark"` swaps to a Carbon Black ground with light type. */
function Card({
  title,
  description,
  href,
  tone = "light",
  className = "",
  children,
}: {
  title: string;
  description?: string;
  href?: string;
  tone?: "light" | "dark";
  className?: string;
  children: React.ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`rounded-2xl border p-6 sm:p-8 flex flex-col ${
        dark
          ? "bg-foreground bg-dots-dark border-code-border"
          : "bg-card border-border"
      } ${className}`}
    >
      <h3
        className={`text-lg sm:text-xl font-semibold tracking-tight ${
          dark ? "text-background" : "text-foreground"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`mt-2 max-w-md text-sm leading-relaxed ${
            dark ? "text-background/65" : "text-muted"
          }`}
        >
          {description}
        </p>
      )}
      {href && (
        <a
          href={href}
          className={`mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all duration-200 ${
            dark ? "text-background" : "text-foreground"
          }`}
        >
          Learn more
          <ArrowRight size={14} />
        </a>
      )}
      <div className="mt-6 flex-1">{children}</div>
    </div>
  );
}

/** Invoice visual: summary on the left, the payer's asset/network step on the
 *  right, as on /invoices/pay/[invoice_number]. Amounts match the 300 used
 *  everywhere else in this section. */
function InvoiceVisual() {
  return (
    <div
      aria-hidden="true"
      className="grid overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-2"
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">
            [BUSINESS NAME]
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">
            Unpaid
          </span>
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-wider text-muted">
          Amount due
        </p>
        <p className="text-2xl font-bold tracking-tight text-foreground">
          $300.00
        </p>
        <p className="mt-0.5 text-[11px] text-muted">Due [DATE]</p>

        <div className="mt-4 space-y-2 border-t border-border pt-3 text-[11px]">
          <div className="flex justify-between gap-3">
            <span className="truncate text-foreground">[ITEM] × 1</span>
            <span className="font-mono text-foreground">$300.00</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Invoice</span>
            <span className="font-mono text-muted">INV-[NUMBER]</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-deeper p-5 sm:border-t-0 sm:border-l">
        <p className="text-xs font-semibold text-foreground">
          Complete your payment
        </p>
        <p className="mt-0.5 text-[10px] text-muted">
          Choose the asset and network to pay with.
        </p>
        <div className="mt-4 space-y-2">
          {[
            { label: "Asset", value: "USDT" },
            { label: "Network", value: "Tron (TRC-20)" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="text-[10px] text-muted">{f.label}</span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                {f.value}
                <ChevronDown size={11} className="text-muted" />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-foreground py-2 text-center text-[11px] font-medium text-background">
          Proceed to payment
        </div>
      </div>
    </div>
  );
}

/** QR visual: the pay-link QR a merchant shows from the checkout modal, framed
 *  like a screen at the counter. Encodes a placeholder, not a live link. */
function QrVisual() {
  return (
    <div aria-hidden="true" className="flex justify-center">
      <div className="w-full max-w-[220px] rounded-2xl border border-border bg-background p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            [BUSINESS NAME]
          </span>
          <span className="text-[10px] text-muted">Scan to pay</span>
        </div>
        <div className="mt-3 flex justify-center">
          <WalletQRCode address="[PAYMENT LINK]" size={128} />
        </div>
        <div className="mt-3 truncate rounded-full border border-border bg-deeper px-3 py-1.5 text-center font-mono text-[10px] text-muted">
          [DOMAIN]/pay/[SESSION ID]
        </div>
      </div>
    </div>
  );
}

/** Payouts visual: a batch of mixed wallet and bank payouts. */
function PayoutsVisual() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-border bg-background"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-semibold text-foreground">
          Recent payouts
        </span>
        <span className="text-[10px] text-muted">Batch payout</span>
      </div>
      <div className="grid grid-cols-[4.5rem_1fr_auto_auto] gap-3 border-b border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
        <span>Asset</span>
        <span>Recipient</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Status</span>
      </div>
      <div className="divide-y divide-border">
        {PAYOUT_ROWS.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[4.5rem_1fr_auto_auto] items-center gap-3 px-4 py-2.5"
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              {r.asset === "NGN" ? (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
                  ₦
                </span>
              ) : (
                <Image
                  src={`/cypto/${r.asset.toLowerCase()}.svg`}
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                  className="h-4 w-4 grayscale"
                />
              )}
              {r.asset}
            </span>
            <span className="truncate font-mono text-[11px] text-muted">
              {r.recipient}
            </span>
            <span className="text-right font-mono text-xs text-foreground">
              {r.amount}
            </span>
            <span
              className={`justify-self-end rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                r.status === "Completed"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-deeper text-muted"
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Infrastructure() {
  return (
    <section className="relative border-b border-border">
      <div className="max-w-[1200px] mx-auto border-x border-border">
        <div className="px-6 py-16 sm:py-24">
          {/* Two-tone heading, same construction as the Hero h1 */}
          <h2 className="max-w-3xl text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.2]">
            <span className="font-bold text-foreground">
              Comprehensive infrastructure to accept, convert and settle crypto.
            </span>{" "}
            <span className="font-normal text-slate-light">
              Dexxify moves money between crypto and Naira for businesses across
              Africa, on one integration.
            </span>
          </h2>

          {/* Bento — spans alternate 5 / 3+2 / 2+3 to match the reference rhythm */}
          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {/* Crypto Checkout — copy in the left column, code and checkout
                widget on the right. Doesn't use <Card> because its copy sits
                beside the visual rather than above it. */}
            <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 sm:p-8 grid lg:grid-cols-2 mb-5">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                  Crypto Checkout
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Accept crypto payments with branded checkout pages or payment
                  links created straight from the API.
                </p>
                <a
                  href="#"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground hover:gap-2.5 transition-all duration-200"
                >
                  Learn more
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* Illustrative, so hidden from assistive tech — the live
                  countdown would otherwise be announced as it changes. */}
              <div aria-hidden="true" className="relative lg:mb-8">
                <div className="rounded-xl bg-code-bg overflow-hidden lg:min-h-[290px]">
                  <div className="flex items-center gap-2 border-b border-code-border px-4 py-2.5">
                    <span className="font-mono text-[11px] text-code-muted">
                      {CHECKOUT_CALL}
                    </span>
                  </div>
                  <div className="p-5 font-mono text-xs text-code-fg overflow-x-auto">
                    {highlight(CHECKOUT_SNIPPET)}
                  </div>
                </div>

                {/* lg:top-[32%] plus lg:mb-8 above: the widget starts partway
                    down the code panel and overhangs it, and the margin keeps
                    that overhang clear of the card edge. */}
                <div className="mt-4 rounded-xl border border-border bg-background p-5 shadow-lg lg:mt-0 lg:absolute lg:top-[32%] lg:-right-7 lg:w-[85%]">
                  <CheckoutWidget />
                </div>
              </div>
            </div>

            {/* Invoices — was "Hosted checkout and payment pages". The
                reference's "recurring payments and subscriptions" is dropped:
                invoices are one-off, there is no recurring billing. */}
            <Card
              title="Invoices"
              description="Create, send and track invoices your customers pay in crypto."
              href="#"
              className="lg:col-span-3"
            >
              <InvoiceVisual />
            </Card>

            {/* QR Payments — was "Instant NGN settlement". Worded around the
                pay-link QR that exists in the checkout modal; the reference's
                "downloadable QR on every payment page" does not exist, and
                in-store POS terminals are still marked coming soon. */}
            <Card
              title="QR Payments"
              description="Every payment session comes with a QR code of its payment link, so customers can scan and pay at the counter."
              href="#"
              tone="dark"
              className="lg:col-span-2"
            >
              <QrVisual />
            </Card>

            {/* Verification */}
            {/* The four checks map one-to-one to POST /kyc/bvn, /kyc/nin,
                /kyc/vnin and /kyc/cac. Statuses are real verification states
                (pending | verified | failed | expired). */}
            <Card
              title="Built-in KYC and compliance"
              description="Verify individuals with BVN, NIN or vNIN, and businesses with their CAC registration."
              href="#"
              tone="dark"
              className="lg:col-span-2"
            >
              <div
                aria-hidden="true"
                className="rounded-xl border border-border bg-background overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-xs font-medium text-foreground">
                    Verification checks
                  </span>
                  <span className="font-mono text-[10px] text-muted">
                    cus_8812
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {[
                    { check: "BVN", scope: "Individual", verified: true },
                    { check: "NIN", scope: "Individual", verified: true },
                    { check: "vNIN", scope: "Individual", verified: false },
                    { check: "CAC", scope: "Business", verified: true },
                  ].map((r) => (
                    <div
                      key={r.check}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <span className="w-12 shrink-0 text-xs font-medium text-foreground">
                        {r.check}
                      </span>
                      <span className="flex-1 truncate text-[11px] text-muted">
                        {r.scope}
                      </span>
                      {r.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          <Check size={9} strokeWidth={3} />
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full border border-border bg-deeper px-2 py-0.5 text-[10px] font-medium text-muted">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Payouts — was "Offramp payouts to any bank". Every claim here
                exists: bank payouts (POST /payouts), stablecoin withdrawals to
                a wallet address, and batch payouts (POST /payouts/batch). */}
            <Card
              title="Payouts"
              description="Send stablecoin and fiat payouts, to wallets or bank accounts, in a single API call."
              href="#"
              className="lg:col-span-3"
            >
              <PayoutsVisual />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
