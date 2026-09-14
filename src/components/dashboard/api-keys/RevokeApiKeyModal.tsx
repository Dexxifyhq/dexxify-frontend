"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useDeleteApiKey } from "@/lib/hooks/api-keys/useApiKeys";
import type { ApiKey } from "@/lib/types/api-keys";

interface Props {
  apiKey: ApiKey | null;
  onClose: () => void;
}

export default function RevokeApiKeyModal({ apiKey, onClose }: Props) {
  const deleteApiKey = useDeleteApiKey();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    deleteApiKey.reset();
  }, [apiKey?.id]);

  useEffect(() => {
    if (!apiKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [apiKey, onClose]);

  if (!apiKey) return null;

  const handleRevoke = () => {
    setError(null);
    deleteApiKey.mutate(apiKey.id, {
      onSuccess: () => {
        toast.success("API key revoked.");
        onClose();
      },
      onError: (err: any) => setError(err?.message ?? "Failed to revoke API key."),
    });
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <h2 className="text-base font-semibold text-dash-foreground">Revoke API Key</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-start gap-2 rounded-lg border border-dash-error-border bg-dash-error-bg px-3 py-2.5">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-dash-error" />
            <p className="text-xs text-dash-error">
              Any requests currently using{" "}
              <span className="font-semibold">{apiKey.label || "this key"}</span> will
              immediately stop working. This can't be undone.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border border-dash-error-border bg-dash-error-bg px-3 py-2.5 text-xs text-dash-error">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-dash-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-dash-border px-4 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRevoke}
              disabled={deleteApiKey.isPending}
              className="flex h-9 items-center gap-2 rounded-lg bg-dash-error px-4 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {deleteApiKey.isPending && <Loader2 size={13} className="animate-spin" />}
              {deleteApiKey.isPending ? "Revoking…" : "Revoke Key"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
