"use client";

import { X, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useCreateInvoice } from "@/lib/hooks/invoices/useInvoices";
import type { InvoiceLineItemDto } from "@/lib/types/invoices";
import { cn } from "@/utils/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

interface LineItemRow extends InvoiceLineItemDto {
  _id: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const inputCls =
  "h-9 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors";

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
        <span>
          {label}
          {required && <span className="ml-0.5 text-[#EF4444]">*</span>}
        </span>
        {hint && (
          <span className="text-[10px] normal-case text-[#52525B]">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

let _rowId = 0;
const nextRowId = () => ++_rowId;
const blankItem = (): LineItemRow => ({
  _id: nextRowId(),
  description: "",
  quantity: 1,
  unit_price: 0,
});

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function CreateInvoiceModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const createInvoice = useCreateInvoice();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<LineItemRow[]>([blankItem()]);
  const [taxRate, setTaxRate] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setCurrency("USD");
    setItems([blankItem()]);
    setTaxRate("");
    setDiscountAmount("");
    setDueDate("");
    setNotes("");
    setError(null);
    createInvoice.reset();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  // Totals
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const taxAmt = subtotal * ((parseFloat(taxRate) || 0) / 100);
  const discAmt = parseFloat(discountAmount) || 0;
  const total = Math.max(0, subtotal + taxAmt - discAmt);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const updateItem = (
    id: number,
    field: keyof InvoiceLineItemDto,
    raw: string,
  ) =>
    setItems((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, [field]: field === "description" ? raw : Number(raw) || 0 }
          : r,
      ),
    );

  const addItem = () => setItems((prev) => [...prev, blankItem()]);
  const removeItem = (id: number) =>
    setItems((prev) =>
      prev.length > 1 ? prev.filter((r) => r._id !== id) : prev,
    );

  const canSubmit =
    email.trim() !== "" &&
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    items.every(
      (i) => i.description.trim() !== "" && i.quantity > 0 && i.unit_price > 0,
    );

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        ...(discountAmount
          ? { discount_amount: parseFloat(discountAmount) }
          : {}),
        ...(dueDate ? { due_date: new Date(dueDate).toISOString() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err: any) =>
          setError(
            err?.message ?? "Failed to create invoice. Please try again.",
          ),
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#1C1C1F] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#FAFAFA]">
              Create Invoice
            </h2>
            <p className="mt-0.5 text-xs text-[#71717A]">
              A shareable payment link will be generated for your customer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form wraps both scrollable body + footer */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* Scrollable body */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
            {/* Customer */}
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Customer
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className={inputCls}
                    required
                  />
                </Field>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Phone" hint="Optional">
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
            </section>

            {/* Invoice settings */}
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Invoice Settings
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Currency">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={cn(inputCls, "appearance-none")}
                  >
                    <option value="USD">USD</option>
                    <option value="NGN">NGN</option>
                  </select>
                </Field>
                <Field label="Due Date" hint="Optional">
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={cn(inputCls, "scheme-dark")}
                  />
                </Field>
              </div>
            </section>

            {/* Line items */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                  Line Items
                </p>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:text-[#60A5FA] transition-colors"
                >
                  <Plus size={12} /> Add Item
                </button>
              </div>
              <div className="mb-1.5 grid grid-cols-[1fr_68px_96px_80px_32px] gap-2 px-1">
                {["Description", "Qty", "Unit Price", "Amount", ""].map((h) => (
                  <span
                    key={h}
                    className="text-[10px] font-semibold uppercase tracking-wider text-[#52525B]"
                  >
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {items.map((row) => (
                  <div
                    key={row._id}
                    className="grid grid-cols-[1fr_68px_96px_80px_32px] gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        updateItem(row._id, "description", e.target.value)
                      }
                      placeholder="Item description"
                      className={inputCls}
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      value={row.quantity || ""}
                      onChange={(e) =>
                        updateItem(row._id, "quantity", e.target.value)
                      }
                      placeholder="1"
                      className={inputCls}
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.unit_price || ""}
                      onChange={(e) =>
                        updateItem(row._id, "unit_price", e.target.value)
                      }
                      placeholder="0.00"
                      className={inputCls}
                      required
                    />
                    <div className="flex h-9 items-center rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#71717A]">
                      {fmt(row.quantity * row.unit_price)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(row._id)}
                      disabled={items.length === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525B] hover:bg-[#1C1C1F] hover:text-[#f87171] disabled:pointer-events-none disabled:opacity-30 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Adjustments */}
            <section>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Adjustments
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tax Rate %" hint="Optional">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </Field>
                <Field label="Discount Amount" hint="Optional">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </Field>
              </div>
            </section>

            {/* Notes */}
            <Field label="Notes" hint="Optional">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thank you for your business."
                className={cn(inputCls, "h-auto resize-none py-2.5")}
              />
            </Field>

            {/* Totals */}
            <div className="rounded-xl border border-[#1C1C1F] bg-[#09090B] px-4 py-3.5 text-sm">
              <div className="flex justify-between text-[#71717A]">
                <span>Subtotal</span>
                <span className="font-mono">
                  {currency} {fmt(subtotal)}
                </span>
              </div>
              {taxAmt > 0 && (
                <div className="mt-1.5 flex justify-between text-[#71717A]">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-mono">
                    {currency} {fmt(taxAmt)}
                  </span>
                </div>
              )}
              {discAmt > 0 && (
                <div className="mt-1.5 flex justify-between text-[#71717A]">
                  <span>Discount</span>
                  <span className="font-mono text-[#f87171]">
                    −{currency} {fmt(discAmt)}
                  </span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-[#1C1C1F] pt-2 font-semibold text-[#FAFAFA]">
                <span>Total</span>
                <span className="font-mono">
                  {currency} {fmt(total)}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-[#7f1d1d]/40 bg-[#450a0a]/60 px-3 py-2.5">
                <AlertCircle
                  size={13}
                  className="mt-0.5 shrink-0 text-[#f87171]"
                />
                <p className="text-xs text-[#f87171]">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#1C1C1F] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#1C1C1F] px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || createInvoice.isPending}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {createInvoice.isPending && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {createInvoice.isPending ? "Creating…" : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
