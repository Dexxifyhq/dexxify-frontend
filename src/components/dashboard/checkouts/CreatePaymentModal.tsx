"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Copy,
  Check,
  ExternalLink,
  X,
  User,
  Mail,
  Link2,
} from "lucide-react";
import { useCreatePaymentSession } from "@/lib/hooks/payment-sessions/usePaymentSessions";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import WalletQRCode from "@/components/ui/WalletQRCode";

interface CreatePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CURRENCIES = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "NGN", label: "NGN", symbol: "₦" },
];

const inputCls =
  "h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-dash-muted">{label}</label>
      {children}
    </div>
  );
}

export default function CreatePaymentModal({
  open,
  onClose,
  onSuccess,
}: CreatePaymentModalProps) {
  const createSession = useCreatePaymentSession();

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [payLink, setPayLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
      setCurrency("USD");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPayLink(null);
      setCopied(false);
      createSession.reset();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const currencySymbol =
    CURRENCIES.find((c) => c.value === currency)?.symbol ?? "$";
  const canSubmit =
    amount.trim() !== "" && Number(amount) > 0 && !createSession.isPending;

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const payload: Record<string, any> = {
      amount: Number(amount),
      currency,
      customer_email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    };

    createSession.mutate(payload, {
      onSuccess: (res: any) => {
        const sessionId = res?.id;
        const link = `${window.location.origin}/pay/${sessionId}`;
        setPayLink(link);
        onSuccess?.();
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Failed to create payment session.");
      },
    });
  };

  const handleCopy = () => {
    if (!payLink) return;
    navigator.clipboard.writeText(payLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create Payment"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        {!payLink ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-dash-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-dash-foreground">
                  Create Payment Session
                </h2>
                <p className="mt-0.5 text-xs text-dash-muted">
                  Customer will choose their crypto token to pay with.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-dash-faint hover:bg-dash-hover hover:text-dash-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
              {/* Amount + currency */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-dash-muted">
                    Amount
                  </label>
                  {/* Currency toggle */}
                  <div className="flex items-center gap-0.5 rounded-lg border border-dash-border bg-dash-hover p-0.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCurrency(c.value)}
                        className={cn(
                          "h-6 rounded-md px-2.5 text-xs font-semibold transition-colors",
                          currency === c.value
                            ? "bg-dash-accent text-white"
                            : "text-dash-muted hover:text-dash-foreground",
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-card px-4 py-3">
                  <span className="shrink-0 text-2xl font-light text-dash-faint">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-dash-foreground placeholder:text-dash-faint focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Divider with label */}
              <div className="flex items-center gap-3 px-5 pb-4">
                <div className="h-px flex-1 bg-dash-border" />
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-dash-faint">
                  <User size={11} />
                  Customer Info
                  <span className="text-dash-faint">(optional)</span>
                </span>
                <div className="h-px flex-1 bg-dash-border" />
              </div>

              {/* Customer fields */}
              <div className="flex flex-col gap-3 px-5 pb-5">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="James"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Last Name">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Wilson"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label="Email">
                  <div className="relative">
                    <Mail
                      size={13}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className={cn(inputCls, "pl-8")}
                    />
                  </div>
                </Field>
              </div>

              {/* Error */}
              {createSession.isError && (
                <p className="mx-5 mb-4 rounded-lg border border-dash-error-border bg-dash-error-bg px-3 py-2 text-xs text-dash-error">
                  {(createSession.error as any)?.message ??
                    "Something went wrong."}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-dash-border px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 rounded-lg px-4 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-9 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-semibold text-white hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                >
                  {createSession.isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create Session"
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* ── Success: a share-ready payment ticket ── */
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dash-success-bg text-dash-success">
                  <Check size={18} strokeWidth={2.5} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-dash-foreground">
                    Checkout link ready
                  </h2>
                  <p className="text-xs text-dash-muted">
                    Share the link, or let your customer scan the code.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-dash-faint transition-colors hover:bg-dash-hover hover:text-dash-foreground"
              >
                <X size={15} />
              </button>
            </div>

            {/* Ticket — the dark card style of the dashboard balance cards */}
            <div className="relative isolate mt-5 overflow-hidden rounded-2xl bg-(--n-900) p-5 text-white">
              <div
                aria-hidden
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(120% 90% at 0% 0%, rgb(255 255 255 / 0.10) 0%, transparent 55%)",
                }}
              />
              <div
                aria-hidden
                className="absolute -bottom-12 -left-10 -z-10 h-44 w-44 rotate-12 bg-white/6"
                style={{
                  maskImage: "url(/logo-set/transparent-2.png)",
                  WebkitMaskImage: "url(/logo-set/transparent-2.png)",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />

              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                    Amount due
                  </p>
                  <p className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-base text-white/55">{currencySymbol}</span>
                    <span className="truncate text-3xl font-medium tracking-tight">
                      {Number(amount).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="ml-0.5 text-xs text-white/50">{currency}</span>
                  </p>
                  {(firstName.trim() || lastName.trim() || email.trim()) && (
                    <p className="mt-4 truncate text-xs text-white/60">
                      For{" "}
                      <span className="font-medium text-white/85">
                        {[firstName, lastName].filter((s) => s.trim()).join(" ") ||
                          email}
                      </span>
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-white/40">
                    Scan to pay on a phone
                  </p>
                </div>
                <div className="shrink-0 rounded-xl ring-1 ring-white/10">
                  <WalletQRCode
                    address={payLink}
                    size={104}
                    logoUrl="/logo-set/transparent-2.png"
                    logoSize={26}
                  />
                </div>
              </div>
            </div>

            {/* Link + copy */}
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-dash-border p-1.5 pl-3.5">
              <Link2 size={15} className="shrink-0 text-dash-faint" />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-dash-muted">
                {payLink.replace(/^https?:\/\//, "")}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-dash-accent px-3.5 text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={payLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-dash-border text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
              >
                <ExternalLink size={14} />
                Open checkout
              </a>
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-xl border border-dash-border bg-dash-bg text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
