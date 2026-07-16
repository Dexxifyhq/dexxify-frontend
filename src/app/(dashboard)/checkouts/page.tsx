"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import CreatePaymentModal from "@/components/dashboard/checkouts/CreatePaymentModal";
import { usePaymentSessions } from "@/lib/hooks/payment-sessions/usePaymentSessions";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type SessionStatus =
  | "initiated"
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "expired"
  | "cancelled";

interface Session {
  id: string;
  reference: string;
  amount: number | null;
  currency: string;
  status: SessionStatus;
  crypto_asset: string | null;
  network: string | null;
  deposit_address: string | null;
  transaction_id: string | null;
  customer_id: string | null;
  payment_page_id: string | null;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  customer?: { first_name?: string; last_name?: string; email?: string } | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_DISPLAY: Record<
  SessionStatus,
  { label: string; className: string }
> = {
  initiated: {
    label: "Initiated",
    className: "border-[#1d3461]/60 bg-[#0f172a]/60 text-[#60A5FA]",
  },
  pending: {
    label: "Pending",
    className: "border-[#78350F]/50 bg-[#451A03]/60 text-[#F59E0B]",
  },
  processing: {
    label: "Processing",
    className: "border-[#1e3a5f]/60 bg-[#0c2340]/60 text-[#38BDF8]",
  },
  completed: {
    label: "Completed",
    className: "border-[#14532D]/50 bg-[#052E16]/60 text-[#22C55E]",
  },
  failed: {
    label: "Failed",
    className: "border-[#7f1d1d]/50 bg-[#450a0a]/60 text-[#f87171]",
  },
  expired: {
    label: "Expired",
    className: "border-[#27272A]/60 bg-[#18181B]/60 text-[#52525B]",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-[#27272A]/60 bg-[#18181B]/60 text-[#52525B]",
  },
};

function StatusBadge({ status }: { status: SessionStatus }) {
  const cfg = STATUS_DISPLAY[status] ?? STATUS_DISPLAY.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

function formatAmount(amount: number | null, currency: string) {
  if (amount == null) return "—";
  const symbol = currency?.toUpperCase() === "NGN" ? "₦" : "$";
  return `${symbol}${Number(amount).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortRef(ref: string) {
  return ref.length > 16 ? `${ref.slice(0, 16)}…` : ref;
}

// ── Detail drawer ──────────────────────────────────────────────────────────

function SessionDrawer({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const payLink = `${origin}/pay/${session.id}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Reference", value: session.reference },
    {
      label: "Amount",
      value: `${formatAmount(session.amount, session.currency)} ${session.currency?.toUpperCase()}`,
    },
    { label: "Status", value: <StatusBadge status={session.status} /> },
    {
      label: "Asset",
      value: session.crypto_asset
        ? `${session.crypto_asset} · ${session.network}`
        : "—",
    },
    {
      label: "Customer",
      value: session.customer
        ? `${session.customer.first_name ?? ""} ${session.customer.last_name ?? ""}`.trim() ||
          session.customer.email ||
          "—"
        : "—",
    },
    {
      label: "Deposit Address",
      value: session.deposit_address ? (
        <span className="break-all font-mono text-[11px]">
          {session.deposit_address}
        </span>
      ) : (
        "—"
      ),
    },
    { label: "Created", value: formatDate(session.created_at) },
    { label: "Expires", value: formatDate(session.expires_at) },
    { label: "Completed", value: formatDate(session.completed_at) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1C1C1F] px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-[#FAFAFA]">
                {shortRef(session.reference)}
              </p>
              <StatusBadge status={session.status} />
            </div>
            <p className="mt-0.5 text-xs text-[#71717A]">
              {formatDate(session.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Amount highlight */}
        <div className="border-b border-[#1C1C1F] px-5 py-5 text-center">
          <p className="text-3xl font-bold text-[#FAFAFA]">
            {formatAmount(session.amount, session.currency)}
          </p>
          <p className="mt-0.5 text-xs text-[#71717A]">
            {session.currency?.toUpperCase()}
            {session.crypto_asset && (
              <>
                {" "}
                · {session.crypto_asset} on {session.network}
              </>
            )}
          </p>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col divide-y divide-[#1C1C1F] rounded-xl border border-[#1C1C1F]">
            {rows.map(({ label, value }) => (
              <li key={label} className="flex items-start gap-3 px-4 py-3">
                <span className="w-28 shrink-0 pt-0.5 text-xs text-[#71717A]">
                  {label}
                </span>
                <span className="min-w-0 flex-1 text-xs font-medium text-[#FAFAFA]">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-[#1C1C1F] px-5 py-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 py-2">
            <span className="flex-1 truncate font-mono text-xs text-[#71717A]">
              {payLink}
            </span>
            <button
              type="button"
              onClick={() => copy(payLink, "link")}
              className="shrink-0 text-[#52525B] hover:text-[#FAFAFA] transition-colors"
            >
              {copied === "link" ? (
                <Check size={13} className="text-[#22C55E]" />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
          <a
            href={payLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#1C1C1F] text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <ExternalLink size={13} />
            Open payment link
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const STATUS_FILTER = [
  { label: "All", value: "all" },
  { label: "Initiated", value: "initiated" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Expired", value: "expired" },
  { label: "Cancelled", value: "cancelled" },
];

export default function CheckoutsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Session | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading, isError } = usePaymentSessions();

  const allSessions: Session[] = Array.isArray(data)
    ? data
    : ((data as any)?.data ?? []);

  // Stats
  const total = allSessions.length;
  const completed = allSessions.filter((s) => s.status === "completed").length;
  const pending = allSessions.filter(
    (s) =>
      s.status === "pending" ||
      s.status === "initiated" ||
      s.status === "processing",
  ).length;
  const failed = allSessions.filter(
    (s) =>
      s.status === "failed" ||
      s.status === "expired" ||
      s.status === "cancelled",
  ).length;

  // Filter
  const filtered = allSessions.filter((s) => {
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.reference.toLowerCase().includes(q) ||
      s.deposit_address?.toLowerCase().includes(q) ||
      s.transaction_id?.toLowerCase().includes(q) ||
      s.crypto_asset?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const copyLink = (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/pay/${session.id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(session.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Payment link copied.");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Checkout Sessions"
        description="One-time payment links you've generated for customers."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
          >
            <Plus size={15} />
            New Payment
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={String(total)}
          icon={<FileText size={15} />}
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
          label="Failed / Expired"
          value={String(failed)}
          icon={<XCircle size={15} />}
        />
      </div>

      {/* Table */}
      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">All Sessions</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, address…"
              className="h-9 w-64 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2a2a30] focus:outline-none transition-colors"
            />
            {/* Status pills */}
            <div className="flex items-center gap-1 rounded-lg border border-[#1C1C1F] bg-[#09090B] p-1">
              {STATUS_FILTER.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
                    statusFilter === opt.value
                      ? "bg-[#1C1C1F] text-[#FAFAFA]"
                      : "text-[#52525B] hover:text-[#A1A1AA]",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-[#3F3F46]" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <AlertCircle
              size={24}
              className="text-[#3F3F46]"
              strokeWidth={1.5}
            />
            <p className="text-sm text-[#71717A]">Failed to load sessions.</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} strokeWidth={1.5} />}
            description={
              search || statusFilter !== "all"
                ? "No sessions match your filters."
                : "No checkout sessions yet. Create your first payment link."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1C1C1F]">
                  {[
                    "Reference",
                    "Amount",
                    "Asset",
                    "Status",
                    "Created",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525B]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1F]">
                {filtered.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => setSelected(session)}
                    className="cursor-pointer transition-colors hover:bg-[#111113]"
                  >
                    {/* Reference */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-[#A1A1AA]">
                        {shortRef(session.reference)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-[#FAFAFA]">
                        {formatAmount(session.amount, session.currency)}
                      </span>
                      <span className="ml-1 text-xs text-[#52525B]">
                        {session.currency?.toUpperCase()}
                      </span>
                    </td>

                    {/* Asset */}
                    <td className="px-5 py-3.5">
                      {session.crypto_asset ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[#FAFAFA]">
                            {session.crypto_asset}
                          </span>
                          <span className="text-[11px] text-[#52525B]">
                            {session.network}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#3F3F46]">
                          Not selected
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={session.status} />
                    </td>

                    {/* Created */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[#71717A]">
                        {formatDate(session.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => copyLink(session, e)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#52525B] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
                          title="Copy payment link"
                        >
                          {copiedId === session.id ? (
                            <Check size={13} className="text-[#22C55E]" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                        <ChevronRight size={14} className="text-[#3F3F46]" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CreatePaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => toast.success("Payment session created.")}
      />

      {selected && (
        <SessionDrawer session={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
