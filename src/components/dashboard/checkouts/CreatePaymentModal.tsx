"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export interface PaymentFormValues {
  amount: string;
  currency: string;
  customerEmail: string;
}

interface CreatePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: PaymentFormValues) => void | Promise<void>;
}

const CURRENCIES = [
  { label: "USD", value: "USD" },
  { label: "NGN", value: "NGN" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
];

const INITIAL: PaymentFormValues = {
  amount: "",
  currency: "USD",
  customerEmail: "",
};

export default function CreatePaymentModal({
  open,
  onClose,
  onSubmit,
}: CreatePaymentModalProps) {
  const [values, setValues] = useState<PaymentFormValues>(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setValues(INITIAL);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = values.amount.trim() !== "" && Number(values.amount) > 0;

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
      aria-label="Create Payment"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        <div className="px-6 pt-5 pb-2">
          <h2 className="text-base font-semibold text-[#FAFAFA]">
            Create Payment
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
          {/* Big amount display */}
          <div className="flex items-baseline justify-center gap-2 py-6">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={values.amount}
              onChange={(e) =>
                setValues((v) => ({ ...v, amount: e.target.value }))
              }
              className="w-40 bg-transparent text-center text-4xl font-semibold text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none"
              required
            />
            <span className="text-lg font-medium text-[#71717A]">
              {values.currency}
            </span>
          </div>

          {/* Currency */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#A1A1AA]">
              Currency
            </label>
            <div className="relative">
              <select
                value={values.currency}
                onChange={(e) =>
                  setValues((v) => ({ ...v, currency: e.target.value }))
                }
                className="h-10 w-full appearance-none rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 pr-9 text-sm text-[#FAFAFA] focus:border-[#2563EB] focus:outline-none transition-colors"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]"
              />
            </div>
          </div>

          {/* Customer email */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA]">
              Customer Email
              <span className="text-[11px] font-normal text-[#52525B]">
                optional
              </span>
            </label>
            <input
              type="email"
              value={values.customerEmail}
              onChange={(e) =>
                setValues((v) => ({ ...v, customerEmail: e.target.value }))
              }
              placeholder="customer@example.com"
              className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="h-9 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
