"use client";

/**
 * Full-page invoice editor, modelled on Stripe's: the form on the left, a
 * live preview of the invoice document on the right. It covers the dashboard
 * chrome while open and sends the same POST /invoices payload the old
 * create modal did.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateInvoice } from "@/lib/hooks/invoices/useInvoices";
import { useCustomers } from "@/lib/hooks/customers/useCustomers";
import { useMyBusiness } from "@/lib/hooks/businesses/useBusinesses";
import type { InvoiceLineItemDto } from "@/lib/types/invoices";
import type { Customer } from "@/lib/types/customers";
import { Segmented } from "@/components/dashboard/balance/modal-kit";
import { cn } from "@/utils/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

interface LineItemRow extends InvoiceLineItemDto {
  _id: number;
}

let _rowId = 0;
const blankItem = (): LineItemRow => ({
  _id: ++_rowId,
  description: "",
  quantity: 1,
  unit_price: 0,
});

const CURRENCIES = [
  { value: "USD", label: "USD" },
  { value: "NGN", label: "NGN" },
];
const SYMBOL: Record<string, string> = { USD: "$", NGN: "₦" };

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const inputCls =
  "h-11 w-full rounded-xl border border-dash-border bg-dash-card px-3.5 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-tone-blue focus:outline-none";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-dash-border py-8 first:pt-0 last:border-0">
      <h2 className="text-lg font-semibold text-dash-foreground">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-dash-muted">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-dash-foreground">
        {label}
        {optional && (
          <span className="text-xs font-normal text-dash-faint">Optional</span>
        )}
      </span>
      {children}
    </label>
  );
}

function customerLabel(c: Customer) {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || "Unnamed";
}

// ── Customer picker ───────────────────────────────────────────────────────────

/** Searchable list of saved customers; picking one fills the fields below. */
function CustomerPicker({ onPick }: { onPick: (c: Customer) => void }) {
  const { data, isLoading } = useCustomers();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const customers: Customer[] = useMemo(
    () => (Array.isArray(data) ? data : ((data as { data?: Customer[] } | undefined)?.data ?? [])),
    [data],
  );
  const matches = customers
    .filter((c) =>
      `${customerLabel(c)} ${c.email ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()),
    )
    .slice(0, 8);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dash-muted"
        />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Find a saved customer by name or email"
          className={cn(inputCls, "pl-10 pr-9")}
        />
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-muted"
        />
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl border border-dash-border bg-dash-card p-1.5 shadow-xl">
          {isLoading ? (
            <p className="px-3 py-3 text-sm text-dash-muted">Loading customers…</p>
          ) : matches.length === 0 ? (
            <p className="px-3 py-3 text-sm text-dash-muted">
              {customers.length === 0
                ? "No saved customers yet. Enter their details below."
                : "No customers match."}
            </p>
          ) : (
            matches.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onPick(c);
                  setQ("");
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-dash-hover"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-hover text-dash-muted">
                  <UserRound size={15} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-dash-foreground">
                    {customerLabel(c)}
                  </span>
                  {c.email && (
                    <span className="block truncate text-xs text-dash-muted">{c.email}</span>
                  )}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const { data: business } = useMyBusiness();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<LineItemRow[]>(() => [blankItem()]);
  const [taxRate, setTaxRate] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const sym = SYMBOL[currency] ?? "";
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmt = subtotal * ((parseFloat(taxRate) || 0) / 100);
  const discAmt = parseFloat(discountAmount) || 0;
  const total = Math.max(0, subtotal + taxAmt - discAmt);

  const updateItem = (id: number, field: keyof InvoiceLineItemDto, raw: string) =>
    setItems((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, [field]: field === "description" ? raw : Number(raw) || 0 }
          : r,
      ),
    );
  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (id: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((r) => r._id !== id) : prev));

  const pickCustomer = (c: Customer) => {
    setFirstName(c.first_name ?? "");
    setLastName(c.last_name ?? "");
    setEmail(c.email ?? "");
    setPhone(c.phone ?? "");
  };

  const missing: string[] = [];
  if (!firstName.trim() || !lastName.trim()) missing.push("customer name");
  if (!email.trim()) missing.push("customer email");
  if (!items.every((i) => i.description.trim() && i.quantity > 0 && i.unit_price > 0))
    missing.push("a description, quantity and price for every item");
  const canSubmit = missing.length === 0;

  // Due date is picked as a day; it's sent as the end of that day, local time.
  const dueAt = dueDate ? new Date(`${dueDate}T23:59:59`) : null;

  const handleSubmit = () => {
    if (!canSubmit || createInvoice.isPending) return;
    setError(null);
    createInvoice.mutate(
      {
        customer: {
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
        },
        currency,
        line_items: items.map(({ description, quantity, unit_price }) => ({
          description,
          quantity,
          unit_price,
        })),
        ...(taxRate ? { tax_rate: parseFloat(taxRate) } : {}),
        ...(discountAmount ? { discount_amount: parseFloat(discountAmount) } : {}),
        ...(dueAt ? { due_date: dueAt.toISOString() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Invoice created! Share the link with your customer.");
          router.push("/invoices");
        },
        onError: (err) =>
          setError(err?.message || "Failed to create invoice. Please try again."),
      },
    );
  };

  const customerName = [firstName, lastName].filter((s) => s.trim()).join(" ");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-dash-card">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-dash-border px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            aria-label="Close editor"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
          >
            <X size={18} />
          </Link>
          <span className="h-5 w-px bg-dash-border" />
          <h1 className="text-base font-semibold text-dash-foreground">Create invoice</h1>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || createInvoice.isPending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-dash-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createInvoice.isPending && <Loader2 size={15} className="animate-spin" />}
          {createInvoice.isPending ? "Creating…" : "Create invoice"}
        </button>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-2">
        {/* ── Form ───────────────────────────────────────────── */}
        <div className="overflow-y-auto">
          <div className="mx-auto max-w-xl px-5 py-10 sm:px-8">
            <Section title="Customer" description="Who should pay this invoice?">
              <CustomerPicker onPick={pickCustomer} />
              <div className="mt-5 grid grid-cols-2 gap-4">
                <Field label="First name">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className={inputCls}
                  />
                </Field>
                <Field label="Last name">
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={inputCls}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone" optional>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="08012345678"
                    maxLength={11}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            <Section title="Currency" description="All items are billed in this currency.">
              <div className="max-w-56">
                <Segmented value={currency} options={CURRENCIES} onChange={setCurrency} />
              </div>
            </Section>

            <Section title="Items">
              <div className="space-y-3">
                {items.map((row, idx) => (
                  <div
                    key={row._id}
                    className="rounded-2xl border border-dash-border p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-dash-muted">
                        Item {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(row._id)}
                        disabled={items.length === 1}
                        aria-label="Remove item"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-dash-faint transition-colors hover:bg-dash-hover hover:text-dash-error disabled:pointer-events-none disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      value={row.description}
                      onChange={(e) => updateItem(row._id, "description", e.target.value)}
                      placeholder="Description, e.g. Website design"
                      className={inputCls}
                    />
                    <div className="mt-3 grid grid-cols-[88px_1fr_auto] items-end gap-3">
                      <Field label="Qty">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity || ""}
                          onChange={(e) => updateItem(row._id, "quantity", e.target.value)}
                          placeholder="1"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Price">
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-dash-muted">
                            {sym}
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.unit_price || ""}
                            onChange={(e) => updateItem(row._id, "unit_price", e.target.value)}
                            placeholder="0.00"
                            className={cn(inputCls, "pl-8")}
                          />
                        </div>
                      </Field>
                      <div className="flex h-11 min-w-24 items-center justify-end text-sm font-semibold text-dash-foreground">
                        {sym}
                        {fmt(row.quantity * row.unit_price)}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addItem}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-dash-border-strong text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-bg"
                >
                  <Plus size={15} /> Add item
                </button>
              </div>
            </Section>

            <Section title="Payment" description="When the customer should pay by.">
              <Field label="Due date" optional>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={cn(inputCls, "scheme-light")}
                />
              </Field>
            </Section>

            <Section title="Additional options">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tax rate" optional>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="0"
                      className={cn(inputCls, "pr-9")}
                    />
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-dash-muted">
                      %
                    </span>
                  </div>
                </Field>
                <Field label="Discount" optional>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-dash-muted">
                      {sym}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      placeholder="0.00"
                      className={cn(inputCls, "pl-8")}
                    />
                  </div>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Memo" optional>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thank you for your business."
                    className={cn(inputCls, "h-auto resize-none py-3")}
                  />
                </Field>
              </div>
            </Section>

            {error && (
              <p className="mb-4 flex items-start gap-2 rounded-xl border border-dash-error-border bg-dash-error-bg px-3.5 py-3 text-sm text-dash-error">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}
            {!canSubmit && (
              <p className="text-xs text-dash-muted">
                To create the invoice, add {missing.join(", ")}.
              </p>
            )}
          </div>
        </div>

        {/* ── Preview ────────────────────────────────────────── */}
        <aside className="hidden overflow-y-auto border-l border-dash-border bg-dash-bg lg:block">
          <div className="mx-auto max-w-xl px-8 py-10">
            <p className="mb-4 text-sm font-medium text-dash-muted">Invoice preview</p>

            <div className="rounded-2xl bg-dash-card p-8 shadow-(--shadow-card) ring-1 ring-dash-border">
              {/* Header */}
              <div className="flex items-start justify-between gap-6">
                <h3 className="text-2xl font-semibold text-dash-foreground">Invoice</h3>
                {business?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user-uploaded, arbitrary host
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-dash-foreground">
                    {business?.name}
                  </span>
                )}
              </div>

              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-xs">
                <dt className="text-dash-muted">Invoice number</dt>
                <dd className="text-dash-faint italic">Assigned on creation</dd>
                <dt className="text-dash-muted">Date of issue</dt>
                <dd className="text-dash-foreground">{fmtDay(new Date())}</dd>
                <dt className="text-dash-muted">Date due</dt>
                <dd className="text-dash-foreground">{dueAt ? fmtDay(dueAt) : "On receipt"}</dd>
              </dl>

              <div className="mt-6 grid grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="mb-1 font-semibold text-dash-foreground">
                    {business?.name ?? "Your business"}
                  </p>
                  {business?.support_email && (
                    <p className="text-dash-muted">{business.support_email}</p>
                  )}
                </div>
                <div>
                  <p className="mb-1 font-semibold text-dash-foreground">Bill to</p>
                  <p className={customerName ? "text-dash-foreground" : "text-dash-faint"}>
                    {customerName || "Customer name"}
                  </p>
                  <p className={email ? "text-dash-muted" : "text-dash-faint"}>
                    {email || "customer@email.com"}
                  </p>
                  {phone && <p className="text-dash-muted">{phone}</p>}
                </div>
              </div>

              <p className="mt-8 text-xl font-semibold text-dash-foreground">
                {sym}
                {fmt(total)} {currency}{" "}
                <span className="font-normal text-dash-muted">
                  due {dueAt ? fmtDay(dueAt) : "on receipt"}
                </span>
              </p>

              {/* Items */}
              <table className="mt-6 w-full text-xs">
                <thead>
                  <tr className="border-b border-dash-border text-dash-muted">
                    <th className="pb-2 text-left font-medium">Description</th>
                    <th className="pb-2 text-right font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Unit price</th>
                    <th className="pb-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row) => (
                    <tr key={row._id} className="border-b border-dash-border">
                      <td className={cn("py-2.5 pr-3", row.description ? "text-dash-foreground" : "text-dash-faint")}>
                        {row.description || "Item description"}
                      </td>
                      <td className="py-2.5 text-right text-dash-foreground">{row.quantity || 0}</td>
                      <td className="py-2.5 text-right text-dash-foreground">
                        {sym}
                        {fmt(row.unit_price)}
                      </td>
                      <td className="py-2.5 text-right text-dash-foreground">
                        {sym}
                        {fmt(row.quantity * row.unit_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="ml-auto mt-4 w-full max-w-60 space-y-1.5 text-xs">
                <div className="flex justify-between text-dash-muted">
                  <span>Subtotal</span>
                  <span className="text-dash-foreground">{sym}{fmt(subtotal)}</span>
                </div>
                {taxAmt > 0 && (
                  <div className="flex justify-between text-dash-muted">
                    <span>Tax ({taxRate}%)</span>
                    <span className="text-dash-foreground">{sym}{fmt(taxAmt)}</span>
                  </div>
                )}
                {discAmt > 0 && (
                  <div className="flex justify-between text-dash-muted">
                    <span>Discount</span>
                    <span className="text-dash-foreground">−{sym}{fmt(discAmt)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-dash-border pt-1.5 text-dash-muted">
                  <span>Total</span>
                  <span className="text-dash-foreground">{sym}{fmt(total)}</span>
                </div>
                <div className="flex justify-between font-semibold text-dash-foreground">
                  <span>Amount due</span>
                  <span>
                    {sym}
                    {fmt(total)} {currency}
                  </span>
                </div>
              </div>

              {notes.trim() && (
                <p className="mt-8 whitespace-pre-wrap text-xs text-dash-muted">{notes}</p>
              )}

              <p className="mt-8 flex items-center gap-1.5 border-t border-dash-border pt-4 text-[11px] text-dash-faint">
                <Check size={12} />
                A payment link is generated for this invoice when it&apos;s created.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
