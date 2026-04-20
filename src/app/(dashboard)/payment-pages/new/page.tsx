"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Building2, Save, ChevronDown } from "lucide-react";

const CURRENCIES = [
  { label: "Nigerian Naira (NGN)", value: "NGN", symbol: "₦" },
  { label: "US Dollar (USD)", value: "USD", symbol: "$" },
  { label: "Euro (EUR)", value: "EUR", symbol: "€" },
  { label: "British Pound (GBP)", value: "GBP", symbol: "£" },
];

const STATUSES = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Draft", value: "draft" },
];

interface PricingOption {
  id: string;
  label: string;
  amount: string;
}

export default function CreatePaymentPage() {
  const [pageTitle, setPageTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [status, setStatus] = useState("active");
  const [minAmount, setMinAmount] = useState("");
  const [options, setOptions] = useState<PricingOption[]>([]);
  const [previewAmount, setPreviewAmount] = useState("");

  const symbol =
    CURRENCIES.find((c) => c.value === currency)?.symbol ?? "";

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "", amount: "" },
    ]);
  };

  const removeOption = (id: string) =>
    setOptions((prev) => prev.filter((o) => o.id !== id));

  const updateOption = (
    id: string,
    key: "label" | "amount",
    value: string,
  ) =>
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, [key]: value } : o)),
    );

  const handleCreate = () => {
    // TODO: POST to /payment-pages
    console.log({
      pageTitle,
      description,
      currency,
      status,
      minAmount,
      options,
    });
  };

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
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
        >
          <Save size={14} />
          Create Page
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1C1C1F]">
        <button
          type="button"
          className="-mb-px border-b-2 border-[#2563EB] px-1 pb-3 text-sm font-medium text-[#2563EB]"
        >
          Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="flex flex-col gap-5">
          {/* General Information */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#FAFAFA]">
              General Information
            </h2>

            <div className="flex flex-col gap-4">
              <Field label="Page Title">
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="e.g. Summer Sale Checkout"
                  className={inputCls}
                />
              </Field>

              <Field label="Description">
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description..."
                  className={`${inputCls} h-auto resize-y py-2.5`}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Currency">
                  <Select
                    value={currency}
                    onChange={setCurrency}
                    options={CURRENCIES.map((c) => ({
                      label: c.label,
                      value: c.value,
                    }))}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={status}
                    onChange={setStatus}
                    options={STATUSES}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#FAFAFA]">Pricing</h2>
              <button
                type="button"
                onClick={addOption}
                className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                + Add Option
              </button>
            </div>

            <Field label="Minimum Amount">
              <input
                type="number"
                step="0.01"
                min="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </Field>

            {options.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                {options.map((o) => (
                  <div
                    key={o.id}
                    className="grid grid-cols-[1fr_160px_auto] gap-2"
                  >
                    <input
                      type="text"
                      value={o.label}
                      onChange={(e) =>
                        updateOption(o.id, "label", e.target.value)
                      }
                      placeholder="Option label"
                      className={inputCls}
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={o.amount}
                      onChange={(e) =>
                        updateOption(o.id, "amount", e.target.value)
                      }
                      placeholder="0.00"
                      className={inputCls}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(o.id)}
                      className="h-10 rounded-lg px-3 text-xs text-[#EF4444] hover:bg-[#2D0A0A] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Receiving Accounts */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#FAFAFA]">
                Receiving Accounts
              </h2>
              <button
                type="button"
                className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                + Link Account
              </button>
            </div>

            <div className="flex items-center justify-center rounded-lg border border-dashed border-[#1C1C1F] py-8 text-sm text-[#52525B]">
              No accounts linked.
            </div>
          </section>
        </div>

        {/* Preview (right column) */}
        <aside className="h-fit">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
            Preview
          </p>
          <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1C1C1F] text-[#A1A1AA]">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#FAFAFA]">
                  {pageTitle || "Business Name"}
                </p>
                <p className="text-xs text-[#71717A]">
                  {description || "Payment Page"}
                </p>
              </div>
            </div>

            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
              Enter Amount
            </p>
            <div className="relative mb-5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#71717A]">
                {symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={previewAmount}
                onChange={(e) => setPreviewAmount(e.target.value)}
                placeholder="0.00"
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-9 flex-1 rounded-lg border border-[#1C1C1F] bg-transparent text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-9 flex-1 rounded-lg bg-[#FAFAFA] text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function Select({
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
        className={`${inputCls} appearance-none pr-9 cursor-pointer`}
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
