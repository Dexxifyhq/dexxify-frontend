"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";
import { payApi } from "@/lib/api/pay";
import { flattenAssets, type FlatAsset } from "@/lib/utils/assets";
import type { Invoice } from "@/lib/types/invoices";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Download,
  FileText,
  Loader2,
} from "lucide-react";
import WalletQRCode from "@/components/ui/WalletQRCode";
import { AssetLogo } from "@/components/dashboard/balance/modal-kit";
import { cn } from "@/utils/utils";

type Step = "form" | "deposit" | "error";

const SYMBOL: Record<string, string> = { NGN: "₦", USD: "$", USDT: "$", USDC: "$" };

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// The public invoice response isn't typed with the issuing business; use it
// when the API includes it.
type PublicInvoice = Invoice & {
  business?: { name?: string | null; logo_url?: string | null } | null;
  business_name?: string | null;
};

// ── Select ────────────────────────────────────────────────────────────────────

/** Label-left, value-right select row, as in the payment card. */
function SelectRow<T extends { key: string }>({
  label,
  placeholder,
  value,
  options,
  render,
  onSelect,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: T | null;
  options: T[];
  render: (o: T) => React.ReactNode;
  onSelect: (o: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-16 w-full items-center justify-between gap-4 rounded-2xl border px-5 text-left transition-colors",
          disabled
            ? "cursor-not-allowed border-dash-border bg-dash-bg"
            : open
              ? "border-dash-accent bg-dash-card"
              : "border-dash-border-strong bg-dash-card hover:border-dash-accent",
        )}
      >
        <span className={cn("text-base", disabled ? "text-dash-faint" : "text-dash-muted")}>
          {label}
        </span>
        <span
          className={cn(
            "flex min-w-0 items-center gap-2 text-base",
            disabled ? "text-dash-faint" : value ? "font-medium text-dash-foreground" : "text-dash-muted",
          )}
        >
          <span className="truncate">{value ? render(value) : placeholder}</span>
          <ChevronDown
            size={18}
            className={cn("shrink-0 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      {open && !disabled && (
        <ul className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-dash-border bg-dash-card p-1.5 shadow-xl">
          {options.map((o) => (
            <li key={o.key}>
              <button
                type="button"
                onClick={() => {
                  onSelect(o);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-dash-hover",
                  value?.key === o.key ? "font-semibold text-dash-foreground" : "text-dash-foreground",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">{render(o)}</span>
                {value?.key === o.key && <Check size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────

function Steps({ current }: { current: 0 | 1 }) {
  const steps = ["Payment method", "Payment address"];
  return (
    <ol className="flex items-center gap-4">
      {steps.map((s, i) => (
        <li key={s} className={cn("flex items-center gap-3", i === 0 && "flex-1")}>
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
              i <= current
                ? "bg-dash-accent text-white"
                : "border border-dash-border-strong text-dash-foreground",
            )}
          >
            {i < current ? <Check size={15} strokeWidth={3} /> : i + 1}
          </span>
          <span
            className={cn(
              "whitespace-nowrap text-base",
              i <= current ? "font-medium text-dash-foreground" : "text-dash-muted",
            )}
          >
            {s}
          </span>
          {i === 0 && (
            <span className="ml-1 hidden h-px flex-1 border-t border-dashed border-dash-border-strong sm:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

// ── Status screens ────────────────────────────────────────────────────────────

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-dash-bg p-6 text-center">
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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

  const assets: FlatAsset[] = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response envelope
    () => flattenAssets((assetsData as any)?.data ?? assetsData ?? {}),
    [assetsData],
  );

  // Asset first, then one of the networks it's available on.
  const symbols = useMemo(() => {
    const seen = new Map<string, { key: string; symbol: string; name: string }>();
    for (const a of assets)
      if (!seen.has(a.symbol)) seen.set(a.symbol, { key: a.symbol, symbol: a.symbol, name: a.name });
    return [...seen.values()];
  }, [assets]);

  const [step, setStep] = useState<Step>("form");
  const [symbol, setSymbol] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<FlatAsset | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped session response
  const [depositInfo, setDepositInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const networks = assets.filter((a) => a.symbol === symbol);

  // Deposit countdown: seconds left are derived from expires_at and a clock
  // that ticks once a second.
  const expiresAt = depositInfo?.expires_at ? new Date(depositInfo.expires_at).getTime() : null;
  const timeLeft = expiresAt ? Math.max(0, Math.floor((expiresAt - now) / 1000)) : null;
  const timerExpired = timeLeft === 0;

  useEffect(() => {
    if (step !== "deposit" || !expiresAt || timerExpired) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step, expiresAt, timerExpired]);

  const handlePay = () => {
    if (!selectedAsset || sessionMutation.isPending) return;
    sessionMutation.mutate(
      { crypto_asset: selectedAsset.symbol, network: selectedAsset.network },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped session response
        onSuccess: (session: any) => {
          if (!session?.deposit_address) {
            setStep("error");
            return;
          }
          setNow(Date.now());
          setDepositInfo(session);
          setStep("deposit");
        },
        onError: () => setStep("error"),
      },
    );
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  // ── Loading / unavailable ─────────────────────────────────────────────────

  if (invoiceLoading) {
    return (
      <Centered>
        <Loader2 size={24} className="animate-spin text-dash-muted" />
      </Centered>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <Centered>
        <AlertTriangle size={32} className="text-dash-warning" strokeWidth={1.5} />
        <p className="text-base font-semibold text-dash-foreground">Invoice not found</p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice link is invalid or has expired.
        </p>
      </Centered>
    );
  }

  if (invoice.status === "paid") {
    return (
      <Centered>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dash-success-bg text-dash-success">
          <Check size={28} />
        </div>
        <p className="text-base font-semibold text-dash-foreground">Invoice Paid</p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice ({invoice.invoice_number}) has already been paid. Thank you!
        </p>
      </Centered>
    );
  }

  if (["cancelled", "void"].includes(invoice.status)) {
    return (
      <Centered>
        <AlertTriangle size={32} className="text-dash-muted" strokeWidth={1.5} />
        <p className="text-base font-semibold text-dash-foreground">Invoice Unavailable</p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice has been {invoice.status} and can no longer be paid.
        </p>
      </Centered>
    );
  }

  const inv = invoice as PublicInvoice;
  const merchant = inv.business?.name || inv.business_name || null;
  const merchantLogo = inv.business?.logo_url || null;
  const sym = SYMBOL[invoice.currency?.toUpperCase()] ?? "";
  const total = Number(invoice.total);
  const items = invoice.line_items ?? [];
  const payment = depositInfo?.metadata?.payment ?? null;
  const depositAddress: string | null = depositInfo?.deposit_address ?? null;
  const cryptoAsset = depositInfo?.crypto_asset ?? selectedAsset?.symbol;
  const network = depositInfo?.network ?? selectedAsset?.networkDisplay;
  const fmtTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="grid min-h-screen bg-dash-card lg:grid-cols-2">
      {/* ── Invoice ─────────────────────────────────────────── */}
      <section className="border-b border-dash-border bg-(--n-50) px-6 py-12 lg:border-b-0 lg:border-r lg:py-16">
        <div className="mx-auto w-full max-w-md lg:ml-auto lg:mr-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {merchantLogo ? (
                // eslint-disable-next-line @next/next/no-img-element -- merchant-uploaded, arbitrary host
                <img src={merchantLogo} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-dash-accent text-2xl font-semibold text-white">
                  {merchant ? merchant.charAt(0).toUpperCase() : <FileText size={24} />}
                </span>
              )}
              <p className="truncate text-xl font-semibold text-dash-foreground">
                {merchant ?? "Invoice"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Download or print invoice"
              title="Download or print"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground print:hidden"
            >
              <Download size={18} />
            </button>
          </div>

          <div className="mt-14">
            <p className="flex items-center gap-4 text-sm font-medium uppercase tracking-[0.12em] text-dash-muted">
              Amount due
              <span
                className={cn(
                  "text-xs font-semibold",
                  invoice.status === "overdue" ? "text-dash-error" : "text-dash-muted",
                )}
              >
                {invoice.status === "overdue" ? "Overdue" : "Unpaid"}
              </span>
            </p>
            <p className="mt-2 flex items-baseline gap-2 text-dash-foreground">
              <span className="text-3xl text-dash-muted">{sym}</span>
              <span className="text-6xl font-semibold tracking-tight">{fmt(total)}</span>
            </p>
            {invoice.due_date && (
              <p className="mt-2 text-lg text-dash-muted">Due on {fmtDay(invoice.due_date)}</p>
            )}
          </div>

          {/* Items */}
          <ul className="mt-10 divide-y divide-dash-border-strong/60 border-y border-dash-border-strong/60">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-4 py-6">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-dash-border-strong bg-dash-card text-dash-muted">
                  <FileText size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg text-dash-foreground">{item.description}</p>
                  <p className="text-base text-dash-muted">
                    {item.quantity} × {sym}
                    {fmtShort(Number(item.unit_price))}
                  </p>
                </div>
                <span className="shrink-0 text-lg font-semibold text-dash-foreground">
                  {sym}
                  {fmt(Number(item.amount))}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2">
            {Number(invoice.tax_amount) > 0 && (
              <div className="flex justify-between text-base text-dash-muted">
                <span>Tax ({invoice.tax_rate}%)</span>
                <span>{sym}{fmt(Number(invoice.tax_amount))}</span>
              </div>
            )}
            {Number(invoice.discount_amount) > 0 && (
              <div className="flex justify-between text-base text-dash-muted">
                <span>Discount</span>
                <span>−{sym}{fmt(Number(invoice.discount_amount))}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-lg text-dash-foreground">Total</span>
              <span className="text-lg font-semibold text-dash-foreground">
                {sym}
                {fmt(total)} {invoice.currency}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="mt-12">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-dash-muted">
              Invoice details
            </p>
            <dl className="mt-4 space-y-3 text-base">
              <div className="flex items-center justify-between gap-6">
                <dt className="shrink-0 text-dash-muted">Invoice number</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-sm text-dash-foreground">
                    {invoice.invoice_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(invoice.invoice_number, "number")}
                    aria-label="Copy invoice number"
                    className="shrink-0 text-dash-faint transition-colors hover:text-dash-foreground print:hidden"
                  >
                    {copied === "number" ? (
                      <Check size={14} className="text-dash-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </dd>
              </div>
              <div className="flex justify-between gap-6">
                <dt className="text-dash-muted">Date of issue</dt>
                <dd className="text-dash-foreground">{fmtDay(invoice.created_at)}</dd>
              </div>
              {invoice.due_date && (
                <div className="flex justify-between gap-6">
                  <dt className="text-dash-muted">Due date</dt>
                  <dd className="text-dash-foreground">{fmtDay(invoice.due_date)}</dd>
                </div>
              )}
            </dl>
            {invoice.notes && (
              <p className="mt-6 whitespace-pre-wrap text-sm text-dash-muted">{invoice.notes}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Payment ─────────────────────────────────────────── */}
      <section className="px-6 py-12 lg:py-16 print:hidden">
        <div className="mx-auto w-full max-w-xl lg:ml-20 lg:mr-auto">
          <Steps current={step === "deposit" ? 1 : 0} />

          <div className="mt-10 rounded-[28px] border border-dash-border bg-dash-card p-8 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.15)] sm:p-10">
            {step === "form" && (
              <>
                <h1 className="text-3xl font-semibold tracking-tight text-dash-foreground">
                  Complete your payment
                </h1>
                <p className="mt-2 text-lg text-dash-muted">
                  {merchant ? `Pay ${merchant} securely with crypto.` : "Pay securely with crypto."}
                </p>

                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-dash-muted">
                  Pay with
                </p>
                <div className="mt-3 space-y-4">
                  {assetsLoading ? (
                    <div className="flex h-16 items-center gap-2 rounded-2xl border border-dash-border px-5 text-sm text-dash-muted">
                      <Loader2 size={15} className="animate-spin" /> Loading assets…
                    </div>
                  ) : (
                    <SelectRow
                      label="Asset"
                      placeholder="Select asset"
                      value={symbols.find((s) => s.symbol === symbol) ?? null}
                      options={symbols}
                      render={(o) => (
                        <>
                          <AssetLogo symbol={o.symbol} className="h-6 w-6" />
                          <span>{o.symbol}</span>
                        </>
                      )}
                      onSelect={(o) => {
                        setSymbol(o.symbol);
                        const nets = assets.filter((a) => a.symbol === o.symbol);
                        setSelectedAsset(nets.length === 1 ? nets[0] : null);
                      }}
                    />
                  )}
                  <SelectRow
                    label="Network"
                    placeholder={symbol ? "Select network" : "Select an asset first"}
                    value={selectedAsset}
                    options={networks}
                    render={(o) => <span>{o.networkDisplay}</span>}
                    onSelect={setSelectedAsset}
                    disabled={!symbol}
                  />
                </div>

                {sessionMutation.isError && (
                  <p className="mt-5 rounded-xl border border-dash-error-border bg-dash-error-bg px-4 py-3 text-sm text-dash-error">
                    {(sessionMutation.error as Error)?.message || "Something went wrong. Please try again."}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={!selectedAsset || sessionMutation.isPending}
                  className="mt-8 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-dash-accent text-lg font-semibold text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:bg-dash-muted"
                >
                  {sessionMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                  {sessionMutation.isPending ? "Processing…" : "Proceed to Payment"}
                </button>
              </>
            )}

            {step === "deposit" && depositInfo && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-dash-foreground">
                      Send your payment
                    </h1>
                    <p className="mt-2 text-lg text-dash-muted">
                      Send {cryptoAsset} on the {network} network.
                    </p>
                  </div>
                  {timeLeft !== null && (
                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-semibold tabular-nums",
                        timerExpired
                          ? "bg-dash-error-bg text-dash-error"
                          : timeLeft < 120
                            ? "bg-dash-warning-bg text-dash-warning"
                            : "bg-dash-hover text-dash-foreground",
                      )}
                    >
                      <Clock size={14} />
                      {timerExpired ? "Expired" : fmtTime(timeLeft)}
                    </span>
                  )}
                </div>

                {payment && (
                  <div className="mt-8 rounded-2xl bg-dash-bg p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-dash-muted">
                      Send exactly
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="flex items-center gap-2.5 font-mono text-2xl font-semibold text-dash-foreground">
                        <AssetLogo symbol={payment.asset} className="h-7 w-7" />
                        {payment.amount} <span className="text-base font-normal text-dash-muted">{payment.asset}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(String(payment.amount), "amount")}
                        aria-label="Copy amount"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
                      >
                        {copied === "amount" ? <Check size={16} className="text-dash-success" /> : <Copy size={16} />}
                      </button>
                    </div>
                    {(Number(payment.gasFee) > 0 || payment.feePaidBy) && (
                      <div className="mt-3 flex items-center justify-between border-t border-dash-border pt-3 text-sm text-dash-muted">
                        <span>Network fee</span>
                        <span className="font-mono">
                          {Number(payment.gasFee) > 0 ? `${payment.gasFee} ${payment.asset}` : "included"}
                          {payment.feePaidBy === "customer" && " (paid by you)"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {depositAddress && (
                  <div className="mt-6 flex flex-col items-center gap-5">
                    <div className="rounded-2xl border border-dash-border p-3">
                      <WalletQRCode address={depositAddress} size={176} />
                    </div>
                    <div className="w-full">
                      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-dash-muted">
                        Payment address
                      </p>
                      <div className="flex items-center gap-3 rounded-2xl border border-dash-border-strong px-5 py-4">
                        <span className="min-w-0 flex-1 break-all font-mono text-sm text-dash-foreground">
                          {depositAddress}
                        </span>
                        <button
                          type="button"
                          onClick={() => copy(depositAddress, "address")}
                          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-dash-border px-3 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
                        >
                          {copied === "address" ? (
                            <>
                              <Check size={14} className="text-dash-success" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-6 flex items-start gap-2.5 rounded-2xl border border-dash-warning-border bg-dash-warning-bg px-4 py-3 text-sm text-dash-warning">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>
                    Only send <span className="font-semibold">{cryptoAsset}</span> on the{" "}
                    <span className="font-semibold">{network}</span> network to this address.
                    Sending anything else may be lost permanently.
                  </span>
                </p>
              </>
            )}

            {step === "error" && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <AlertTriangle size={30} className="text-dash-error" strokeWidth={1.5} />
                <p className="text-lg font-semibold text-dash-foreground">
                  Couldn&apos;t generate a payment address
                </p>
                <p className="text-sm text-dash-muted">Something went wrong. Please try again.</p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    sessionMutation.reset();
                  }}
                  className="mt-3 h-12 rounded-2xl border border-dash-border px-6 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
                >
                  Try again
                </button>
              </div>
            )}
          </div>

          <p className="mt-10 flex items-center justify-center gap-2 text-sm text-dash-muted">
            Powered by
            <span className="flex items-center gap-1.5 font-semibold text-dash-foreground">
              Dexxify
              {/* eslint-disable-next-line @next/next/no-img-element -- static brand mark */}
              <img src="/logo-set/transparent-2.png" alt="" className="h-5 w-5" />
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
