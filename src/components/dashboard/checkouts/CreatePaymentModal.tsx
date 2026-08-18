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
} from "lucide-react";
import { useCreatePaymentSession } from "@/lib/hooks/payment-sessions/usePaymentSessions";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

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
    // if (firstName.trim()) payload.title = `Payment — ${firstName.trim()} ${lastName.trim()}`.trim();

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
          /* ── Success state ── */
          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dash-success-border bg-dash-success-bg">
                <Check size={22} className="text-dash-success" />
              </div>
              <h2 className="text-base font-semibold text-dash-foreground">
                Session Created
              </h2>
              <p className="max-w-xs text-xs text-dash-muted">
                Share this link with your customer — they&apos;ll choose their
                token and complete payment.
              </p>
            </div>

            {/* Link box */}
            <div className="flex items-center gap-2 rounded-xl border border-dash-border bg-dash-card px-3 py-2.5">
              <span className="flex-1 truncate font-mono text-xs text-dash-muted">
                {payLink}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 text-dash-faint hover:text-dash-foreground transition-colors"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check size={14} className="text-dash-success" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-9 rounded-lg border border-dash-border text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
              >
                Done
              </button>
              <a
                href={payLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
              >
                <ExternalLink size={13} />
                Preview
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
