"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { payApi } from "@/lib/api/pay";
import { useEstimatePayment } from "@/lib/hooks/payment-sessions/usePaymentSessions";
import { flattenAssets, type FlatAsset } from "@/lib/utils/assets";
import { useCountdown } from "@/lib/hooks/useCountdown";
import {
  ChevronDown,
  Search,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Clock,
} from "lucide-react";

type Step = "form" | "deposit" | "error";

// ── Asset picker ───────────────────────────────────────────────────────────

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
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-sm transition-colors hover:border-white/20"
      >
        {selected ? (
          <>
            <span className="flex-1 text-left font-medium text-white">
              {selected.symbol}
              <span className="ml-1.5 text-xs font-normal text-white/40">
                {selected.name}
              </span>
            </span>
            <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40">
              {selected.networkDisplay}
            </span>
          </>
        ) : (
          <span className="flex-1 text-left text-white/30">Choose token…</span>
        )}
        <ChevronDown
          size={14}
          className={`shrink-0 text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-white/10 bg-[#111113] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
            <Search size={13} className="shrink-0 text-white/30" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tokens…"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-white/30">
                No tokens found
              </li>
            ) : (
              filtered.map((a) => (
                <li key={a.key}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(a);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${selected?.key === a.key ? "text-white" : "text-white/70"}`}
                  >
                    <span className="flex-1 truncate font-medium">
                      {a.symbol}
                      <span className="ml-1.5 text-xs font-normal text-white/40">
                        {a.name}
                      </span>
                    </span>
                    <span className="shrink-0 rounded bg-white/6 px-1.5 py-0.5 text-[10px] text-white/30">
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

// ── Page ───────────────────────────────────────────────────────────────────

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
    (assetsData as any)?.data ?? assetsData ?? {},
  );

  const [step, setStep] = useState<Step>("form");
  const [selectedAsset, setSelectedAsset] = useState<FlatAsset | null>(null);
  const [depositInfo, setDepositInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
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
  // console.log(session);

  // If session already has a deposit address (e.g. page refresh), skip to deposit step
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
  }, [session]);

  // const expired =
  //   depositInfo && count === 0 && !!depositInfo.session?.expires_at;
  const expired = session && count === 0 && !!session?.expires_at;

  const timerDisplay = (() => {
    const m = Math.floor(count / 60);
    const s = count % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  })();

  const sessionAmount: number = Number(session?.amount ?? 0);
  const canPay = !!selectedAsset && !depositMutation.isPending;

  const handlePay = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canPay || !selectedAsset) return;
    depositMutation.mutate(
      {
        crypto_asset: selectedAsset.symbol,
        network: selectedAsset.network,
      },
      {
        onSuccess: (res: any) => {
          setDepositInfo(res);
          setStep("deposit");
        },
        onError: () => {
          setStep("error");
        },
      },
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const depositAddress =
    depositInfo?.session?.deposit_address ??
    // depositInfo?.cc?.payment?.address ??
    null;

  const cryptoAsset =
    depositInfo?.session?.crypto_asset ?? selectedAsset?.symbol;
  const network = depositInfo?.session?.network ?? selectedAsset?.network;

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#09090B] p-6 text-center">
        <AlertTriangle size={32} className="text-[#F59E0B]" strokeWidth={1.5} />
        <p className="text-base font-semibold text-white">Session not found</p>
        <p className="max-w-xs text-sm text-white/40">
          This payment link is invalid or has expired.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090B] p-4">
      <p className="mb-8 text-sm font-semibold tracking-widest text-white/20 uppercase">
        Dexxify
      </p>

      {/* Expiry timer */}
      {session?.expires_at && (
        <div
          className={`flex items-center justify-center gap-4 rounded-xl border px-4 py-2.5 mb-4 ${
            expired
              ? "border-red-900/40 bg-red-950/30"
              : count <= 120
                ? "border-yellow-900/40 bg-yellow-950/30"
                : "border-white/10 bg-white/5"
          }`}
        >
          <Clock
            size={13}
            className={
              expired
                ? "text-red-400"
                : count <= 120
                  ? "text-yellow-400"
                  : "text-white/40"
            }
          />
          {expired ? (
            <span className="text-xs font-semibold text-red-400">
              Session expired — please go back and try again
            </span>
          ) : (
            <span
              className={`font-mono text-sm font-semibold tabular-nums ${
                count <= 120 ? "text-yellow-400" : "text-white/70"
              }`}
            >
              {timerDisplay}
            </span>
          )}
        </div>
      )}

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0D0D0F] shadow-2xl">
        {/* Amount header */}
        <div className="flex flex-col items-center gap-1 border-b border-white/10 px-6 py-6 text-center">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Amount Due
          </p>
          <p className="text-4xl font-bold text-white">
            {sessionAmount.toFixed(2)}
            <span className="ml-1.5 text-lg font-normal text-white/40">
              {session.currency?.toUpperCase() ?? "USD"}
            </span>
          </p>
        </div>

        {/* ── Step: form ── */}
        {step === "form" && (
          <form onSubmit={handlePay} className="flex flex-col gap-4 px-6 py-6">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Pay With
              </label>
              {assetsLoading ? (
                <div className="flex h-11 items-center gap-2 px-3 text-xs text-white/30">
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

            {/* Estimate */}
            {selectedAsset && (
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-xs text-white/40">
                  You&apos;ll send approx.
                </span>
                {estimating ? (
                  <Loader2 size={13} className="animate-spin text-white/30" />
                ) : estimateData?.crypto ? (
                  <span className="text-sm font-semibold text-white">
                    {Number(estimateData.crypto.amount).toFixed(6)}{" "}
                    <span className="font-normal text-white/50">
                      {estimateData.crypto.asset}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-white/30">—</span>
                )}
              </div>
            )}

            {depositMutation.isError && (
              <p className="rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2.5 text-xs text-red-400">
                {(depositMutation.error as any)?.message ??
                  "Something went wrong. Please try again."}
              </p>
            )}

            <button
              type="submit"
              disabled={!canPay}
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#09090B] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {depositMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : null}
              {depositMutation.isPending
                ? "Processing…"
                : "Get Deposit Address"}
            </button>
          </form>
        )}

        {/* ── Step: deposit ── */}
        {step === "deposit" && depositInfo && (
          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Send Payment</p>
              <p className="mt-0.5 text-xs text-white/40">
                Send exactly the amount below to this address.
              </p>
            </div>

            {/* Crypto amount to send */}
            {(estimateData?.crypto || session?.metadata?.estimate?.crypto) && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                  Amount to Send
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {Number(
                    estimateData?.crypto.amount ||
                      session?.metadata?.estimate?.crypto.amount,
                  ).toFixed(6)}{" "}
                  <span className="text-base font-normal text-white/40">
                    {estimateData?.crypto.asset ||
                      session?.metadata?.estimate?.crypto.asset}
                  </span>
                </p>
                {(estimateData?.fees?.networkFee ||
                  session?.metadata?.estimate?.fees?.networkFee) && (
                  <p className="mt-1 text-[11px] text-white/30">
                    Network fee:{" "}
                    <span className="text-white/50">
                      {estimateData?.fees?.networkFee ||
                        session?.metadata?.estimate?.fees?.networkFee}{" "}
                      {estimateData?.crypto?.asset ||
                        session?.metadata?.estimate?.crypto?.asset}
                    </span>{" "}
                    · paid by{" "}
                    <span className="text-white/50">
                      {estimateData?.fees?.paidBy ||
                        session?.metadata?.estimate?.fees?.paidBy}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Deposit address */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Deposit Address
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <span className="flex-1 break-all font-mono text-xs text-white/70">
                  {depositAddress}
                </span>
                <button
                  type="button"
                  onClick={() => depositAddress && handleCopy(depositAddress)}
                  className="shrink-0 text-white/30 hover:text-white transition-colors"
                >
                  {copied ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Network warning */}
            <div className="flex items-start gap-2 rounded-xl border border-yellow-900/40 bg-yellow-950/30 px-3 py-2.5">
              <AlertTriangle
                size={13}
                className="mt-0.5 shrink-0 text-yellow-500"
              />
              <p className="text-xs text-yellow-500/80">
                Only send <span className="font-semibold">{cryptoAsset}</span>{" "}
                on the <span className="font-semibold">{network}</span> network
                to this address.
              </p>
            </div>
          </div>
        )}

        {/* ── Step: error ── */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
            <AlertTriangle
              size={28}
              className="text-red-400"
              strokeWidth={1.5}
            />
            <p className="text-sm font-semibold text-white">Payment Failed</p>
            <p className="text-xs text-white/40">
              We couldn&apos;t generate a deposit address. Please try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("form");
                depositMutation.reset();
              }}
              className="mt-2 h-9 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:bg-white/5 transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-white/20">
        Powered by <span className="font-semibold text-white/30">Dexxify</span>
      </p>
    </div>
  );
}
