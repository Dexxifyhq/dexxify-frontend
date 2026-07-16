"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Copy,
  Check,
  X,
  Loader2,
  ChevronRight,
  Link,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";
import CreateInvoiceModal from "@/components/dashboard/invoices/CreateInvoiceModal";
import {
  useInvoices,
  useMarkInvoicePaid,
  useCancelInvoice,
} from "@/lib/hooks/invoices/useInvoices";
import type { Invoice, InvoiceStatus } from "@/lib/types/invoices";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

// ── Config ─────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<InvoiceStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-[#18181B]/60 text-[#71717A] border-[#27272A]/50" },
  sent:      { label: "Sent",      cls: "bg-[#1e3a5f]/60 text-[#60A5FA] border-[#1d3461]/50" },
  viewed:    { label: "Viewed",    cls: "bg-[#1a0a2e]/60 text-[#a855f7] border-[#3b0764]/50" },
  paid:      { label: "Paid",      cls: "bg-[#052e16]/60 text-[#4ade80] border-[#14532D]/50" },
  overdue:   { label: "Overdue",   cls: "bg-[#450a0a]/60 text-[#f87171] border-[#7f1d1d]/50" },
  cancelled: { label: "Cancelled", cls: "bg-[#18181B]/60 text-[#52525B] border-[#27272A]/50" },
  void:      { label: "Void",      cls: "bg-[#18181B]/60 text-[#52525B] border-[#27272A]/50" },
};

const STATUS_OPTIONS = [
  { label: "All Status",  value: "all" },
  { label: "Sent",        value: "sent" },
  { label: "Paid",        value: "paid" },
  { label: "Overdue",     value: "overdue" },
  { label: "Draft",       value: "draft" },
  { label: "Cancelled",   value: "cancelled" },
  { label: "Void",        value: "void" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtAmount(invoice: Invoice) {
  return `${invoice.currency} ${Number(invoice.total).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function customerName(invoice: Invoice) {
  const c = invoice.customer;
  if (!c) return "—";
  const full = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return full || c.email || "—";
}

function invoicePayUrl(invoiceNumber: string) {
  if (typeof window === "undefined") return `/invoices/pay/${invoiceNumber}`;
  return `${window.location.origin}/invoices/pay/${invoiceNumber}`;
}

// ── Badges ─────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ── Copy link button ───────────────────────────────────────────────────────────

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Copy payment link"
      className="flex h-7 w-7 items-center justify-center rounded-lg text-[#52525B] hover:bg-[#1C1C1F] hover:text-[#A1A1AA] transition-colors"
    >
      {copied ? <Check size={13} className="text-[#4ade80]" /> : <Link size={13} />}
    </button>
  );
}

// ── Detail drawer ──────────────────────────────────────────────────────────────

function InvoiceDrawer({
  invoice,
  onClose,
}: {
  invoice: Invoice | null;
  onClose: () => void;
}) {
  const markPaid = useMarkInvoicePaid();
  const cancelInvoice = useCancelInvoice();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!invoice) return null;

  const payUrl = invoicePayUrl(invoice.invoice_number);
  const canMarkPaid = ["sent", "viewed", "overdue"].includes(invoice.status);
  const canCancel = !["paid", "void", "cancelled"].includes(invoice.status);

  const handleMarkPaid = () => {
    markPaid.mutate(invoice.id, {
      onSuccess: () => { toast.success("Invoice marked as paid."); onClose(); },
      onError: (err: any) => toast.error(err?.message ?? "Failed to update invoice."),
    });
  };

  const handleCancel = () => {
    cancelInvoice.mutate(invoice.id, {
      onSuccess: () => { toast.success("Invoice cancelled."); onClose(); setConfirmCancel(false); },
      onError: (err: any) => toast.error(err?.message ?? "Failed to cancel invoice."),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#1C1C1F] bg-[#09090B] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1F] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-semibold text-[#FAFAFA]">
              {invoice.invoice_number}
            </span>
            <StatusBadge status={invoice.status} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Amount hero */}
        <div className="border-b border-[#1C1C1F] px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">Total</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[#FAFAFA]">
            {fmtAmount(invoice)}
          </p>
          {invoice.paid_at && (
            <p className="mt-0.5 text-xs text-[#4ade80]">Paid on {fmtDate(invoice.paid_at)}</p>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Payment link */}
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] px-3 py-2.5">
            <Copy size={12} className="shrink-0 text-[#52525B]" />
            <span className="flex-1 truncate font-mono text-xs text-[#71717A]">{payUrl}</span>
            <CopyLinkButton url={payUrl} />
          </div>

          {/* Customer */}
          {invoice.customer && (
            <div className="mb-4 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] px-4 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">Customer</p>
              <p className="text-sm font-medium text-[#FAFAFA]">{customerName(invoice)}</p>
              {invoice.customer.email && (
                <p className="mt-0.5 text-xs text-[#71717A]">{invoice.customer.email}</p>
              )}
              {invoice.customer.phone && (
                <p className="mt-0.5 text-xs text-[#71717A]">{invoice.customer.phone}</p>
              )}
            </div>
          )}

          {/* Line items */}
          <div className="mb-4 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] px-4 py-3">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">Line Items</p>
            <div className="flex flex-col gap-2">
              {invoice.line_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-[#FAFAFA]">{item.description}</p>
                    <p className="text-xs text-[#52525B]">
                      {item.quantity} × {invoice.currency} {Number(item.unit_price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-sm text-[#A1A1AA]">
                    {Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-[#1C1C1F] pt-3 text-sm">
              <div className="flex justify-between text-[#71717A]">
                <span>Subtotal</span>
                <span className="font-mono">{Number(invoice.subtotal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              {Number(invoice.tax_amount) > 0 && (
                <div className="mt-1 flex justify-between text-[#71717A]">
                  <span>Tax ({invoice.tax_rate}%)</span>
                  <span className="font-mono">{Number(invoice.tax_amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              {Number(invoice.discount_amount) > 0 && (
                <div className="mt-1 flex justify-between text-[#71717A]">
                  <span>Discount</span>
                  <span className="font-mono text-[#f87171]">−{Number(invoice.discount_amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-[#1C1C1F] pt-2 font-semibold text-[#FAFAFA]">
                <span>Total</span>
                <span className="font-mono">{fmtAmount(invoice)}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Due Date", value: fmtDate(invoice.due_date) },
              { label: "Created", value: fmtDate(invoice.created_at) },
              { label: "Currency", value: invoice.currency },
              { label: "Invoice #", value: invoice.invoice_number },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] p-2.5">
                <p className="text-[#52525B]">{label}</p>
                <p className="mt-0.5 font-mono text-[#A1A1AA]">{value}</p>
              </div>
            ))}
          </div>

          {invoice.notes && (
            <div className="mt-2 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] p-2.5 text-xs">
              <p className="text-[#52525B]">Notes</p>
              <p className="mt-0.5 text-[#A1A1AA]">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {(canMarkPaid || canCancel) && (
          <div className="shrink-0 border-t border-[#1C1C1F] px-5 py-4">
            {confirmCancel ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmCancel(false)}
                  className="flex-1 h-9 rounded-lg border border-[#1C1C1F] text-sm text-[#A1A1AA] hover:bg-[#1C1C1F] transition-colors">
                  Keep Invoice
                </button>
                <button type="button" onClick={handleCancel} disabled={cancelInvoice.isPending}
                  className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg bg-[#450a0a]/60 text-sm text-[#f87171] hover:bg-[#450a0a]/90 disabled:opacity-50 transition-colors">
                  {cancelInvoice.isPending ? <Loader2 size={13} className="animate-spin" /> : null}
                  {cancelInvoice.isPending ? "Cancelling…" : "Yes, Cancel"}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                {canMarkPaid && (
                  <button type="button" onClick={handleMarkPaid} disabled={markPaid.isPending}
                    className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-lg bg-[#052e16]/60 text-sm font-medium text-[#4ade80] hover:bg-[#052e16]/90 disabled:opacity-50 transition-colors">
                    {markPaid.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {markPaid.isPending ? "Updating…" : "Mark as Paid"}
                  </button>
                )}
                {canCancel && (
                  <button type="button" onClick={() => setConfirmCancel(true)}
                    className="flex-1 h-9 rounded-lg border border-[#1C1C1F] text-sm text-[#71717A] hover:border-[#7f1d1d]/40 hover:text-[#f87171] transition-colors">
                    Cancel Invoice
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Invoice | null>(null);

  const { data, isLoading, isError } = useInvoices();

  const invoices: Invoice[] = Array.isArray(data) ? data : ((data as any)?.data ?? []);

  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter((i) => i.status === "paid").length;
    const pending = invoices.filter((i) => ["sent", "viewed", "draft"].includes(i.status)).length;
    const overdue = invoices.filter((i) => i.status === "overdue").length;
    return { total, paid, pending, overdue };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (!q) return true;
      const name = customerName(inv).toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        name.includes(q) ||
        (inv.customer?.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [invoices, search, statusFilter]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Invoices"
          description="Create and share payment invoices with your customers."
          actions={
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
            >
              <Plus size={15} />
              Create Invoice
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Invoices" value={String(stats.total)} icon={<FileText size={15} />} />
          <StatCard label="Paid"           value={String(stats.paid)}    icon={<CheckCircle2 size={15} />} />
          <StatCard label="Pending"        value={String(stats.pending)} icon={<Clock size={15} />} />
          <StatCard label="Overdue"        value={String(stats.overdue)} icon={<AlertCircle size={15} />} />
        </div>

        {/* Table */}
        <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#FAFAFA]">All Invoices</h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by number or customer…"
                  className="h-9 w-64 rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                />
              </div>
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
              <Loader2 size={22} className="animate-spin text-[#3F3F46]" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <AlertCircle size={24} className="text-[#3F3F46]" strokeWidth={1.5} />
              <p className="text-sm text-[#71717A]">Failed to load invoices.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <FileText size={32} className="text-[#3F3F46]" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-[#FAFAFA]">
                  {search || statusFilter !== "all"
                    ? "No invoices match your filters."
                    : "No invoices yet."}
                </p>
                {!search && statusFilter === "all" && (
                  <p className="mt-1 text-xs text-[#71717A]">
                    Create your first invoice to get started.
                  </p>
                )}
              </div>
              {!search && statusFilter === "all" && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
                >
                  <Plus size={14} /> Create Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1C1C1F]">
                    {["Invoice #", "Customer", "Amount", "Status", "Due Date", "Created", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => setSelected(inv)}
                      className="cursor-pointer border-b border-[#1C1C1F] last:border-0 hover:bg-[#111113] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold text-[#FAFAFA]">
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm text-[#FAFAFA]">{customerName(inv)}</p>
                          {inv.customer?.email && (
                            <p className="text-xs text-[#52525B]">{inv.customer.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm font-medium text-[#FAFAFA]">
                          {fmtAmount(inv)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#52525B]">
                        {fmtDate(inv.due_date)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[#52525B]">
                        {fmtDate(inv.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <CopyLinkButton url={invoicePayUrl(inv.invoice_number)} />
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
      </div>

      <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} />

      <CreateInvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => toast.success("Invoice created! Share the link with your customer.")}
      />
    </>
  );
}
