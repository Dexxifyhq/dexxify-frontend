"use client";

import {
  FileText,
  Link2,
  Globe,
  ArrowDown,
  User,
  Coins,
  Wallet,
  CheckCircle2,
  Zap,
  RefreshCw,
  Users,
  Clock,
  Hash,
  ArrowRight,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface InstrumentCardProps {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  name: string;
  tagline: string;
  useCase: string;
  url: string;
  traits: { icon: React.ReactNode; label: string }[];
  merchantSteps: string[];
}

// ── Instrument Card ────────────────────────────────────────────────────────

function InstrumentCard({
  icon,
  color,
  bgColor,
  borderColor,
  name,
  tagline,
  useCase,
  url,
  traits,
  merchantSteps,
}: InstrumentCardProps) {
  return (
    <div className={`flex flex-col rounded-xl border ${borderColor} bg-dash-card`}>
      {/* Header */}
      <div className={`flex items-start gap-3 border-b ${borderColor} p-5`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
          <span className={color}>{icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-dash-foreground">{name}</p>
          <p className="mt-0.5 text-xs text-dash-muted">{tagline}</p>
        </div>
      </div>

      {/* URL pattern */}
      <div className="border-b border-dash-border px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-dash-faint">URL</p>
        <p className="mt-1 font-mono text-xs text-dash-muted">{url}</p>
      </div>

      {/* Traits */}
      <div className="border-b border-dash-border px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-dash-faint">Characteristics</p>
        <ul className="flex flex-col gap-2">
          {traits.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-dash-muted">
              <span className="text-dash-faint">{t.icon}</span>
              {t.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Merchant flow */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-dash-faint">Merchant creates</p>
        {merchantSteps.map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${bgColor} ${color}`}>
              {i + 1}
            </span>
            <p className="text-xs text-dash-muted">{step}</p>
          </div>
        ))}
      </div>

      {/* Use case tag */}
      <div className={`mt-auto border-t ${borderColor} px-5 py-3`}>
        <span className={`inline-flex items-center rounded-full ${bgColor} ${color} px-2.5 py-0.5 text-[11px] font-semibold`}>
          {useCase}
        </span>
      </div>
    </div>
  );
}

// ── Journey Step ───────────────────────────────────────────────────────────

function JourneyStep({
  number,
  icon,
  title,
  description,
  isLast = false,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dash-accent bg-dash-accent-soft text-dash-accent">
          {icon}
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs font-semibold text-dash-foreground">{title}</p>
          <p className="mt-0.5 max-w-[120px] text-[11px] text-dash-muted">{description}</p>
        </div>
      </div>
      {!isLast && (
        <div className="mt-3 flex flex-col items-center gap-0.5">
          <div className="h-1 w-1 rounded-full bg-dash-accent/40" />
          <div className="h-1 w-1 rounded-full bg-dash-accent/40" />
          <div className="h-1 w-1 rounded-full bg-dash-accent/40" />
        </div>
      )}
    </div>
  );
}

// ── Comparison row ─────────────────────────────────────────────────────────

function CompareRow({
  label,
  invoice,
  checkout,
  page,
}: {
  label: string;
  invoice: string;
  checkout: string;
  page: string;
}) {
  return (
    <tr className="border-t border-dash-border">
      <td className="py-3 pr-4 text-xs font-medium text-dash-muted">{label}</td>
      <td className="py-3 pr-4 text-xs text-dash-muted">{invoice}</td>
      <td className="py-3 pr-4 text-xs text-dash-muted">{checkout}</td>
      <td className="py-3 text-xs text-dash-muted">{page}</td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-dash-foreground">Payment Workflows</h1>
        <p className="text-sm text-dash-muted">
          Three instruments, one customer journey. Understand what to use and when.
        </p>
      </div>

      {/* ── Three instruments ── */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
          Payment Instruments
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InstrumentCard
            icon={<FileText size={16} />}
            color="text-dash-warning"
            bgColor="bg-dash-warning-bg"
            borderColor="border-dash-warning-border"
            name="Invoice"
            tagline="Bill a specific customer"
            useCase="B2B / Client billing"
            url="/invoice/[invoice_id]"
            traits={[
              { icon: <User size={11} />, label: "Tied to one customer (email required)" },
              { icon: <Hash size={11} />, label: "Has line items + descriptions" },
              { icon: <Clock size={11} />, label: "Has a due date — expires after" },
              { icon: <FileText size={11} />, label: "One-time, non-reusable" },
            ]}
            merchantSteps={[
              "Enter customer email, amount, line items & due date",
              "Backend creates invoice + unique link",
              "Share the link (email or copy) to your customer",
              "Webhook fires when customer pays",
            ]}
          />

          <InstrumentCard
            icon={<Link2 size={16} />}
            color="text-dash-accent"
            bgColor="bg-dash-accent-soft"
            borderColor="border-dash-accent"
            name="Checkout Session"
            tagline="Quick one-time payment link"
            useCase="One-off / API-driven"
            url="/pay/[session_id]"
            traits={[
              { icon: <Zap size={11} />, label: "Fast to create — amount only" },
              { icon: <Clock size={11} />, label: "Expires in ~30 minutes" },
              { icon: <FileText size={11} />, label: "No customer binding required" },
              { icon: <RefreshCw size={11} />, label: "Can be single or multi-use" },
            ]}
            merchantSteps={[
              "Enter the USD amount to charge",
              "Backend creates session + unique link",
              "Share or send the link to your customer",
              "Webhook fires on each completed payment",
            ]}
          />

          <InstrumentCard
            icon={<Globe size={16} />}
            color="text-dash-success"
            bgColor="bg-dash-success-bg"
            borderColor="border-dash-success-border"
            name="Payment Page"
            tagline="Permanent, reusable storefront"
            useCase="E-commerce / Donations"
            url="/p/[page_slug]"
            traits={[
              { icon: <Globe size={11} />, label: "Permanent URL — never expires" },
              { icon: <Users size={11} />, label: "Many customers, same link" },
              { icon: <Coins size={11} />, label: "Fixed price or 'pay what you want'" },
              { icon: <RefreshCw size={11} />, label: "Always multi-use by design" },
            ]}
            merchantSteps={[
              "Set title, description, amount (or flexible)",
              "Customize appearance (logo, color, cover)",
              "Publish — get a permanent shareable URL",
              "Webhook fires per completed payment",
            ]}
          />
        </div>
      </div>

      {/* ── Shared customer journey ── */}
      <div className="rounded-xl border border-dash-border bg-dash-card p-6">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
          Shared Customer Journey — same flow for all three instruments
        </p>
        <div className="flex flex-wrap items-start justify-center gap-2">
          <JourneyStep
            number={1}
            icon={<Link2 size={16} />}
            title="Opens link"
            description="Customer clicks the merchant's shared URL"
          />
          <div className="mt-4 hidden sm:flex items-center text-dash-accent/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={2}
            icon={<FileText size={16} />}
            title="Sees details"
            description="Amount, description, merchant name"
          />
          <div className="mt-4 hidden sm:flex items-center text-dash-accent/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={3}
            icon={<User size={16} />}
            title="Enters details"
            description="Name + email address"
          />
          <div className="mt-4 hidden sm:flex items-center text-dash-accent/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={4}
            icon={<Coins size={16} />}
            title="Picks token"
            description="Selects crypto from available assets"
          />
          <div className="mt-4 hidden sm:flex items-center text-dash-accent/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={5}
            icon={<Wallet size={16} />}
            title="Gets address"
            description="Unique deposit address + amount generated"
          />
          <div className="mt-4 hidden sm:flex items-center text-dash-accent/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={6}
            icon={<ArrowDown size={16} />}
            title="Sends crypto"
            description="Sends exact amount to the address"
          />
          <div className="mt-4 hidden sm:flex items-center text-dash-accent/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={7}
            icon={<CheckCircle2 size={16} />}
            title="Confirmed"
            description="Backend confirms on-chain, webhook fires"
            isLast
          />
        </div>

        {/* Note */}
        <div className="mt-6 rounded-lg border border-dash-border bg-dash-hover px-4 py-3 text-xs text-dash-muted">
          <span className="font-semibold text-dash-muted">Key principle: </span>
          Each call to{" "}
          <span className="font-mono text-dash-accent">POST /payment-sessions/:id/pay</span> (or the invoice/page equivalent) generates a fresh, unique on-chain deposit address. The link is safe to share publicly — the address is tied to the individual customer submission, not the link itself.
        </div>
      </div>

      {/* ── What the customer page looks like ── */}
      <div className="rounded-xl border border-dash-border bg-dash-card">
        <div className="border-b border-dash-border px-5 py-4">
          <p className="text-sm font-semibold text-dash-foreground">What the Customer Page Shows</p>
          <p className="mt-0.5 text-xs text-dash-muted">
            What differs between instruments on the same page template
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-dash-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Invoice */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={13} className="text-dash-warning" />
              <p className="text-xs font-semibold text-dash-foreground">Invoice Page</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                "Merchant's business name + logo",
                "Invoice number (#INV-0042)",
                "Line items with descriptions",
                "Total amount + due date",
                "\"Invoice expires in X days\" warning",
                "Name + email pre-filled if known",
                "Token picker → deposit address",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-dash-muted">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-dash-warning/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 size={13} className="text-dash-accent" />
              <p className="text-xs font-semibold text-dash-foreground">Checkout Session Page</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                "Merchant's business name",
                "Amount due in USD + NGN equivalent",
                "Expiry countdown timer",
                "Name + email fields",
                "Token picker (asset + network)",
                "Min deposit info per token",
                "Deposit address + copy button",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-dash-muted">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-dash-accent/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Page */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe size={13} className="text-dash-success" />
              <p className="text-xs font-semibold text-dash-foreground">Payment Page</p>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                "Page title + description (merchant-set)",
                "Cover image / banner (optional)",
                "Fixed amount or editable amount field",
                "Name + email fields",
                "Token picker",
                "No expiry — stays open",
                "Deposit address per submission",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-dash-muted">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-dash-success/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Comparison table ── */}
      <div className="rounded-xl border border-dash-border bg-dash-card">
        <div className="border-b border-dash-border px-5 py-4">
          <p className="text-sm font-semibold text-dash-foreground">Feature Comparison</p>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-3 pr-4 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-dash-faint">
                  Feature
                </th>
                <th className="pb-3 pr-4 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-dash-warning">
                  Invoice
                </th>
                <th className="pb-3 pr-4 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-dash-accent">
                  Checkout
                </th>
                <th className="pb-3 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-dash-success">
                  Payment Page
                </th>
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Customer-specific" invoice="✓ Yes" checkout="Optional" page="✗ No" />
              <CompareRow label="Reusable link" invoice="✗ One-time" checkout="Optional" page="✓ Permanent" />
              <CompareRow label="Expires" invoice="✓ Due date" checkout="✓ ~30 min" page="✗ Never" />
              <CompareRow label="Line items" invoice="✓ Yes" checkout="✗ No" page="Optional" />
              <CompareRow label="Flexible amount" invoice="✗ Fixed" checkout="✗ Fixed" page="✓ Optional" />
              <CompareRow label="Customer token choice" invoice="✓ Yes" checkout="✓ Yes" page="✓ Yes" />
              <CompareRow label="Unique deposit address" invoice="✓ Per pay" checkout="✓ Per pay" page="✓ Per pay" />
              <CompareRow label="Webhook on payment" invoice="✓ Yes" checkout="✓ Yes" page="✓ Yes" />
              <CompareRow label="Multiple customers" invoice="✗ No" checkout="Multi-use only" page="✓ Always" />
            </tbody>
          </table>
        </div>
      </div>

      {/* ── What needs to be built ── */}
      <div className="rounded-xl border border-dash-border bg-dash-card">
        <div className="border-b border-dash-border px-5 py-4">
          <p className="text-sm font-semibold text-dash-foreground">Build Checklist</p>
          <p className="mt-0.5 text-xs text-dash-muted">What still needs to be wired up</p>
        </div>
        <div className="grid grid-cols-1 divide-y divide-dash-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Invoice */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={13} className="text-dash-warning" />
              <p className="text-xs font-semibold text-dash-foreground">Invoice</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                { done: false, label: "POST /invoices API + hook" },
                { done: false, label: "Invoice form with line items" },
                { done: false, label: "GET /invoices list + table" },
                { done: false, label: "/invoice/[id] public customer page" },
                { done: false, label: "Paid / expired status tracking" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] ${item.done ? "border-dash-success bg-dash-success/20 text-dash-success" : "border-dash-faint text-transparent"}`}>
                    ✓
                  </span>
                  <span className={item.done ? "text-dash-muted line-through" : "text-dash-muted"}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 size={13} className="text-dash-accent" />
              <p className="text-xs font-semibold text-dash-foreground">Checkout Session</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                { done: true, label: "POST /payment-sessions API + hook" },
                { done: true, label: "Create session modal (merchant)" },
                { done: true, label: "/pay/[session_id] customer page" },
                { done: true, label: "Token picker + NGN conversion" },
                { done: true, label: "Deposit address display" },
                { done: false, label: "Expiry countdown timer on page" },
                { done: false, label: "Sessions table on checkout page" },
                { done: false, label: "Multi-use toggle on create modal" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] ${item.done ? "border-dash-success bg-dash-success/20 text-dash-success" : "border-dash-faint text-transparent"}`}>
                    ✓
                  </span>
                  <span className={item.done ? "text-dash-muted line-through" : "text-dash-muted"}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Page */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe size={13} className="text-dash-success" />
              <p className="text-xs font-semibold text-dash-foreground">Payment Page</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {[
                { done: false, label: "POST /payment-pages API + hook" },
                { done: false, label: "Create page form (title, desc, amount)" },
                { done: false, label: "Active/inactive toggle" },
                { done: false, label: "/p/[slug] permanent customer page" },
                { done: false, label: "Flexible amount input on customer page" },
                { done: false, label: "Payment history per page" },
                { done: false, label: "Embed code / share options" },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] ${item.done ? "border-dash-success bg-dash-success/20 text-dash-success" : "border-dash-faint text-transparent"}`}>
                    ✓
                  </span>
                  <span className={item.done ? "text-dash-muted line-through" : "text-dash-muted"}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
