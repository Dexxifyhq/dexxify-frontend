"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  Copy,
  Check,
  Loader2,
  X,
  CheckCircle2,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";
import { cn } from "@/utils/utils";
import {
  useLedgerBalance,
  useLedgerTransactions,
} from "@/lib/hooks/ledger/useLedger";
import {
  useWallets,
  useWalletAddress,
  useCreateWallet,
  useIssueIdentity,
  useSavedWithdrawalAddresses,
  useWithdrawStableCoin,
  useWithdrawFiat,
} from "@/lib/hooks/wallet/useWallets";
import { walletsApi } from "@/lib/api/wallet";
import { useSavedBanks } from "@/lib/hooks/misc/useMisc";
import {
  useSwapEstimate,
  useCreateSwapQuotation,
  useExecuteSwap,
  useCreateOfframp,
  useSwapList,
} from "@/lib/hooks/swaps/useSwaps";
import type {
  LedgerTransaction,
  LedgerTxType,
  LedgerEntryStatus,
} from "@/lib/types/ledger";
import type { WithdrawalAddress } from "@/lib/types/wallet";
import type { SavedBank } from "@/lib/types/misc";
import type { WalletAsset } from "@/lib/api/offramp";
import type { SwapQuotation } from "@/lib/api/swaps";
import { useQuery } from "@tanstack/react-query";
import { payApi } from "@/lib/api/pay";
import { flattenAssets, type FlatAsset } from "@/lib/utils/assets";

// ── Config ───────────────────────────────────────────────────────────────────

type Currency = "NGN" | "USDT" | "USDC";
type ActiveTab = "history" | "swaps";

const TX_TYPE_CFG: Record<LedgerTxType, { label: string; cls: string }> = {
  deposit: {
    label: "Deposit",
    cls: "bg-[#052e16]/60 text-[#4ade80] border-[#14532D]/50",
  },
  onramp: {
    label: "Onramp",
    cls: "bg-[#052e16]/60 text-[#4ade80] border-[#14532D]/50",
  },
  refund: {
    label: "Refund",
    cls: "bg-[#052e16]/60 text-[#86efac] border-[#14532D]/50",
  },
  withdrawal: {
    label: "Withdrawal",
    cls: "bg-[#450a0a]/60 text-[#f87171] border-[#7f1d1d]/50",
  },
  offramp: {
    label: "Offramp",
    cls: "bg-[#450a0a]/60 text-[#f87171] border-[#7f1d1d]/50",
  },
  payout: {
    label: "Payout",
    cls: "bg-[#3b0d07]/60 text-[#fb923c] border-[#7c2d12]/50",
  },
  fee: {
    label: "Fee",
    cls: "bg-[#2d1a00]/60 text-[#F59E0B] border-[#78350F]/50",
  },
  transfer: {
    label: "Transfer",
    cls: "bg-[#1e3a5f]/60 text-[#60A5FA] border-[#1d3461]/50",
  },
  swap: {
    label: "Swap",
    cls: "bg-[#1a0a2e]/60 text-[#a855f7] border-[#3b0764]/50",
  },
};

const STATUS_CFG: Record<LedgerEntryStatus, { label: string; cls: string }> = {
  completed: {
    label: "Completed",
    cls: "bg-[#052e16]/60 text-[#4ade80] border-[#14532D]/50",
  },
  pending: {
    label: "Pending",
    cls: "bg-[#2d1a00]/60 text-[#F59E0B] border-[#78350F]/50",
  },
  initiated: {
    label: "Initiated",
    cls: "bg-[#18181B]/60 text-[#71717A] border-[#27272A]/50",
  },
  processing: {
    label: "Processing",
    cls: "bg-[#1e3a5f]/60 text-[#60A5FA] border-[#1d3461]/50",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-[#450a0a]/60 text-[#f87171] border-[#7f1d1d]/50",
  },
  reversed: {
    label: "Reversed",
    cls: "bg-[#3b0d07]/60 text-[#fb923c] border-[#7c2d12]/50",
  },
};

const WALLET_ASSET_OPTIONS: WalletAsset[] = [
  "BTC",
  "TRX",
  "BNB",
  "TON",
  "USDT",
  "ETH",
  "USDC",
  "SOL",
];

const SWAP_QUOTATION_CURRENCIES = ["NGN", "USDT", "USDC"] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  return Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function truncate(s: string, len = 20) {
  if (!s || s.length <= len) return s;
  return `${s.slice(0, 9)}…${s.slice(-7)}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Shared badge components ───────────────────────────────────────────────────

function TxTypeBadge({ type }: { type: LedgerTxType }) {
  const cfg = TX_TYPE_CFG[type] ?? {
    label: type,
    cls: "bg-[#18181B]/60 text-[#71717A] border-[#27272A]/50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: LedgerEntryStatus | string }) {
  const cfg = STATUS_CFG[status as LedgerEntryStatus] ?? {
    label: status,
    cls: "bg-[#18181B]/60 text-[#71717A] border-[#27272A]/50",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded text-[#52525B] hover:text-[#A1A1AA] transition-colors"
    >
      {copied ? (
        <Check size={12} className="text-[#4ade80]" />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────

function ModalShell({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl",
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Input / Label helpers ─────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#52525B] mb-1.5">
      {children}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors",
        props.className,
      )}
    />
  );
}

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-3 pr-8 text-sm text-[#A1A1AA] focus:border-[#2563EB] focus:outline-none transition-colors cursor-pointer",
          props.className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B]"
      />
    </div>
  );
}

function ErrorMsg({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-[#f87171]">
      <AlertCircle size={12} /> {message}
    </p>
  );
}

function PrimaryButton({
  children,
  loading,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        "flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#FAFAFA] text-sm font-semibold text-[#09090B] transition-opacity hover:opacity-90 disabled:opacity-40",
        props.className,
      )}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

// ── Deposit Modal ─────────────────────────────────────────────────────────────

type DepositStep = "select" | "address";

interface DepositAddress {
  chain: string;
  address: string;
  createdAt?: string;
}
interface NgnVirtualAccount {
  currency: string;
  accountNumber: string;
  accountName: string;
  bankName?: string;
}
interface WalletResult {
  id: string;
  deposit_addresses: string | DepositAddress[];
  ngn_virtual_accounts: string | NgnVirtualAccount[];
}

function parseJsonField<T>(field: string | T[]): T[] {
  if (Array.isArray(field)) return field;
  if (!field) return [];
  try {
    return JSON.parse(field as string) as T[];
  } catch {
    return [];
  }
}

function DepositModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<DepositStep>("select");
  const [selectedKey, setSelectedKey] = useState("");
  const [walletResult, setWalletResult] = useState<WalletResult | null>(null);

  const { data: rawAssets, isLoading: assetsLoading } = useQuery({
    queryKey: ["deposit-assets"],
    queryFn: payApi.getDepositAssets,
    staleTime: 5 * 60_000,
  });

  const createWallet = useCreateWallet();
  const issueIdentity = useIssueIdentity();

  const assets: FlatAsset[] = flattenAssets(
    (rawAssets as any)?.data ?? rawAssets ?? {},
  );

  const selectedAsset = assets.find((a) => a.key === selectedKey) ?? null;

  const handleCreate = async () => {
    if (!selectedAsset) return;
    try {
      // 1. Create the deposit account
      const wallet = await createWallet.mutateAsync({ customer_id: undefined });
      const walletId: string = wallet.id;

      // 2. Issue a deposit identity for the selected chain
      await issueIdentity.mutateAsync({
        walletId,
        dto: {
          type: "static_deposit_address",
          chain:
            selectedAsset.chainKey as import("@/lib/types/wallet").DepositIdentityChain,
        },
      });

      // 3. Re-fetch wallet to get the updated deposit_addresses
      const updated = await walletsApi.getById(walletId);
      setWalletResult(updated as unknown as WalletResult);
      setStep("address");
    } catch {
      // errors shown inline
    }
  };

  const handleClose = () => {
    setStep("select");
    setSelectedKey("");
    setWalletResult(null);
    createWallet.reset();
    issueIdentity.reset();
    onClose();
  };

  // Derive address for the selected chain
  const depositAddresses = walletResult
    ? parseJsonField<DepositAddress>(walletResult.deposit_addresses)
    : [];
  const ngnAccounts = walletResult
    ? parseJsonField<NgnVirtualAccount>(walletResult.ngn_virtual_accounts)
    : [];

  const matchedAddress = selectedAsset
    ? depositAddresses.find((da) => da.chain === selectedAsset.chainKey)
    : null;

  const createError =
    createWallet.error instanceof Error
      ? createWallet.error.message
      : issueIdentity.error instanceof Error
        ? issueIdentity.error.message
        : null;

  const isCreating = createWallet.isPending || issueIdentity.isPending;

  return (
    <ModalShell open={open} onClose={handleClose} title="Deposit Funds">
      {step === "select" ? (
        <div className="flex flex-col gap-4">
          <div>
            <Label>Asset &amp; Network</Label>
            {assetsLoading ? (
              <div className="h-9 animate-pulse rounded-lg bg-[#1C1C1F]" />
            ) : (
              <Select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
              >
                <option value="">Select asset &amp; network…</option>
                {assets.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.symbol} — {a.networkDisplay}
                  </option>
                ))}
              </Select>
            )}
          </div>

          {selectedAsset && (
            <div className="rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-3 space-y-1">
              <p className="text-xs text-[#52525B]">Selected</p>
              <p className="text-sm font-semibold text-[#FAFAFA]">
                {selectedAsset.name} ({selectedAsset.symbol})
              </p>
              <p className="text-xs text-[#71717A]">
                Network: {selectedAsset.networkDisplay}
              </p>
            </div>
          )}

          <ErrorMsg message={createError} />

          <PrimaryButton
            type="button"
            disabled={!selectedKey}
            loading={isCreating}
            onClick={handleCreate}
            className="mt-1"
          >
            {createWallet.isPending
              ? "Creating wallet…"
              : issueIdentity.isPending
                ? "Issuing address…"
                : "Generate Deposit Address"}
          </PrimaryButton>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Asset + Network summary */}
          {selectedAsset && (
            <div className="flex items-center justify-between rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-3">
              <div>
                <p className="text-xs text-[#52525B]">Asset</p>
                <p className="text-sm font-semibold text-[#FAFAFA]">
                  {selectedAsset.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#52525B]">Network</p>
                <p className="text-sm font-semibold text-[#FAFAFA]">
                  {selectedAsset.networkDisplay}
                </p>
              </div>
            </div>
          )}

          {/* Filtered deposit address */}
          {matchedAddress ? (
            <div>
              <Label>Deposit Address</Label>
              <div className="flex items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 py-2.5">
                <span className="flex-1 break-all font-mono text-xs text-[#A1A1AA]">
                  {matchedAddress.address}
                </span>
                <CopyButton value={matchedAddress.address} />
              </div>
              <p className="mt-1.5 text-[10px] text-[#52525B]">
                Only send {selectedAsset?.symbol} on the{" "}
                {selectedAsset?.networkDisplay} network to this address.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-[#27272A] bg-[#18181B] px-4 py-3">
              <p className="text-xs text-[#71717A]">
                No deposit address found for the selected network. Try a
                different asset or network.
              </p>
            </div>
          )}

          {/* NGN virtual accounts */}
          {ngnAccounts.length > 0 && (
            <div>
              <Label>NGN Virtual Accounts</Label>
              <div className="flex flex-col gap-2">
                {ngnAccounts.map((va, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 py-2.5 space-y-0.5"
                  >
                    {va.bankName && (
                      <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-wider">
                        {va.bankName}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-sm text-[#FAFAFA]">
                        {va.accountNumber}
                      </p>
                      <CopyButton value={va.accountNumber} />
                    </div>
                    <p className="text-xs text-[#71717A]">{va.accountName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep("select")}
            className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors text-center"
          >
            ← Choose a different asset
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ── Withdraw Modal ────────────────────────────────────────────────────────────

type WithdrawTab = "stablecoin" | "fiat";

function WithdrawModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<WithdrawTab>("stablecoin");

  // Stablecoin state
  const [scAddress, setScAddress] = useState("");
  const [scAmount, setScAmount] = useState("");
  const [scNetwork, setScNetwork] = useState("ERC20");
  const [scToken, setScToken] = useState("USDT");
  // const [scExternalId, setScExternalId] = useState(() => generateUUID());
  const [scSuccess, setScSuccess] = useState(false);

  // Fiat state
  const [fiatBankId, setFiatBankId] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [fiatNarration, setFiatNarration] = useState("");
  const [fiatSuccess, setFiatSuccess] = useState(false);

  const withdrawStableCoin = useWithdrawStableCoin();
  const withdrawFiat = useWithdrawFiat();
  const { data: savedAddresses } = useSavedWithdrawalAddresses();
  const { data: savedBanks } = useSavedBanks();

  const handleClose = useCallback(() => {
    setScSuccess(false);
    setFiatSuccess(false);
    withdrawStableCoin.reset();
    withdrawFiat.reset();
    onClose();
  }, [onClose, withdrawStableCoin, withdrawFiat]);

  const handleStablecoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await withdrawStableCoin.mutateAsync({
        address: scAddress,
        amount: Number(scAmount),
        network: scNetwork,
        token: scToken,
        externalId: generateUUID(),
      });
      setScSuccess(true);
    } catch {
      // error shown inline
    }
  };

  const handleFiatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await withdrawFiat.mutateAsync({
        bank_id: fiatBankId,
        amount: Number(fiatAmount),
        narration: fiatNarration || undefined,
      });
      setFiatSuccess(true);
    } catch {
      // error shown inline
    }
  };

  const scError =
    withdrawStableCoin.error instanceof Error
      ? withdrawStableCoin.error.message
      : null;
  const fiatError =
    withdrawFiat.error instanceof Error ? withdrawFiat.error.message : null;

  return (
    <ModalShell open={open} onClose={handleClose} title="Withdraw Funds">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[#1C1C1F] bg-[#09090B] p-1 mb-5">
        {(["stablecoin", "fiat"] as WithdrawTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === t
                ? "bg-[#1C1C1F] text-[#FAFAFA]"
                : "text-[#71717A] hover:text-[#A1A1AA]",
            )}
          >
            {t === "stablecoin" ? "Stablecoin" : "Fiat (NGN)"}
          </button>
        ))}
      </div>

      {tab === "stablecoin" && (
        <>
          {scSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 size={40} className="text-[#4ade80]" />
              <p className="text-sm font-semibold text-[#FAFAFA]">
                Withdrawal Submitted
              </p>
              <p className="text-xs text-[#71717A]">
                Your stablecoin withdrawal has been submitted.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-[#FAFAFA] text-sm font-semibold text-[#09090B]"
              >
                Done
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleStablecoinSubmit}
              className="flex flex-col gap-3"
            >
              {savedAddresses && savedAddresses.length > 0 && (
                <div>
                  <Label>Saved Address</Label>
                  <Select
                    value={scAddress}
                    onChange={(e) => {
                      const sa = (savedAddresses as WithdrawalAddress[]).find(
                        (a) => a.address === e.target.value,
                      );
                      if (sa) {
                        setScAddress(sa.address);
                        setScNetwork(sa.network);
                        setScToken(sa.token);
                      }
                    }}
                  >
                    <option value="">Select saved address…</option>
                    {(savedAddresses as WithdrawalAddress[]).map((sa) => (
                      <option key={sa.id} value={sa.address}>
                        {sa.label} — {sa.address.slice(0, 12)}… ({sa.network}/
                        {sa.token})
                      </option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <Label>Destination Address</Label>
                <Input
                  required
                  placeholder="0x…"
                  value={scAddress}
                  onChange={(e) => setScAddress(e.target.value)}
                />
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={scAmount}
                  onChange={(e) => setScAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Network</Label>
                  <div className="flex h-9 items-center rounded-lg border border-[#1C1C1F] bg-[#18181B] px-3 text-sm text-[#A1A1AA]">
                    {scNetwork || "—"}
                  </div>
                </div>
                <div>
                  <Label>Token</Label>
                  <div className="flex h-9 items-center rounded-lg border border-[#1C1C1F] bg-[#18181B] px-3 text-sm text-[#A1A1AA]">
                    {scToken || "—"}
                  </div>
                </div>
              </div>
              <ErrorMsg message={scError} />
              <PrimaryButton
                type="submit"
                loading={withdrawStableCoin.isPending}
                className="mt-1"
              >
                Submit Withdrawal
              </PrimaryButton>
            </form>
          )}
        </>
      )}

      {tab === "fiat" && (
        <>
          {fiatSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle2 size={40} className="text-[#4ade80]" />
              <p className="text-sm font-semibold text-[#FAFAFA]">
                Fiat Withdrawal Submitted
              </p>
              <p className="text-xs text-[#71717A]">
                Your fiat withdrawal has been submitted.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-[#FAFAFA] text-sm font-semibold text-[#09090B]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleFiatSubmit} className="flex flex-col gap-3">
              <div>
                <Label>Bank Recipient</Label>
                {savedBanks && savedBanks.length > 0 ? (
                  <Select
                    required
                    value={fiatBankId}
                    onChange={(e) => setFiatBankId(e.target.value)}
                  >
                    <option value="">Select saved bank…</option>
                    {(savedBanks as SavedBank[]).map((bank) => (
                      <option key={bank.id} value={bank.provider_recipient_id}>
                        {bank.bank_name} — {bank.account_number} (
                        {bank.account_name})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    required
                    placeholder="Recipient ID"
                    value={fiatBankId}
                    onChange={(e) => setFiatBankId(e.target.value)}
                  />
                )}
              </div>
              <div>
                <Label>Amount (NGN)</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={fiatAmount}
                  onChange={(e) => setFiatAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Narration (optional)</Label>
                <Input
                  placeholder="Payment description…"
                  value={fiatNarration}
                  onChange={(e) => setFiatNarration(e.target.value)}
                />
              </div>
              <ErrorMsg message={fiatError} />
              <PrimaryButton
                type="submit"
                loading={withdrawFiat.isPending}
                className="mt-1"
              >
                Submit Withdrawal
              </PrimaryButton>
            </form>
          )}
        </>
      )}
    </ModalShell>
  );
}

// ── Swap Modal ────────────────────────────────────────────────────────────────

type SwapModalTab = "crypto" | "offramp";
type CryptoSwapStep = "form" | "quotation" | "success";

function CryptoSwapFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<CryptoSwapStep>("form");
  const [fromCurrency, setFromCurrency] = useState("USDT");
  const [toCurrency, setToCurrency] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [quotation, setQuotation] = useState<SwapQuotation | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [timerExpired, setTimerExpired] = useState(false);

  const createQuotation = useCreateSwapQuotation();
  const executeSwap = useExecuteSwap();

  // Live estimate
  const estimateEnabled =
    !!fromCurrency &&
    !!toCurrency &&
    !!amount &&
    Number(amount) > 0 &&
    fromCurrency !== toCurrency;
  const { data: estimate, isFetching: estimateFetching } = useSwapEstimate(
    fromCurrency,
    toCurrency,
    amount,
  );

  // Countdown timer for quotation step
  useEffect(() => {
    if (step !== "quotation") return;
    setCountdown(15);
    setTimerExpired(false);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setTimerExpired(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleGetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = await createQuotation.mutateAsync({
        fromCurrency,
        toCurrency,
        amount,
      });
      setQuotation(q);
      setStep("quotation");
    } catch {
      // error shown inline
    }
  };

  const handleExecute = async () => {
    if (!quotation) return;
    try {
      await executeSwap.mutateAsync(quotation.id);
      setStep("success");
    } catch {
      // error shown inline
    }
  };

  const quotationError =
    createQuotation.error instanceof Error
      ? createQuotation.error.message
      : null;
  const executeError =
    executeSwap.error instanceof Error ? executeSwap.error.message : null;

  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle2 size={40} className="text-[#4ade80]" />
        <p className="text-sm font-semibold text-[#FAFAFA]">Swap Executed!</p>
        <p className="text-xs text-[#71717A]">
          Your swap has been successfully executed.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-[#FAFAFA] text-sm font-semibold text-[#09090B]"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === "quotation" && quotation) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-[#1C1C1F] bg-[#09090B] p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#71717A]">From</span>
            <span className="font-semibold text-[#FAFAFA]">
              {fmt(quotation.amount)} {quotation.fromCurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#71717A]">To</span>
            <span className="font-semibold text-[#4ade80]">
              {fmt(quotation.quotedAmount)} {quotation.toCurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#71717A]">Rate</span>
            <span className="font-mono text-[#A1A1AA]">{quotation.rate}</span>
          </div>
          <div className="border-t border-[#1C1C1F] pt-2 flex justify-between text-sm">
            <span className="text-[#71717A]">Expires in</span>
            <span
              className={cn(
                "font-mono font-semibold",
                timerExpired
                  ? "text-[#f87171]"
                  : countdown <= 5
                    ? "text-[#F59E0B]"
                    : "text-[#FAFAFA]",
              )}
            >
              {timerExpired ? "Expired" : `${countdown}s`}
            </span>
          </div>
        </div>
        <ErrorMsg message={executeError} />
        <PrimaryButton
          onClick={handleExecute}
          loading={executeSwap.isPending}
          disabled={timerExpired}
        >
          {timerExpired ? "Quote Expired" : "Execute Swap"}
        </PrimaryButton>
        {timerExpired && (
          <button
            type="button"
            onClick={() => {
              createQuotation.reset();
              executeSwap.reset();
              setStep("form");
            }}
            className="flex h-9 w-full items-center justify-center rounded-lg border border-[#1C1C1F] text-sm text-[#A1A1AA] hover:border-[#2563EB] transition-colors"
          >
            Get New Quote
          </button>
        )}
      </div>
    );
  }

  // Step: form
  return (
    <form onSubmit={handleGetQuote} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>From</Label>
          <Select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            {SWAP_QUOTATION_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>To</Label>
          <Select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {SWAP_QUOTATION_CURRENCIES.filter((c) => c !== fromCurrency).map(
              (c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ),
            )}
          </Select>
        </div>
      </div>
      <div>
        <Label>Amount</Label>
        <Input
          required
          type="number"
          min="0"
          step="any"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* Live estimate */}
      {estimateEnabled && (
        <div className="rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 py-2.5">
          {estimateFetching ? (
            <p className="text-xs text-[#52525B]">Fetching estimate…</p>
          ) : estimate ? (
            <div className="flex justify-between text-xs">
              <span className="text-[#71717A]">Estimated output</span>
              <span className="font-mono font-semibold text-[#FAFAFA]">
                {fmt(estimate.estimatedAmount)} {estimate.toCurrency}
                <span className="ml-2 text-[#52525B]">@ {estimate.rate}</span>
              </span>
            </div>
          ) : null}
        </div>
      )}

      <ErrorMsg message={quotationError} />
      <PrimaryButton
        type="submit"
        loading={createQuotation.isPending}
        className="mt-1"
      >
        Get Quote
      </PrimaryButton>
    </form>
  );
}

function OfframpFlow({ onDone }: { onDone: () => void }) {
  const [cryptoAsset, setCryptoAsset] = useState<WalletAsset>("USDT");
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: savedBanks, isLoading: banksLoading } = useSavedBanks();
  const createOfframp = useCreateOfframp();

  const bankList: SavedBank[] = (savedBanks as SavedBank[] | undefined) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOfframp.mutateAsync({
        crypto_asset: cryptoAsset,
        crypto_amount: Number(cryptoAmount),
        recipient_id: recipientId,
      });
      setSuccess(true);
    } catch {
      // error shown inline
    }
  };

  const offrampError =
    createOfframp.error instanceof Error ? createOfframp.error.message : null;

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <CheckCircle2 size={40} className="text-[#4ade80]" />
        <p className="text-sm font-semibold text-[#FAFAFA]">
          Offramp Submitted
        </p>
        <p className="text-xs text-[#71717A]">
          Your offramp has been successfully submitted.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-[#FAFAFA] text-sm font-semibold text-[#09090B]"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Crypto Asset</Label>
          <Select
            value={cryptoAsset}
            onChange={(e) => setCryptoAsset(e.target.value as WalletAsset)}
          >
            {SWAP_QUOTATION_CURRENCIES.filter((c) => c !== "NGN").map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Crypto Amount</Label>
          <Input
            required
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={cryptoAmount}
            onChange={(e) => setCryptoAmount(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>Recipient</Label>
        {banksLoading ? (
          <div className="h-9 animate-pulse rounded-lg bg-[#1C1C1F]" />
        ) : bankList.length > 0 ? (
          <Select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
          >
            <option value="">Select bank recipient…</option>
            {bankList.map((bank) => (
              <option key={bank.id} value={bank.provider_recipient_id}>
                {bank.bank_name} — {bank.account_number} ({bank.account_name})
              </option>
            ))}
          </Select>
        ) : (
          <Input
            required
            placeholder="Recipient ID"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
          />
        )}
      </div>
      <ErrorMsg message={offrampError} />
      <PrimaryButton
        type="submit"
        loading={createOfframp.isPending}
        className="mt-1"
      >
        Execute Offramp
      </PrimaryButton>
    </form>
  );
}

function SwapModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<SwapModalTab>("crypto");

  const handleDone = useCallback(() => {
    onClose();
    setTab("crypto");
  }, [onClose]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Swap / Offramp"
      maxWidth="max-w-lg"
    >
      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-lg border border-[#1C1C1F] bg-[#09090B] p-1 mb-5">
        {(["crypto", "offramp"] as SwapModalTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === t
                ? "bg-[#1C1C1F] text-[#FAFAFA]"
                : "text-[#71717A] hover:text-[#A1A1AA]",
            )}
          >
            {t === "crypto" ? "Crypto Swap" : "Offramp (→ NGN)"}
          </button>
        ))}
      </div>

      {tab === "crypto" && <CryptoSwapFlow onDone={handleDone} />}
      {tab === "offramp" && <OfframpFlow onDone={handleDone} />}
    </ModalShell>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({
  currency,
  txRef,
}: {
  currency: Currency;
  txRef: React.RefObject<LedgerTransaction[]>;
}) {
  const { data, isLoading, isError } = useLedgerTransactions({ limit: 20 });
  const txList: LedgerTransaction[] = data?.data ?? [];

  // Keep ref updated for CSV export
  useEffect(() => {
    if (txList.length > 0) {
      txRef.current = txList;
    }
  }, [txList, txRef]);

  const getAmount = (tx: LedgerTransaction) => {
    if (currency === "NGN") {
      const credit = Number(tx.credit_ngn);
      const debit = Number(tx.debit_ngn);
      if (credit > 0) return { value: `+₦${fmt(credit)}`, positive: true };
      if (debit > 0) return { value: `-₦${fmt(debit)}`, positive: false };
      return { value: "—", positive: false };
    } else if (currency === "USDT") {
      const credit = Number(tx.credit_usdt);
      const debit = Number(tx.debit_usdt);
      if (credit > 0) return { value: `+$${fmt(credit)}`, positive: true };
      if (debit > 0) return { value: `-$${fmt(debit)}`, positive: false };
      return { value: "—", positive: false };
    } else {
      const credit = Number(tx.credit_usdc);
      const debit = Number(tx.debit_usdc);
      if (credit > 0) return { value: `+$${fmt(credit)}`, positive: true };
      if (debit > 0) return { value: `-$${fmt(debit)}`, positive: false };
      return { value: "—", positive: false };
    }
  };

  return (
    <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
      <div className="border-b border-[#1C1C1F] px-5 py-4">
        <p className="text-sm font-semibold text-[#FAFAFA]">
          Transaction History
        </p>
      </div>

      {isLoading && (
        <div className="divide-y divide-[#1C1C1F]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="h-4 w-16 animate-pulse rounded-full bg-[#1C1C1F]" />
              <div className="h-3 flex-1 animate-pulse rounded bg-[#1C1C1F]" />
              <div className="h-3 w-24 animate-pulse rounded bg-[#1C1C1F]" />
              <div className="h-4 w-14 animate-pulse rounded-full bg-[#1C1C1F]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[#1C1C1F]" />
              <div className="h-3 w-28 animate-pulse rounded bg-[#1C1C1F]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <AlertCircle size={24} className="text-[#3F3F46]" strokeWidth={1.5} />
          <p className="text-sm text-[#71717A]">Failed to load transactions.</p>
        </div>
      )}

      {!isLoading && !isError && txList.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ArrowLeftRight
            size={28}
            className="text-[#3F3F46]"
            strokeWidth={1.5}
          />
          <p className="text-sm font-semibold text-[#FAFAFA]">
            No transactions yet.
          </p>
        </div>
      )}

      {!isLoading && !isError && txList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1C1C1F]">
                {[
                  "Type",
                  "Asset",
                  `Amount (${currency})`,
                  "Status",
                  "Reference",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txList.map((tx) => {
                const { value: amtValue, positive } = getAmount(tx);
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-[#1C1C1F] last:border-0 hover:bg-[#111113] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <TxTypeBadge type={tx.tx_type} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md border border-[#1C1C1F] px-2 py-0.5 font-mono text-[11px] text-[#A1A1AA]">
                        {tx.asset ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "font-mono text-sm font-medium",
                          positive ? "text-[#4ade80]" : "text-[#FAFAFA]",
                        )}
                      >
                        {amtValue}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-[#71717A]">
                        {truncate(tx.reference_id)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#52525B]">
                      {fmtDate(tx.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer link */}
      <div className="border-t border-[#1C1C1F] px-5 py-3">
        <Link
          href="/transactions"
          className="text-xs text-[#2563EB] hover:underline"
        >
          View all transactions →
        </Link>
      </div>
    </div>
  );
}

// ── Swaps tab ─────────────────────────────────────────────────────────────────

function SwapsTab({ onNewSwap }: { onNewSwap: () => void }) {
  const { data, isLoading } = useSwapList();

  const rawList =
    (data as unknown as { data?: unknown[] })?.data ??
    (Array.isArray(data) ? (data as unknown[]) : []);

  return (
    <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
      <div className="flex items-center justify-between border-b border-[#1C1C1F] px-5 py-4">
        <p className="text-sm font-semibold text-[#FAFAFA]">Swaps</p>
        <button
          type="button"
          onClick={onNewSwap}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 text-xs font-semibold text-white hover:brightness-110 transition-all"
        >
          <ArrowLeftRight size={12} /> New Swap
        </button>
      </div>

      {isLoading && (
        <div className="divide-y divide-[#1C1C1F]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="h-3 flex-1 animate-pulse rounded bg-[#1C1C1F]" />
              <div className="h-3 w-20 animate-pulse rounded bg-[#1C1C1F]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && rawList.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ArrowLeftRight
            size={28}
            className="text-[#3F3F46]"
            strokeWidth={1.5}
          />
          <p className="text-sm font-semibold text-[#FAFAFA]">No swaps yet.</p>
          <button
            type="button"
            onClick={onNewSwap}
            className="mt-1 text-xs text-[#2563EB] hover:underline"
          >
            Create your first swap
          </button>
        </div>
      )}

      {!isLoading && rawList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1C1C1F]">
                {["From", "To", "Rate", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawList.map((swap, idx) => {
                const s = swap as Record<string, unknown>;
                const fromAmt = s.amount ?? s.from_amount ?? s.fromAmount;
                const fromCur = s.fromCurrency ?? s.from_currency;
                const toAmt = s.quotedAmount ?? s.to_amount ?? s.toAmount;
                const toCur = s.toCurrency ?? s.to_currency;
                const rate = s.rate;
                const status = String(s.status ?? "—");
                const createdAt = String(s.created_at ?? s.createdAt ?? "");
                return (
                  <tr
                    key={String(s.id ?? idx)}
                    className="border-b border-[#1C1C1F] last:border-0 hover:bg-[#111113] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[#FAFAFA]">
                      {fromAmt != null ? fmt(Number(fromAmt)) : "—"}{" "}
                      <span className="text-[#71717A]">
                        {String(fromCur ?? "")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[#4ade80]">
                      {toAmt != null ? fmt(Number(toAmt)) : "—"}{" "}
                      <span className="text-[#71717A]">
                        {String(toCur ?? "")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-[#A1A1AA]">
                      {rate != null ? String(rate) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#52525B]">
                      {createdAt ? fmtDate(createdAt) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BalancePage() {
  const [currency, setCurrency] = useState<Currency>("NGN");
  const [activeTab, setActiveTab] = useState<ActiveTab>("history");
  const [depositOpen, setDepositOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Keep last-fetched tx list for CSV export (avoids re-fetching)
  const txRef = useRef<LedgerTransaction[]>([]);

  const { data: balance, isLoading: balanceLoading } = useLedgerBalance();

  const currencyData =
    currency === "NGN"
      ? balance?.ngn
      : currency === "USDT"
        ? balance?.usdt
        : balance?.usdc;
  const symbol = currency === "NGN" ? "₦" : "$";

  // CSV export
  const handleExportCsv = useCallback(() => {
    const rows = txRef.current;
    if (!rows.length) return;

    const headers = [
      "id",
      "tx_type",
      "asset",
      "debit_ngn",
      "credit_ngn",
      "debit_usdt",
      "credit_usdt",
      "debit_usdc",
      "credit_usdc",
      "status",
      "reference_id",
      "description",
      "created_at",
    ];

    const escape = (v: unknown) => {
      const s = String(v ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };

    const lines = [
      headers.join(","),
      ...rows.map((tx) =>
        [
          tx.id,
          tx.tx_type,
          tx.asset ?? "",
          tx.debit_ngn,
          tx.credit_ngn,
          tx.debit_usdt,
          tx.credit_usdt,
          tx.debit_usdc,
          tx.credit_usdc,
          tx.status,
          tx.reference_id,
          tx.description ?? "",
          tx.created_at,
        ]
          .map(escape)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const TABS: { label: string; value: ActiveTab }[] = [
    { label: "History", value: "history" },
    { label: "Swaps", value: "swaps" },
  ];

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <PageHeader
          title="Balance"
          description="Manage your funds"
          actions={
            <>
              {/* Currency picker */}
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="h-9 appearance-none rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-3 pr-8 text-sm font-medium text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="NGN">NGN</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B]"
                />
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#A1A1AA] hover:border-[#2563EB] hover:text-[#FAFAFA] transition-colors"
              >
                <Download size={13} /> Export CSV
              </button>
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#A1A1AA] hover:border-[#2563EB] hover:text-[#FAFAFA] transition-colors"
              >
                <ArrowDownToLine size={13} /> Deposit
              </button>
              <button
                type="button"
                onClick={() => setSwapOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#A1A1AA] hover:border-[#2563EB] hover:text-[#FAFAFA] transition-colors"
              >
                <ArrowLeftRight size={13} /> Swap
              </button>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3 text-sm font-semibold text-[#09090B] hover:opacity-90 transition-opacity"
              >
                <ArrowUpFromLine size={13} /> Withdraw
              </button>
            </>
          }
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Available Balance"
            value={
              balanceLoading ? "—" : `${symbol}${fmt(currencyData?.balance)}`
            }
            icon={<Wallet size={15} />}
            loading={balanceLoading}
          />
          <StatCard
            label="Total Credits"
            value={
              balanceLoading ? "—" : `${symbol}${fmt(currencyData?.credits)}`
            }
            icon={<TrendingUp size={15} />}
            loading={balanceLoading}
          />
          <StatCard
            label="Total Debits"
            value={
              balanceLoading ? "—" : `${symbol}${fmt(currencyData?.debits)}`
            }
            icon={<TrendingDown size={15} />}
            loading={balanceLoading}
          />
        </div>

        {/* Tab bar */}
        <div>
          <div className="flex items-center border-b border-[#1C1C1F] gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.value
                    ? "border-[#2563EB] text-[#FAFAFA]"
                    : "border-transparent text-[#71717A] hover:text-[#A1A1AA]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {activeTab === "history" && (
              <HistoryTab currency={currency} txRef={txRef} />
            )}
            {activeTab === "swaps" && (
              <SwapsTab onNewSwap={() => setSwapOpen(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
      <SwapModal open={swapOpen} onClose={() => setSwapOpen(false)} />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </>
  );
}
