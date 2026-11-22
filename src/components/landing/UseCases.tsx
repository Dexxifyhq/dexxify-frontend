"use client";

import { useRef } from "react";
import Image from "next/image";
import WalletQRCode from "@/components/ui/WalletQRCode";
import { SITE_URL } from "@/lib/constants/site";

/**
 * Use cases — an Anchor-style carousel, black and white. One slide per
 * example: group label, title, one-line description, product tiles, and a
 * product preview bottom-right that bleeds off the slide.
 *
 * Carousel is CSS scroll-snap; the arrow buttons scroll one slide at a time.
 * Swipe works on touch too; on phones the arrows sit under the heading.
 *
 * Copy is held to what the product does today. Changes from the original
 * WhoItsFor copy:
 * - E-commerce no longer says "without a crypto wallet" — paying in crypto
 *   needs one.
 * - SaaS no longer says "subscriptions" — invoices are one-off, there is no
 *   recurring billing.
 * - Betting loses "instantly" — no settlement timing we can't verify.
 *
 * The previews are illustrative. Naira figures stay literal placeholders: an
 * NGN amount implies a published exchange rate.
 */

type Product = "checkout" | "swap" | "payouts" | "kyc" | "invoices";
type Mock = "checkout" | "invoice" | "payouts" | "swap";

type UseCase = {
  group: string;
  title: string;
  line: string;
  products: Product[];
  mock: Mock;
};

const COLLECT = "Collect crypto";
const PAY_OUT = "Pay out in Naira";

const CASES: UseCase[] = [
  { group: COLLECT, title: "E-commerce stores", line: "Accept crypto from customers anywhere and settle to your bank.", products: ["checkout", "swap", "payouts"], mock: "checkout" },
  { group: COLLECT, title: "SaaS platforms", line: "Bill customers with crypto invoices and payment links.", products: ["invoices", "checkout"], mock: "invoice" },
  { group: COLLECT, title: "Betting platforms", line: "Take crypto deposits that settle to your bank.", products: ["checkout", "payouts"], mock: "checkout" },
  { group: COLLECT, title: "Service businesses", line: "Invoice clients in crypto, get paid in Naira.", products: ["invoices", "swap"], mock: "invoice" },
  { group: COLLECT, title: "Digital creators", line: "Sell digital products globally, receive Naira locally.", products: ["checkout", "swap"], mock: "checkout" },
  { group: PAY_OUT, title: "Crypto exchanges", line: "Automate NGN withdrawals and replace manual P2P desks.", products: ["swap", "payouts", "kyc"], mock: "swap" },
  { group: PAY_OUT, title: "Payroll tools", line: "Disburse salaries in Naira from a stablecoin treasury.", products: ["payouts", "kyc"], mock: "payouts" },
];

// Slide backgrounds cycle dark / light, like the product cards.
const THEMES = [
  { bg: "#0A0A0A", fg: "#FFFFFF", tile: "#1F1F1F" },
  { bg: "#EDEDED", fg: "#0A0A0A", tile: "#FFFFFF" },
  { bg: "#262626", fg: "#FFFFFF", tile: "#3A3A3A" },
  { bg: "#DCDCDC", fg: "#0A0A0A", tile: "#F5F5F5" },
  { bg: "#161616", fg: "#FFFFFF", tile: "#2A2A2A" },
];

const GAP = 24; // px between slides; the arrows step by slide width + this

// ── Product previews ─────────────────────────────────────────────────────────
// White panels; on desktop they sit bottom-right and bleed off the slide.

const PANEL =
  "w-[320px] max-w-full rounded-2xl bg-white p-[22px] text-[#0A0A0A] shadow-[0_30px_60px_rgba(0,0,0,0.25)] lg:min-h-[400px]";

function Dot({ dark }: { dark?: boolean }) {
  return (
    <span
      className={`inline-block h-[7px] w-[7px] shrink-0 rounded-full ${dark ? "bg-[#0A0A0A]" : "bg-[#BDBDBD]"}`}
    />
  );
}

function CheckoutMock() {
  return (
    <div className={PANEL}>
      <div className="flex items-center gap-[10px]">
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-[#0A0A0A] text-[11px] font-semibold text-white">
          YS
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] font-semibold">Your store</span>
          <span className="text-[11px] text-[#767676]">Order #10482</span>
        </span>
      </div>
      <p className="mt-5 text-center text-[12px] text-[#767676]">Amount due</p>
      <p className="text-center text-[30px] font-medium tracking-[-0.5px]">
        200.00 USDT
      </p>
      {/* A real, scannable QR — it opens the Dexxify site. */}
      <div className="mx-auto mt-4 w-fit rounded-xl border border-[#EEEEEE]">
        <WalletQRCode address={SITE_URL} size={114} />
      </div>
      <p className="mt-4 flex items-center justify-center gap-[6px] text-[12px] text-[#767676]">
        <Dot />
        Waiting for payment
      </p>
    </div>
  );
}

function InvoiceMock() {
  const lines = [
    ["Design retainer", "$250.00"],
    ["Hosting", "$50.00"],
  ];
  return (
    <div className={PANEL}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold">Invoice INV-0231</span>
        <span className="rounded-full bg-[#F2F2F2] px-[10px] py-1 text-[11px] font-medium">
          Unpaid
        </span>
      </div>
      <p className="mt-5 text-[12px] text-[#767676]">Amount</p>
      <p className="text-[30px] font-medium tracking-[-0.5px]">$300.00</p>
      <div className="mt-4 flex flex-col gap-2 text-[13px]">
        {lines.map(([item, amount]) => (
          <div key={item} className="flex justify-between border-t border-[#F0F0F0] pt-2">
            <span>{item}</span>
            <span className="font-medium">{amount}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <span className="flex-1 rounded-[10px] bg-[#0A0A0A] py-[10px] text-center text-[13px] font-medium text-white">
          Pay in USDT
        </span>
        <span className="flex-1 rounded-[10px] bg-[#F2F2F2] py-[10px] text-center text-[13px] font-medium">
          Pay in USDC
        </span>
      </div>
    </div>
  );
}

function PayoutsMock() {
  const rows: { to: string; amount: string; status: string; done: boolean }[] = [
    { to: "Bank ••••4417", amount: "₦[AMOUNT]", status: "Completed", done: true },
    { to: "Wallet TXk2…9fQa", amount: "300.00 USDT", status: "Completed", done: true },
    { to: "Bank ••••0932", amount: "₦[AMOUNT]", status: "Processing", done: false },
    { to: "Bank ••••1288", amount: "₦[AMOUNT]", status: "Queued", done: false },
    { to: "Wallet 0x8f…21Cd", amount: "120.00 USDC", status: "Queued", done: false },
  ];
  return (
    <div className={`${PANEL} px-[18px] py-2 lg:w-[340px] lg:max-w-[340px]`}>
      <p className="mb-1 mt-2 text-[13px] font-semibold">Batch payout · PO-2291</p>
      {rows.map((r, i) => (
        <div
          key={r.to}
          className={`flex items-center gap-[10px] py-[11px] text-[13px] ${i ? "border-t border-[#F0F0F0]" : ""}`}
        >
          <span className="min-w-0 flex-1 truncate font-medium">{r.to}</span>
          <span className="font-medium">{r.amount}</span>
          <span className="flex items-center gap-[5px] text-[11px] text-[#767676]">
            <Dot dark={r.done} />
            {r.status}
          </span>
        </div>
      ))}
      <div className="mt-1 flex justify-between border-t border-[#E5E5E5] py-3 text-[13px] font-semibold">
        <span>5 recipients</span>
        <span>Send batch</span>
      </div>
    </div>
  );
}

function SwapRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[#F5F5F5] px-[14px] py-3">
      <span className="flex flex-col">
        <span className="text-[11px] text-[#767676]">{label}</span>
        <span className="text-[26px] font-medium tracking-[-0.5px]">{value}</span>
      </span>
      <span className="rounded-full border border-[#E5E5E5] bg-white px-[10px] py-1.5 text-[13px] font-semibold">
        {unit}
      </span>
    </div>
  );
}

function SwapMock() {
  return (
    <div className={`${PANEL} flex flex-col gap-1.5 p-[14px]`}>
      <SwapRow label="You pay" value="1,000.00" unit="USDT" />
      <SwapRow label="You receive" value="₦[AMOUNT]" unit="NGN" />
      <div className="flex flex-col gap-2 px-1 py-3 text-[13px]">
        <div className="flex justify-between">
          <span className="text-[#767676]">Rate</span>
          <span className="font-medium">1 USDT = ₦[RATE]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#767676]">Settle to</span>
          <span className="font-medium">Bank ••••4417</span>
        </div>
      </div>
      <span className="mt-1.5 rounded-[9px] bg-[#0A0A0A] py-[11px] text-center text-[13px] font-medium text-white">
        Swap and withdraw
      </span>
    </div>
  );
}

const MOCKS: Record<Mock, () => React.JSX.Element> = {
  checkout: CheckoutMock,
  invoice: InvoiceMock,
  payouts: PayoutsMock,
  swap: SwapMock,
};

// ── Section ──────────────────────────────────────────────────────────────────

export default function UseCases() {
  const trackRef = useRef<HTMLDivElement>(null);

  const go = (dir: 1 | -1) => {
    const track = trackRef.current;
    const slide = track?.querySelector<HTMLElement>("[data-slide]");
    if (!track || !slide) return;
    track.scrollBy({ left: dir * (slide.offsetWidth + GAP), behavior: "smooth" });
  };

  return (
    <section className="overflow-x-clip py-12 lg:py-24">
      {/* Heading left, arrows right on desktop; arrows under the heading on
          phones, as on the Anchor mobile reference. */}
      <div className="mx-auto flex max-w-[1180px] flex-col items-start gap-5 px-6 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-6 lg:px-0 lg:pb-9">
        <h2 className="max-w-[760px] text-[26px] font-normal leading-[1.18] tracking-[-0.8px] text-[#0A0A0A] lg:text-[46px] lg:tracking-[-1px]">
          Built for every Nigerian business.
        </h2>
        <div className="flex gap-[10px]">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => go(dir)}
              aria-label={dir < 0 ? "Previous use case" : "Next use case"}
              aria-controls="use-cases-track"
              className="grid h-12 w-12 place-items-center rounded-xl bg-[#F2F2F2] text-[#0A0A0A] transition-colors hover:bg-[#E5E5E5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d={dir < 0 ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Track. On desktop the first slide lines up with the 1180px heading
          column and the next one peeks in on the right. Focusable so keyboard
          users can scroll it with the arrow keys. The smooth-scroll library
          leaves horizontal gestures here to the browser. */}
      <div
        ref={trackRef}
        id="use-cases-track"
        role="region"
        aria-label="Use cases"
        tabIndex={0}
        data-lenis-prevent-horizontal
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 [scroll-padding-inline:24px] [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A] lg:px-[max(24px,calc((100%_-_1180px)/2))] lg:[scroll-padding-inline:max(24px,calc((100%_-_1180px)/2))] [&::-webkit-scrollbar]:hidden"
      >
        {CASES.map((c, i) => {
          const t = THEMES[i % THEMES.length];
          const Preview = MOCKS[c.mock];
          return (
            <article
              key={c.title}
              data-slide
              aria-label={`${i + 1} of ${CASES.length}: ${c.title}`}
              className="relative flex w-[calc(100vw-48px)] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] px-7 pt-9 lg:h-[540px] lg:w-[1180px] lg:flex-row lg:items-start lg:justify-between lg:px-20 lg:pt-[72px]"
              style={{ background: t.bg, color: t.fg }}
            >
              <div className="flex flex-col gap-5 lg:h-[396px]">
                <span className="text-[16px] font-medium">{c.group}</span>
                <h3 className="max-w-[560px] text-[40px] font-medium leading-[0.95] tracking-[-2px] lg:text-[92px]">
                  {c.title}.
                </h3>
                <p className="max-w-[460px] text-[16px] leading-[1.5] opacity-80">
                  {c.line}
                </p>
                {/* Product tiles reuse the product-card illustrations. */}
                <div aria-hidden="true" className="mt-6 flex gap-[10px] lg:mt-auto">
                  {c.products.map((p) => (
                    <span
                      key={p}
                      className="relative h-[54px] w-[72px] overflow-hidden rounded-[10px]"
                      style={{ background: t.tile }}
                    >
                      <Image
                        src={`/illustrations/${p}.svg`}
                        alt=""
                        fill
                        unoptimized
                        sizes="72px"
                        className="object-cover object-[50%_60%]"
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Preview: below the text on mobile; bottom-right on desktop,
                  bleeding off the slide's bottom edge. Illustrative only. */}
              <div
                aria-hidden="true"
                className="-mb-10 mt-10 w-full self-center lg:mb-0 lg:mt-0 lg:w-auto lg:translate-y-10 lg:self-end"
              >
                <div className="mx-auto flex max-w-full justify-center lg:mx-0">
                  <Preview />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
