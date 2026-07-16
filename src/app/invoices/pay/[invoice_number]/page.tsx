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
} from "lucide-react";

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
        className="flex h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 text-sm transition-colors hover:border-white/20"
      >
        {selected ? (
          <>
            <span className="flex-1 text-left font-medium text-white">
              {selected.symbol}
              <span className="ml-1.5 text-xs font-normal text-white/40">{selected.name}</span>
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
              <li className="px-3 py-2 text-xs text-white/30">No tokens found</li>
            ) : (
              filtered.map((a) => (
                <li key={a.key}>
                  <button
                    type="button"
                    onClick={() => { onSelect(a); setOpen(false); setSearch(""); }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${selected?.key === a.key ? "text-white" : "text-white/70"}`}
                  >
                    <span className="flex-1 truncate font-medium">
                      {a.symbol}
                      <span className="ml-1.5 text-xs font-normal text-white/40">{a.name}</span>
                    </span>
                    <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30">
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

  // After creating the invoice session, get the deposit address
  const sessionMutation = useMutation({
    mutationFn: (dto: { crypto_asset: string; network: string }) =>
      invoicesApi.createPaymentSession(invoice_number, dto),
  });

  const depositMutation = useMutation({
    mutationFn: ({
      sessionId,
      crypto_asset,
      network,
    }: {
      sessionId: string;
      crypto_asset: string;
      network: string;
    }) => payApi.generateDepositAddress(sessionId, { crypto_asset, network }),
  });

  const assets: FlatAsset[] = flattenAssets(
    (assetsData as any)?.data ?? assetsData ?? {},
  );

  const [step, setStep] = useState<Step>("form");
  const [selectedAsset, setSelectedAsset] = useState<FlatAsset | null>(null);
  const [depositInfo, setDepositInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePay = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAsset || sessionMutation.isPending || depositMutation.isPending) return;

    sessionMutation.mutate(
      {
        crypto_asset: selectedAsset.symbol,
        network: selectedAsset.network,
      },
      {
        onSuccess: (session: any) => {
          // session = the PaymentSession record; now get deposit address
          const sessionId = session?.id ?? session?.data?.id;
          if (!sessionId) { setStep("error"); return; }

          depositMutation.mutate(
            {
              sessionId,
              crypto_asset: selectedAsset.symbol,
              network: selectedAsset.network,
            },
            {
              onSuccess: (res: any) => {
                setDepositInfo(res);
                setStep("deposit");
              },
              onError: () => setStep("error"),
            },
          );
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

  const isPending = sessionMutation.isPending || depositMutation.isPending;
  const depositAddress =
    depositInfo?.session?.deposit_address ??
    depositInfo?.deposit_address ??
    null;

  const cryptoAsset = depositInfo?.session?.crypto_asset ?? selectedAsset?.symbol;
  const network = depositInfo?.session?.network ?? selectedAsset?.networkDisplay;

  // ── Loading / error ────────────────────────────────────────────────────────

  if (invoiceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <Loader2 size={24} className="animate-spin text-white/30" />
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#09090B] p-6 text-center">
        <AlertTriangle size={32} className="text-[#F59E0B]" strokeWidth={1.5} />
        <p className="text-base font-semibold text-white">Invoice not found</p>
        <p className="max-w-xs text-sm text-white/40">
          This invoice link is invalid or has expired.
        </p>
      </div>
    );
  }

  if (invoice.status === "paid") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#09090B] p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#052e16]/60 text-[#4ade80]">
          <Check size={28} />
        </div>
        <p className="text-base font-semibold text-white">Invoice Paid</p>
        <p className="max-w-xs text-sm text-white/40">
          This invoice ({invoice.invoice_number}) has already been paid. Thank you!
        </p>
      </div>
    );
  }

  if (["cancelled", "void"].includes(invoice.status)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#09090B] p-6 text-center">
        <AlertTriangle size={32} className="text-[#52525B]" strokeWidth={1.5} />
        <p className="text-base font-semibold text-white">Invoice Unavailable</p>
        <p className="max-w-xs text-sm text-white/40">
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
    <div className="flex min-h-screen flex-col items-center bg-[#09090B] px-4 py-12">
      <p className="mb-8 text-sm font-semibold tracking-widest text-white/20 uppercase">
        Dexxify
      </p>

      <div className="w-full max-w-sm space-y-3">
        {/* Invoice card */}
        <div className="rounded-2xl border border-white/10 bg-[#0D0D0F] shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
              <FileText size={16} className="text-white/40" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold text-white">{invoice.invoice_number}</p>
              {customerName && (
                <p className="truncate text-xs text-white/40">{customerName}</p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center gap-1 border-b border-white/10 px-6 py-6 text-center">
            <p className="text-xs uppercase tracking-wider text-white/40">Amount Due</p>
            <p className="text-4xl font-bold text-white">
              {fmt(total)}
              <span className="ml-1.5 text-lg font-normal text-white/40">
                {invoice.currency}
              </span>
            </p>
            {invoice.due_date && (
              <p className="mt-1 text-xs text-white/30">
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
          <div className="border-b border-white/10 px-5 py-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Items
            </p>
            <div className="flex flex-col gap-2">
              {invoice.line_items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate text-white/60">{item.description}</span>
                  <span className="shrink-0 font-mono text-white/40">
                    {invoice.currency} {fmt(Number(item.amount))}
                  </span>
                </div>
              ))}
            </div>
            {(Number(invoice.tax_amount) > 0 || Number(invoice.discount_amount) > 0) && (
              <div className="mt-3 border-t border-white/10 pt-3 text-xs text-white/30">
                {Number(invoice.tax_amount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-mono">{fmt(Number(invoice.tax_amount))}</span>
                  </div>
                )}
                {Number(invoice.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span className="font-mono text-red-400/70">−{fmt(Number(invoice.discount_amount))}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Step: form ── */}
          {step === "form" && (
            <form onSubmit={handlePay} className="flex flex-col gap-4 px-5 py-5">
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

              {(sessionMutation.isError || depositMutation.isError) && (
                <p className="rounded-xl border border-red-900/40 bg-red-950/40 px-3 py-2.5 text-xs text-red-400">
                  {((sessionMutation.error ?? depositMutation.error) as any)?.message ??
                    "Something went wrong. Please try again."}
                </p>
              )}

              <button
                type="submit"
                disabled={!selectedAsset || isPending}
                className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold text-[#09090B] hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                {isPending ? "Processing…" : "Get Payment Address"}
              </button>
            </form>
          )}

          {/* ── Step: deposit ── */}
          {step === "deposit" && depositInfo && (
            <div className="flex flex-col gap-5 px-5 py-5">
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Send Payment</p>
                <p className="mt-0.5 text-xs text-white/40">
                  Send exactly the amount to this address.
                </p>
              </div>

              {/* Address */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                  Deposit Address
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <span className="flex-1 break-all font-mono text-xs text-white/70">
                    {depositAddress ?? "—"}
                  </span>
                  {depositAddress && (
                    <button
                      type="button"
                      onClick={() => handleCopy(depositAddress)}
                      className="shrink-0 text-white/30 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Network warning */}
              <div className="flex items-start gap-2 rounded-xl border border-yellow-900/40 bg-yellow-950/30 px-3 py-2.5">
                <AlertTriangle size={13} className="mt-0.5 shrink-0 text-yellow-500" />
                <p className="text-xs text-yellow-500/80">
                  Only send <span className="font-semibold">{cryptoAsset}</span> on the{" "}
                  <span className="font-semibold">{network}</span> network to this address.
                  Wrong network = permanent loss.
                </p>
              </div>

              <p className="text-center text-[11px] text-white/20">
                Invoice {invoice.invoice_number} · {invoice.currency} {fmt(total)}
              </p>
            </div>
          )}

          {/* ── Step: error ── */}
          {step === "error" && (
            <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
              <AlertTriangle size={28} className="text-red-400" strokeWidth={1.5} />
              <p className="text-sm font-semibold text-white">Failed to generate address</p>
              <p className="text-xs text-white/40">
                Something went wrong. Please try again.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  sessionMutation.reset();
                  depositMutation.reset();
                }}
                className="mt-2 h-9 rounded-xl border border-white/10 px-4 text-sm text-white/60 hover:bg-white/5 transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {invoice.notes && (
          <p className="px-1 text-center text-xs text-white/30">{invoice.notes}</p>
        )}

        <p className="text-center text-xs text-white/20">
          Powered by <span className="font-semibold text-white/30">Dexxify</span>
        </p>
      </div>
    </div>
  );
}
