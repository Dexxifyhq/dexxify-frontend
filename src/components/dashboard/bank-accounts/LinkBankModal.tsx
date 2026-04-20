"use client";

import { X, Landmark, Hash } from "lucide-react";
import { useEffect, useState } from "react";

interface LinkBankModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: { bankName: string; accountNumber: string }) => void | Promise<void>;
}

export default function LinkBankModal({
  open,
  onClose,
  onSubmit,
}: LinkBankModalProps) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setBankName("");
      setAccountNumber("");
    }
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

  const canSubmit =
    bankName.trim() !== "" && accountNumber.trim().length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      await onSubmit?.({ bankName, accountNumber });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Link Bank Account"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold text-[#FAFAFA]">
              Link Bank Account
            </h2>
            <p className="mt-0.5 text-xs text-[#71717A]">
              Add a verified bank account for payouts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Bank Name
            </label>
            <div className="relative">
              <Landmark
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Search for your bank..."
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Account Number
            </label>
            <div className="relative">
              <Hash
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="0123456789"
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

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
              className="h-9 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {submitting ? "Adding…" : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
