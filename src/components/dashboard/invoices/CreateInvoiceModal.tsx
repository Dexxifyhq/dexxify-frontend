"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: InvoiceFormValues) => void | Promise<void>;
}

export interface InvoiceFormValues {
  amount: string;
  currency: string;
  expirationDate: string; // yyyy-mm-dd
  expirationTime: string; // hh:mm
  description: string;
  customerEmail: string;
}

const CURRENCIES = [
  { label: "NGN", value: "NGN" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
];

const INITIAL: InvoiceFormValues = {
  amount: "",
  currency: "NGN",
  expirationDate: "",
  expirationTime: "",
  description: "",
  customerEmail: "",
};

export default function CreateInvoiceModal({
  open,
  onClose,
  onSubmit,
}: CreateInvoiceModalProps) {
  const [values, setValues] = useState<InvoiceFormValues>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) setValues(INITIAL);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = <K extends keyof InvoiceFormValues>(
    key: K,
    v: InvoiceFormValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: v }));

  const canSubmit =
    values.amount.trim() !== "" &&
    values.currency.trim() !== "" &&
    values.customerEmail.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      await onSubmit?.(values);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create Invoice"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1F] px-6 py-4">
          <h2 className="text-base font-semibold text-[#FAFAFA]">
            Create Invoice
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          {/* Amount */}
          <Field label="Amount" required>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={values.amount}
              onChange={(e) => update("amount", e.target.value)}
              className={inputCls}
              required
            />
          </Field>

          {/* Currency */}
          <Field label="Currency" required>
            <select
              value={values.currency}
              onChange={(e) => update("currency", e.target.value)}
              className={`${inputCls} appearance-none pr-9`}
              required
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Expiration */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
              Expiration Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={values.expirationDate}
                onChange={(e) => update("expirationDate", e.target.value)}
                className={inputCls}
                placeholder="mm/dd/yyyy"
              />
              <input
                type="time"
                value={values.expirationTime}
                onChange={(e) => update("expirationTime", e.target.value)}
                className={inputCls}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#52525B]">Max. 5 days</p>
          </div>

          {/* Description */}
          <Field label="Description" hint="Optional">
            <textarea
              rows={3}
              value={values.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What's this invoice for?"
              className={`${inputCls} resize-none py-2.5`}
            />
          </Field>

          {/* Customer Email */}
          <Field label="Customer Email" required>
            <input
              type="email"
              value={values.customerEmail}
              onChange={(e) => update("customerEmail", e.target.value)}
              placeholder="customer@example.com"
              className={inputCls}
              required
            />
          </Field>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#1C1C1F] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#1C1C1F] bg-transparent px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="h-9 rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {submitting ? "Creating…" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "h-9 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#A1A1AA]">
        <span>
          {label}
          {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
        </span>
        {hint && <span className="text-[11px] text-[#52525B]">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
