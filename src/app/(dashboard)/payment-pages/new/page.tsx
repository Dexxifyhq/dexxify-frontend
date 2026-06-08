"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  Save,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";
import { useCreatePaymentPage } from "@/lib/hooks/payment-pages/usePaymentPages";
import { toast } from "sonner";

const STATUSES = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Inactive", value: "inactive" },
];

interface PricingOption {
  id: string;
  label: string;
  amount: string;
}

export default function CreatePaymentPageForm() {
  const router = useRouter();
  const createPage = useCreatePaymentPage();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency] = useState("USD");
  const [status, setStatus] = useState("active");
  const [amount, setAmount] = useState("");
  const [autoSettlement, setAutoSettlement] = useState(false);
  const [previewAmount, setPreviewAmount] = useState("");

  // Success state
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
        auto_settlement: autoSettlement,
      },
      {
        onSuccess: (res: any) => {
          setCreatedPage(res);
        },
        onError: (err: any) => {
          toast.error(err?.message ?? "Failed to create payment page.");
        },
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
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#14532D]/50 bg-[#052E16]/60">
          <Check size={24} className="text-[#22C55E]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Page Created</h2>
          <p className="mt-1 text-sm text-[#71717A]">
            Share this link — anyone who visits can pay you.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 rounded-xl border border-[#1C1C1F] bg-[#09090B] px-3 py-2.5">
            <span className="flex-1 truncate font-mono text-xs text-[#A1A1AA]">
              {publicUrl}
            </span>
            <button
              onClick={handleCopy}
              className="shrink-0 text-[#71717A] hover:text-[#FAFAFA] transition-colors"
            >
              {copied ? (
                <Check size={14} className="text-[#22C55E]" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/payment-pages")}
            className="h-9 rounded-lg border border-[#1C1C1F] px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            View all pages
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={15} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#FAFAFA]">
            Create Payment Page
          </h1>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={!canCreate || createPage.isPending}
          className="inline-flex h-9 cursor-pointer hover:opacity-70 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
        >
          {createPage.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {createPage.isPending ? "Creating…" : "Create Page"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* General */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#FAFAFA]">
              General Information
            </h2>
            <div className="flex flex-col gap-4">
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
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#FAFAFA]">
              Pricing
            </h2>
            <div className="flex flex-col gap-4">
              <Field label="Amount (USD) *">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
              </Field>
            </div>
          </section>

          {/* Settlement */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  Auto Settlement
                </h2>
                <p className="mt-0.5 text-xs text-[#71717A]">
                  Automatically settle received payments to your linked bank
                  account after each confirmed transaction.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoSettlement}
                onClick={() => setAutoSettlement((v) => !v)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none ${
                  autoSettlement
                    ? "border-[#14532D]/60 bg-[#22C55E]"
                    : "border-[#2a2a2e] bg-[#1C1C1F]"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    autoSettlement ? "translate-x-0.5" : "-translate-x-5"
                  }`}
                />
              </button>
            </div>
          </section>
        </div>

        {/* Preview (right column) */}
        <aside className="h-fit">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
            Live Preview
          </p>
          <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C1C1F] text-[#A1A1AA]">
                <Building2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#FAFAFA]">
                  {title || "Page Title"}
                </p>
                <p className="truncate text-xs text-[#71717A]">
                  {description || "Description"}
                </p>
              </div>
            </div>

            {/* Preset options */}
            {/* {options.filter((o) => o.label && o.amount).length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {options
                  .filter((o) => o.label && o.amount)
                  .map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      className="rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 py-1.5 text-xs font-medium text-[#A1A1AA]"
                    >
                      {o.label} — ${o.amount}
                    </button>
                  ))}
              </div>
            )} */}

            <div className="mb-4 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 py-2.5 text-center">
              <p className="text-xs text-[#71717A]">You pay</p>
              <p className="text-xl font-bold text-[#FAFAFA]">
                ${amount || "0.00"}{" "}
                <span className="text-sm font-normal text-[#71717A]">USD</span>
              </p>
            </div>

            <button
              type="button"
              className="h-9 w-full opacity-50 cursor-not-allowed rounded-lg bg-[#FAFAFA] text-sm font-medium text-[#09090B]"
            >
              Continue to Pay
            </button>

            {autoSettlement && (
              <p className="mt-3 text-center text-[11px] text-[#22C55E]">
                Auto-settlement enabled
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

const inputCls =
  "h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
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
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]"
      />
    </div>
  );
}
