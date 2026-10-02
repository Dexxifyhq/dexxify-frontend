"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { payApi } from "@/lib/api/pay";
import { useEstimatePayment } from "@/lib/hooks/payment-sessions/usePaymentSessions";
import { flattenAssets, type FlatAsset } from "@/lib/utils/assets";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { AlertTriangle, Check, Copy, Loader2, ShoppingBag } from "lucide-react";
import {
  AssetNetworkPicker,
  CARD,
  Centered,
  DepositDetails,
  HostedPayShell,
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
const fmtDay = (d: string) =>
  new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function CheckoutSessionPage() {
  const { session_id } = useParams<{ session_id: string }>();

  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ["pay-session", session_id],
    queryFn: () => payApi.getSession(session_id),
    enabled: !!session_id,
    retry: 1,
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ["pay-deposit-assets"],
    queryFn: payApi.getDepositAssets,
    staleTime: 60 * 60 * 1000,
  });

  const depositMutation = useMutation({
    mutationFn: (payload: { crypto_asset: string; network: string }) =>
      payApi.generateDepositAddress(session_id, payload),
  });

  const assets: FlatAsset[] = flattenAssets(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response envelope
    (assetsData as any)?.data ?? assetsData ?? {},
  );

  const [step, setStep] = useState<Step>("form");
  const [selectedAsset, setSelectedAsset] = useState<FlatAsset | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped session response
  const [depositInfo, setDepositInfo] = useState<any | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const { count, start: startCountdown } = useCountdown(0);

  const { data: estimateData, isFetching: estimating } = useEstimatePayment(
    selectedAsset && session
      ? {
          amount: String(session.amount ?? 0),
          currency: session.currency ?? "USD",
          crypto_asset: selectedAsset.symbol,
          network: selectedAsset.network,
          reference: session.provider_session_reference,
        }
      : null,
  );

  // If the session already has a deposit address (e.g. page refresh), skip
  // straight to the deposit step.
  useEffect(() => {
    if (!session) return;
    if (session.deposit_address) {
      setDepositInfo({ session });
      setStep("deposit");
    }
  }, [session]);

  useEffect(() => {
    if (!session?.expires_at) return;
    const secondsLeft = Math.max(
      0,
      Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000),
    );
    startCountdown(secondsLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the session changes
  }, [session]);

  const expired = !!session?.expires_at && count === 0;

  const handlePay = () => {
    if (!selectedAsset || depositMutation.isPending || expired) return;
    depositMutation.mutate(
      { crypto_asset: selectedAsset.symbol, network: selectedAsset.network },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped response
        onSuccess: (res: any) => {
          setDepositInfo(res);
          setStep("deposit");
        },
        onError: () => setStep("error"),
      },
    );
  };

  if (sessionLoading) {
    return (
      <Centered>
        <Loader2 size={24} className="animate-spin text-dash-muted" />
      </Centered>
    );
  }

  if (sessionError || !session) {
    return (
      <Centered>
        <AlertTriangle
          size={32}
          className="text-dash-warning"
          strokeWidth={1.5}
        />
        <p className="text-base font-semibold text-dash-foreground">
          Session not found
        </p>
        <p className="max-w-xs text-sm text-dash-muted">
          This payment link is invalid or has expired.
        </p>
      </Centered>
    );
  }

  const currency: string = session.currency?.toUpperCase() ?? "USD";
  const sym = SYMBOL[currency] ?? "";
  const sessionAmount = Number(session.amount ?? 0);
  const reference: string | undefined = session.reference;
  const customer = session.customer as
    | {
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
      }
    | null
    | undefined;
  const customerLabel = customer
    ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      customer.email
    : null;

  const depositAddress: string | null =
    depositInfo?.session?.deposit_address ?? null;
  const cryptoAsset: string | undefined =
    depositInfo?.session?.crypto_asset ?? selectedAsset?.symbol;
  const network: string | undefined =
    depositInfo?.session?.network ??
    selectedAsset?.networkDisplay ??
    selectedAsset?.network;
  const estimate = estimateData?.crypto
    ? estimateData
    : session?.metadata?.estimate;
  const sendAmount = estimate?.crypto?.amount
    ? Number(estimate.crypto.amount).toFixed(6)
    : null;
  const sendAsset: string | undefined = estimate?.crypto?.asset ?? cryptoAsset;
  const networkFee = estimate?.fees?.networkFee;
  const paidBy = estimate?.fees?.paidBy;

  // ── Summary ───────────────────────────────────────────────────────────────

  const summary = (
    <>
      <div className="flex items-center gap-3 px-1">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-accent text-white">
          <ShoppingBag size={17} />
        </span>
        <p className="text-base font-semibold text-dash-foreground">Checkout</p>
      </div>

      <section className={cn(CARD, "mt-6")}>
        <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-dash-muted">
          Amount due
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] tracking-[0.1em]",
              expired
                ? "bg-dash-error-bg text-dash-error"
                : "bg-dash-hover text-dash-muted",
            )}
          >
            {expired ? "Expired" : "Unpaid"}
          </span>
        </p>
        <p className="mt-2.5 flex items-baseline gap-1.5 text-dash-foreground">
          <span className="text-xl text-dash-muted">{sym}</span>
          <span className="text-[44px] font-medium leading-none tracking-tight">
            {fmt(sessionAmount)}
          </span>
          {!sym && <span className="text-lg text-dash-muted">{currency}</span>}
        </p>
        {session.expires_at && (
          <p className="mt-2 text-sm text-dash-muted">
            {expired ? "Expired" : "Expires"} {fmtDay(session.expires_at)}
          </p>
        )}

        {(reference || customerLabel || session.created_at) && (
          <dl className="mt-5 space-y-2.5 rounded-2xl bg-dash-bg p-4 text-sm">
            {reference && (
              <div className="flex items-center justify-between gap-6">
                <dt className="shrink-0 text-dash-muted">Reference</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-xs text-dash-foreground">
                    {reference}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(reference);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 1800);
                    }}
                    aria-label="Copy reference"
                    className="shrink-0 text-dash-faint transition-colors hover:text-dash-foreground"
                  >
                    {copiedRef ? (
                      <Check size={14} className="text-dash-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </dd>
              </div>
            )}
            {customerLabel && (
              <div className="flex justify-between gap-6">
                <dt className="text-dash-muted">Customer</dt>
                <dd className="truncate text-dash-foreground">
                  {customerLabel}
                </dd>
              </div>
            )}
            {session.created_at && (
              <div className="flex justify-between gap-6">
                <dt className="text-dash-muted">Created</dt>
                <dd className="text-dash-foreground">
                  {fmtDay(session.created_at)}
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>
    </>
  );

  // ── Payment ───────────────────────────────────────────────────────────────

  const payment = (
    <section className={CARD}>
      <div className="mb-5">
        <Steps current={step === "deposit" ? 1 : 0} />
      </div>

      {step === "form" && (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-dash-foreground">
                Complete your payment
              </h1>
              <p className="mt-1 text-sm text-dash-muted">
                Pay securely with crypto.
              </p>
            </div>
            {session.expires_at && <TimerPill seconds={count} />}
          </div>

          {expired ? (
            <p className="mt-6 rounded-xl border border-dash-error-border bg-dash-error-bg px-4 py-3 text-sm text-dash-error">
              This checkout session has expired. Please go back and start a new
              payment.
            </p>
          ) : (
            <>
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

              {selectedAsset && (
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-dash-bg px-4 py-3">
                  <span className="text-sm text-dash-muted">
                    You&apos;ll send approx.
                  </span>
                  {estimating ? (
                    <Loader2
                      size={14}
                      className="animate-spin text-dash-muted"
                    />
                  ) : estimateData?.crypto ? (
                    <span className="font-mono text-sm font-semibold text-dash-foreground">
                      {Number(estimateData.crypto.amount).toFixed(6)}{" "}
                      <span className="font-normal text-dash-muted">
                        {estimateData.crypto.asset}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-dash-muted">—</span>
                  )}
                </div>
              )}

              {depositMutation.isError && (
                <p className="mt-4 rounded-xl border border-dash-error-border bg-dash-error-bg px-4 py-3 text-sm text-dash-error">
                  {(depositMutation.error as Error)?.message ||
                    "Something went wrong. Please try again."}
                </p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={!selectedAsset || depositMutation.isPending}
                className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-dash-accent text-base font-semibold text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:bg-dash-border-strong"
              >
                {depositMutation.isPending && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {depositMutation.isPending
                  ? "Processing…"
                  : "Proceed to Payment"}
              </button>
            </>
          )}
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
            {session.expires_at && <TimerPill seconds={count} />}
          </div>
          <DepositDetails
            amount={sendAmount}
            asset={sendAsset}
            feeNote={
              networkFee ? (
                <>
                  Network fee{" "}
                  <span className="font-mono">
                    {networkFee} {sendAsset}
                  </span>
                  {paidBy && ` · paid by ${paidBy}`}
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
              depositMutation.reset();
            }}
            className="mt-3 h-12 rounded-2xl border border-dash-border px-6 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );

  return <HostedPayShell summary={summary} payment={payment} />;
}
