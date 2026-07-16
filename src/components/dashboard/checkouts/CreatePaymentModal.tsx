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
  "h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2a2a30] focus:outline-none transition-colors";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#71717A]">{label}</label>
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

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {!payLink ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#1C1C1F] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  Create Payment Session
                </h2>
                <p className="mt-0.5 text-xs text-[#71717A]">
                  Customer will choose their crypto token to pay with.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#52525B] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-0">
              {/* Amount + currency */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-[#71717A]">
                    Amount
                  </label>
                  {/* Currency toggle */}
                  <div className="flex items-center gap-0.5 rounded-lg border border-[#1C1C1F] bg-[#111113] p-0.5">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCurrency(c.value)}
                        className={cn(
                          "h-6 rounded-md px-2.5 text-xs font-semibold transition-colors",
                          currency === c.value
                            ? "bg-[#FAFAFA] text-[#09090B]"
                            : "text-[#71717A] hover:text-[#A1A1AA]",
                        )}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-[#1C1C1F] bg-[#09090B] px-4 py-3">
                  <span className="shrink-0 text-2xl font-light text-[#3F3F46]">
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
                    className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-[#FAFAFA] placeholder:text-[#2a2a30] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Divider with label */}
              <div className="flex items-center gap-3 px-5 pb-4">
                <div className="h-px flex-1 bg-[#1C1C1F]" />
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#3F3F46]">
                  <User size={11} />
                  Customer Info
                  <span className="text-[#2a2a30]">(optional)</span>
                </span>
                <div className="h-px flex-1 bg-[#1C1C1F]" />
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
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#3F3F46]"
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
                <p className="mx-5 mb-4 rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-xs text-red-400">
                  {(createSession.error as any)?.message ??
                    "Something went wrong."}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 border-t border-[#1C1C1F] px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 rounded-lg px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-9 items-center gap-2 rounded-lg bg-[#FAFAFA] px-5 text-sm font-semibold text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#14532D]/50 bg-[#052E16]/60">
                <Check size={22} className="text-[#22C55E]" />
              </div>
              <h2 className="text-base font-semibold text-[#FAFAFA]">
                Session Created
              </h2>
              <p className="max-w-xs text-xs text-[#71717A]">
                Share this link with your customer — they&apos;ll choose their
                token and complete payment.
              </p>
            </div>

            {/* Link box */}
            <div className="flex items-center gap-2 rounded-xl border border-[#1C1C1F] bg-[#09090B] px-3 py-2.5">
              <span className="flex-1 truncate font-mono text-xs text-[#A1A1AA]">
                {payLink}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 text-[#52525B] hover:text-[#FAFAFA] transition-colors"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check size={14} className="text-[#22C55E]" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-9 rounded-lg border border-[#1C1C1F] text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
              >
                Done
              </button>
              <a
                href={payLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
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
