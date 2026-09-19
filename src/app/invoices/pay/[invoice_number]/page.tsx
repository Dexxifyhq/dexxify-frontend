"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";
import { payApi } from "@/lib/api/pay";
import { flattenAssets, type FlatAsset } from "@/lib/utils/assets";
import {
  ChevronDown,
  Search,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";
import WalletQRCode from "@/components/ui/WalletQRCode";

type Step = "form" | "deposit" | "error";

// ── Asset picker (shared pattern from /pay/[session_id]) ───────────────────

function AssetPicker({
  assets,
  selected,
  onSelect,
}: {
  assets: FlatAsset[];
  selected: FlatAsset | null;
  onSelect: (a: FlatAsset) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? assets.filter(
        (a) =>
          a.symbol.toLowerCase().includes(search.toLowerCase()) ||
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.networkDisplay.toLowerCase().includes(search.toLowerCase()),
      )
    : assets;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-dash-border bg-dash-hover px-3 text-sm transition-colors hover:border-dash-border-strong"
      >
        {selected ? (
          <>
            <span className="flex-1 text-left font-medium text-dash-foreground">
              {selected.symbol}
              <span className="ml-1.5 text-xs font-normal text-dash-muted">{selected.name}</span>
            </span>
            <span className="shrink-0 rounded bg-dash-hover px-1.5 py-0.5 text-[10px] text-dash-muted">
              {selected.networkDisplay}
            </span>
          </>
        ) : (
          <span className="flex-1 text-left text-dash-muted">Choose token…</span>
        )}
        <ChevronDown
          size={14}
          className={`shrink-0 text-dash-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-dash-border bg-dash-card shadow-2xl">
          <div className="flex items-center gap-2 border-b border-dash-border px-3 py-2.5">
            <Search size={13} className="shrink-0 text-dash-muted" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tokens…"
              className="flex-1 bg-transparent text-sm text-dash-foreground placeholder:text-dash-faint focus:outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-dash-muted">No tokens found</li>
            ) : (
              filtered.map((a) => (
                <li key={a.key}>
                  <button
                    type="button"
                    onClick={() => { onSelect(a); setOpen(false); setSearch(""); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-dash-hover ${selected?.key === a.key ? "text-dash-foreground" : "text-dash-muted"}`}
                  >
                    <span className="flex-1 truncate font-medium">
                      {a.symbol}
                      <span className="ml-1.5 text-xs font-normal text-dash-muted">{a.name}</span>
                    </span>
                    <span className="shrink-0 rounded bg-dash-hover px-1.5 py-0.5 text-[10px] text-dash-muted">
                      {a.networkDisplay}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function InvoicePayPage() {
  const { invoice_number } = useParams<{ invoice_number: string }>();

  const {
    data: invoice,
    isLoading: invoiceLoading,
    isError: invoiceError,
  } = useQuery({
    queryKey: ["invoice-public", invoice_number],
    queryFn: () => invoicesApi.getByNumber(invoice_number),
    enabled: !!invoice_number,
    retry: 1,
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ["pay-deposit-assets"],
    queryFn: payApi.getDepositAssets,
    staleTime: 60 * 60 * 1000,
  });

  const sessionMutation = useMutation({
    mutationFn: (dto: { crypto_asset: string; network: string }) =>
      invoicesApi.createPaymentSession(invoice_number, dto),
  });

  const assets: FlatAsset[] = flattenAssets(
    (assetsData as any)?.data ?? assetsData ?? {},
  );

  const [step, setStep] = useState<Step>("form");
  const [selectedAsset, setSelectedAsset] = useState<FlatAsset | null>(null);
  const [depositInfo, setDepositInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (step !== "deposit" || !depositInfo?.expires_at) return;
    const calc = () =>
      Math.max(0, Math.floor((new Date(depositInfo.expires_at).getTime() - Date.now()) / 1000));
    setTimeLeft(calc());
    const id = setInterval(() => {
      const s = calc();
      setTimeLeft(s);
      if (s === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [step, depositInfo?.expires_at]);

  const handlePay = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset || sessionMutation.isPending) return;

    sessionMutation.mutate(
      {
        crypto_asset: selectedAsset.symbol,
        network: selectedAsset.network,
      },
      {
        onSuccess: (session: any) => {
          if (!session?.deposit_address) { setStep("error"); return; }
          setDepositInfo(session);
          setStep("deposit");
        },
        onError: () => setStep("error"),
      },
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPending = sessionMutation.isPending;
  const depositAddress = depositInfo?.deposit_address ?? null;
  const cryptoAsset = depositInfo?.crypto_asset ?? selectedAsset?.symbol;
  const network = depositInfo?.network ?? selectedAsset?.networkDisplay;
  const payment = depositInfo?.metadata?.payment ?? null;

  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const timerExpired = timeLeft === 0;

  // ── Loading / error ────────────────────────────────────────────────────────

  if (invoiceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dash-bg">
        <Loader2 size={24} className="animate-spin text-dash-muted" />
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-dash-bg p-6 text-center">
        <AlertTriangle size={32} className="text-dash-warning" strokeWidth={1.5} />
        <p className="text-base font-semibold text-dash-foreground">Invoice not found</p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice link is invalid or has expired.
        </p>
      </div>
    );
  }

  if (invoice.status === "paid") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-dash-bg p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dash-success-bg text-dash-success">
          <Check size={28} />
        </div>
        <p className="text-base font-semibold text-dash-foreground">Invoice Paid</p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice ({invoice.invoice_number}) has already been paid. Thank you!
        </p>
      </div>
    );
  }

  if (["cancelled", "void"].includes(invoice.status)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-dash-bg p-6 text-center">
        <AlertTriangle size={32} className="text-dash-muted" strokeWidth={1.5} />
        <p className="text-base font-semibold text-dash-foreground">Invoice Unavailable</p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice has been {invoice.status} and can no longer be paid.
        </p>
      </div>
    );
  }

  const customerName = invoice.customer
    ? [invoice.customer.first_name, invoice.customer.last_name].filter(Boolean).join(" ") ||
      invoice.customer.email
    : null;

  const total = Number(invoice.total);
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col items-center bg-dash-bg px-4 py-12">
      <p className="mb-8 text-sm font-semibold tracking-widest text-dash-muted uppercase">
        Dexxify
      </p>

      <div className="w-full max-w-sm space-y-3">
        {/* Invoice card */}
        <div className="rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-dash-border px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dash-hover">
              <FileText size={16} className="text-dash-muted" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold text-dash-foreground">{invoice.invoice_number}</p>
              {customerName && (
                <p className="truncate text-xs text-dash-muted">{customerName}</p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center gap-1 border-b border-dash-border px-6 py-6 text-center">
            <p className="text-xs uppercase tracking-wider text-dash-muted">Amount Due</p>
            <p className="text-4xl font-bold text-dash-foreground">
              {fmt(total)}
              <span className="ml-1.5 text-lg font-normal text-dash-muted">
                {invoice.currency}
              </span>
            </p>
            {invoice.due_date && (
              <p className="mt-1 text-xs text-dash-muted">
                Due{" "}
                {new Date(invoice.due_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Line items summary */}
          <div className="border-b border-dash-border px-5 py-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
              Items
            </p>
            <div className="flex flex-col gap-2">
              {invoice.line_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate text-dash-muted">{item.description}</span>
                  <span className="shrink-0 font-mono text-dash-muted">
                    {invoice.currency} {fmt(Number(item.amount))}
                  </span>
                </div>
              ))}
            </div>
            {(Number(invoice.tax_amount) > 0 || Number(invoice.discount_amount) > 0) && (
              <div className="mt-3 border-t border-dash-border pt-3 text-xs text-dash-muted">
                {Number(invoice.tax_amount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-mono">{fmt(Number(invoice.tax_amount))}</span>
                  </div>
                )}
                {Number(invoice.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-mono text-dash-error">−{fmt(Number(invoice.discount_amount))}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Step: form ── */}
          {step === "form" && (
            <form onSubmit={handlePay} className="flex flex-col gap-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
                  Pay With
                </label>
                {assetsLoading ? (
                  <div className="flex h-11 items-center gap-2 px-3 text-xs text-dash-muted">
                    <Loader2 size={13} className="animate-spin" />
                    Loading tokens…
                  </div>
                ) : (
                  <AssetPicker
                    assets={assets}
                    selected={selectedAsset}
                    onSelect={setSelectedAsset}
                  />
                )}
              </div>

              {sessionMutation.isError && (
                <p className="rounded-xl border border-dash-error-border bg-dash-error-bg px-3 py-2.5 text-xs text-dash-error">
                  {(sessionMutation.error as any)?.message ??
                    "Something went wrong. Please try again."}
                </p>
              )}

              <button
                type="submit"
                disabled={!selectedAsset || isPending}
                className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-dash-accent text-sm font-semibold text-dash-bg hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                {isPending ? "Processing…" : "Get Payment Address"}
              </button>
            </form>
          )}

          {/* ── Step: deposit ── */}
          {step === "deposit" && depositInfo && (
            <div className="flex flex-col gap-4 px-5 py-5">
              {/* Timer */}
              {timeLeft !== null && (
                <div className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 ${
                  timerExpired
                    ? "border-dash-error-border bg-dash-error-bg"
                    : timeLeft < 120
                    ? "border-dash-warning-border bg-dash-warning-bg"
                    : "border-dash-border bg-dash-hover"
                }`}>
                  <Clock size={12} className={timerExpired ? "text-dash-error" : timeLeft < 120 ? "text-dash-warning" : "text-dash-muted"} />
                  <span className={`font-mono text-sm font-semibold tabular-nums ${
                    timerExpired ? "text-dash-error" : timeLeft < 120 ? "text-dash-warning" : "text-dash-muted"
                  }`}>
                    {timerExpired ? "Expired" : fmtTime(timeLeft)}
                  </span>
                  {!timerExpired && (
                    <span className="text-[10px] text-dash-muted">remaining</span>
                  )}
                </div>
              )}

              {/* Crypto amount + fee */}
              {payment && (
                <div className="rounded-xl border border-dash-border bg-dash-hover px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-muted">Send exactly</span>
                  </div>
                  <p className="mt-1 font-mono text-lg font-bold text-dash-foreground">
                    {payment.amount}
                    <span className="ml-1.5 text-sm font-normal text-dash-muted">{payment.asset}</span>
                  </p>
                  {(Number(payment.gasFee) > 0 || payment.feePaidBy) && (
                    <div className="mt-2 flex items-center justify-between border-t border-dash-border pt-2 text-[11px] text-dash-muted">
                      <span>Network fee</span>
                      <span className="font-mono">
                        {Number(payment.gasFee) > 0 ? `${payment.gasFee} ${payment.asset}` : "included"}
                        {payment.feePaidBy === "customer" && " (paid by you)"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Address */}
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
                  Deposit Address
                </p>
                {depositAddress && (
                  <div className="flex justify-center">
                    <WalletQRCode address={depositAddress} size={160} />
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-hover px-3 py-2.5">
                  <span className="flex-1 break-all font-mono text-xs text-dash-muted">
                    {depositAddress ?? "—"}
                  </span>
                  {depositAddress && (
                    <button
                      type="button"
                      onClick={() => handleCopy(depositAddress)}
                      className="shrink-0 text-dash-muted hover:text-dash-foreground transition-colors"
                    >
                      {copied ? <Check size={14} className="text-dash-success" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Network warning */}
              <div className="flex items-start gap-2 rounded-xl border border-dash-warning-border bg-dash-warning-bg px-3 py-2.5">
                <AlertTriangle size={13} className="mt-0.5 shrink-0 text-dash-warning" />
                <p className="text-xs text-dash-warning">
                  Only send <span className="font-semibold">{cryptoAsset}</span> on the{" "}
                  <span className="font-semibold">{network}</span> network to this address.
                  Wrong network = permanent loss.
                </p>
              </div>

              <p className="text-center text-[11px] text-dash-muted">
                Invoice {invoice.invoice_number} · {invoice.currency} {fmt(total)}
              </p>
            </div>
          )}

          {/* ── Step: error ── */}
          {step === "error" && (
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <AlertTriangle size={28} className="text-dash-error" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-dash-foreground">Failed to generate address</p>
              <p className="text-xs text-dash-muted">
                Something went wrong. Please try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  sessionMutation.reset();
                }}
                className="mt-2 h-9 rounded-xl border border-dash-border px-4 text-sm text-dash-muted hover:bg-dash-hover transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {invoice.notes && (
          <p className="px-1 text-center text-xs text-dash-muted">{invoice.notes}</p>
        )}

        <p className="text-center text-xs text-dash-muted">
          Powered by <span className="font-semibold text-dash-muted">Dexxify</span>
        </p>
      </div>
    </div>
  );
}
