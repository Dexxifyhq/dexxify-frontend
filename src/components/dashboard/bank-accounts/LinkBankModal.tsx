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

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold text-dash-foreground">
              Link Bank Account
            </h2>
            <p className="mt-0.5 text-xs text-dash-muted">
              Add a verified bank account for payouts.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {/* Bank selector */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
              Bank Name
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex h-10 w-full items-center gap-2 rounded-lg border border-dash-border bg-dash-card pl-3 pr-3 text-sm transition-colors focus:border-dash-accent focus:outline-none"
              >
                <Landmark size={14} className="shrink-0 text-dash-faint" />
                <span
                  className={`flex-1 text-left truncate ${selectedBank ? "text-dash-foreground" : "text-dash-faint"}`}
                >
                  {selectedBank ? selectedBank.name : "Select your bank…"}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-dash-faint transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-dash-border bg-dash-card shadow-xl">
                  <div className="flex items-center gap-2 border-b border-dash-border px-3 py-2">
                    <Search size={13} className="shrink-0 text-dash-faint" />
                    <input
                      autoFocus
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search banks…"
                      className="flex-1 bg-transparent text-sm text-dash-foreground placeholder:text-dash-faint focus:outline-none"
                    />
                  </div>
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {filtered.length === 0 ? (
                      <li className="px-3 py-2 text-xs text-dash-faint">
                        No banks found
                      </li>
                    ) : (
                      filtered.map((bank) => (
                        <li key={bank.code}>
                          <button
                            type="button"
                            onClick={() => handleBankSelect(bank)}
                            className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-dash-hover ${
                              selectedBank?.code === bank.code
                                ? "text-dash-foreground"
                                : "text-dash-muted"
                            }`}
                          >
                            <span className="truncate">{bank.name}</span>
                            <span className="ml-auto shrink-0 font-mono text-[10px] text-dash-faint">
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
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
              Account Number
            </label>
            <div className="relative">
              <Hash
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint"
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
                className="h-10 w-full rounded-lg border border-dash-border bg-dash-card pl-9 pr-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Verified account name */}
          {verifiedName && (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-dash-success-border bg-dash-success-bg px-3 py-2.5">
                <CheckCircle2 size={14} className="shrink-0 text-dash-success" />
                <p className="text-xs">
                  <span className="text-dash-muted">Account name: </span>
                  <span className="font-medium text-dash-foreground">
                    {verifiedName}
                  </span>
                </p>
              </div>

              {/* Optional label */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
                  Label{" "}
                  <span className="normal-case text-dash-faint">(optional)</span>
                </label>
                <div className="relative">
                  <Tag
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint"
                  />
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. My GTBank"
                    className="h-10 w-full rounded-lg border border-dash-border bg-dash-card pl-9 pr-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Set as primary */}
              <button
                type="button"
                onClick={() => setIsDefault((v) => !v)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  isDefault
                    ? "border-dash-success-border bg-dash-success-bg"
                    : "border-dash-border bg-dash-card"
                }`}
              >
                <Star
                  size={14}
                  className={
                    isDefault
                      ? "fill-dash-success text-dash-success"
                      : "text-dash-faint"
                  }
                />
                <div>
                  <p className="text-xs font-medium text-dash-foreground">
                    Set as primary account
                  </p>
                  <p className="text-[11px] text-dash-muted">
                    Payouts default to this account
                  </p>
                </div>
                <div
                  className={`ml-auto h-4 w-4 shrink-0 rounded border transition-colors ${
                    isDefault
                      ? "border-dash-success bg-dash-success"
                      : "border-dash-border-strong bg-transparent"
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
            <p className="rounded-lg border border-dash-error-border bg-dash-error-bg px-3 py-2.5 text-xs text-dash-error">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-dash-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-dash-border bg-transparent px-4 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
            >
              Cancel
            </button>

            {!verifiedName ? (
              <button
                type="button"
                onClick={handleVerify}
                disabled={!canVerify || isVerifying}
                className="flex h-9 items-center gap-2 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                {isVerifying && <Loader2 size={13} className="animate-spin" />}
                {isVerifying ? "Verifying…" : "Verify Account"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex h-9 items-center gap-2 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
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
