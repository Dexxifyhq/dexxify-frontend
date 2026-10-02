"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Download,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  ListFilter,
  Receipt,
  Search,
  Loader2,
  AlertCircle,
  Lock,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import DepositModal from "@/components/dashboard/balance/DepositModal";
import SwapModal from "@/components/dashboard/balance/SwapModal";
import WithdrawModal from "@/components/dashboard/balance/WithdrawModal";
import { AssetLogo } from "@/components/dashboard/balance/modal-kit";
import FilterDropdown from "@/components/dashboard/shared/FilterDropdown";
import { cn } from "@/utils/utils";
import { useAuth } from "@/lib/context/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  useLedgerBalance,
  useLedgerTransactions,
} from "@/lib/hooks/ledger/useLedger";
import { useSwapList } from "@/lib/hooks/swaps/useSwaps";
import type {
  LedgerTransaction,
  LedgerTxType,
  LedgerEntryStatus,
} from "@/lib/types/ledger";

// ── Config ───────────────────────────────────────────────────────────────────

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

// Direction glyph for each entry type: money in, money out, or moved across.
const TX_TYPE_ICON: Record<LedgerTxType, React.ElementType> = {
  deposit: ArrowDownLeft,
  onramp: ArrowDownLeft,
  refund: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  offramp: ArrowUpRight,
  payout: ArrowUpRight,
  fee: Receipt,
  transfer: ArrowRightLeft,
  swap: ArrowLeftRight,
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined) {
  return Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


// ── Shared badge components ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: LedgerEntryStatus | string }) {
  const cfg = STATUS_CFG[status as LedgerEntryStatus] ?? {
    label: status,
    cls: "bg-dash-hover text-dash-muted border-dash-border",
  };
  // Borderless pill — the tint carries the status.
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}


// ── History tab ───────────────────────────────────────────────────────────────

// Each ledger entry moves one currency; these map it to its credit/debit
// columns and its symbol.
const LEDGER_LEGS = [
  { code: "NGN", credit: "credit_ngn", debit: "debit_ngn", symbol: "₦" },
  { code: "USDT", credit: "credit_usdt", debit: "debit_usdt", symbol: "$" },
  { code: "USDC", credit: "credit_usdc", debit: "debit_usdc", symbol: "$" },
] as const;

// The entry's own currency decides which columns hold its amount; if the
// currency field is missing, fall back to whichever leg actually moved.
function legOf(tx: LedgerTransaction) {
  return (
    LEDGER_LEGS.find((l) => l.code === tx.currency?.toUpperCase()) ??
    LEDGER_LEGS.find(
      (l) => Number(tx[l.credit]) > 0 || Number(tx[l.debit]) > 0,
    )
  );
}

function amountOf(tx: LedgerTransaction) {
  const leg = legOf(tx);
  if (!leg) return null;
  const credit = Number(tx[leg.credit]);
  const debit = Number(tx[leg.debit]);
  if (credit > 0) return { sign: "+", value: credit, leg, positive: true };
  if (debit > 0) return { sign: "-", value: debit, leg, positive: false };
  return null;
}

// Searches the reference, the entry id and an on-chain hash when metadata
// carries one.
function matchesSearch(tx: LedgerTransaction, q: string) {
  const meta = (tx.metadata ?? {}) as Record<string, unknown>;
  return [tx.reference_id, tx.id, meta.tx_hash, meta.hash]
    .filter((v): v is string => typeof v === "string")
    .some((v) => v.toLowerCase().includes(q));
}

function shortRef(s: string) {
  return s && s.length > 10 ? `${s.slice(0, 10)}...` : s;
}

function fmtShortDate(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-dash-border bg-dash-card pl-10 pr-3 text-sm text-dash-foreground transition-colors placeholder:text-dash-muted focus:border-tone-blue focus:outline-none sm:w-72"
      />
    </div>
  );
}

const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  ...(Object.keys(TX_TYPE_CFG) as LedgerTxType[]).map((t) => ({
    value: t,
    label: TX_TYPE_CFG[t].label,
  })),
];
const CURRENCY_OPTIONS = [
  { value: "all", label: "All Currencies" },
  ...LEDGER_LEGS.map((l) => ({ value: l.code, label: l.code })),
];
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  ...(Object.keys(STATUS_CFG) as LedgerEntryStatus[]).map((s) => ({
    value: s,
    label: STATUS_CFG[s].label,
  })),
];

function HistoryTab({
  txRef,
}: {
  txRef: React.RefObject<LedgerTransaction[]>;
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [status, setStatus] = useState("all");

  // Type is filtered by the API; currency, status and search apply to the
  // page that comes back (the endpoint doesn't take them).
  const { data, isLoading, isError } = useLedgerTransactions({
    limit: 20,
    ...(type !== "all" ? { tx_type: type as LedgerTxType } : {}),
  });
  const txList: LedgerTransaction[] = data?.data ?? [];

  // Keep ref updated for CSV export
  useEffect(() => {
    if (txList.length > 0) {
      txRef.current = txList;
    }
  }, [txList, txRef]);

  const q = search.trim().toLowerCase();
  const rows = txList.filter(
    (tx) =>
      (currency === "all" || legOf(tx)?.code === currency) &&
      (status === "all" || tx.status === status) &&
      (!q || matchesSearch(tx, q)),
  );
  const filtering = !!q || type !== "all" || currency !== "all" || status !== "all";

  const COLS = ["Reference", "Type", "Amount", "Status", "Date"];

  return (
    <div className="rounded-2xl border border-dash-border bg-dash-card">
      {/* Title + filters */}
      <div className="flex flex-col gap-4 px-5 pb-2 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-lg font-semibold text-dash-foreground">
          Balance History
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by reference or hash..."
          />
          <FilterDropdown label="Type" value={type} onChange={setType} options={TYPE_OPTIONS} />
          <FilterDropdown label="Currency" value={currency} onChange={setCurrency} options={CURRENCY_OPTIONS} />
          <FilterDropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>
      </div>

      {isLoading && (
        <div className="divide-y divide-dash-border px-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-5">
              <div className="h-4 w-28 animate-pulse rounded bg-dash-hover" />
              <div className="h-6 w-24 animate-pulse rounded-md bg-dash-hover" />
              <div className="h-4 w-20 animate-pulse rounded bg-dash-hover" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-dash-hover" />
              <div className="h-4 w-28 animate-pulse rounded bg-dash-hover" />
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

      {!isLoading && !isError && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <ArrowLeftRight
            size={28}
            className="text-dash-faint"
            strokeWidth={1.5}
          />
          <p className="text-sm font-semibold text-dash-foreground">
            {filtering
              ? "No transactions match your filters."
              : "No transactions yet."}
          </p>
        </div>
      )}

      {!isLoading && !isError && rows.length > 0 && (
        <div className="overflow-x-auto px-5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dash-border">
                {COLS.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap py-4 pr-6 text-sm font-normal text-dash-muted last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => {
                const amt = amountOf(tx);
                const typeCfg = TX_TYPE_CFG[tx.tx_type];
                const TypeIcon = TX_TYPE_ICON[tx.tx_type] ?? ArrowLeftRight;
                return (
                  <tr
                    key={tx.id}
                    className="border-b border-dash-border last:border-0"
                  >
                    <td className="whitespace-nowrap py-5 pr-6">
                      <span
                        title={tx.reference_id}
                        className="font-mono text-sm text-dash-foreground"
                      >
                        {shortRef(tx.reference_id)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-5 pr-6">
                      <span className="inline-flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md",
                            typeCfg?.cls ?? "bg-dash-hover text-dash-muted",
                          )}
                        >
                          <TypeIcon size={14} />
                        </span>
                        <span className="text-sm font-medium text-dash-foreground">
                          {typeCfg?.label ?? tx.tx_type}
                        </span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-5 pr-6">
                      {amt ? (
                        <span
                          className={cn(
                            "text-[15px] font-semibold",
                            amt.positive
                              ? "text-dash-success"
                              : "text-dash-foreground",
                          )}
                        >
                          {amt.sign}
                          {amt.leg.symbol}
                          {fmt(amt.value)}
                          {amt.leg.code !== "NGN" && (
                            <span className="ml-1 text-xs font-normal text-dash-muted">
                              {amt.leg.code}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-dash-faint">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-5 pr-6">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="whitespace-nowrap py-5 text-sm text-dash-muted">
                      {fmtShortDate(tx.created_at)}
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

// /swaps returns an untyped list; these read the fields the old table used.
function swapFields(swap: unknown, idx: number) {
  const s = swap as Record<string, unknown>;
  const num = (v: unknown) => (v != null && v !== "" ? Number(v) : null);
  return {
    id: String(s.id ?? idx),
    fromAmount: num(s.source_amount),
    fromCurrency: String(s.from_currency ?? ""),
    toAmount: num(s.target_amount),
    toCurrency: String(s.to_currency ?? ""),
    status: String(s.status ?? "—"),
    createdAt: String(s.created_at ?? s.createdAt ?? ""),
  };
}

function SwapLeg({
  amount,
  currency,
  positive,
}: {
  amount: number | null;
  currency: string;
  positive?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {currency && <AssetLogo symbol={currency} className="h-6 w-6" />}
      <span
        className={cn(
          "text-[15px] font-semibold",
          positive ? "text-dash-success" : "text-dash-foreground",
        )}
      >
        {amount != null ? fmt(amount) : "—"}
      </span>
      <span className="text-xs text-dash-muted">{currency}</span>
    </span>
  );
}

function SwapsTab() {
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("all");
  const { data, isLoading } = useSwapList();

  const rawList =
    (data as unknown as { data?: unknown[] })?.data ??
    (Array.isArray(data) ? (data as unknown[]) : []);

  // Search and currency apply to the page that comes back.
  const q = search.trim().toLowerCase();
  const rows = rawList
    .map(swapFields)
    .filter(
      (s) =>
        (currency === "all" ||
          s.fromCurrency.toUpperCase() === currency ||
          s.toCurrency.toUpperCase() === currency) &&
        (!q || s.id.toLowerCase().includes(q)),
    );

  return (
    <div className="rounded-2xl border border-dash-border bg-dash-card">
      {/* Title + filters */}
      <div className="flex flex-col gap-4 px-5 pb-2 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-lg font-semibold text-dash-foreground">
          Swap History
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by ID..."
          />
          <FilterDropdown
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={CURRENCY_OPTIONS}
          />
        </div>
      </div>

      {isLoading && (
        <div className="divide-y divide-dash-border px-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-5">
              <div className="h-4 w-24 animate-pulse rounded bg-dash-hover" />
              <div className="h-6 w-28 animate-pulse rounded bg-dash-hover" />
              <div className="h-6 w-28 animate-pulse rounded bg-dash-hover" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-dash-hover" />
              <div className="h-4 w-28 animate-pulse rounded bg-dash-hover" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <ListFilter
            size={32}
            strokeWidth={1.5}
            className="text-dash-border-strong"
          />
          <p className="text-sm text-dash-muted">
            No swap transactions found.
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="overflow-x-auto px-5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dash-border">
                {["ID", "From", "To", "Status", "Date"].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap py-4 pr-6 text-sm font-normal text-dash-muted last:pr-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-dash-border last:border-0"
                >
                  <td className="whitespace-nowrap py-5 pr-6">
                    <span
                      title={s.id}
                      className="font-mono text-sm text-dash-foreground"
                    >
                      {shortRef(s.id)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-5 pr-6">
                    <SwapLeg amount={s.fromAmount} currency={s.fromCurrency} />
                  </td>
                  <td className="whitespace-nowrap py-5 pr-6">
                    <SwapLeg
                      amount={s.toAmount}
                      currency={s.toCurrency}
                      positive
                    />
                  </td>
                  <td className="whitespace-nowrap py-5 pr-6">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="whitespace-nowrap py-5 text-sm text-dash-muted">
                    {s.createdAt ? fmtShortDate(s.createdAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Wallet cards ─────────────────────────────────────────────────────────────

const WALLETS: {
  code: string;
  key: "ngn" | "usdt" | "usdc";
  name: string;
  symbol: string;
  icon: string;
}[] = [
  { code: "NGN", key: "ngn", name: "Nigerian Naira", symbol: "₦", icon: "/currency/ngn.svg" },
  { code: "USDT", key: "usdt", name: "Tether", symbol: "$", icon: "/crypto/usdt.svg" },
  { code: "USDC", key: "usdc", name: "USD Coin", symbol: "$", icon: "/crypto/usdc.svg" },
];

// One card per currency, showing what's available in it. Display only —
// History below lists every currency's movements.
function WalletCard({
  wallet,
  balance,
  loading,
}: {
  wallet: (typeof WALLETS)[number];
  balance: number | undefined;
  loading: boolean;
}) {
  return (
    <div className="flex h-full flex-col gap-5 rounded-2xl border border-dash-border bg-dash-card p-5">
      {/* Currency */}
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- static currency mark */}
        <img src={wallet.icon} alt="" className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-dash-foreground">
            {wallet.code}
          </p>
          <p className="truncate text-xs text-dash-faint">{wallet.name}</p>
        </div>
      </div>

      {/* Balance */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
          Available
        </p>
        {loading ? (
          <div className="mt-1.5 h-8 w-36 animate-pulse rounded bg-dash-hover" />
        ) : (
          // Small, light currency symbol on the baseline; the figure carries
          // the weight.
          <p className="mt-1 flex items-baseline gap-1 leading-tight text-dash-foreground">
            <span className="text-base font-normal text-dash-muted">
              {wallet.symbol}
            </span>
            <span className="text-[28px] font-medium tracking-tight">
              {fmt(balance)}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BalancePage() {
  const { role, isLoading: roleLoading } = useAuth();

  if (roleLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={20} className="animate-spin text-dash-muted" />
      </div>
    );
  }

  if (!hasPermission(role, PERMISSIONS.MANAGE_BALANCE)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dash-border bg-dash-card py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dash-hover text-dash-muted">
          <Lock size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-dash-foreground">
            Access restricted
          </p>
          <p className="mt-1 text-xs text-dash-muted">
            Your role doesn&apos;t have permission to view the business balance.
          </p>
        </div>
      </div>
    );
  }

  return <BalancePageContent />;
}

function BalancePageContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("history");
  const [depositOpen, setDepositOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Keep last-fetched tx list for CSV export (avoids re-fetching)
  const txRef = useRef<LedgerTransaction[]>([]);

  const { data: balance, isLoading: balanceLoading } = useLedgerBalance();

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
    { label: "Balance history", value: "history" },
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
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex h-11 items-center gap-2 rounded-xl border border-dash-border bg-dash-card px-4 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-bg"
              >
                <Download size={15} className="text-dash-muted" /> Export CSV
              </button>
              <button
                type="button"
                onClick={() => setDepositOpen(true)}
                className="flex h-11 items-center gap-2 rounded-xl border border-dash-border bg-dash-card px-4 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-bg"
              >
                <ArrowDownToLine size={15} className="text-dash-muted" /> Deposit
              </button>
              <button
                type="button"
                onClick={() => setSwapOpen(true)}
                className="flex h-11 items-center gap-2 rounded-xl border border-dash-border bg-dash-card px-4 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-bg"
              >
                <ArrowLeftRight size={15} className="text-dash-muted" /> Swap
              </button>
              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                className="flex h-11 items-center gap-2 rounded-xl bg-dash-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover"
              >
                <ArrowUpFromLine size={15} /> Withdraw
              </button>
            </>
          }
        />

        {/* Wallets — one card per currency. On phones they sit in a row
            that scrolls sideways (snapping card by card), like the action
            buttons above; from md up they're a three-column grid. The 4px
            padding keeps card shadows from being clipped by the scroller. */}
        <div className="-m-1 flex snap-x snap-mandatory gap-4 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {WALLETS.map((w) => (
            <div key={w.code} className="w-[78%] shrink-0 snap-start md:w-auto">
              <WalletCard
                wallet={w}
                balance={balance?.[w.key].balance}
                loading={balanceLoading}
              />
            </div>
          ))}
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
              <HistoryTab txRef={txRef} />
            )}
            {activeTab === "swaps" && (
              <SwapsTab />
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
