"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";
import { useLedgerTransactions } from "@/lib/hooks/ledger/useLedger";
import type {
  LedgerTransaction,
  LedgerTxType,
  LedgerEntryStatus,
} from "@/lib/types/ledger";
import { cn } from "@/utils/utils";

// ── Config maps ─────────────────────────────────────────────────────────────

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

const TX_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Deposit", value: "deposit" },
  { label: "Withdrawal", value: "withdrawal" },
  { label: "Payout", value: "payout" },
  { label: "Fee", value: "fee" },
  { label: "Transfer", value: "transfer" },
  { label: "Swap", value: "swap" },
  { label: "Onramp", value: "onramp" },
  { label: "Offramp", value: "offramp" },
  { label: "Refund", value: "refund" },
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Initiated", value: "initiated" },
  { label: "Rejected", value: "rejected" },
  { label: "Reversed", value: "reversed" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number, decimals = 2) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function truncate(s: string, len = 18) {
  if (!s || s.length <= len) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
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

function getMainAmount(tx: LedgerTransaction): {
  value: string;
  positive: boolean;
} {
  if (Number(tx.credit_usdt) > 0) {
    return { value: `$${fmtNum(Number(tx.credit_usdt))}`, positive: true };
  }
  if (Number(tx.debit_usdt) > 0) {
    return { value: `$${fmtNum(Number(tx.debit_usdt))}`, positive: false };
  }
  if (Number(tx.credit_usdc) > 0) {
    return { value: `$${fmtNum(Number(tx.credit_usdc))}`, positive: true };
  }
  if (Number(tx.debit_usdc) > 0) {
    return { value: `$${fmtNum(Number(tx.debit_usdc))}`, positive: false };
  }
  if (Number(tx.credit_ngn) > 0) {
    return { value: `₦${fmtNum(Number(tx.credit_ngn))}`, positive: true };
  }
  if (Number(tx.debit_ngn) > 0) {
    return { value: `₦${fmtNum(Number(tx.debit_ngn))}`, positive: false };
  }
  return { value: "—", positive: false };
}

// ── Badges ───────────────────────────────────────────────────────────────────

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

function StatusBadge({ status }: { status: LedgerEntryStatus }) {
  const cfg = STATUS_CFG[status] ?? {
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

// ── Copy button ───────────────────────────────────────────────────────────────

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
      className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded text-dash-faint hover:text-dash-muted transition-colors"
    >
      {copied ? (
        <Check size={11} className="text-dash-success" />
      ) : (
        <Copy size={11} />
      )}
    </button>
  );
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-dash-border last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
        {label}
      </span>
      <div className="text-sm text-dash-foreground">{children}</div>
    </div>
  );
}

function TransactionDrawer({
  tx,
  onClose,
}: {
  tx: LedgerTransaction | null;
  onClose: () => void;
}) {
  if (!tx) return null;

  const { value: amtValue, positive } = getMainAmount(tx);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-dash-border bg-dash-bg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <TxTypeBadge type={tx.tx_type} />
            <StatusBadge status={tx.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Amount hero */}
        <div className="border-b border-dash-border px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
            Amount
          </p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold tracking-tight",
              positive ? "text-dash-success" : "text-dash-foreground",
            )}
          >
            {positive ? "+" : "−"}
            {amtValue}
          </p>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5">
          <DetailRow label="Transaction ID">
            <span className="font-mono text-xs">{tx.id}</span>
            <CopyButton value={tx.id} />
          </DetailRow>
          <DetailRow label="Reference ID">
            <span className="font-mono text-xs">{tx.reference_id}</span>
            <CopyButton value={tx.reference_id} />
          </DetailRow>
          <DetailRow label="Reference Type">
            <span className="text-dash-muted">{tx.reference_type}</span>
          </DetailRow>
          {tx.asset && (
            <DetailRow label="Asset">
              <span className="text-dash-muted">{tx.asset}</span>
            </DetailRow>
          )}
          <DetailRow label="Ledger (Debit / Credit)">
            <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-dash-border bg-dash-card p-2">
                <p className="text-dash-faint">Debit USDT</p>
                <p className="font-mono">${fmtNum(Number(tx.debit_usdt))}</p>
              </div>
              <div className="rounded-lg border border-dash-border bg-dash-card p-2">
                <p className="text-dash-faint">Credit USDT</p>
                <p className="font-mono">${fmtNum(Number(tx.credit_usdt))}</p>
              </div>
              <div className="rounded-lg border border-dash-border bg-dash-card p-2">
                <p className="text-dash-faint">Debit USDC</p>
                <p className="font-mono">${fmtNum(Number(tx.debit_usdc))}</p>
              </div>
              <div className="rounded-lg border border-dash-border bg-dash-card p-2">
                <p className="text-dash-faint">Credit USDC</p>
                <p className="font-mono">${fmtNum(Number(tx.credit_usdc))}</p>
              </div>
              <div className="rounded-lg border border-dash-border bg-dash-card p-2">
                <p className="text-dash-faint">Debit NGN</p>
                <p className="font-mono">₦{fmtNum(Number(tx.debit_ngn))}</p>
              </div>
              <div className="rounded-lg border border-dash-border bg-dash-card p-2">
                <p className="text-dash-faint">Credit NGN</p>
                <p className="font-mono">₦{fmtNum(Number(tx.credit_ngn))}</p>
              </div>
            </div>
          </DetailRow>
          {tx.description && (
            <DetailRow label="Description">
              <span className="text-dash-muted">{tx.description}</span>
            </DetailRow>
          )}
          <DetailRow label="Date">
            <span className="text-dash-muted">{fmtDate(tx.created_at)}</span>
          </DetailRow>
          {tx.metadata && Object.keys(tx.metadata).length > 0 && (
            <DetailRow label="Metadata">
              <pre className="mt-1 max-h-36 overflow-auto rounded-lg border border-dash-border bg-dash-card p-2 font-mono text-[11px] text-dash-muted">
                {JSON.stringify(tx.metadata, null, 2)}
              </pre>
            </DetailRow>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LedgerTransaction | null>(null);

  const { data, isLoading, isError } = useLedgerTransactions({
    ...(txTypeFilter !== "all"
      ? { tx_type: txTypeFilter as LedgerTxType }
      : {}),
    page,
  });
  // console.log("data", data);

  const txList: LedgerTransaction[] = data?.data ?? [];
  const meta = data?.meta;

  const handleTxTypeChange = (val: string) => {
    setTxTypeFilter(val);
    setPage(1);
  };

  const stats = useMemo(
    () => ({
      total: meta?.total ?? txList.length,
      completed: txList.filter((t) => t.status === "completed").length,
      pending: txList.filter((t) =>
        ["initiated", "pending", "processing"].includes(t.status),
      ).length,
      failed: txList.filter((t) => ["rejected", "reversed"].includes(t.status))
        .length,
    }),
    [txList, meta],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return txList.filter((tx) => {
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (!q) return true;
      return (
        tx.reference_id.toLowerCase().includes(q) ||
        (tx.asset ?? "").toLowerCase().includes(q) ||
        (tx.description ?? "").toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q)
      );
    });
  }, [txList, search, statusFilter]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Transactions"
          description="Ledger of all deposit, withdrawal, and fee activity."
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Transactions"
            value={String(stats.total)}
            icon={<ArrowLeftRight size={15} />}
          />
          <StatCard
            label="Completed"
            value={String(stats.completed)}
            icon={<CheckCircle2 size={15} />}
          />
          <StatCard
            label="Pending"
            value={String(stats.pending)}
            icon={<Clock size={15} />}
          />
          <StatCard
            label="Failed / Reversed"
            value={String(stats.failed)}
            icon={<XCircle size={15} />}
          />
        </div>

        {/* Table */}
        <section className="rounded-xl border border-dash-border bg-dash-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-dash-border px-5 py-4">
            <h2 className="text-sm font-semibold text-dash-foreground">
              All Transactions
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by reference, asset, description…"
                  className="h-9 w-72 rounded-lg border border-dash-border bg-dash-card pl-9 pr-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
                />
              </div>
              <FilterSelect
                label="All Types"
                options={TX_TYPE_OPTIONS}
                value={txTypeFilter}
                onChange={handleTxTypeChange}
              />
              <FilterSelect
                label="All Status"
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </div>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="animate-spin text-dash-faint" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <AlertCircle
                size={24}
                className="text-dash-faint"
                strokeWidth={1.5}
              />
              <p className="text-sm text-dash-muted">
                Failed to load transactions.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <ArrowLeftRight
                size={28}
                className="text-dash-faint"
                strokeWidth={1.5}
              />
              <p className="text-sm font-semibold text-dash-foreground">
                {search || txTypeFilter !== "all" || statusFilter !== "all"
                  ? "No transactions match your filters."
                  : "No transactions yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-dash-border">
                    {[
                      "Type",
                      "Asset",
                      "Amount",
                      "Status",
                      "Reference",
                      "Date",
                      "",
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
                  {filtered.map((tx) => {
                    const { value: amtValue, positive } = getMainAmount(tx);
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => setSelected(tx)}
                        className="cursor-pointer border-b border-dash-border last:border-0 hover:bg-dash-hover transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <TxTypeBadge type={tx.tx_type} />
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-md border border-dash-border px-2 py-0.5 font-mono text-[11px] font-semibold text-dash-muted">
                            {tx.asset ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={cn(
                              "font-mono text-sm font-medium",
                              positive ? "text-dash-success" : "text-dash-foreground",
                            )}
                          >
                            {amtValue !== "—" ? (positive ? "+" : "−") : ""}
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
                        <td className="px-4 py-3.5">
                          <ChevronRight size={14} className="text-dash-faint" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-between border-t border-dash-border px-5 py-3">
              <p className="text-xs text-dash-faint">
                Page {meta.page} of {meta.total_pages} &middot; {meta.total}{" "}
                total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!meta.has_prev || isLoading}
                  className="flex h-8 items-center gap-1 rounded-lg border border-dash-border px-3 text-xs font-medium text-dash-muted hover:bg-dash-hover disabled:pointer-events-none disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!meta.has_next || isLoading}
                  className="flex h-8 items-center gap-1 rounded-lg border border-dash-border px-3 text-xs font-medium text-dash-muted hover:bg-dash-hover disabled:pointer-events-none disabled:opacity-30 transition-colors"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <TransactionDrawer tx={selected} onClose={() => setSelected(null)} />
    </>
  );
}
