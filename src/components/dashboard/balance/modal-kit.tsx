"use client";

/**
 * Shared building blocks for the Balance page's money-movement modals
 * (Deposit, Swap, Withdraw): the modal frame, recessed tabs, step indicator,
 * amount field, currency picker, selectable rows, summary and success state.
 */

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/utils/utils";

// ── Formatting ───────────────────────────────────────────────────────────────

export function fmt(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function shortAddress(s: string) {
  if (!s || s.length <= 20) return s;
  return `${s.slice(0, 8)}…${s.slice(-6)}`;
}

// ── Asset logos ──────────────────────────────────────────────────────────────

const CRYPTO_LOGOS = new Set([
  "ada", "avax", "bnb", "btc", "dot", "eth", "ltc", "matic", "sol", "usdc", "usdt",
]);

function logoFor(symbol: string): string | null {
  const s = symbol.toLowerCase();
  if (s === "ngn") return "/currency/ngn.svg";
  return CRYPTO_LOGOS.has(s) ? `/crypto/${s}.svg` : null;
}

/** Coin / currency mark; falls back to a lettered disc for unknown symbols. */
export function AssetLogo({
  symbol,
  className = "h-7 w-7",
}: {
  symbol: string;
  className?: string;
}) {
  const src = logoFor(symbol);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- static asset mark
    return <img src={src} alt="" className={cn("shrink-0", className)} />;
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-dash-hover text-[11px] font-semibold text-dash-muted",
        className,
      )}
    >
      {symbol.slice(0, 1).toUpperCase()}
    </span>
  );
}

// ── Modal frame ──────────────────────────────────────────────────────────────

const TONE_TEXT = {
  green: "text-tone-green",
  violet: "text-tone-violet",
  blue: "text-tone-blue",
} as const;

export function ModalShell({
  open,
  onClose,
  icon: Icon,
  tone,
  title,
  subtitle,
  children,
  maxWidth = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  icon: React.ElementType;
  tone: keyof typeof TONE_TEXT;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-2xl border border-dash-border bg-dash-card shadow-2xl",
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 px-6 pb-2 pt-6">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-bg",
              TONE_TEXT[tone],
            )}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-dash-foreground">
              {title}
            </h2>
            <p className="text-xs text-dash-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}

// ── Recessed tabs ────────────────────────────────────────────────────────────

/** Same recessed-track / raised-knob treatment as the Topbar's Live/Test
 *  switch, with a neutral white knob since these aren't statuses. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  return (
    <div
      role="tablist"
      className="relative grid h-10 rounded-full bg-dash-bg p-1 shadow-[inset_0_2px_5px_rgb(0_0_0/0.10),inset_0_-1px_1px_rgb(255_255_255/0.9)]"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-dash-card shadow-[0_2px_6px_rgb(0_0_0/0.12)] transition-transform duration-500 ease-in-out"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-full text-xs font-semibold transition-colors duration-500",
            o.value === value
              ? "text-dash-foreground"
              : "text-dash-muted hover:text-dash-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Step indicator ───────────────────────────────────────────────────────────

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={label}
            className={cn("flex items-center gap-2", i < steps.length - 1 && "flex-1")}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                done && "bg-dash-accent text-white",
                active && "bg-dash-accent text-white ring-4 ring-dash-hover",
                !done && !active && "bg-dash-hover text-dash-muted",
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-xs",
                active ? "font-semibold text-dash-foreground" : "text-dash-muted",
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px min-w-3 flex-1",
                  done ? "bg-dash-accent" : "bg-dash-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Fields ───────────────────────────────────────────────────────────────────

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
      {children}
    </p>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-dash-border bg-dash-card px-3.5 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-dash-accent focus:outline-none",
        props.className,
      )}
    />
  );
}

/** Large amount entry with a currency control on the right. */
export function AmountField({
  value,
  onChange,
  currency,
  hint,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  currency: React.ReactNode;
  hint?: React.ReactNode;
  autoFocus?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-dash-border bg-dash-bg px-4 py-3.5 transition-colors focus-within:border-dash-accent">
      <div className="flex items-center gap-3">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0.00"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-3xl font-medium tracking-tight text-dash-foreground outline-none placeholder:text-dash-faint [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {currency}
      </div>
      {hint && <div className="mt-1.5 text-xs text-dash-muted">{hint}</div>}
    </div>
  );
}

/** Static currency pill (logo + code). */
export function CurrencyBadge({ code }: { code: string }) {
  return (
    <span className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-dash-border bg-dash-card pl-1.5 pr-3 text-sm font-semibold text-dash-foreground">
      <AssetLogo symbol={code} className="h-6 w-6" />
      {code || "—"}
    </span>
  );
}

/** Currency pill that opens a small menu of options. */
export function CurrencyPicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-full border border-dash-border bg-dash-card pl-1.5 pr-2.5 text-sm font-semibold text-dash-foreground transition-colors hover:bg-dash-hover"
      >
        <AssetLogo symbol={value} className="h-6 w-6" />
        {value}
        <ChevronDown
          size={14}
          className={cn("text-dash-faint transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-10 mt-1.5 min-w-36 overflow-hidden rounded-xl border border-dash-border bg-dash-card py-1 shadow-xl"
        >
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dash-foreground transition-colors hover:bg-dash-hover"
              >
                <AssetLogo symbol={o} className="h-5 w-5" />
                <span className="flex-1 text-left">{o}</span>
                {o === value && <Check size={14} className="text-dash-foreground" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A selectable row (radio-style) for saved addresses, banks and assets. */
export function OptionRow({
  selected,
  onSelect,
  leading,
  title,
  subtitle,
  trailing,
}: {
  selected: boolean;
  onSelect: () => void;
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
        selected
          ? "border-dash-accent bg-dash-bg"
          : "border-dash-border hover:bg-dash-bg",
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-dash-foreground">
          {title}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-dash-muted">{subtitle}</p>
        )}
      </div>
      {trailing}
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-dash-accent bg-dash-accent text-white"
            : "border-dash-border-strong",
        )}
      >
        {selected && <Check size={12} strokeWidth={3} />}
      </span>
    </button>
  );
}

// ── Summary / notes ──────────────────────────────────────────────────────────

export function Summary({
  rows,
}: {
  rows: { label: string; value: React.ReactNode; emphasis?: boolean }[];
}) {
  return (
    <dl className="space-y-2.5 rounded-2xl bg-dash-bg p-4">
      {rows.map((r) => (
        <div
          key={r.label}
          className={cn(
            "flex items-start justify-between gap-4 text-sm",
            r.emphasis && "border-t border-dash-border pt-2.5",
          )}
        >
          <dt className="shrink-0 text-dash-muted">{r.label}</dt>
          <dd
            className={cn(
              "min-w-0 break-all text-right",
              r.emphasis
                ? "font-semibold text-dash-foreground"
                : "font-medium text-dash-foreground",
            )}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Note({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "warning";
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs",
        tone === "warning"
          ? "border border-dash-warning-border bg-dash-warning-bg text-dash-warning"
          : "bg-dash-bg text-dash-muted",
      )}
    >
      <AlertCircle size={14} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function ErrorNote({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-2 rounded-xl border border-dash-error-border bg-dash-error-bg px-3 py-2.5 text-xs text-dash-error">
      <AlertCircle size={14} className="mt-px shrink-0" />
      <span>{message}</span>
    </p>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────

export function PrimaryButton({
  children,
  loading,
  disabled,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={loading || disabled}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-dash-accent text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "flex h-11 items-center justify-center rounded-xl border border-dash-border px-5 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Back + primary action, side by side. */
export function StepActions({
  onBack,
  children,
}: {
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {onBack && <SecondaryButton onClick={onBack}>Back</SecondaryButton>}
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ── Success ──────────────────────────────────────────────────────────────────

export function SuccessState({
  title,
  description,
  children,
  onDone,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  onDone: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 pt-2 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dash-success-bg text-dash-success ring-8 ring-dash-success-bg/50">
        <Check size={30} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-base font-semibold text-dash-foreground">{title}</p>
        <p className="mt-1 text-sm text-dash-muted">{description}</p>
      </div>
      {children && <div className="w-full text-left">{children}</div>}
      <PrimaryButton onClick={onDone}>Done</PrimaryButton>
    </div>
  );
}

// ── Copy ─────────────────────────────────────────────────────────────────────

export function CopyButton({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ?? "Copy"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-colors",
        label
          ? "h-8 border border-dash-border px-3 text-dash-foreground hover:bg-dash-hover"
          : "h-7 w-7 text-dash-faint hover:bg-dash-hover hover:text-dash-foreground",
      )}
    >
      {copied ? (
        <Check size={13} className="text-dash-success" />
      ) : (
        <Copy size={13} />
      )}
      {label && (copied ? "Copied" : label)}
    </button>
  );
}
