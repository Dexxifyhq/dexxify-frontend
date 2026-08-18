"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ChevronRight,
  X,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  ArrowUpLeft,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";
import { useRefunds, useRefundSession } from "@/lib/hooks/refunds/useRefunds";
import type { Refund, RefundStatus, RefundFeePaidBy, CreateRefundDto } from "@/lib/types/refunds";

// ── Config ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<RefundStatus, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-dash-warning-bg text-dash-warning" },
  processing: { label: "Processing", cls: "bg-dash-accent-soft text-dash-accent" },
  completed:  { label: "Completed",  cls: "bg-dash-success-bg text-dash-success" },
  failed:     { label: "Failed",     cls: "bg-dash-error-bg text-dash-error" },
};

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending",    value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed",  value: "completed" },
  { label: "Failed",     value: "failed" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status as RefundStatus] ?? { label: status, cls: "bg-dash-hover text-dash-muted" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function truncate(s: string, n = 16) {
  return s.length > n ? `${s.slice(0, 6)}…${s.slice(-6)}` : s;
}

// ── Create Refund Modal ────────────────────────────────────────────────────

const inputCls =
  "h-9 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
        <span>{label}{required && <span className="ml-0.5 text-dash-error">*</span>}</span>
        {hint && <span className="text-[10px] normal-case text-dash-faint">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function CreateRefundModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const refundSession = useRefundSession();

  const [sessionRef, setSessionRef] = useState("");
  const [refundAddress, setRefundAddress] = useState("");
  const [reason, setReason] = useState("");
  const [feePaidBy, setFeePaidBy] = useState<RefundFeePaidBy | "">("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSessionRef(""); setRefundAddress(""); setReason(""); setFeePaidBy(""); setError(null);
    refundSession.reset();
  };

  if (!open) return null;

  const canSubmit = sessionRef.trim() !== "" && refundAddress.trim() !== "" && !refundSession.isPending;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);

    const dto: CreateRefundDto = {
      refundAddress: refundAddress.trim(),
      ...(reason.trim() ? { reason: reason.trim() } : {}),
      ...(feePaidBy ? { feePaidBy: feePaidBy as RefundFeePaidBy } : {}),
    };

    refundSession.mutate(
      { sessionReference: sessionRef.trim(), dto },
      {
        onSuccess: () => { reset(); onClose(); },
        onError: (err: any) =>
          setError(err?.message ?? "Failed to initiate refund. Please try again."),
      },
    );
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { reset(); onClose(); }} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dash-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-dash-foreground">Initiate Refund</h2>
            <p className="mt-0.5 text-xs text-dash-muted">Refund a completed payment session to a customer wallet.</p>
          </div>
          <button type="button" onClick={() => { reset(); onClose(); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <Field label="Session Reference" required>
            <input type="text" value={sessionRef} onChange={(e) => setSessionRef(e.target.value)}
              placeholder="CS_xxxxxxxxxxxxxxxx" className={inputCls} required />
          </Field>

          <Field label="Refund Address" required hint="Customer wallet">
            <input type="text" value={refundAddress} onChange={(e) => setRefundAddress(e.target.value)}
              placeholder="0x... or T..." className={inputCls} required />
          </Field>

          <Field label="Reason" hint="Optional">
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Customer requested refund"
              className="w-full resize-none rounded-lg border border-dash-border bg-dash-card px-3 py-2 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors" />
          </Field>

          <Field label="Fee Paid By" hint="Optional">
            <select value={feePaidBy} onChange={(e) => setFeePaidBy(e.target.value as RefundFeePaidBy | "")}
              className="h-9 w-full appearance-none rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground focus:border-dash-accent focus:outline-none transition-colors">
              <option value="">Use default</option>
              <option value="merchant">Merchant</option>
              <option value="customer">Customer</option>
            </select>
          </Field>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-dash-error-border bg-dash-error-bg px-3 py-2.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0 text-dash-error" />
              <p className="text-xs text-dash-error">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-dash-border pt-4">
            <button type="button" onClick={() => { reset(); onClose(); }}
              className="h-9 rounded-lg border border-dash-border px-4 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!canSubmit}
              className="flex h-9 items-center gap-2 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors">
              {refundSession.isPending && <Loader2 size={13} className="animate-spin" />}
              {refundSession.isPending ? "Processing…" : "Initiate Refund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Refund Drawer ──────────────────────────────────────────────────────────

function RefundDrawer({ refund, onClose }: { refund: Refund; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-dash-border bg-dash-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ArrowUpLeft size={16} className="text-dash-muted" />
            <span className="text-sm font-semibold text-dash-foreground">Refund Details</span>
          </div>
          <button onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Status + amount hero */}
          <div className="rounded-xl border border-dash-border bg-dash-card px-4 py-4 text-center">
            <StatusBadge status={refund.status} />
            {refund.amount && refund.asset && (
              <p className="mt-2 font-mono text-2xl font-bold text-dash-foreground">
                {refund.amount}
                <span className="ml-1.5 text-sm font-normal text-dash-muted">{refund.asset}</span>
              </p>
            )}
            {refund.chain && (
              <p className="mt-0.5 text-xs text-dash-faint">{refund.chain}</p>
            )}
          </div>

          {/* Details grid */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Reference",         value: refund.reference },
              { label: "Session Reference", value: refund.sessionReference },
              { label: "Fee",               value: refund.fee ? `${refund.fee} ${refund.asset ?? ""}` : null },
              { label: "Fee Paid By",       value: refund.feePaidBy },
              { label: "Created",           value: refund.createdAt ? fmt(refund.createdAt) : null },
              { label: "Updated",           value: refund.updatedAt ? fmt(refund.updatedAt) : null },
            ].filter((r) => r.value).map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-xs text-dash-faint">{label}</span>
                <span className="text-right font-mono text-xs text-dash-muted break-all">{value}</span>
              </div>
            ))}
          </div>

          {/* Refund address */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
              Refund Address
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-dash-border bg-dash-card px-3 py-2">
              <span className="flex-1 break-all font-mono text-xs text-dash-muted">
                {refund.refundAddress}
              </span>
              <button onClick={() => copy(refund.refundAddress)}
                className="shrink-0 text-dash-faint hover:text-dash-foreground transition-colors">
                {copied ? <Check size={13} className="text-dash-success" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          {/* Reason */}
          {refund.reason && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">Reason</p>
              <p className="rounded-lg border border-dash-border bg-dash-card px-3 py-2 text-xs text-dash-muted">
                {refund.reason}
              </p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function RefundsPage() {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected]   = useState<Refund | null>(null);

  const { data: raw, isLoading } = useRefunds(
    status !== "all" ? { status: status as RefundStatus } : {},
  );

  // CC passthrough: response may be { data: [...] } or [...] directly
  const refunds: Refund[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as any)?.data)
    ? (raw as any).data
    : [];

  const filtered = refunds.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.reference?.toLowerCase().includes(q) ||
      r.sessionReference?.toLowerCase().includes(q) ||
      r.refundAddress?.toLowerCase().includes(q)
    );
  });

  // Stats
  const total      = refunds.length;
  const completed  = refunds.filter((r) => r.status === "completed").length;
  const pending    = refunds.filter((r) => r.status === "pending" || r.status === "processing").length;
  const failed     = refunds.filter((r) => r.status === "failed").length;

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Refunds"
          description="View and manage your refund history."
          actions={
            <button onClick={() => setModalOpen(true)}
              className="flex h-9 items-center gap-2 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors">
              <ArrowUpLeft size={14} />
              New Refund
            </button>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total"     value={String(total)}     icon={<RotateCcw size={15} />} />
          <StatCard label="Completed" value={String(completed)} icon={<CheckCircle2 size={15} />} />
          <StatCard label="Pending"   value={String(pending)}   icon={<Clock size={15} />} />
          <StatCard label="Failed"    value={String(failed)}    icon={<XCircle size={15} />} />
        </div>

        <section className="rounded-xl border border-dash-border bg-dash-card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-dash-border px-5 py-4">
            <h2 className="text-sm font-semibold text-dash-foreground">All Refunds</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by reference or address…"
                  className="h-9 w-72 rounded-lg border border-dash-border bg-dash-card pl-9 pr-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors" />
              </div>
              <FilterSelect label="All Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />
            </div>
          </header>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-dash-faint" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<RotateCcw size={28} strokeWidth={1.5} />}
              description="No refunds found matching your criteria."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dash-border">
                    {["Reference", "Session Ref", "Amount", "Status", "Address", "Date", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border">
                  {filtered.map((r) => (
                    <tr key={r.id} onClick={() => setSelected(r)}
                      className="cursor-pointer transition-colors hover:bg-dash-hover">
                      <td className="px-4 py-3 font-mono text-xs text-dash-muted">
                        {r.reference ?? r.id?.slice(0, 12) ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dash-muted">
                        {r.sessionReference ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.amount ? (
                          <span className="font-mono text-xs text-dash-foreground">
                            {r.amount}
                            <span className="ml-1 text-dash-faint">{r.asset}</span>
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-dash-muted">
                        {r.refundAddress ? truncate(r.refundAddress) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-dash-faint">
                        {r.createdAt ? fmtDate(r.createdAt) : "—"}
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

      <CreateRefundModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {selected && <RefundDrawer refund={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
