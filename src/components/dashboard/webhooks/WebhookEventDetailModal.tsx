"use client";

import { useEffect } from "react";
import { X, Loader2, Copy } from "lucide-react";
import { useWebhookEvent } from "@/lib/hooks/webhooks/useWebhooks";

interface Props {
  eventId: string | null;
  onClose: () => void;
}

const STATUS_CLS: Record<string, string> = {
  delivered: "bg-dash-success-bg text-dash-success border-dash-success-border",
  pending: "bg-dash-warning-bg text-dash-warning border-dash-warning-border",
  failed: "bg-dash-error-bg text-dash-error border-dash-error-border",
};

function fmtDateTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function WebhookEventDetailModal({ eventId, onClose }: Props) {
  const { data: event, isLoading } = useWebhookEvent(eventId);

  useEffect(() => {
    if (!eventId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [eventId, onClose]);

  if (!eventId) return null;

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => null);
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

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-dash-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-dash-foreground">
              Webhook Delivery
            </h2>
            <p className="mt-0.5 font-mono text-xs text-dash-muted">
              {eventId}
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading || !event ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-dash-muted" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Event
                  </p>
                  <p className="font-mono text-dash-foreground">
                    {event.event_type}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Status
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${
                      STATUS_CLS[event.status] ??
                      "bg-dash-hover text-dash-muted border-dash-border"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Attempts
                  </p>
                  <p className="text-dash-foreground">{event.attempts}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Response
                  </p>
                  <p className="text-dash-foreground">
                    {event.response_status ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Created
                  </p>
                  <p className="text-dash-foreground">
                    {fmtDateTime(event.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Last attempt
                  </p>
                  <p className="text-dash-foreground">
                    {fmtDateTime(event.last_attempt_at)}
                  </p>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Payload
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(JSON.stringify(event.payload, null, 2))}
                    className="flex items-center gap-1 text-xs text-dash-muted hover:text-dash-foreground transition-colors"
                  >
                    <Copy size={11} /> Copy
                  </button>
                </div>
                <pre className="max-h-56 overflow-auto rounded-lg border border-dash-border bg-dash-hover p-3 font-mono text-xs text-dash-foreground">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>

              {event.response_body && (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Response body
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-dash-border bg-dash-hover p-3 font-mono text-xs text-dash-foreground">
                    {event.response_body}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
