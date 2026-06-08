"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { payApi } from "@/lib/api/pay";
import {
  ChevronDown,
  Search,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

// ── Steps ──────────────────────────────────────────────────────────────────
type Step = "form" | "deposit" | "error";

// ── Asset dropdown ─────────────────────────────────────────────────────────

function AssetPicker({
  assets,
  selected,
  onSelect,
}: {
  assets: any[];
  selected: any | null;
  onSelect: (a: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? assets.filter(
        (a) =>
          a.symbol?.toLowerCase().includes(search.toLowerCase()) ||
          a.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.network?.toLowerCase().includes(search.toLowerCase()),
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
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-sm transition-colors hover:border-white/20 focus:outline-none"
      >
        {selected ? (
          <>
            <img
              src={selected.icon}
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px] shrink-0 rounded-full object-cover"
            />
            <span className="flex-1 text-left font-medium text-white">
              {selected.symbol}
            </span>
            <span className="text-xs text-white/40">{selected.network}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-white/30">Choose token…</span>
        )}
        <ChevronDown
          size={15}
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
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-white/30">
                No tokens found
              </li>
            ) : (
              filtered.map((asset: any) => (
                <li key={asset.id ?? asset.identifier}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                      selected?.id === asset.id ? "text-white" : "text-white/70"
                    }`}
                  >
                    <img
                      src={asset.icon}
                      alt=""
                      width={22}
                      height={22}
                      className="h-[22px] w-[22px] shrink-0 rounded-full object-cover"
                    />
                    <span className="flex-1 truncate font-medium">
                      {asset.symbol}
                      <span className="ml-1.5 text-xs font-normal text-white/40">
                        {asset.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-white/30">
                      {asset.network}
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

export default function PayPage() {
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

  const initiateMutation = useMutation({
    mutationFn: (payload: any) =>
      payApi.initiatePagePayment(session_id, payload),
  });

  const assets: any[] = Array.isArray(assetsData)
    ? assetsData
    : ((assetsData as any)?.data ?? []);

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [depositInfo, setDepositInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const sessionAmount: number = session?.amount ?? 0;
  const ngnRate: number = selectedAsset?.rate?.NGN ?? 0;
  const ngnValue =
    sessionAmount > 0 && ngnRate > 0
      ? (sessionAmount * ngnRate).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null;

  const minDeposit: number | null = selectedAsset?.minimum ?? null;

  const canPay =
    name.trim() !== "" &&
    email.trim() !== "" &&
    !!selectedAsset &&
    !initiateMutation.isPending;

  const handlePay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canPay || !selectedAsset) return;
    initiateMutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        asset: selectedAsset.identifier,
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

  // ── Loading state ──────────────────────────────────────────────────────
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  // ── Session not found / error ──────────────────────────────────────────
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
      {/* Brand */}
      <p className="mb-8 text-sm font-semibold tracking-widest text-white/20 uppercase">
        Dexxify
      </p>

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0D0D0F] shadow-2xl">
        {/* ── Amount header ── */}
        <div className="flex flex-col items-center gap-1 border-b border-white/10 px-6 py-6 text-center">
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Amount Due
          </p>
          <p className="text-4xl font-bold text-white">
            ${sessionAmount.toFixed(2)}
            <span className="ml-1.5 text-lg font-normal text-white/40">
              USD
            </span>
          </p>
          {ngnValue && (
            <p className="mt-1 text-xs text-white/40">
              ≈ <span className="text-white/60">₦{ngnValue}</span>
            </p>
          )}
        </div>

        {/* ── Step: form ── */}
        {step === "form" && (
          <form onSubmit={handlePay} className="flex flex-col gap-4 px-6 py-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>

            {/* Asset */}
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
              {selectedAsset && minDeposit !== null && (
                <p className="mt-1.5 text-xs text-white/30">
                  Min. deposit:{" "}
                  <span className="text-white/50">
                    ₦{minDeposit.toLocaleString()}
                  </span>
                </p>
              )}
            </div>

            {/* Error */}
            {initiateMutation.isError && (
              <p className="rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2.5 text-xs text-red-400">
                {(initiateMutation.error as any)?.message ??
                  "Something went wrong. Please try again."}
              </p>
            )}

            <button
              type="submit"
              disabled={!canPay}
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#09090B] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {initiateMutation.isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : null}
              {initiateMutation.isPending ? "Processing…" : "Continue to Pay"}
            </button>
          </form>
        )}

        {/* ── Step: deposit address ── */}
        {step === "deposit" && depositInfo && (
          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Send Payment</p>
              <p className="mt-0.5 text-xs text-white/40">
                Send exactly the amount below to this address.
              </p>
            </div>

            {/* Asset + amount to send */}
            {depositInfo.amountToPay && (
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                <p className="text-xs text-white/40">Amount to send</p>
                <p className="mt-0.5 text-xl font-bold text-white">
                  {depositInfo.amountToPay}{" "}
                  <span className="text-base font-normal text-white/50">
                    {selectedAsset?.symbol}
                  </span>
                </p>
              </div>
            )}

            {/* Deposit address */}
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Deposit Address
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                <span className="flex-1 break-all text-xs font-mono text-white/70">
                  {depositInfo.address ?? depositInfo.deposit_address}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      depositInfo.address ?? depositInfo.deposit_address,
                    )
                  }
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
                Only send{" "}
                <span className="font-semibold">{selectedAsset?.symbol}</span>{" "}
                on the{" "}
                <span className="font-semibold">{selectedAsset?.network}</span>{" "}
                network to this address.
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
              We couldn&apos;t initiate your payment. Please go back and try
              again.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("form");
                initiateMutation.reset();
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
