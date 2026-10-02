import type { Invoice, InvoiceStatus } from "@/lib/types/invoices";
import { cn } from "@/utils/utils";

/** Shared by the Invoices list and the invoice detail page. */

export const STATUS_CFG: Record<InvoiceStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-dash-hover text-dash-muted" },
  sent:      { label: "Sent",      cls: "bg-tone-blue/10 text-tone-blue" },
  viewed:    { label: "Viewed",    cls: "bg-dash-purple-bg text-dash-purple" },
  paid:      { label: "Paid",      cls: "bg-dash-success-bg text-dash-success" },
  overdue:   { label: "Expired",   cls: "bg-dash-error-bg text-dash-error" },
  cancelled: { label: "Cancelled", cls: "bg-dash-hover text-dash-faint" },
  void:      { label: "Void",      cls: "bg-dash-hover text-dash-faint" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        cfg.cls,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}

export const CURRENCY_SYMBOL: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  USDT: "$",
  USDC: "$",
};

export function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function customerName(invoice: Invoice) {
  const c = invoice.customer;
  if (!c) return "—";
  const full = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return full || c.email || "—";
}

export function invoicePayUrl(invoiceNumber: string) {
  if (typeof window === "undefined") return `/invoices/pay/${invoiceNumber}`;
  return `${window.location.origin}/invoices/pay/${invoiceNumber}`;
}

export const canMarkPaid = (s: InvoiceStatus) =>
  ["sent", "viewed", "overdue"].includes(s);
export const canCancel = (s: InvoiceStatus) =>
  !["paid", "void", "cancelled"].includes(s);
