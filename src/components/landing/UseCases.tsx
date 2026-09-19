import { DOCS_URL } from "@/lib/constants/links";
import {
  ArrowUpRight,
  ShoppingCart,
  Monitor,
  Trophy,
  Wrench,
  Palette,
  BarChart2,
  Briefcase,
  Plane,
  Gamepad2,
  Wallet,
  FileText,
  LayoutTemplate,
  QrCode,
  CreditCard,
  Landmark,
  Coins,
  type LucideIcon,
} from "lucide-react";

interface UseCase {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/**
 * Copy is held to what the product does today. Changes from the original
 * WhoItsFor copy:
 * - E-commerce no longer says "without a crypto wallet" — paying in crypto
 *   needs one.
 * - SaaS no longer says "subscriptions" — invoices are one-off, there is no
 *   recurring billing.
 * - Betting and gaming lose "instantly"/"instant" — no settlement timing we
 *   can't verify.
 */
const COLLECT: UseCase[] = [
  { icon: ShoppingCart, title: "E-commerce stores", desc: "Accept crypto from customers anywhere and settle to your bank." },
  { icon: Monitor, title: "SaaS platforms", desc: "Bill customers with crypto invoices and payment links." },
  { icon: Trophy, title: "Betting platforms", desc: "Take crypto deposits that settle to your bank." },
  { icon: Wrench, title: "Service businesses", desc: "Invoice clients in crypto, get paid in Naira." },
  { icon: Palette, title: "Digital creators", desc: "Sell digital products globally, receive Naira locally." },
];

const PAY_OUT: UseCase[] = [
  { icon: BarChart2, title: "Crypto exchanges", desc: "Automate NGN withdrawals and replace manual P2P desks." },
  { icon: Briefcase, title: "Freelance platforms", desc: "Pay Nigerian contractors in Naira from USDT balances." },
  { icon: Plane, title: "Remittance apps", desc: "Crypto in from abroad, Naira out to any Nigerian bank." },
  { icon: Gamepad2, title: "Gaming platforms", desc: "Crypto-to-Naira payouts for Nigerian players." },
  { icon: Wallet, title: "Payroll tools", desc: "Disburse salaries in Naira from a stablecoin treasury." },
];

// ── Diagram primitives ──────────────────────────────────────────────────────
// Every connector in these diagrams is horizontal, as in the reference, so
// they're plain grid rows with a 1px line and a CSS arrowhead rather than an
// SVG whose text and arrowheads would distort as it scales.

function Node({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-code-border bg-foreground px-2.5 py-2 text-[11px] font-medium text-background sm:px-3 sm:text-xs">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-background/10">
        <Icon size={11} />
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

/** A horizontal connector ending in an arrowhead, with an optional pill label
 *  sitting on the line. */
function Connector({ label }: { label?: string }) {
  return (
    <div className="relative mx-1 h-px min-w-10 flex-1 bg-code-border">
      <span className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[4px] border-l-[6px] border-y-transparent border-l-code-muted" />
      {label && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-code-border bg-foreground px-2 py-0.5 text-[10px] text-background/70">
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Collect: every way a payment comes in, all settling to one balance.
 * All four inputs are real (payment sessions, payment pages, invoices, the
 * pay-link QR), and a wallet can auto-settle to a bank account.
 */
function CollectDiagram() {
  const inputs = [
    { icon: CreditCard, label: "Payment session" },
    { icon: LayoutTemplate, label: "Payment page" },
    { icon: FileText, label: "Invoice" },
    { icon: QrCode, label: "QR payment" },
  ];
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-y-3">
      {inputs.map((n, i) => (
        <div key={n.label} className="contents">
          <div className="col-start-1" style={{ gridRow: i + 1 }}>
            <Node icon={n.icon} label={n.label} />
          </div>
          <div className="col-start-2 flex" style={{ gridRow: i + 1 }}>
            <Connector />
          </div>
        </div>
      ))}
      {/* One destination spanning every input row */}
      <div
        className="col-start-3 flex h-full flex-col items-center justify-center gap-1 rounded-md border border-code-border bg-foreground px-4 text-center"
        style={{ gridRow: `1 / span ${inputs.length}` }}
      >
        <Landmark size={14} className="text-background" />
        <span className="text-xs font-medium text-background">
          Your balance
        </span>
        <span className="text-[10px] text-background/60">
          Wallet or bank
        </span>
      </div>
    </div>
  );
}

/**
 * Pay out: the three real outbound flows — off-ramp (crypto to a Naira
 * recipient), payouts (POST /payouts, NGN to a bank) and stablecoin
 * withdrawals to a wallet address.
 */
function PayOutDiagram() {
  const flows = [
    { from: { icon: Coins, label: "USDT / USDC" }, via: "off-ramp", to: { icon: Landmark, label: "Nigerian bank" } },
    { from: { icon: Wallet, label: "NGN balance" }, via: "payout", to: { icon: Landmark, label: "Nigerian bank" } },
    { from: { icon: Coins, label: "USDT / USDC" }, via: "withdrawal", to: { icon: Wallet, label: "Wallet address" } },
  ];
  return (
    <div className="space-y-5">
      {flows.map((f) => (
        <div key={f.via} className="flex items-center">
          <Node icon={f.from.icon} label={f.from.label} />
          <Connector label={f.via} />
          <Node icon={f.to.icon} label={f.to.label} />
        </div>
      ))}
    </div>
  );
}

// ── Rows ────────────────────────────────────────────────────────────────────

/**
 * One band of the section: two-tone lead and link top-left, the real use-case
 * list bottom-left, diagram on the right. The reference puts a customer
 * testimonial in the bottom-left slot; there are no real ones to quote, and an
 * invented quote would be a fabricated endorsement, so that slot holds the use
 * cases instead.
 */
function Row({
  lead,
  rest,
  linkLabel,
  items,
  diagram,
}: {
  lead: string;
  rest: string;
  linkLabel: string;
  items: UseCase[];
  diagram: React.ReactNode;
}) {
  return (
    <div className="grid gap-10 border-t border-code-border px-4 sm:px-6 py-12 sm:py-16 lg:grid-cols-2 lg:gap-12">
      <div className="flex flex-col">
        <h3 className="max-w-md text-lg sm:text-xl leading-snug tracking-tight">
          <span className="font-semibold text-background">{lead}</span>{" "}
          <span className="text-background/60">{rest}</span>
        </h3>
        <a
          href={DOCS_URL}
          className="mt-4 inline-flex w-fit items-center gap-1 text-xs font-medium text-background hover:gap-2 transition-all duration-200"
        >
          {linkLabel}
          <ArrowUpRight size={12} />
        </a>

        <ul className="mt-10 space-y-3 lg:mt-auto lg:pt-10">
          {items.map((u) => (
            <li key={u.title} className="flex items-start gap-3">
              <u.icon size={14} className="mt-0.5 shrink-0 text-background/60" />
              <p className="text-sm leading-relaxed">
                <span className="font-medium text-background">{u.title}</span>{" "}
                <span className="text-background/60">{u.desc}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* The diagram restates the lead in picture form, so it's decorative */}
      <div aria-hidden="true" className="flex items-center overflow-x-auto lg:justify-end">
        <div className="w-full max-w-md">{diagram}</div>
      </div>
    </div>
  );
}

export default function UseCases() {
  return (
    <section className="relative border-b border-code-border bg-foreground bg-dots-dark">
      <div className="max-w-[1200px] mx-auto border-x border-code-border">
        {/* Intro */}
        <div className="px-4 sm:px-6 py-16 sm:py-24">
          <h2 className="max-w-2xl text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.2]">
            <span className="font-bold text-background">
              Built for every Nigerian business.
            </span>{" "}
            <span className="font-normal text-background/60">
              From storefronts collecting crypto to platforms paying out in
              Naira, on one integration.
            </span>
          </h2>
          <a
            href={DOCS_URL}
            className="mt-8 inline-flex h-9 items-center rounded-md bg-background px-4 text-sm font-medium text-foreground hover:bg-card transition-colors duration-200"
          >
            Read the docs
          </a>
        </div>

        <Row
          lead="Collect crypto"
          rest="from customers through checkout, payment pages, invoices or QR, and settle to one balance."
          linkLabel="See how checkout works"
          items={COLLECT}
          diagram={<CollectDiagram />}
        />

        <Row
          lead="Pay out in Naira"
          rest="to any Nigerian bank, or send stablecoins to a wallet, from the same balance."
          linkLabel="See how payouts work"
          items={PAY_OUT}
          diagram={<PayOutDiagram />}
        />
      </div>
    </section>
  );
}
