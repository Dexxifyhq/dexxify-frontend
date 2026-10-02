"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FilePlus2,
  FileText,
  Link2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCancelInvoice,
  useInvoice,
  useMarkInvoicePaid,
} from "@/lib/hooks/invoices/useInvoices";
import type { Invoice } from "@/lib/types/invoices";
import {
  StatusBadge,
  canCancel,
  canMarkPaid,
  customerName,
  fmtDateTime,
  fmtMoney,
  invoicePayUrl,
} from "@/components/dashboard/invoices/invoice-ui";
import { cn } from "@/utils/utils";

// ── Bits ──────────────────────────────────────────────────────────────────────

function CopyIcon({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() =>
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        })
      }
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-dash-faint transition-colors hover:bg-dash-hover hover:text-dash-foreground"
    >
      {copied ? <Check size={12} className="text-dash-success" /> : <Copy size={12} />}
    </button>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-dash-muted">
      {children}
    </p>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-dash-muted">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-dash-foreground">{children}</div>
    </div>
  );
}

// Whether the invoice can still collect a payment.
function collection(inv: Invoice) {
  if (["paid", "cancelled", "void"].includes(inv.status))
    return { label: "Closed", cls: "bg-dash-hover text-dash-muted" };
  if (inv.status === "overdue")
    return { label: "Expired", cls: "bg-dash-error-bg text-dash-error" };
  return { label: "Open", cls: "bg-dash-success-bg text-dash-success" };
}

// Timeline built from the invoice's own dates — there's no separate payments
// endpoint, so this is everything the API records about its lifecycle.
function activity(inv: Invoice) {
  const events: { icon: React.ElementType; tone: string; title: string; at: string }[] = [
    { icon: FilePlus2, tone: "text-dash-muted", title: "Invoice created", at: inv.created_at },
  ];
  if (inv.paid_at)
    events.push({ icon: CheckCircle2, tone: "text-dash-success", title: "Payment received", at: inv.paid_at });
  if (inv.status === "overdue" && inv.due_date)
    events.push({ icon: Clock, tone: "text-dash-error", title: "Invoice expired", at: inv.due_date });
  if (inv.status === "cancelled" || inv.status === "void")
    events.push({
      icon: Ban,
      tone: "text-dash-muted",
      title: inv.status === "void" ? "Invoice voided" : "Invoice closed",
      at: inv.updated_at,
    });
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

const CARD = "rounded-2xl border border-dash-border bg-dash-card";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const markPaid = useMarkInvoicePaid();
  const cancelInvoice = useCancelInvoice();
  const [tab, setTab] = useState<"overview" | "activity">("overview");
  const [confirmClose, setConfirmClose] = useState(false);

  const back = (
    <Link
      href="/invoices"
      className="inline-flex items-center gap-1.5 text-sm text-dash-muted transition-colors hover:text-dash-foreground"
    >
      <ArrowLeft size={15} /> Back
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <div className="h-9 w-64 animate-pulse rounded-lg bg-dash-hover" />
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="h-72 animate-pulse rounded-2xl bg-dash-hover" />
          <div className="h-72 animate-pulse rounded-2xl bg-dash-hover" />
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="flex flex-col gap-6">
        {back}
        <div className={cn(CARD, "flex flex-col items-center gap-2 py-20 text-center")}>
          <AlertCircle size={26} strokeWidth={1.5} className="text-dash-faint" />
          <p className="text-sm font-semibold text-dash-foreground">Invoice not found</p>
          <p className="text-xs text-dash-muted">It may have been removed, or the link is wrong.</p>
        </div>
      </div>
    );
  }

  const payUrl = invoicePayUrl(invoice.invoice_number);
  const col = collection(invoice);
  const paid = invoice.status === "paid";
  const items = invoice.line_items ?? [];

  const handleMarkPaid = () =>
    markPaid.mutate(invoice.id, {
      onSuccess: () => toast.success("Invoice marked as paid."),
      onError: (err) => toast.error(err?.message || "Failed to update invoice."),
    });

  const handleClose = () =>
    cancelInvoice.mutate(invoice.id, {
      onSuccess: () => {
        toast.success("Invoice closed.");
        setConfirmClose(false);
      },
      onError: (err) => toast.error(err?.message || "Failed to close invoice."),
    });

  return (
    <div className="flex flex-col gap-6">
      {back}

      {/* Title */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Invoice</Eyebrow>
          <div className="mt-1.5 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-dash-foreground">
              Invoice details
            </h1>
            <StatusBadge status={invoice.status} />
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            navigator.clipboard
              .writeText(payUrl)
              .then(() => toast.success("Payment link copied."))
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-dash-border bg-dash-card px-4 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-bg"
        >
          <Link2 size={15} className="text-dash-muted" /> Copy payment link
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-dash-border">
        {(
          [
            { key: "overview", label: "Overview" },
            { key: "activity", label: "Payment Activity" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-tone-blue text-dash-foreground"
                : "border-transparent text-dash-muted hover:text-dash-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
        {/* ── Main column ──────────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-5">
          {tab === "overview" ? (
            <>
              {/* Summary */}
              <section className={cn(CARD, "p-6")}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-dash-muted">Total amount</p>
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-semibold tracking-tight text-dash-foreground">
                        {fmtMoney(invoice.total)}
                      </span>
                      <span className="text-lg text-dash-muted">{invoice.currency}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-dash-muted">Collection</p>
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        col.cls,
                      )}
                    >
                      {col.label}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-5 border-t border-dash-border pt-5 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
                  <Meta label="Reference">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-mono text-xs">{invoice.invoice_number}</span>
                      <CopyIcon value={invoice.invoice_number} label="Copy reference" />
                    </span>
                  </Meta>
                  <Meta label="Created">{fmtDateTime(invoice.created_at)}</Meta>
                  <Meta label="Expires">{fmtDateTime(invoice.due_date)}</Meta>
                  <Meta label="Amount paid">
                    {fmtMoney(paid ? invoice.total : 0)} {invoice.currency}
                  </Meta>
                </div>

                {invoice.notes && (
                  <div className="mt-5 border-t border-dash-border pt-5">
                    <p className="text-xs text-dash-muted">Note</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-dash-foreground">
                      {invoice.notes}
                    </p>
                  </div>
                )}
              </section>

              {/* Items */}
              <section className={cn(CARD, "p-6")}>
                <div className="flex items-center justify-between">
                  <Eyebrow>Items</Eyebrow>
                  <span className="text-xs text-dash-muted">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <ul className="mt-4 divide-y divide-dash-border">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 py-4 first:pt-1">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dash-border text-dash-muted">
                        <FileText size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-dash-foreground">
                          {item.description}
                        </p>
                        <p className="text-xs text-dash-muted">
                          {item.quantity} × {fmtMoney(item.unit_price)} {invoice.currency}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-dash-foreground">
                        {fmtMoney(item.amount)} {invoice.currency}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 space-y-2 border-t border-dash-border pt-4 text-sm">
                  {(Number(invoice.tax_amount) > 0 || Number(invoice.discount_amount) > 0) && (
                    <div className="flex justify-between text-dash-muted">
                      <span>Subtotal</span>
                      <span>{fmtMoney(invoice.subtotal)} {invoice.currency}</span>
                    </div>
                  )}
                  {Number(invoice.tax_amount) > 0 && (
                    <div className="flex justify-between text-dash-muted">
                      <span>Tax ({invoice.tax_rate}%)</span>
                      <span>{fmtMoney(invoice.tax_amount)} {invoice.currency}</span>
                    </div>
                  )}
                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between text-dash-muted">
                      <span>Discount</span>
                      <span>−{fmtMoney(invoice.discount_amount)} {invoice.currency}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-dash-muted">Total</span>
                    <span className="text-base font-semibold text-dash-foreground">
                      {fmtMoney(invoice.total)} {invoice.currency}
                    </span>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className={cn(CARD, "p-6")}>
              <Eyebrow>Payment activity</Eyebrow>
              <ol className="mt-5">
                {activity(invoice).map((e, i, all) => (
                  <li key={e.title} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < all.length - 1 && (
                      <span className="absolute left-4 top-9 h-[calc(100%-2.25rem)] w-px bg-dash-border" />
                    )}
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dash-border bg-dash-card",
                        e.tone,
                      )}
                    >
                      <e.icon size={15} />
                    </span>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-dash-foreground">{e.title}</p>
                      <p className="text-xs text-dash-muted">{fmtDateTime(e.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {!invoice.paid_at && (
                <p className="mt-6 rounded-xl bg-dash-bg px-4 py-3 text-xs text-dash-muted">
                  No payment has been recorded for this invoice yet.
                </p>
              )}
            </section>
          )}
        </div>

        {/* ── Side column ──────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Customer */}
          <section className={cn(CARD, "p-6")}>
            <Eyebrow>Customer</Eyebrow>
            {invoice.customer ? (
              <dl className="mt-4 divide-y divide-dash-border text-sm">
                {invoice.customer.email && (
                  <div className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <dt className="text-dash-muted">Email</dt>
                    <dd className="flex min-w-0 items-center gap-1">
                      <span className="truncate font-mono text-xs text-dash-foreground">
                        {invoice.customer.email}
                      </span>
                      <CopyIcon value={invoice.customer.email} label="Copy email" />
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <dt className="text-dash-muted">Name</dt>
                  <dd className="truncate font-medium text-dash-foreground">
                    {customerName(invoice)}
                  </dd>
                </div>
                {invoice.customer.phone && (
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-dash-muted">Phone</dt>
                    <dd className="text-dash-foreground">{invoice.customer.phone}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-dash-muted">No customer attached.</p>
            )}
          </section>

          {/* Actions */}
          <section className={cn(CARD, "flex flex-col gap-3 p-6")}>
            <a
              href={payUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-dash-accent text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover"
            >
              View invoice <ExternalLink size={14} />
            </a>

            {canMarkPaid(invoice.status) && (
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={markPaid.isPending}
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dash-border text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-bg disabled:opacity-50"
              >
                {markPaid.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={15} className="text-dash-success" />
                )}
                Mark as paid
              </button>
            )}

            {canCancel(invoice.status) &&
              (confirmClose ? (
                <div className="rounded-xl border border-dash-error-border bg-dash-error-bg p-3">
                  <p className="text-xs text-dash-error">
                    Close this invoice? The customer will no longer be able to pay it.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClose(false)}
                      className="h-10 flex-1 rounded-lg border border-dash-border bg-dash-card text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-bg"
                    >
                      Keep open
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={cancelInvoice.isPending}
                      className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-dash-error text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {cancelInvoice.isPending && <Loader2 size={14} className="animate-spin" />}
                      Close invoice
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClose(true)}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-dash-border text-sm font-medium text-dash-foreground transition-colors hover:border-dash-error-border hover:text-dash-error"
                >
                  <Ban size={15} /> Close invoice
                </button>
              ))}
          </section>
        </div>
      </div>
    </div>
  );
}
