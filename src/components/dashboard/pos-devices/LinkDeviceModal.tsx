"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Loader2, RefreshCcw, Copy, Check } from "lucide-react";
import { useInitiatePosDeviceLink } from "@/lib/hooks/pos-devices/usePosDevices";
import { useRealtimeEvent } from "@/lib/context/RealtimeContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

function fmtCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function LinkDeviceModal({ open, onClose }: Props) {
  const initiateLink = useInitiatePosDeviceLink();
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const handleLinked = useCallback(() => onCloseRef.current(), []);
  useRealtimeEvent("pos_device.linked", handleLinked);

  const generate = () => {
    setCopied(false);
    initiateLink.mutate(undefined, {
      onSuccess: (res) => setSecondsLeft(res.expires_in_seconds),
    });
  };

  useEffect(() => {
    if (!open) return;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !initiateLink.data || secondsLeft <= 0) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, initiateLink.data, secondsLeft > 0]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const otp = initiateLink.data?.otp;
  const expired = Boolean(initiateLink.data) && secondsLeft <= 0;

  const copyOtp = () => {
    if (!otp) return;
    navigator.clipboard?.writeText(otp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold text-dash-foreground">
              Link a POS Device
            </h2>
            <p className="mt-0.5 text-xs text-dash-muted">
              Enter this code on the device to link it to your business.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {initiateLink.isPending && !otp ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-dash-muted" />
            </div>
          ) : initiateLink.isError ? (
            <p className="rounded-lg border border-dash-error-border bg-dash-error-bg px-3 py-2.5 text-xs text-dash-error">
              {(initiateLink.error as any)?.message ??
                "Failed to generate a code."}
            </p>
          ) : otp ? (
            <>
              <div className="flex items-center justify-center gap-3 rounded-xl border border-dash-border bg-dash-hover py-6">
                <span className="font-mono text-3xl font-bold tracking-[0.35em] text-dash-foreground">
                  {otp}
                </span>
                <button
                  type="button"
                  onClick={copyOtp}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-dash-muted hover:bg-dash-border hover:text-dash-foreground transition-colors"
                  aria-label="Copy code"
                >
                  {copied ? (
                    <Check size={14} className="text-dash-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>

              <p className="text-center text-xs text-dash-muted">
                {expired ? (
                  <span className="text-dash-error">
                    This code has expired.
                  </span>
                ) : (
                  <>
                    Expires in{" "}
                    <span className="font-mono font-medium text-dash-foreground">
                      {fmtCountdown(secondsLeft)}
                    </span>
                  </>
                )}
              </p>

              <button
                type="button"
                onClick={generate}
                disabled={initiateLink.isPending}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-dash-border px-4 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                {initiateLink.isPending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCcw size={13} />
                )}
                {expired ? "Generate new code" : "Regenerate"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
