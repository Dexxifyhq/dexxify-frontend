"use client";

import { X, Wallet, Tag, AlertCircle, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useAddWithdrawalAddress } from "@/lib/hooks/wallet/useWallets";
import type { WithdrawalNetwork, WithdrawalToken } from "@/lib/types/wallet";
import { cn } from "@/utils/utils";

// ── Network / token config ─────────────────────────────────────────────────

interface NetworkOption {
  value: WithdrawalNetwork;
  label: string;
  chain: string;
  placeholder: string;
}

const NETWORK_OPTIONS: NetworkOption[] = [
  {
    value: "ethereum",
    label: "ERC-20",
    chain: "Ethereum",
    placeholder: "0x...",
  },
  {
    value: "tron",
    label: "TRC-20",
    chain: "Tron",
    placeholder: "T...",
  },
  {
    value: "solana",
    label: "Solana",
    chain: "Solana",
    placeholder: "Base58 address…",
  },
  {
    value: "bsc",
    label: "BEP-20",
    chain: "BSC",
    placeholder: "0x...",
  },
  {
    value: "base",
    label: "Base",
    chain: "Base",
    placeholder: "0x2105...",
  },
];

const TOKENS: WithdrawalToken[] = ["USDT", "USDC"];

// USDC is not supported on TON
// function tokensFor(network: WithdrawalNetwork): WithdrawalToken[] {
//   return network === "TON" ? ["USDT"] : TOKENS;
// }

// ── Modal ──────────────────────────────────────────────────────────────────

interface AddAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddAddressModal({
  open,
  onClose,
  onSuccess,
}: AddAddressModalProps) {
  const addAddress = useAddWithdrawalAddress();

  const [network, setNetwork] = useState<WithdrawalNetwork>("ethereum");
  const [token, setToken] = useState<WithdrawalToken>("USDT");
  const [address, setAddress] = useState("");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedNet = NETWORK_OPTIONS.find((n) => n.value === network)!;
  // const availableTokens = tokensFor(network);

  // If the selected token is not available on the new network, reset to USDT
  // useEffect(() => {
  //   if (!availableTokens.includes(token)) setToken("USDT");
  // }, [network]);

  useEffect(() => {
    if (!open) return;
    setNetwork("ethereum");
    setToken("USDT");
    setAddress("");
    setLabel("");
    setIsDefault(false);
    setError(null);
    addAddress.reset();
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

  const canSubmit = address.trim().length > 10 && label.trim().length > 0;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || addAddress.isPending) return;
    setError(null);
    addAddress.mutate(
      {
        address: address.trim(),
        network,
        token,
        label: label.trim(),
        isDefault,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err: any) =>
          setError(err?.message ?? "Failed to save address. Please try again."),
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold text-[#FAFAFA]">
              Add Withdrawal Address
            </h2>
            <p className="mt-0.5 text-xs text-[#71717A]">
              Save a crypto address for stablecoin payouts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          {/* Network + Token row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Network */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                Network
              </label>
              <div className="flex flex-col gap-1.5">
                {NETWORK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNetwork(opt.value)}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                      network === opt.value
                        ? "border-[#2563EB]/60 bg-[#1e3a5f]/40 text-[#FAFAFA]"
                        : "border-[#1C1C1F] bg-[#09090B] text-[#71717A] hover:text-[#FAFAFA]",
                    )}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-[10px] text-[#52525B]">
                      {opt.chain}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Token */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                Token
              </label>
              <div className="flex flex-col gap-1.5">
                {TOKENS.map((t) => {
                  // const unavailable = !availableTokens.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      // disabled={unavailable}
                      onClick={() => setToken(t)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                        token === t
                          ? "border-[#2563EB]/60 bg-[#1e3a5f]/40 text-[#FAFAFA]"
                          : "border-[#1C1C1F] bg-[#09090B] text-[#71717A] hover:text-[#FAFAFA]",
                      )}
                    >
                      <span className="font-semibold">{t}</span>
                      {/* {unavailable && (
                        <span className="text-[10px] text-[#3F3F46]">N/A</span>
                      )} */}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Wallet Address
            </label>
            <div className="relative">
              <Wallet
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={selectedNet.placeholder}
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 font-mono text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                required
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#52525B]">
              Double-check this address — payouts to wrong addresses cannot be
              recovered.
            </p>
          </div>

          {/* Label */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Label
            </label>
            <div className="relative">
              <Tag
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Treasury USDT Wallet"
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Set as default */}
          <button
            type="button"
            onClick={() => setIsDefault((v) => !v)}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
              isDefault
                ? "border-[#14532D]/40 bg-[#052e16]/40"
                : "border-[#1C1C1F] bg-[#09090B]",
            )}
          >
            <Star
              size={14}
              className={
                isDefault ? "fill-[#22C55E] text-[#22C55E]" : "text-[#52525B]"
              }
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-[#FAFAFA]">
                Set as default
              </p>
              <p className="text-[11px] text-[#71717A]">
                Auto-selected for all payouts
              </p>
            </div>
            <div
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                isDefault
                  ? "border-[#22C55E] bg-[#22C55E]"
                  : "border-[#3F3F46] bg-transparent",
              )}
            >
              {isDefault && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1 4l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-[#7f1d1d]/40 bg-[#450a0a]/60 px-3 py-2.5">
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0 text-[#f87171]"
              />
              <p className="text-xs text-[#f87171]">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-[#1C1C1F] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#1C1C1F] px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || addAddress.isPending}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {addAddress.isPending && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {addAddress.isPending ? "Saving…" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
