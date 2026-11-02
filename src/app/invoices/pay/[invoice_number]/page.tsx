"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { invoicesApi } from "@/lib/api/invoices";
import { payApi } from "@/lib/api/pay";
import { usePaymentSessionEvents } from "@/lib/hooks/payment-sessions/usePaymentSessionEvents";
import { flattenAssets, type FlatAsset } from "@/lib/utils/assets";
import { humanizeFailureReason } from "@/lib/utils/payment-result";
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
import {
  AssetNetworkPicker,
  CARD,
  Centered,
  DepositDetails,
  HostedPayShell,
  PaymentResultIcon,
  Steps,
  TimerPill,
} from "@/components/pay/hosted-pay";
import { cn } from "@/utils/utils";

type Step = "form" | "deposit" | "error";

const SYMBOL: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  USDT: "$",
  USDC: "$",
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtShort = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// The public invoice response isn't typed with the issuing business; use it
// when the API includes it.
type PublicInvoice = Invoice & {
  business?: { name?: string | null; logo_url?: string | null } | null;
  business_name?: string | null;
};

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

  const [step, setStep] = useState<Step>("form");
  const [selectedAsset, setSelectedAsset] = useState<FlatAsset | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped session response
  const [depositInfo, setDepositInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Deposit countdown: seconds left are derived from expires_at and a clock
  // that ticks once a second.
  const expiresAt = depositInfo?.expires_at
    ? new Date(depositInfo.expires_at).getTime()
    : null;
  const timeLeft = expiresAt
    ? Math.max(0, Math.floor((expiresAt - now) / 1000))
    : null;
  const timerExpired = timeLeft === 0;

  useEffect(() => {
    if (step !== "deposit" || !expiresAt || timerExpired) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step, expiresAt, timerExpired]);

  const sessionId: string | undefined = depositInfo?.id;
  const { partial, completed, failed } = usePaymentSessionEvents(sessionId);

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
        <AlertTriangle
          size={32}
          className="text-dash-warning"
          strokeWidth={1.5}
        />
        <p className="text-base font-semibold text-dash-foreground">
          Invoice not found
        </p>
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
        <p className="text-base font-semibold text-dash-foreground">
          Invoice Paid
        </p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice ({invoice.invoice_number}) has already been paid. Thank
          you!
        </p>
      </Centered>
    );
  }

  if (["cancelled", "void"].includes(invoice.status)) {
    return (
      <Centered>
        <AlertTriangle
          size={32}
          className="text-dash-muted"
          strokeWidth={1.5}
        />
        <p className="text-base font-semibold text-dash-foreground">
          Invoice Unavailable
        </p>
        <p className="max-w-xs text-sm text-dash-muted">
          This invoice has been {invoice.status} and can no longer be paid.
        </p>
      </Centered>
    );
  }

  if (completed) {
    return (
      <Centered>
        <PaymentResultIcon variant="success" />
        <p className="text-lg font-semibold text-dash-foreground">
          Payment successful
        </p>
        <p className="text-sm text-dash-muted">
          You paid{" "}
          <span className="font-semibold text-dash-foreground">
            {SYMBOL[invoice.currency?.toUpperCase()] ?? ""}
            {fmt(Number(completed.amount_paid))}
          </span>
        </p>
        <p className="mt-1 font-mono text-xs text-dash-faint">
          {invoice.invoice_number}
        </p>
      </Centered>
    );
  }

  if (failed) {
    return (
      <Centered>
        <PaymentResultIcon variant="failed" />
        <p className="text-lg font-semibold text-dash-foreground">
          Payment failed
        </p>
        <p className="max-w-xs text-sm text-dash-muted">
          {humanizeFailureReason(failed.reason)}
        </p>
        <p className="mt-1 font-mono text-xs text-dash-faint">
          {invoice.invoice_number}
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
  const cryptoAsset: string | undefined =
    depositInfo?.crypto_asset ?? selectedAsset?.symbol;
  const network: string | undefined =
    depositInfo?.network ?? selectedAsset?.networkDisplay;

  // ── Summary ───────────────────────────────────────────────────────────────

  const summary = (
    <>
      {/* Merchant */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex min-w-0 items-center gap-3">
          {merchantLogo ? (
            // eslint-disable-next-line @next/next/no-img-element -- merchant-uploaded, arbitrary host
            <img
              src={merchantLogo}
              alt=""
              className="h-10 w-10 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-accent text-base font-semibold text-white">
              {merchant ? (
                merchant.charAt(0).toUpperCase()
              ) : (
                <FileText size={17} />
              )}
            </span>
          )}
          <p className="truncate text-base font-semibold text-dash-foreground">
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
          <Download size={17} />
        </button>
      </div>

      {/* Summary */}
      <section className={cn(CARD, "mt-6")}>
        <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-dash-muted">
          Amount due
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] tracking-[0.1em]",
              invoice.status === "overdue"
                ? "bg-dash-error-bg text-dash-error"
                : "bg-dash-hover text-dash-muted",
            )}
          >
            {invoice.status === "overdue" ? "Overdue" : "Unpaid"}
          </span>
        </p>
        <p className="mt-2.5 flex items-baseline gap-1.5 text-dash-foreground">
          <span className="text-xl text-dash-muted">{sym}</span>
          <span className="text-[44px] font-medium leading-none tracking-tight">
            {fmt(total)}
          </span>
        </p>
        {invoice.due_date && (
          <p className="mt-2 text-sm text-dash-muted">
            Due on {fmtDay(invoice.due_date)}
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="mt-5 flex w-full items-center justify-between rounded-xl bg-dash-bg px-4 py-3 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover print:hidden"
        >
          <span>
            {showDetails ? "Hide invoice details" : "View invoice details"}
            <span className="ml-2 text-xs font-normal text-dash-muted">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-dash-muted transition-transform",
              showDetails && "rotate-180",
            )}
          />
        </button>

        {/* Details — collapsed on screen, always included when printing */}
        <div
          className={cn("mt-5", showDetails ? "block" : "hidden print:block")}
        >
          <ul className="divide-y divide-dash-border">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dash-border text-dash-muted">
                  <FileText size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dash-foreground">
                    {item.description}
                  </p>
                  <p className="text-xs text-dash-muted">
                    {item.quantity} × {sym}
                    {fmtShort(Number(item.unit_price))}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-dash-foreground">
                  {sym}
                  {fmt(Number(item.amount))}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-2 space-y-2 border-t border-dash-border pt-3 text-sm">
            {Number(invoice.tax_amount) > 0 && (
              <div className="flex justify-between text-dash-muted">
                <span>Tax ({invoice.tax_rate}%)</span>
                <span>
                  {sym}
                  {fmt(Number(invoice.tax_amount))}
                </span>
              </div>
            )}
            {Number(invoice.discount_amount) > 0 && (
              <div className="flex justify-between text-dash-muted">
                <span>Discount</span>
                <span>
                  −{sym}
                  {fmt(Number(invoice.discount_amount))}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-dash-muted">Total</span>
              <span className="font-semibold text-dash-foreground">
                {sym}
                {fmt(total)}{" "}
                <span className="text-xs font-normal text-dash-muted">
                  {invoice.currency}
                </span>
              </span>
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 rounded-2xl bg-dash-bg p-4 text-sm">
            <div className="flex items-center justify-between gap-6">
              <dt className="shrink-0 text-dash-muted">Invoice number</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-xs text-dash-foreground">
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
              <dd className="text-dash-foreground">
                {fmtDay(invoice.created_at)}
              </dd>
            </div>
            {invoice.due_date && (
              <div className="flex justify-between gap-6">
                <dt className="text-dash-muted">Due date</dt>
                <dd className="text-dash-foreground">
                  {fmtDay(invoice.due_date)}
                </dd>
              </div>
            )}
          </dl>
          {invoice.notes && (
            <p className="mt-4 whitespace-pre-wrap text-sm text-dash-muted">
              {invoice.notes}
            </p>
          )}
        </div>
      </section>
    </>
  );

  // ── Payment ───────────────────────────────────────────────────────────────

  const amountRemaining = partial
    ? partial.amount_due ?? Math.max(total - Number(partial.amount_paid), 0)
    : 0;

  const paymentCard = (
    <section className={CARD}>
      {partial && (
        <div className="fade-up mb-5 flex items-start gap-3 rounded-2xl border border-dash-warning-border bg-dash-warning-bg px-4 py-3.5">
          <Clock size={16} className="mt-0.5 shrink-0 text-dash-warning" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-dash-warning">
              Partial payment received
            </p>
            <p className="mt-0.5 text-dash-warning">
              We&apos;ve received{" "}
              <span className="font-semibold">
                {sym}
                {fmt(Number(partial.amount_paid))}
              </span>{" "}
              so far.{" "}
              <span className="font-semibold">
                {sym}
                {fmt(amountRemaining)}
              </span>{" "}
              still due.
            </p>
          </div>
        </div>
      )}

      <div className="mb-5">
        <Steps current={step === "deposit" ? 1 : 0} />
      </div>

      {step === "form" && (
        <>
          <h1 className="text-xl font-semibold tracking-tight text-dash-foreground">
            Complete your payment
          </h1>
          <p className="mt-1 text-sm text-dash-muted">
            {merchant
              ? `Pay ${merchant} securely with crypto.`
              : "Pay securely with crypto."}
          </p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-dash-muted">
            Pay with
          </p>
          <div className="mt-3">
            <AssetNetworkPicker
              assets={assets}
              loading={assetsLoading}
              value={selectedAsset}
              onChange={setSelectedAsset}
            />
          </div>

          {sessionMutation.isError && (
            <p className="mt-4 rounded-xl border border-dash-error-border bg-dash-error-bg px-4 py-3 text-sm text-dash-error">
              {(sessionMutation.error as Error)?.message ||
                "Something went wrong. Please try again."}
            </p>
          )}

          <button
            type="button"
            onClick={handlePay}
            disabled={!selectedAsset || sessionMutation.isPending}
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-dash-accent text-base font-semibold text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:bg-dash-border-strong"
          >
            {sessionMutation.isPending && (
              <Loader2 size={18} className="animate-spin" />
            )}
            {sessionMutation.isPending ? "Processing…" : "Proceed to Payment"}
          </button>
        </>
      )}

      {step === "deposit" && depositInfo && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-dash-foreground">
                Send your payment
              </h1>
              <p className="mt-1 text-sm text-dash-muted">
                Send {cryptoAsset} on the {network} network.
              </p>
            </div>
            <TimerPill seconds={timeLeft} />
          </div>
          <DepositDetails
            amount={payment ? String(payment.amount) : null}
            asset={payment?.asset ?? cryptoAsset}
            feeNote={
              payment && (Number(payment.gasFee) > 0 || payment.feePaidBy) ? (
                <>
                  Network fee{" "}
                  <span className="font-mono">
                    {Number(payment.gasFee) > 0
                      ? `${payment.gasFee} ${payment.asset}`
                      : "included"}
                  </span>
                  {payment.feePaidBy === "customer" && " · paid by you"}
                </>
              ) : undefined
            }
            address={depositAddress}
            network={network}
          />
        </>
      )}

      {step === "error" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertTriangle
            size={30}
            className="text-dash-error"
            strokeWidth={1.5}
          />
          <p className="text-lg font-semibold text-dash-foreground">
            Couldn&apos;t generate a payment address
          </p>
          <p className="text-sm text-dash-muted">
            Something went wrong. Please try again.
          </p>
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
    </section>
  );

  return <HostedPayShell summary={summary} payment={paymentCard} />;
}
