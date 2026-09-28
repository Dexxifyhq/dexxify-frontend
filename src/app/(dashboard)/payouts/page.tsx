"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  ChevronRight,
  X,
  Copy,
  Check,
  Loader2,
  Lock,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";
import { usePayouts, usePayout } from "@/lib/hooks/payouts/usePayouts";
import type { Payout, PayoutStatus } from "@/lib/types/payouts";
import { useAuth } from "@/lib/context/AuthContext";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

// ── Config ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<PayoutStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-dash-warning-bg text-dash-warning" },
  processing: {
    label: "Processing",
    cls: "bg-dash-accent-soft text-dash-accent",
  },
  completed: {
    label: "Completed",
    cls: "bg-dash-success-bg text-dash-success",
  },
  failed: { label: "Failed", cls: "bg-dash-error-bg text-dash-error" },
};

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status as PayoutStatus] ?? {
    label: status,
    cls: "bg-dash-hover text-dash-muted",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

function truncate(s: string, n = 16) {
  return s.length > n ? `${s.slice(0, 6)}…${s.slice(-6)}` : s;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Payout Drawer ────────────────────────────────────────────────────────────
// Fetches the individual payout fresh via GET /payouts/{id} rather than
// reusing the row from the list — the list and detail come from separate
// backend calls.

function PayoutDrawer({
  payoutId,
  onClose,
}: {
  payoutId: string;
  onClose: () => void;
}) {
  const { data: payout, isLoading } = usePayout(payoutId);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-dash-border bg-dash-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-dash-muted" />
            <span className="text-sm font-semibold text-dash-foreground">
              Payout Details
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {isLoading || !payout ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-dash-faint" />
          </div>
        ) : (
          <div className="flex flex-col gap-5 p-5">
            {/* Status + amount hero */}
            <div className="rounded-xl border border-dash-border bg-dash-card px-4 py-4 text-center">
              <StatusBadge status={payout.status} />
              <p className="mt-2 font-mono text-2xl font-bold text-dash-foreground">
                {payout.amount.toLocaleString()}
                <span className="ml-1.5 text-sm font-normal text-dash-muted">
                  {payout.currency}
                </span>
              </p>
              {payout.fee > 0 && (
                <p className="mt-0.5 text-xs text-dash-faint">
                  Fee: {payout.fee.toLocaleString()} {payout.currency}
                </p>
              )}
            </div>

            {payout.status === "failed" && payout.failure_reason && (
              <div className="rounded-lg border border-dash-error-border bg-dash-error-bg px-3 py-2.5">
                <p className="text-xs font-medium text-dash-error">
                  Failure reason
                </p>
                <p className="mt-0.5 text-xs text-dash-error">
                  {payout.failure_reason}
                </p>
              </div>
            )}

            {/* Bank details */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                Recipient
              </p>
              <div className="flex flex-col gap-2 rounded-lg border border-dash-border bg-dash-card px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-dash-faint">Account Name</span>
                  <span className="text-right text-xs text-dash-muted">
                    {payout.account_name ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-dash-faint">
                    Account Number
                  </span>
                  <span className="text-right font-mono text-xs text-dash-muted">
                    {payout.account_number ?? "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-dash-faint">Bank Code</span>
                  <span className="text-right font-mono text-xs text-dash-muted">
                    {payout.bank_code ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Reference details */}
            <div className="flex flex-col gap-3">
              {[
                { key: "id", label: "Payout ID", value: payout.id },
                {
                  key: "provider_reference",
                  label: "Provider Reference",
                  value: payout.provider_reference,
                },
                {
                  key: "provider_payout_id",
                  label: "Provider Payout ID",
                  value: payout.provider_payout_id,
                },
              ]
                .filter((r) => r.value)
                .map(({ key, label, value }) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="shrink-0 text-xs text-dash-faint">
                      {label}
                    </span>
                    <button
                      onClick={() => copy(key, value as string)}
                      className="flex items-center gap-1.5 text-right font-mono text-xs text-dash-muted hover:text-dash-foreground transition-colors"
                    >
                      <span className="break-all">{value}</span>
                      {copied === key ? (
                        <Check
                          size={11}
                          className="shrink-0 text-dash-success"
                        />
                      ) : (
                        <Copy size={11} className="shrink-0" />
                      )}
                    </button>
                  </div>
                ))}
              <div className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-xs text-dash-faint">
                  Created
                </span>
                <span className="text-right text-xs text-dash-muted">
                  {fmtDateTime(payout.created_at)}
                </span>
              </div>
              {payout.completed_at && (
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-xs text-dash-faint">
                    Completed
                  </span>
                  <span className="text-right text-xs text-dash-muted">
                    {fmtDateTime(payout.completed_at)}
                  </span>
                </div>
              )}
            </div>

            {/* Narration */}
            {payout.narration && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                  Narration
                </p>
                <p className="rounded-lg border border-dash-border bg-dash-card px-3 py-2 text-xs text-dash-muted">
                  {payout.narration}
                </p>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PayoutsPage() {
  const { role, isLoading: roleLoading } = useAuth();

  if (roleLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={20} className="animate-spin text-dash-muted" />
      </div>
    );
  }

  if (!hasPermission(role, PERMISSIONS.WITHDRAW_BANK)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dash-border bg-dash-card py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dash-hover text-dash-muted">
          <Lock size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-dash-foreground">
            Access restricted
          </p>
          <p className="mt-1 text-xs text-dash-muted">
            Your role doesn&apos;t have permission to view payouts.
          </p>
        </div>
      </div>
    );
  }

  return <PayoutsPageContent />;
}

function PayoutsPageContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: raw, isLoading } = usePayouts();

  // TransformInterceptor may hand back the bare array or { data: [...] }.
  const payouts: Payout[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.data)
      ? (raw as any).data
      : [];

  const filtered = payouts.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.provider_reference?.toLowerCase().includes(q) ||
      p.account_number?.toLowerCase().includes(q) ||
      p.account_name?.toLowerCase().includes(q)
    );
  });

  const total = payouts.length;
  const completed = payouts.filter((p) => p.status === "completed").length;
  const pending = payouts.filter(
    (p) => p.status === "pending" || p.status === "processing",
  ).length;
  const failed = payouts.filter((p) => p.status === "failed").length;

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payouts"
          description="View the status and history of your bank payouts."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={String(total)}
            icon={<Send size={15} />}
          />
          <StatCard
            label="Completed"
            value={String(completed)}
            icon={<CheckCircle2 size={15} />}
          />
          <StatCard
            label="Pending"
            value={String(pending)}
            icon={<Clock size={15} />}
          />
          <StatCard
            label="Failed"
            value={String(failed)}
            icon={<XCircle size={15} />}
          />
        </div>

        <section className="rounded-xl border border-dash-border bg-dash-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-dash-border px-5 py-4">
            <h2 className="text-sm font-semibold text-dash-foreground">
              All Payouts
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID, reference, or account…"
                  className="h-9 w-72 rounded-lg border border-dash-border bg-dash-card pl-9 pr-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
                />
              </div>
              <FilterSelect
                label="All Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
              />
            </div>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-dash-faint" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Send size={28} strokeWidth={1.5} />}
              description="No payouts found matching your criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dash-border">
                    {[
                      "Payout ID",
                      "Amount",
                      "Recipient",
                      "Status",
                      "Date",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-dash-faint"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className="cursor-pointer transition-colors hover:bg-dash-hover"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-dash-muted">
                        {truncate(p.provider_reference ?? p.id)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-dash-foreground">
                          {p.amount.toLocaleString()}
                          <span className="ml-1 text-dash-faint">
                            {p.currency}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-dash-muted">
                        {p.account_name || p.account_number
                          ? `${p.account_name} - ${p.account_number}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-dash-faint">
                        {fmtDate(p.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight size={14} className="text-dash-faint" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedId && (
        <PayoutDrawer
          payoutId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
