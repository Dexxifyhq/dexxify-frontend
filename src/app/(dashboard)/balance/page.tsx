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
import WalletQRCode from "@/components/ui/WalletQRCode";

// ── Config ───────────────────────────────────────────────────────────────────

type Currency = "NGN" | "USDT" | "USDC";
type ActiveTab = "history" | "swaps";

const TX_TYPE_CFG: Record<LedgerTxType, { label: string; cls: string }> = {
  deposit: {
    label: "Deposit",
    cls: "bg-dash-success-bg text-dash-success border-dash-success-border",
  },
  onramp: {
    label: "Onramp",
    cls: "bg-dash-success-bg text-dash-success border-dash-success-border",
  },
  refund: {
    label: "Refund",
    cls: "bg-dash-success-bg text-dash-success border-dash-success-border",
  },
  withdrawal: {
    label: "Withdrawal",
    cls: "bg-dash-error-bg text-dash-error border-dash-error-border",
  },
  offramp: {
    label: "Offramp",
    cls: "bg-dash-error-bg text-dash-error border-dash-error-border",
  },
  payout: {
    label: "Payout",
    cls: "bg-dash-orange-bg text-dash-orange border-dash-orange-border",
  },
  fee: {
    label: "Fee",
    cls: "bg-dash-warning-bg text-dash-warning border-dash-warning-border",
  },
  transfer: {
    label: "Transfer",
    cls: "bg-dash-accent-soft text-dash-accent border-dash-accent-soft",
  },
  swap: {
    label: "Swap",
    cls: "bg-dash-purple-bg text-dash-purple border-dash-purple-border",
  },
};

const STATUS_CFG: Record<LedgerEntryStatus, { label: string; cls: string }> = {
  completed: {
    label: "Completed",
    cls: "bg-dash-success-bg text-dash-success border-dash-success-border",
  },
  pending: {
    label: "Pending",
    cls: "bg-dash-warning-bg text-dash-warning border-dash-warning-border",
  },
  initiated: {
    label: "Initiated",
    cls: "bg-dash-hover text-dash-muted border-dash-border",
  },
  processing: {
    label: "Processing",
    cls: "bg-dash-accent-soft text-dash-accent border-dash-accent-soft",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-dash-error-bg text-dash-error border-dash-error-border",
  },
  reversed: {
    label: "Reversed",
    cls: "bg-dash-orange-bg text-dash-orange border-dash-orange-border",
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
    cls: "bg-dash-hover text-dash-muted border-dash-border",
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
    cls: "bg-dash-hover text-dash-muted border-dash-border",
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
      className="ml-1.5 inline-flex h-6 w-6 items-center justify-center rounded text-dash-faint hover:text-dash-muted transition-colors"
    >
      {copied ? (
        <Check size={12} className="text-dash-success" />
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
          "relative w-full rounded-2xl border border-dash-border bg-dash-card shadow-2xl",
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
          <h2 className="text-sm font-semibold text-dash-foreground">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
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
    <label className="block text-[11px] font-semibold uppercase tracking-wider text-dash-faint mb-1.5">
      {children}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-9 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors",
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
          "h-9 w-full appearance-none rounded-lg border border-dash-border bg-dash-card pl-3 pr-8 text-sm text-dash-muted focus:border-dash-accent focus:outline-none transition-colors cursor-pointer",
          props.className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dash-faint"
      />
    </div>
  );
}

function FeeNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-dash-muted">
      <AlertCircle size={12} className="shrink-0 text-dash-faint" />
      {children}
    </p>
  );
}

function ErrorMsg({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs text-dash-error">
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
        "flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-dash-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40",
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
              <div className="h-9 animate-pulse rounded-lg bg-dash-hover" />
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
            <div className="rounded-lg border border-dash-border bg-dash-card px-4 py-3 space-y-1">
              <p className="text-xs text-dash-faint">Selected</p>
              <p className="text-sm font-semibold text-dash-foreground">
                {selectedAsset.name} ({selectedAsset.symbol})
              </p>
              <p className="text-xs text-dash-muted">
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
            <div className="flex items-center justify-between rounded-lg border border-dash-border bg-dash-card px-4 py-3">
              <div>
                <p className="text-xs text-dash-faint">Asset</p>
                <p className="text-sm font-semibold text-dash-foreground">
                  {selectedAsset.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dash-faint">Network</p>
                <p className="text-sm font-semibold text-dash-foreground">
                  {selectedAsset.networkDisplay}
                </p>
              </div>
            </div>
          )}

          {/* Filtered deposit address */}
          {matchedAddress ? (
            <div className="flex flex-col gap-2">
              <Label>Deposit Address</Label>
              <div className="flex justify-center">
                <WalletQRCode address={matchedAddress.address} size={160} />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-dash-border bg-dash-card px-3 py-2.5">
                <span className="flex-1 break-all font-mono text-xs text-dash-muted">
                  {matchedAddress.address}
                </span>
                <CopyButton value={matchedAddress.address} />
              </div>
              <p className="text-[10px] text-dash-faint">
                Only send {selectedAsset?.symbol} on the{" "}
                {selectedAsset?.networkDisplay} network to this address.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-dash-border bg-dash-hover px-4 py-3">
              <p className="text-xs text-dash-muted">
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
                    className="rounded-lg border border-dash-border bg-dash-card px-3 py-2.5 space-y-0.5"
                  >
                    {va.bankName && (
                      <p className="text-[10px] font-semibold text-dash-faint uppercase tracking-wider">
                        {va.bankName}
                      </p>
                    )}
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-sm text-dash-foreground">
                        {va.accountNumber}
                      </p>
                      <CopyButton value={va.accountNumber} />
                    </div>
                    <p className="text-xs text-dash-muted">{va.accountName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep("select")}
            className="text-xs text-dash-faint hover:text-dash-muted transition-colors text-center"
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
  const [scNetwork, setScNetwork] = useState("");
  const [scToken, setScToken] = useState("");
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
      <div className="flex gap-1 rounded-lg border border-dash-border bg-dash-card p-1 mb-5">
        {(["stablecoin", "fiat"] as WithdrawTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === t
                ? "bg-dash-hover text-dash-foreground"
                : "text-dash-muted hover:text-dash-muted",
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
              <CheckCircle2 size={40} className="text-dash-success" />
              <p className="text-sm font-semibold text-dash-foreground">
                Withdrawal Submitted
              </p>
              <p className="text-xs text-dash-muted">
                Your stablecoin withdrawal has been submitted.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-dash-accent text-sm font-semibold text-white"
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
              <FeeNote>Fee: $1.00 (Deducted from balance)</FeeNote>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Network</Label>
                  <div className="flex h-9 items-center rounded-lg border border-dash-border bg-dash-hover px-3 text-sm text-dash-muted">
                    {scNetwork || "—"}
                  </div>
                </div>
                <div>
                  <Label>Token</Label>
                  <div className="flex h-9 items-center rounded-lg border border-dash-border bg-dash-hover px-3 text-sm text-dash-muted">
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
              <CheckCircle2 size={40} className="text-dash-success" />
              <p className="text-sm font-semibold text-dash-foreground">
                Fiat Withdrawal Submitted
              </p>
              <p className="text-xs text-dash-muted">
                Your fiat withdrawal has been submitted.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-dash-accent text-sm font-semibold text-white"
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
              <FeeNote>Fee: ₦200.00 (Deducted from balance)</FeeNote>
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
  const [countdown, setCountdown] = useState(0);
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

  // Countdown timer for quotation step — driven by quotation.expiresAt
  useEffect(() => {
    if (step !== "quotation" || !quotation) return;
    const secondsLeft = Math.max(
      0,
      Math.round((new Date(quotation.expiresAt).getTime() - Date.now()) / 1000),
    );
    setCountdown(secondsLeft);
    setTimerExpired(secondsLeft <= 0);
    if (secondsLeft <= 0) return;
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
  }, [step, quotation]);

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
        <CheckCircle2 size={40} className="text-dash-success" />
        <p className="text-sm font-semibold text-dash-foreground">
          Swap Executed!
        </p>
        <p className="text-xs text-dash-muted">
          Your swap has been successfully executed.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-dash-accent text-sm font-semibold text-white"
        >
          Done
        </button>
      </div>
    );
  }

  if (step === "quotation" && quotation) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-dash-border bg-dash-card p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-dash-muted">From</span>
            <span className="font-semibold text-dash-foreground">
              {fmt(quotation.sourceAmount)} {quotation.fromCurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dash-muted">To</span>
            <span className="font-semibold text-dash-success">
              {fmt(quotation.targetAmount)} {quotation.toCurrency}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dash-muted">Rate</span>
            <span className="font-mono text-dash-muted">{quotation.rate}</span>
          </div>
          <div className="border-t border-dash-border pt-2 flex justify-between text-sm">
            <span className="text-dash-muted">Expires in</span>
            <span
              className={cn(
                "font-mono font-semibold",
                timerExpired
                  ? "text-dash-error"
                  : countdown <= 30
                    ? "text-dash-warning"
                    : "text-dash-foreground",
              )}
            >
              {timerExpired
                ? "Expired"
                : `${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}`}
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
            className="flex h-9 w-full items-center justify-center rounded-lg border border-dash-border text-sm text-dash-muted hover:border-dash-accent transition-colors"
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
        <div className="rounded-lg border border-dash-border bg-dash-card px-3 py-2.5">
          {estimateFetching ? (
            <p className="text-xs text-dash-faint">Fetching estimate…</p>
          ) : estimate ? (
            <div className="flex justify-between text-xs">
              <span className="text-dash-muted">Estimated output</span>
              <span className="font-mono font-semibold text-dash-foreground">
                {fmt(estimate.targetAmount)} {estimate.toCurrency}
                <span className="ml-2 text-dash-faint">@ {estimate.rate}</span>
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
        <CheckCircle2 size={40} className="text-dash-success" />
        <p className="text-sm font-semibold text-dash-foreground">
          Offramp Submitted
        </p>
        <p className="text-xs text-dash-muted">
          Your offramp has been successfully submitted.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-2 flex h-9 w-full items-center justify-center rounded-lg bg-dash-accent text-sm font-semibold text-white"
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
          <div className="h-9 animate-pulse rounded-lg bg-dash-hover" />
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
      <div className="flex gap-1 rounded-lg border border-dash-border bg-dash-card p-1 mb-5">
        {(["crypto", "offramp"] as SwapModalTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === t
                ? "bg-dash-hover text-dash-foreground"
                : "text-dash-muted hover:text-dash-muted",
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
    <div className="rounded-xl border border-dash-border bg-dash-card">
      <div className="border-b border-dash-border px-5 py-4">
        <p className="text-sm font-semibold text-dash-foreground">
          Transaction History
        </p>
      </div>

      {isLoading && (
        <div className="divide-y divide-dash-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="h-4 w-16 animate-pulse rounded-full bg-dash-hover" />
              <div className="h-3 flex-1 animate-pulse rounded bg-dash-hover" />
              <div className="h-3 w-24 animate-pulse rounded bg-dash-hover" />
              <div className="h-4 w-14 animate-pulse rounded-full bg-dash-hover" />
              <div className="h-3 w-32 animate-pulse rounded bg-dash-hover" />
              <div className="h-3 w-28 animate-pulse rounded bg-dash-hover" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <AlertCircle
            size={24}
            className="text-dash-faint"
            strokeWidth={1.5}
          />
          <p className="text-sm text-dash-muted">
            Failed to load transactions.
          </p>
        </div>
      )}

      {!isLoading && !isError && txList.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ArrowLeftRight
            size={28}
            className="text-dash-faint"
            strokeWidth={1.5}
          />
          <p className="text-sm font-semibold text-dash-foreground">
            No transactions yet.
          </p>
        </div>
      )}

      {!isLoading && !isError && txList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dash-border">
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
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-dash-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txList
                .filter(
                  (tx) =>
                    tx.currency === "NGN" ||
                    ((currency === tx.asset || currency === tx.currency) &&
                      tx.currency !== "NGN"),
                )
                .map((tx) => {
                  const { value: amtValue, positive } = getAmount(tx);
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-dash-border last:border-0 hover:bg-dash-hover transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <TxTypeBadge type={tx.tx_type} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-md border border-dash-border px-2 py-0.5 font-mono text-[11px] text-dash-muted">
                          {tx.asset ?? "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "font-mono text-sm font-medium",
                            positive
                              ? "text-dash-success"
                              : "text-dash-foreground",
                          )}
                        >
                          {amtValue}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-dash-muted">
                          {truncate(tx.reference_id)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-dash-faint">
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
      <div className="border-t border-dash-border px-5 py-3">
        <Link
          href="/transactions"
          className="text-xs text-dash-accent hover:underline"
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
    <div className="rounded-xl border border-dash-border bg-dash-card">
      <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
        <p className="text-sm font-semibold text-dash-foreground">Swaps</p>
        <button
          type="button"
          onClick={onNewSwap}
          className="flex h-8 items-center gap-1.5 rounded-lg bg-dash-accent px-3 text-xs font-semibold text-white hover:brightness-110 transition-all"
        >
          <ArrowLeftRight size={12} /> New Swap
        </button>
      </div>

      {isLoading && (
        <div className="divide-y divide-dash-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="h-3 flex-1 animate-pulse rounded bg-dash-hover" />
              <div className="h-3 w-20 animate-pulse rounded bg-dash-hover" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && rawList.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ArrowLeftRight
            size={28}
            className="text-dash-faint"
            strokeWidth={1.5}
          />
          <p className="text-sm font-semibold text-dash-foreground">
            No swaps yet.
          </p>
          <button
            type="button"
            onClick={onNewSwap}
            className="mt-1 text-xs text-dash-accent hover:underline"
          >
            Create your first swap
          </button>
        </div>
      )}

      {!isLoading && rawList.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dash-border">
                {["From", "To", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-dash-faint"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rawList.map((swap, idx) => {
                const s = swap as Record<string, unknown>;
                const fromAmt = s.source_amount;
                const fromCur = s.from_currency;
                const toAmt = s.target_amount;
                const toCur = s.to_currency;
                const status = String(s.status ?? "—");
                const createdAt = String(s.created_at ?? s.createdAt ?? "");
                return (
                  <tr
                    key={String(s.id ?? idx)}
                    className="border-b border-dash-border last:border-0 hover:bg-dash-hover transition-colors"
                  >
                    <td className="px-5 py-3.5 text-dash-foreground">
                      {fromAmt != null ? fmt(Number(fromAmt)) : "—"}{" "}
                      <span className="text-dash-muted">
                        {String(fromCur ?? "")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-dash-success">
                      {toAmt != null ? fmt(Number(toAmt)) : "—"}{" "}
                      <span className="text-dash-muted">
                        {String(toCur ?? "")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-dash-faint">
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
                  className="h-9 appearance-none rounded-lg border border-dash-border bg-dash-card pl-3 pr-8 text-sm font-medium text-dash-muted hover:border-dash-accent focus:border-dash-accent focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="NGN">NGN</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dash-faint"
                />
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-muted hover:border-dash-accent hover:text-dash-foreground transition-colors"
              >
                <Download size={13} /> Export CSV
              </button>
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-muted hover:border-dash-accent hover:text-dash-foreground transition-colors"
              >
                <ArrowDownToLine size={13} /> Deposit
              </button>
              <button
                type="button"
                onClick={() => setSwapOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-muted hover:border-dash-accent hover:text-dash-foreground transition-colors"
              >
                <ArrowLeftRight size={13} /> Swap
              </button>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-dash-accent px-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
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
          <div className="flex items-center border-b border-dash-border gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.value
                    ? "border-dash-accent text-dash-foreground"
                    : "border-transparent text-dash-muted hover:text-dash-muted",
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
