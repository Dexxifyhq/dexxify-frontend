"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Zap,
  FileText,
  DollarSign,
} from "lucide-react";
import { useCreatePaymentPage } from "@/lib/hooks/payment-pages/usePaymentPages";
import { useMyBusiness } from "@/lib/hooks/businesses/useBusinesses";
import { toast } from "sonner";

const STATUSES = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Inactive", value: "inactive" },
];

const CURRENCIES = [
  { label: "USD", value: "USD" },
  { label: "NGN", value: "NGN" },
];

export default function CreatePaymentPageForm() {
  const router = useRouter();
  const createPage = useCreatePaymentPage();
  const { data: business } = useMyBusiness();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("USD");
  const [status, setStatus] = useState("active");
  const [amount, setAmount] = useState("");

  const [createdPage, setCreatedPage] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const canCreate = title.trim() !== "" && amount !== "" && Number(amount) > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    createPage.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        currency,
        status,
        amount: Number(amount),
      },
      {
        onSuccess: (res: any) => setCreatedPage(res),
        onError: (err: any) =>
          toast.error(err?.message ?? "Failed to create payment page."),
      },
    );
  };

  const publicUrl = createdPage
    ? `${window.location.origin}/p/${createdPage.slug}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success screen ─────────────────────────────────────────────────────
  if (createdPage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dash-success-border bg-dash-success-bg">
          <Check size={24} className="text-dash-success" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-dash-foreground">Page Created</h2>
          <p className="mt-1 text-sm text-dash-muted">
            Share this link — anyone who visits can pay you.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-card px-3 py-2.5">
            <span className="flex-1 truncate font-mono text-xs text-dash-muted">
              {publicUrl}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-dash-muted transition-colors hover:text-dash-foreground"
            >
              {copied ? (
                <Check size={14} className="text-dash-success" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/payment-pages")}
            className="h-9 rounded-lg border border-dash-border px-4 text-sm font-medium text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
          >
            View all pages
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover"
          >
            <ExternalLink size={13} />
            Preview page
          </a>
        </div>
      </div>
    );
  }

  // ── Create form ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/payment-pages"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-dash-border bg-dash-card text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
            aria-label="Back"
          >
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-dash-foreground">
              New Payment Page
            </h1>
            <p className="text-xs text-dash-faint">
              Configure your page then share the link to collect payments.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canCreate || createPage.isPending}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-dash-accent px-3.5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createPage.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Zap size={14} />
          )}
          {createPage.isPending ? "Creating…" : "Create Page"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* ── Left: form fields ────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* General */}
          <section className="rounded-xl border border-dash-border bg-dash-card">
            <div className="flex items-center gap-2.5 border-b border-dash-border px-5 py-3.5">
              <FileText size={14} className="text-dash-faint" />
              <h2 className="text-sm font-semibold text-dash-foreground">General</h2>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <Field label="Page Title *">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Sale Checkout"
                  className={inputCls}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your customers what they're paying for…"
                  className={`${inputCls} h-auto resize-y py-2.5`}
                />
              </Field>

              <Field label="Status">
                <SelectField
                  value={status}
                  onChange={setStatus}
                  options={STATUSES}
                />
              </Field>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl border border-dash-border bg-dash-card">
            <div className="flex items-center gap-2.5 border-b border-dash-border px-5 py-3.5">
              <DollarSign size={14} className="text-dash-faint" />
              <h2 className="text-sm font-semibold text-dash-foreground">Pricing</h2>
            </div>
            <div className="p-5">
              <Field label="Amount & Currency *">
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} min-w-0 flex-1`}
                  />
                  <div className="relative w-28 shrink-0">
                    <select
                      value={currency}
                      onChange={(e) =>
                        setCurrency(e.target.value as typeof currency)
                      }
                      className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-dash-border bg-dash-card px-3 pr-8 text-sm text-dash-foreground transition-colors focus:border-dash-accent focus:outline-none"
                    >
                      {CURRENCIES.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dash-muted"
                    />
                  </div>
                </div>
              </Field>
            </div>
          </section>
        </div>

        {/* ── Right: live preview ──────────────────────────────────────── */}
        <aside className="h-fit">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
            Live Preview
          </p>

          {/* Mirrors the actual /p/[slug] checkout card */}
          <div className="w-full rounded-2xl border border-white/10 bg-[#0D0D0F] shadow-2xl">
            {/* Page header */}
            <div className="border-b border-white/10 px-5 py-5 text-center">
              <div className="mb-3 flex flex-col items-center gap-1.5">
                {business?.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/25">
                    <Building2 size={18} />
                  </div>
                )}
                {business?.name && (
                  <p className="text-[11px] font-medium text-white/40">
                    {business.name}
                  </p>
                )}
              </div>
              <p className="text-sm font-semibold text-white">
                {title || "Page Title"}
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                {description || "Your description will appear here"}
              </p>
              <div className="mt-3">
                <p className="text-2xl font-bold text-white">
                  {Number(amount || 0).toFixed(2)}
                  <span className="ml-1.5 text-sm font-normal text-white/40">
                    {currency}
                  </span>
                </p>
              </div>
            </div>

            {/* Mock form — mirrors p/[slug] step="form" */}
            <div className="flex flex-col gap-3 px-5 py-5">
              <div className="grid grid-cols-2 gap-2.5">
                <MockField label="First Name" placeholder="James" />
                <MockField label="Last Name" placeholder="Wilson" />
              </div>
              <MockField label="Email" placeholder="you@example.com" />

              {/* Pay With picker mock */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  Pay With
                </p>
                <div className="flex h-9 items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3">
                  <span className="text-xs text-white/20">Choose token…</span>
                  <ChevronDown size={12} className="text-white/20" />
                </div>
              </div>

              <button
                type="button"
                disabled
                className="mt-1 h-9 w-full cursor-not-allowed rounded-lg bg-white/10 text-xs font-semibold text-white/25"
              >
                Continue to Pay
              </button>
            </div>

            <p className="pb-3.5 text-center text-[10px] text-white/15">
              Powered by{" "}
              <span className="font-semibold text-white/20">Dexxify</span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const inputCls =
  "h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-dash-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} cursor-pointer appearance-none pr-9`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dash-muted"
      />
    </div>
  );
}

function MockField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
        {label}
      </p>
      <div className="flex h-9 items-center rounded-lg border border-white/10 bg-white/5 px-3">
        <span className="text-xs text-white/20">{placeholder}</span>
      </div>
    </div>
  );
}
