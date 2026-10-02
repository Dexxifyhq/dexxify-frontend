"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Loader2,
  Link,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import {
  useInvoices,
  useMarkInvoicePaid,
} from "@/lib/hooks/invoices/useInvoices";
import type { Invoice, InvoiceStatus } from "@/lib/types/invoices";
import {
  CURRENCY_SYMBOL,
  StatusBadge,
  canMarkPaid as canMarkPaidStatus,
  customerName,
  fmtDate,
  invoicePayUrl,
} from "@/components/dashboard/invoices/invoice-ui";
import { cn } from "@/utils/utils";
import { toast } from "sonner";

// ── Status tabs ────────────────────────────────────────────────────────────────

// Stripe-style summary tabs over the list. Each groups one or more statuses;
// sent, viewed, cancelled and void invoices are only under "All".
const TABS: { key: string; label: string; statuses: InvoiceStatus[] | null }[] = [
  { key: "all",         label: "All invoices", statuses: null },
  { key: "draft",       label: "Draft",        statuses: ["draft"] },
  { key: "overdue",     label: "Expired",      statuses: ["overdue"] },
  { key: "paid",        label: "Paid",         statuses: ["paid"] },
];

function AmountCell({ invoice }: { invoice: Invoice }) {
  const sym = CURRENCY_SYMBOL[invoice.currency?.toUpperCase()] ?? "";
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-[15px] font-semibold text-dash-foreground">
        {sym}
        {Number(invoice.total).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span className="text-xs text-dash-muted">{invoice.currency}</span>
    </span>
  );
}

// ── Row menu ───────────────────────────────────────────────────────────────────

function RowMenu({
  invoice,
  onView,
}: {
  invoice: Invoice;
  onView: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const markPaid = useMarkInvoicePaid();
  const payUrl = invoicePayUrl(invoice.invoice_number);
  const canMarkPaid = canMarkPaidStatus(invoice.status);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item =
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-dash-foreground transition-colors hover:bg-dash-hover disabled:opacity-50";

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Invoice actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground",
          open && "bg-dash-hover text-dash-foreground",
        )}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-dash-border bg-dash-card p-1.5 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <FileText size={14} className="text-dash-muted" /> View details
          </button>
          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              navigator.clipboard
                .writeText(payUrl)
                .then(() => toast.success("Payment link copied."));
              setOpen(false);
            }}
          >
            <Link size={14} className="text-dash-muted" /> Copy payment link
          </button>
          <a
            role="menuitem"
            href={payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={item}
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={14} className="text-dash-muted" /> Open payment page
          </a>
          {canMarkPaid && (
            <>
              <div className="my-1 border-t border-dash-border" />
              <button
                type="button"
                role="menuitem"
                className={item}
                disabled={markPaid.isPending}
                onClick={() =>
                  markPaid.mutate(invoice.id, {
                    onSuccess: () => {
                      toast.success("Invoice marked as paid.");
                      setOpen(false);
                    },
                    onError: (err) =>
                      toast.error(err?.message || "Failed to update invoice."),
                  })
                }
              >
                {markPaid.isPending ? (
                  <Loader2 size={14} className="animate-spin text-dash-muted" />
                ) : (
                  <CheckCircle2 size={14} className="text-dash-success" />
                )}
                Mark as paid
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const router = useRouter();
  const openInvoice = (inv: Invoice) => router.push(`/invoices/${inv.id}`);

  const { data, isLoading, isError } = useInvoices();

  const invoices: Invoice[] = Array.isArray(data) ? data : ((data as any)?.data ?? []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of TABS) {
      c[t.key] = t.statuses
        ? invoices.filter((i) => t.statuses!.includes(i.status)).length
        : invoices.length;
    }
    return c;
  }, [invoices]);

  const filtered = useMemo(() => {
    const statuses = TABS.find((t) => t.key === tab)?.statuses ?? null;
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (statuses && !statuses.includes(inv.status)) return false;
      if (!q) return true;
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        customerName(inv).toLowerCase().includes(q) ||
        (inv.customer?.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [invoices, search, tab]);

  const filtering = !!search.trim() || tab !== "all";

  const createButton = (
    <NextLink
      href="/invoices/new"
      className="inline-flex h-11 items-center gap-2 rounded-xl bg-dash-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover"
    >
      <Plus size={16} />
      Create invoice
    </NextLink>
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Invoices"
          description="Create and share payment invoices with your customers."
          actions={createButton}
        />

        {/* Status tabs — one sideways-scrolling row on phones, four across
            from md up */}
        <div
          role="tablist"
          aria-label="Invoice status"
          className="-m-1 flex snap-x snap-mandatory gap-3 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex w-[42%] shrink-0 snap-start flex-col items-start gap-1 rounded-2xl border bg-dash-card px-4 py-3.5 text-left transition-colors md:w-auto",
                  active
                    ? "border-tone-blue ring-1 ring-tone-blue"
                    : "border-dash-border hover:bg-dash-bg",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-tone-blue" : "text-dash-muted",
                  )}
                >
                  {t.label}
                </span>
                {isLoading ? (
                  <span className="h-7 w-10 animate-pulse rounded bg-dash-hover" />
                ) : (
                  <span className="text-2xl font-semibold tracking-tight text-dash-foreground">
                    {counts[t.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <section className="rounded-2xl border border-dash-border bg-dash-card">
          <div className="flex flex-col gap-3 px-5 pb-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-dash-foreground">
              {TABS.find((t) => t.key === tab)?.label}
            </h2>
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by number or customer..."
                className="h-11 w-full rounded-xl border border-dash-border bg-dash-card pl-10 pr-3 text-sm text-dash-foreground transition-colors placeholder:text-dash-muted focus:border-tone-blue focus:outline-none sm:w-72"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="divide-y divide-dash-border px-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 py-5">
                  <div className="h-5 w-32 animate-pulse rounded bg-dash-hover" />
                  <div className="h-4 w-24 animate-pulse rounded bg-dash-hover" />
                  <div className="h-4 flex-1 animate-pulse rounded bg-dash-hover" />
                  <div className="h-4 w-24 animate-pulse rounded bg-dash-hover" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <AlertCircle size={24} className="text-dash-faint" strokeWidth={1.5} />
              <p className="text-sm text-dash-muted">Failed to load invoices.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <FileText size={32} className="text-dash-border-strong" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-semibold text-dash-foreground">
                  {filtering ? "No invoices match." : "No invoices yet."}
                </p>
                <p className="mt-1 text-xs text-dash-muted">
                  {filtering
                    ? "Try another tab or search."
                    : "Create your first invoice to get paid."}
                </p>
              </div>
              {!filtering && createButton}
            </div>
          ) : (
            <div className="overflow-x-auto px-5">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-dash-border">
                    {["Amount", "Invoice number", "Customer", "Due", "Created", ""].map((h) => (
                      <th
                        key={h || "actions"}
                        className="whitespace-nowrap py-4 pr-6 text-sm font-normal text-dash-muted last:pr-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => openInvoice(inv)}
                      className="group cursor-pointer border-b border-dash-border last:border-0"
                    >
                      <td className="whitespace-nowrap py-4 pr-6">
                        <span className="inline-flex items-center gap-3">
                          <AmountCell invoice={inv} />
                          <StatusBadge status={inv.status} />
                        </span>
                      </td>
                      <td className="whitespace-nowrap py-4 pr-6">
                        <span className="font-mono text-sm text-dash-foreground group-hover:underline">
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td className="py-4 pr-6">
                        <p className="text-sm text-dash-foreground">{customerName(inv)}</p>
                        {inv.customer?.email && customerName(inv) !== inv.customer.email && (
                          <p className="text-xs text-dash-muted">{inv.customer.email}</p>
                        )}
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap py-4 pr-6 text-sm",
                          inv.status === "overdue" ? "font-medium text-dash-error" : "text-dash-muted",
                        )}
                      >
                        {fmtDate(inv.due_date)}
                      </td>
                      <td className="whitespace-nowrap py-4 pr-6 text-sm text-dash-muted">
                        {fmtDate(inv.created_at)}
                      </td>
                      <td className="py-4 text-right">
                        <RowMenu invoice={inv} onView={() => openInvoice(inv)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

    </>
  );
}

