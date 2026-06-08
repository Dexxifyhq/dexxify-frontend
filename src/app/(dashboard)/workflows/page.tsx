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
    <div className={`flex flex-col rounded-xl border ${borderColor} bg-[#0D0D0F]`}>
      {/* Header */}
      <div className={`flex items-start gap-3 border-b ${borderColor} p-5`}>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
          <span className={color}>{icon}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#FAFAFA]">{name}</p>
          <p className="mt-0.5 text-xs text-[#71717A]">{tagline}</p>
        </div>
      </div>

      {/* URL pattern */}
      <div className="border-b border-[#1C1C1F] px-5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">URL</p>
        <p className="mt-1 font-mono text-xs text-[#71717A]">{url}</p>
      </div>

      {/* Traits */}
      <div className="border-b border-[#1C1C1F] px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">Characteristics</p>
        <ul className="flex flex-col gap-2">
          {traits.map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[#A1A1AA]">
              <span className="text-[#52525B]">{t.icon}</span>
              {t.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Merchant flow */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">Merchant creates</p>
        {merchantSteps.map((step, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${bgColor} ${color}`}>
              {i + 1}
            </span>
            <p className="text-xs text-[#71717A]">{step}</p>
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2563EB]/40 bg-[#1e3a5f]/40 text-[#60A5FA]">
          {icon}
        </div>
        <div className="mt-2 text-center">
          <p className="text-xs font-semibold text-[#FAFAFA]">{title}</p>
          <p className="mt-0.5 max-w-[120px] text-[11px] text-[#71717A]">{description}</p>
        </div>
      </div>
      {!isLast && (
        <div className="mt-3 flex flex-col items-center gap-0.5">
          <div className="h-1 w-1 rounded-full bg-[#2563EB]/40" />
          <div className="h-1 w-1 rounded-full bg-[#2563EB]/40" />
          <div className="h-1 w-1 rounded-full bg-[#2563EB]/40" />
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
    <tr className="border-t border-[#1C1C1F]">
      <td className="py-3 pr-4 text-xs font-medium text-[#71717A]">{label}</td>
      <td className="py-3 pr-4 text-xs text-[#A1A1AA]">{invoice}</td>
      <td className="py-3 pr-4 text-xs text-[#A1A1AA]">{checkout}</td>
      <td className="py-3 text-xs text-[#A1A1AA]">{page}</td>
    </tr>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-[#FAFAFA]">Payment Workflows</h1>
        <p className="text-sm text-[#71717A]">
          Three instruments, one customer journey. Understand what to use and when.
        </p>
      </div>

      {/* ── Three instruments ── */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
          Payment Instruments
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <InstrumentCard
            icon={<FileText size={16} />}
            color="text-[#F59E0B]"
            bgColor="bg-[#451A03]/60"
            borderColor="border-[#78350F]/40"
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
            color="text-[#60A5FA]"
            bgColor="bg-[#1e3a5f]/60"
            borderColor="border-[#2563EB]/30"
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
            color="text-[#22C55E]"
            bgColor="bg-[#052E16]/60"
            borderColor="border-[#14532D]/40"
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
      <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-6">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
          Shared Customer Journey — same flow for all three instruments
        </p>
        <div className="flex flex-wrap items-start justify-center gap-2">
          <JourneyStep
            number={1}
            icon={<Link2 size={16} />}
            title="Opens link"
            description="Customer clicks the merchant's shared URL"
          />
          <div className="mt-4 hidden sm:flex items-center text-[#2563EB]/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={2}
            icon={<FileText size={16} />}
            title="Sees details"
            description="Amount, description, merchant name"
          />
          <div className="mt-4 hidden sm:flex items-center text-[#2563EB]/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={3}
            icon={<User size={16} />}
            title="Enters details"
            description="Name + email address"
          />
          <div className="mt-4 hidden sm:flex items-center text-[#2563EB]/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={4}
            icon={<Coins size={16} />}
            title="Picks token"
            description="Selects crypto from available assets"
          />
          <div className="mt-4 hidden sm:flex items-center text-[#2563EB]/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={5}
            icon={<Wallet size={16} />}
            title="Gets address"
            description="Unique deposit address + amount generated"
          />
          <div className="mt-4 hidden sm:flex items-center text-[#2563EB]/30">
            <ArrowRight size={16} />
          </div>
          <JourneyStep
            number={6}
            icon={<ArrowDown size={16} />}
            title="Sends crypto"
            description="Sends exact amount to the address"
          />
          <div className="mt-4 hidden sm:flex items-center text-[#2563EB]/30">
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
        <div className="mt-6 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-3 text-xs text-[#71717A]">
          <span className="font-semibold text-[#A1A1AA]">Key principle: </span>
          Each call to{" "}
          <span className="font-mono text-[#60A5FA]">POST /payment-sessions/:id/pay</span> (or the invoice/page equivalent) generates a fresh, unique on-chain deposit address. The link is safe to share publicly — the address is tied to the individual customer submission, not the link itself.
        </div>
      </div>

      {/* ── What the customer page looks like ── */}
      <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <div className="border-b border-[#1C1C1F] px-5 py-4">
          <p className="text-sm font-semibold text-[#FAFAFA]">What the Customer Page Shows</p>
          <p className="mt-0.5 text-xs text-[#71717A]">
            What differs between instruments on the same page template
          </p>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#1C1C1F] md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Invoice */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={13} className="text-[#F59E0B]" />
              <p className="text-xs font-semibold text-[#FAFAFA]">Invoice Page</p>
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
                <li key={i} className="flex items-start gap-2 text-xs text-[#71717A]">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#F59E0B]/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 size={13} className="text-[#60A5FA]" />
              <p className="text-xs font-semibold text-[#FAFAFA]">Checkout Session Page</p>
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
                <li key={i} className="flex items-start gap-2 text-xs text-[#71717A]">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#60A5FA]/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Page */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe size={13} className="text-[#22C55E]" />
              <p className="text-xs font-semibold text-[#FAFAFA]">Payment Page</p>
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
                <li key={i} className="flex items-start gap-2 text-xs text-[#71717A]">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#22C55E]/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Comparison table ── */}
      <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <div className="border-b border-[#1C1C1F] px-5 py-4">
          <p className="text-sm font-semibold text-[#FAFAFA]">Feature Comparison</p>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full">
            <thead>
              <tr>
                <th className="pb-3 pr-4 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">
                  Feature
                </th>
                <th className="pb-3 pr-4 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[#F59E0B]">
                  Invoice
                </th>
                <th className="pb-3 pr-4 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[#60A5FA]">
                  Checkout
                </th>
                <th className="pb-3 pt-4 text-left text-[10px] font-semibold uppercase tracking-wider text-[#22C55E]">
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
      <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <div className="border-b border-[#1C1C1F] px-5 py-4">
          <p className="text-sm font-semibold text-[#FAFAFA]">Build Checklist</p>
          <p className="mt-0.5 text-xs text-[#71717A]">What still needs to be wired up</p>
        </div>
        <div className="grid grid-cols-1 divide-y divide-[#1C1C1F] md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Invoice */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText size={13} className="text-[#F59E0B]" />
              <p className="text-xs font-semibold text-[#FAFAFA]">Invoice</p>
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
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] ${item.done ? "border-[#22C55E] bg-[#22C55E]/20 text-[#22C55E]" : "border-[#3F3F46] text-transparent"}`}>
                    ✓
                  </span>
                  <span className={item.done ? "text-[#71717A] line-through" : "text-[#A1A1AA]"}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Checkout */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 size={13} className="text-[#60A5FA]" />
              <p className="text-xs font-semibold text-[#FAFAFA]">Checkout Session</p>
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
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] ${item.done ? "border-[#22C55E] bg-[#22C55E]/20 text-[#22C55E]" : "border-[#3F3F46] text-transparent"}`}>
                    ✓
                  </span>
                  <span className={item.done ? "text-[#71717A] line-through" : "text-[#A1A1AA]"}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Page */}
          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Globe size={13} className="text-[#22C55E]" />
              <p className="text-xs font-semibold text-[#FAFAFA]">Payment Page</p>
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
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border text-[9px] ${item.done ? "border-[#22C55E] bg-[#22C55E]/20 text-[#22C55E]" : "border-[#3F3F46] text-transparent"}`}>
                    ✓
                  </span>
                  <span className={item.done ? "text-[#71717A] line-through" : "text-[#A1A1AA]"}>
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
