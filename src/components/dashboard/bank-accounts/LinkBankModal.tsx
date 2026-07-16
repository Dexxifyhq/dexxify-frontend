"use client";

import {
  X,
  Landmark,
  Hash,
  ChevronDown,
  Search,
  CheckCircle2,
  Loader2,
  Tag,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useBanks, useVerifyBank, useSaveBank } from "@/lib/hooks/misc/useMisc";
import type { Bank } from "@/lib/types/misc";

interface LinkBankModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LinkBankModal({
  open,
  onClose,
  onSuccess,
}: LinkBankModalProps) {
  const { data: banksData } = useBanks();
  // console.log(banksData);
  // Response shape after unwrap: { banks: {data: Bank[]}, cached: boolean }
  const bankList: Bank[] = banksData?.banks?.data ?? [];

  const verifyBank = useVerifyBank();
  const saveBank = useSaveBank();

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [label, setLabel] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? bankList.filter((b) =>
        b.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : bankList;

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!open) return;
    setSelectedBank(null);
    setSearch("");
    setDropdownOpen(false);
    setAccountNumber("");
    setLabel("");
    setIsDefault(false);
    setVerifiedName(null);
    setError(null);
    verifyBank.reset();
    saveBank.reset();
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

  const canVerify =
    !!selectedBank && accountNumber.trim().length >= 6 && !verifiedName;
  const isVerifying = verifyBank.isPending;
  const isSaving = saveBank.isPending;

  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setDropdownOpen(false);
    setSearch("");
    setVerifiedName(null);
    setError(null);
    verifyBank.reset();
  };

  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value);
    if (verifiedName || error) {
      setVerifiedName(null);
      setError(null);
      verifyBank.reset();
    }
  };

  const handleVerify = () => {
    if (!canVerify || !selectedBank) return;
    setError(null);
    verifyBank.mutate(
      { accountNumber: accountNumber.trim(), bankCode: selectedBank.code },
      {
        onSuccess: (res) => {
          const name = res.resolved?.accountName;
          if (name) {
            setVerifiedName(name);
          } else {
            setError("Could not resolve account name. Please try again.");
          }
        },
        onError: (err: any) =>
          setError(
            err?.message ??
              "Could not verify account. Check the details and try again.",
          ),
      },
    );
  };

  const handleSave = () => {
    if (!selectedBank || !verifiedName) return;
    setError(null);
    saveBank.mutate(
      {
        accountNumber: accountNumber.trim(),
        bankCode: selectedBank.code,
        label: label.trim() || undefined,
        isDefault,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err: any) =>
          setError(
            err?.message ?? "Failed to save bank account. Please try again.",
          ),
      },
    );
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
        {/* Header */}
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

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Bank selector */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Bank Name
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-3 pr-3 text-sm transition-colors focus:border-[#2563EB] focus:outline-none"
              >
                <Landmark size={14} className="shrink-0 text-[#52525B]" />
                <span
                  className={`flex-1 text-left truncate ${selectedBank ? "text-[#FAFAFA]" : "text-[#3F3F46]"}`}
                >
                  {selectedBank ? selectedBank.name : "Select your bank…"}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-[#52525B] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] shadow-xl">
                  <div className="flex items-center gap-2 border-b border-[#1C1C1F] px-3 py-2">
                    <Search size={13} className="shrink-0 text-[#52525B]" />
                    <input
                      autoFocus
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search banks…"
                      className="flex-1 bg-transparent text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none"
                    />
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filtered.length === 0 ? (
                      <li className="px-3 py-2 text-xs text-[#52525B]">
                        No banks found
                      </li>
                    ) : (
                      filtered.map((bank) => (
                        <li key={bank.code}>
                          <button
                            type="button"
                            onClick={() => handleBankSelect(bank)}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-[#1C1C1F] ${
                              selectedBank?.code === bank.code
                                ? "text-[#FAFAFA]"
                                : "text-[#A1A1AA]"
                            }`}
                          >
                            <span className="truncate">{bank.name}</span>
                            <span className="ml-auto shrink-0 font-mono text-[10px] text-[#3F3F46]">
                              {bank.code}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Account number */}
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
                  handleAccountNumberChange(e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
                placeholder="0123456789"
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Verified account name */}
          {verifiedName && (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-[#166534]/40 bg-[#052e16]/60 px-3 py-2.5">
                <CheckCircle2 size={14} className="shrink-0 text-[#4ade80]" />
                <p className="text-xs">
                  <span className="text-[#71717A]">Account name: </span>
                  <span className="font-medium text-[#FAFAFA]">
                    {verifiedName}
                  </span>
                </p>
              </div>

              {/* Optional label */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                  Label{" "}
                  <span className="normal-case text-[#3F3F46]">(optional)</span>
                </label>
                <div className="relative">
                  <Tag
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
                  />
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. My GTBank"
                    className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Set as primary */}
              <button
                type="button"
                onClick={() => setIsDefault((v) => !v)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  isDefault
                    ? "border-[#14532D]/40 bg-[#052e16]/40"
                    : "border-[#1C1C1F] bg-[#09090B]"
                }`}
              >
                <Star
                  size={14}
                  className={
                    isDefault
                      ? "fill-[#22C55E] text-[#22C55E]"
                      : "text-[#52525B]"
                  }
                />
                <div>
                  <p className="text-xs font-medium text-[#FAFAFA]">
                    Set as primary account
                  </p>
                  <p className="text-[11px] text-[#71717A]">
                    Payouts default to this account
                  </p>
                </div>
                <div
                  className={`ml-auto h-4 w-4 shrink-0 rounded border transition-colors ${
                    isDefault
                      ? "border-[#22C55E] bg-[#22C55E]"
                      : "border-[#3F3F46] bg-transparent"
                  } flex items-center justify-center`}
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
            </>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-lg border border-[#7f1d1d]/40 bg-[#450a0a]/60 px-3 py-2.5 text-xs text-[#f87171]">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-[#1C1C1F] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#1C1C1F] bg-transparent px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>

            {!verifiedName ? (
              <button
                type="button"
                onClick={handleVerify}
                disabled={!canVerify || isVerifying}
                className="flex h-9 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                {isVerifying && <Loader2 size={13} className="animate-spin" />}
                {isVerifying ? "Verifying…" : "Verify Account"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex h-9 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                {isSaving && <Loader2 size={13} className="animate-spin" />}
                {isSaving ? "Saving…" : "Confirm & Save"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
