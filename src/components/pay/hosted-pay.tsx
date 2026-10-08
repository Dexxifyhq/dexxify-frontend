"use client";

/**
 * Shared building blocks for the hosted payment pages customers see
 * (invoice payment, checkout session): the page frame with its watermarks,
 * the asset → network picker, the two-step indicator and the compact
 * "send exactly + QR + address" block.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Loader2,
} from "lucide-react";
import type { FlatAsset } from "@/lib/utils/assets";
import WalletQRCode from "@/components/ui/WalletQRCode";
import { AssetLogo } from "@/components/dashboard/balance/modal-kit";
import { cn } from "@/utils/utils";

// The Dexxify D, cut from the transparent logo as a mask so a watermark can
// be any tint.
export const WATERMARK_MASK: React.CSSProperties = {
  maskImage: "url(/logo-set/transparent-2.png)",
  WebkitMaskImage: "url(/logo-set/transparent-2.png)",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskPosition: "center",
};

export const CARD =
  "rounded-3xl bg-dash-card p-6 shadow-(--shadow-card) ring-1 ring-dash-border";

// ── Page frame ────────────────────────────────────────────────────────────────

export function HostedPayShell({
  summary,
  payment,
}: {
  summary: React.ReactNode;
  payment: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen bg-dash-card lg:grid lg:h-screen lg:grid-cols-2 lg:overflow-hidden print:block print:h-auto print:bg-white">
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-[18vmin] -right-[16vmin] -z-10 h-[min(85vw,760px)] w-[min(85vw,760px)] -rotate-12 bg-black/[0.035] lg:hidden print:hidden"
        style={WATERMARK_MASK}
      />

      <section className="relative isolate overflow-hidden px-4 pt-10 sm:pt-14 lg:h-screen lg:p-0 print:block print:h-auto">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 -left-24 -z-10 hidden h-120 w-120 rotate-12 bg-black/6 lg:block print:hidden"
          style={WATERMARK_MASK}
        />
        <div className="lg:flex lg:h-full lg:overflow-y-auto lg:px-10 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
          <div className="mx-auto w-full max-w-md lg:my-auto lg:ml-auto lg:mr-0 lg:py-10">
            {summary}
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 pt-4 sm:pb-14 lg:flex lg:h-screen lg:overflow-y-auto lg:px-10 lg:py-0 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden print:hidden">
        <div className="mx-auto w-full max-w-md lg:my-auto lg:ml-0 lg:mr-auto lg:py-6">
          {payment}
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-dash-muted">
            Powered by
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand wordmark */}
            <img
              src="/logo-set/dexxify-tight.png"
              alt="Dexxify"
              className="h-4 w-auto"
            />
          </p>
        </div>
      </section>
    </div>
  );
}

/** Full-screen message (loading, not found, paid, unavailable). */
export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-dash-card p-6 text-center">
      {children}
    </div>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────

export function Steps({ current }: { current: 0 | 1 }) {
  const steps = ["Payment method", "Payment address"];
  return (
    <ol className="flex items-center gap-4">
      {steps.map((s, i) => (
        <li
          key={s}
          className={cn("flex items-center gap-3", i === 0 && "flex-1")}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
              i <= current
                ? "bg-dash-accent text-white"
                : "border border-dash-border-strong text-dash-foreground",
            )}
          >
            {i < current ? <Check size={15} strokeWidth={3} /> : i + 1}
          </span>
          <span
            className={cn(
              "whitespace-nowrap text-sm",
              i <= current
                ? "font-medium text-dash-foreground"
                : "text-dash-muted",
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

// ── Select row ────────────────────────────────────────────────────────────────

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
          "flex h-14 w-full items-center justify-between gap-4 rounded-2xl border px-5 text-left transition-colors",
          disabled
            ? "cursor-not-allowed border-dash-border bg-dash-bg"
            : open
              ? "border-dash-accent bg-dash-card"
              : "border-dash-border-strong bg-dash-card hover:border-dash-accent",
        )}
      >
        <span
          className={cn(
            "text-sm",
            disabled ? "text-dash-faint" : "text-dash-muted",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "flex min-w-0 items-center gap-2 text-sm",
            disabled
              ? "text-dash-faint"
              : value
                ? "font-medium text-dash-foreground"
                : "text-dash-muted",
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {value ? render(value) : placeholder}
          </span>
          <ChevronDown
            size={18}
            className={cn(
              "shrink-0 transition-transform",
              open && "rotate-180",
            )}
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
                  "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-dash-foreground transition-colors hover:bg-dash-hover",
                  value?.key === o.key && "font-semibold",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {render(o)}
                </span>
                {value?.key === o.key && <Check size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Asset → network picker ────────────────────────────────────────────────────

/**
 * Asset first, then one of the networks it's available on. Calls onChange
 * with the full asset+network pair, or null while it's incomplete.
 */
export function AssetNetworkPicker({
  assets,
  loading,
  value,
  onChange,
}: {
  assets: FlatAsset[];
  loading: boolean;
  value: FlatAsset | null;
  onChange: (a: FlatAsset | null) => void;
}) {
  const [symbol, setSymbol] = useState<string | null>(value?.symbol ?? null);

  const symbols = useMemo(() => {
    const seen = new Map<string, { key: string; symbol: string }>();
    for (const a of assets)
      if (!seen.has(a.symbol))
        seen.set(a.symbol, { key: a.symbol, symbol: a.symbol });
    return [...seen.values()];
  }, [assets]);
  const networks = assets.filter((a) => a.symbol === symbol);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex h-14 items-center gap-2 rounded-2xl border border-dash-border px-5 text-sm text-dash-muted">
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
            onChange(nets.length === 1 ? nets[0] : null);
          }}
        />
      )}
      <SelectRow
        label="Network"
        placeholder={symbol ? "Select network" : "Select an asset first"}
        value={value}
        options={networks}
        render={(o) => <span>{o.networkDisplay}</span>}
        onSelect={onChange}
        disabled={!symbol}
      />
    </div>
  );
}

// ── Deposit block ─────────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  return { copied, copy };
}

/**
 * The "send exactly" amount (when known), the QR beside the address, and the
 * wrong-network warning — compact enough to fit one screen.
 */
export function DepositDetails({
  amount,
  asset,
  feeNote,
  address,
  network,
}: {
  amount: string | null;
  asset: string | undefined;
  feeNote?: React.ReactNode;
  address: string | null;
  network: string | undefined;
}) {
  const { copied, copy } = useCopy();
  return (
    <>
      {amount && asset && (
        <div className="mt-5 rounded-2xl bg-dash-bg px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dash-muted">
              Send exactly
            </p>
            {feeNote && <p className="text-xs text-dash-muted">{feeNote}</p>}
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="flex min-w-0 items-center gap-2 font-mono text-xl font-semibold text-dash-foreground">
              <AssetLogo symbol={asset} className="h-6 w-6" />
              <span className="truncate">{amount}</span>
              <span className="text-sm font-normal text-dash-muted">
                {asset}
              </span>
            </p>
            <button
              type="button"
              onClick={() => copy(amount, "amount")}
              aria-label="Copy amount"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
            >
              {copied === "amount" ? (
                <Check size={15} className="text-dash-success" />
              ) : (
                <Copy size={15} />
              )}
            </button>
          </div>
        </div>
      )}

      {address && (
        <div className="mt-4 flex items-stretch gap-4">
          <div className="shrink-0 rounded-2xl border border-dash-border p-2">
            <WalletQRCode address={address} size={112} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dash-muted">
                Payment address
              </p>
              <p className="mt-1.5 break-all font-mono text-xs leading-relaxed text-dash-foreground">
                {address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copy(address, "address")}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-dash-border text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
            >
              {copied === "address" ? (
                <>
                  <Check size={14} className="text-dash-success" /> Copied
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy address
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl border border-dash-warning-border bg-dash-warning-bg px-3.5 py-2.5 text-xs text-dash-warning">
        <AlertTriangle size={14} className="mt-px shrink-0" />
        <span>
          Only send <span className="font-semibold">{asset}</span> on the{" "}
          <span className="font-semibold">{network}</span> network to this
          address. Sending anything else may be lost permanently.
        </span>
      </p>
    </>
  );
}

// ── Result icon ──────────────────────────────────────────────────────────────

/**
 * Animated circle + check/X — the result screen for a live payment.completed
 * / payment.failed SSE event. Shared across every hosted payment surface
 * (checkout sessions, invoices, payment pages).
 */
export function PaymentResultIcon({
  variant,
}: {
  variant: "success" | "failed";
}) {
  return (
    <svg
      viewBox="0 0 52 52"
      className={cn(
        "h-16 w-16",
        variant === "success" ? "text-dash-success" : "text-dash-error",
      )}
    >
      <circle
        className="result-ring"
        cx="26"
        cy="26"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {variant === "success" ? (
        <path
          className="result-check"
          d="M14.1 27.2l7.1 7.2 16.7-16.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          className="result-x"
          d="M17 17l18 18M35 17l-18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// ── Countdown pill ────────────────────────────────────────────────────────────

export function TimerPill({ seconds }: { seconds: number | null }) {
  if (seconds === null) return null;
  const expired = seconds <= 0;
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-semibold tabular-nums",
        expired
          ? "bg-dash-error-bg text-dash-error"
          : seconds < 120
            ? "bg-dash-warning-bg text-dash-warning"
            : "bg-dash-hover text-dash-foreground",
      )}
    >
      <Clock size={14} />
      {expired ? "Expired" : `${mm}:${ss}`}
    </span>
  );
}
