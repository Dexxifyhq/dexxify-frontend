"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { useCreatePaymentSession } from "@/lib/hooks/payment-sessions/usePaymentSessions";
import { toast } from "sonner";

interface CreatePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePaymentModal({
  open,
  onClose,
  onSuccess,
}: CreatePaymentModalProps) {
  const createSession = useCreatePaymentSession();
  const [amount, setAmount] = useState("");
  const [payLink, setPayLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount("");
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

  const canSubmit = amount.trim() !== "" && Number(amount) > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    createSession.mutate(
      { amount: Number(amount) },
      {
        onSuccess: (res: any) => {
          const sessionId = res?.id ?? res?.session_id ?? res?.reference;
          const link = `${window.location.origin}/pay/${sessionId}`;
          setPayLink(link);
          onSuccess?.();
        },
        onError: (err: any) => {
          toast.error(err?.message ?? "Failed to create payment session.");
        },
      },
    );
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {!payLink ? (
          <>
            <div className="px-6 pt-5 pb-2">
              <h2 className="text-base font-semibold text-[#FAFAFA]">
                Create Payment
              </h2>
              <p className="mt-0.5 text-xs text-[#71717A]">
                Set the amount — your customer will choose how to pay.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 px-6 py-5"
            >
              <div className="flex items-baseline justify-center gap-2 py-6">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-40 bg-transparent text-center text-4xl font-semibold text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none"
                  required
                />
                <span className="text-lg font-medium text-[#71717A]">USD</span>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#1C1C1F] pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 rounded-lg px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit || createSession.isPending}
                  className="flex h-9 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                >
                  {createSession.isPending && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  {createSession.isPending ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* ── Success state: shareable link ── */
          <div className="flex flex-col gap-5 px-6 py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#14532D]/50 bg-[#052E16]/60">
                <Check size={20} className="text-[#22C55E]" />
              </div>
              <h2 className="text-base font-semibold text-[#FAFAFA]">
                Session Created
              </h2>
              <p className="text-xs text-[#71717A]">
                Share this link with your customer. They&apos;ll enter their
                details and choose a token to pay with.
              </p>
            </div>

            {/* Link box */}
            <div className="flex items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 py-2.5">
              <span className="flex-1 truncate text-xs text-[#A1A1AA]">
                {payLink}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 text-[#71717A] hover:text-[#FAFAFA] transition-colors"
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
                className="flex-1 h-9 rounded-lg border border-[#1C1C1F] bg-transparent text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
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
