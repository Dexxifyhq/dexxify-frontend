"use client";

import { X, Info, ChevronDown, CreditCard, Check } from "lucide-react";
import { useEffect, useState } from "react";

export interface AddAddressValues {
  network: string;
  walletAddress: string;
  label: string;
  isDefault: boolean;
}

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: AddAddressValues) => void | Promise<void>;
}

const NETWORKS = [
  { label: "Select Network", value: "" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Polygon", value: "polygon" },
  { label: "BSC", value: "bsc" },
  { label: "Base", value: "base" },
  { label: "Arbitrum", value: "arbitrum" },
  { label: "Optimism", value: "optimism" },
  { label: "Bitcoin", value: "bitcoin" },
  { label: "Solana", value: "solana" },
  { label: "Tron", value: "tron" },
];

const INITIAL: AddAddressValues = {
  network: "",
  walletAddress: "",
  label: "",
  isDefault: false,
};

export default function AddAddressModal({
  open,
  onClose,
  onSubmit,
}: AddAddressModalProps) {
  const [values, setValues] = useState<AddAddressValues>(INITIAL);
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

  const update = <K extends keyof AddAddressValues>(
    key: K,
    v: AddAddressValues[K],
  ) => setValues((prev) => ({ ...prev, [key]: v }));

  const canSubmit =
    values.network !== "" && values.walletAddress.trim() !== "";

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
      aria-label="Add Address"
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
              Add Address
            </h2>
            <p className="mt-0.5 text-xs text-[#71717A]">
              Connect a new wallet for payouts
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
          {/* Network */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-[#FAFAFA]">
              Network
              <Info size={12} className="text-[#71717A]" />
            </label>
            <div className="relative">
              <select
                value={values.network}
                onChange={(e) => update("network", e.target.value)}
                className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 pr-9 text-sm text-[#FAFAFA] focus:border-[#2563EB] focus:outline-none transition-colors"
                required
              >
                {NETWORKS.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]"
              />
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#FAFAFA]">
              Wallet Address
            </label>
            <input
              type="text"
              value={values.walletAddress}
              onChange={(e) => update("walletAddress", e.target.value)}
              placeholder="0x..."
              className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 font-mono text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              required
            />
            <div className="mt-2 flex items-start gap-2">
              <CreditCard
                size={14}
                className="mt-0.5 shrink-0 text-[#2563EB]"
              />
              <p className="text-xs leading-relaxed text-[#71717A]">
                Double-check this address. Payouts sent to incorrect addresses
                cannot be recovered.
              </p>
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#FAFAFA]">
              Label{" "}
              <span className="font-normal text-[#71717A]">(Optional)</span>
            </label>
            <input
              type="text"
              value={values.label}
              onChange={(e) => update("label", e.target.value)}
              placeholder="e.g. Corporate Treasury"
              className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
            />
          </div>

          {/* Set as Default */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-3">
            <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={values.isDefault}
                onChange={(e) => update("isDefault", e.target.checked)}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-[#3F3F46] bg-[#09090B] checked:border-[#2563EB] checked:bg-[#2563EB] focus:outline-none"
              />
              <Check
                size={11}
                className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
                strokeWidth={3}
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#FAFAFA]">
                Set as Default
              </p>
              <p className="text-xs text-[#71717A]">
                Auto-select for all payouts (only one default address allowed)
              </p>
            </div>
          </label>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#1C1C1F] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 flex-1 rounded-lg border border-[#1C1C1F] bg-transparent px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <Check size={14} />
              {submitting ? "Adding…" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
