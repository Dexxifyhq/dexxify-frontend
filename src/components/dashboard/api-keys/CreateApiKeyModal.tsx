"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Check, Copy, AlertTriangle, KeyRound } from "lucide-react";
import { useCreateApiKey } from "@/lib/hooks/api-keys/useApiKeys";
import type { ApiKeyEnvironment } from "@/lib/types/api-keys";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateApiKeyModal({ open, onClose }: Props) {
  const createApiKey = useCreateApiKey();

  const [label, setLabel] = useState("");
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>("sandbox");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLabel("");
    setEnvironment("sandbox");
    setError(null);
    setCopied(false);
    createApiKey.reset();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      // Ignore Escape once the plaintext key is showing — force an explicit "Done".
      if (e.key === "Escape" && !createApiKey.data) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, createApiKey.data]);

  if (!open) return null;

  const created = createApiKey.data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createApiKey.isPending) return;
    setError(null);
    createApiKey.mutate(
      { label: label.trim() || undefined, environment },
      { onError: (err: any) => setError(err?.message ?? "Failed to create API key.") },
    );
  };

  const copyKey = () => {
    if (!created?.key) return;
    navigator.clipboard?.writeText(created.key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={created ? undefined : onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold text-dash-foreground">
              {created ? "API Key Created" : "Create API Key"}
            </h2>
            <p className="mt-0.5 text-xs text-dash-muted">
              {created
                ? "Copy it now — you won't be able to see it again."
                : "Give it a label and pick an environment."}
            </p>
          </div>
          {!created && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {created ? (
          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex items-center gap-2 rounded-lg border border-dash-border bg-dash-hover px-3 py-2.5">
              <KeyRound size={14} className="shrink-0 text-dash-muted" />
              <code className="flex-1 truncate font-mono text-sm text-dash-foreground">
                {created.key}
              </code>
              <button
                type="button"
                onClick={copyKey}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-dash-muted hover:bg-dash-border hover:text-dash-foreground transition-colors"
                aria-label="Copy key"
              >
                {copied ? <Check size={13} className="text-dash-success" /> : <Copy size={13} />}
              </button>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-dash-warning-border bg-dash-warning-bg px-3 py-2.5">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-dash-warning" />
              <p className="text-xs text-dash-warning">
                This is the only time the full key is shown. Store it somewhere safe —
                you'll need to create a new key if you lose it.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg bg-dash-accent text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
                Label <span className="normal-case text-dash-faint">(optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Production backend"
                className="h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
                Environment
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["sandbox", "live"] as ApiKeyEnvironment[]).map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`h-10 rounded-lg border text-sm font-medium capitalize transition-colors ${
                      environment === env
                        ? "border-dash-accent bg-dash-accent-soft text-dash-accent"
                        : "border-dash-border text-dash-muted hover:bg-dash-hover"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
              {environment === "live" && (
                <p className="mt-1.5 text-xs text-dash-warning">
                  Live keys can move real funds. Handle with care.
                </p>
              )}
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
                type="submit"
                disabled={createApiKey.isPending}
                className="flex h-9 items-center gap-2 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                {createApiKey.isPending && <Loader2 size={13} className="animate-spin" />}
                {createApiKey.isPending ? "Creating…" : "Create Key"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
