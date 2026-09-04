"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Plus,
  KeyRound,
  Bell,
  HelpCircle,
  AlertTriangle,
  RefreshCcw,
  Eye,
  EyeOff,
  BookOpen,
  Rocket,
  ExternalLink,
  Terminal,
  Ban,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import Toggle from "@/components/dashboard/shared/Toggle";
import { useApiKeys } from "@/lib/hooks/api-keys/useApiKeys";
import CreateApiKeyModal from "@/components/dashboard/api-keys/CreateApiKeyModal";
import RevokeApiKeyModal from "@/components/dashboard/api-keys/RevokeApiKeyModal";
import type { ApiKey } from "@/lib/types/api-keys";
import {
  useWebhook,
  useSaveWebhook,
  useRegenerateWebhookSecret,
  useDeleteWebhook,
  useWebhookEvents,
} from "@/lib/hooks/webhooks/useWebhooks";
import {
  WEBHOOK_EVENT_TYPES,
  type WebhookEventStatus,
} from "@/lib/types/webhooks";
import WebhookEventDetailModal from "@/components/dashboard/webhooks/WebhookEventDetailModal";

const TABS = [
  { key: "keys", label: "Overview & Keys" },
  { key: "integrations", label: "Integrations" },
  { key: "mcp", label: "MCP" },
  { key: "webhooks", label: "Webhook Events" },
];

const SDKS = [
  {
    name: "Node.js SDK",
    install: "npm install dexxify",
    badge: "JS",
    color: "#F7DF1E",
  },
  {
    name: "Python SDK",
    install: "pip install dexxify",
    badge: "Py",
    color: "#3776AB",
  },
];

const BASE_URL = "https://api.dexxify.com/api/v1";

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function maskKey(key: ApiKey) {
  if (key.prefix) return `${key.prefix}${"•".repeat(8)}${key.last_four ?? ""}`;
  return `${"•".repeat(12)}${key.last_four ?? ""}`;
}

export default function ApiWebhooksPage() {
  const [tab, setTab] = useState("keys");
  const [revealSecret, setRevealSecret] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const { data: webhook, isLoading: webhookLoading } = useWebhook();
  const saveWebhook = useSaveWebhook();
  const regenerateSecret = useRegenerateWebhookSecret();
  const deleteWebhook = useDeleteWebhook();

  const [urlInput, setUrlInput] = useState("");
  const [activeInput, setActiveInput] = useState(false);

  useEffect(() => {
    if (!webhook) return;
    setUrlInput(webhook.url ?? "");
    setActiveInput(webhook.is_active);
  }, [webhook]);

  const [showCreateKey, setShowCreateKey] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const { data: apiKeys, isLoading: keysLoading } = useApiKeys();

  const handleSaveWebhook = () => {
    saveWebhook.mutate(
      { url: urlInput.trim(), is_active: activeInput },
      {
        onSuccess: () => toast.success("Webhook saved."),
        onError: (err: any) =>
          toast.error(err?.message ?? "Failed to save webhook."),
      },
    );
  };

  const handleRegenerateSecret = () => {
    regenerateSecret.mutate(undefined, {
      onSuccess: () => {
        setRevealSecret(true);
        toast.success("Signing secret regenerated.");
      },
      onError: (err: any) =>
        toast.error(err?.message ?? "Failed to regenerate secret."),
    });
  };

  const handleRemoveWebhook = () => {
    deleteWebhook.mutate(undefined, {
      onSuccess: () => {
        setConfirmRemove(false);
        toast.success("Webhook removed.");
      },
      onError: (err: any) => {
        setConfirmRemove(false);
        toast.error(err?.message ?? "Failed to remove webhook.");
      },
    });
  };

  const copy = (text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(text).catch(() => null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Developers"
        description="Manage API keys, webhooks, and explore integration SDKs."
      />

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-dash-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-dash-accent text-dash-accent"
                : "border-transparent text-dash-muted hover:text-dash-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "keys" && (
        <>
          {/* SDK cards */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
              SDKs
            </span>
            <span className="rounded-full bg-dash-hover px-2 py-0.5 text-[10px] font-semibold text-dash-muted">
              Coming soon
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {SDKS.map((sdk) => (
              <div
                key={sdk.name}
                className="flex items-center gap-3 rounded-xl border border-dash-border bg-dash-card p-4"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: `${sdk.color}1A`,
                    color: sdk.color,
                  }}
                >
                  {sdk.badge}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-dash-foreground">
                    {sdk.name}
                  </p>
                  <p className="truncate font-mono text-xs text-dash-muted">
                    {sdk.install}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Base URL */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-dash-border bg-dash-card px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                Base URL
              </span>
              <code className="truncate font-mono text-sm text-dash-foreground">
                {BASE_URL}
              </code>
            </div>
            <button
              type="button"
              onClick={() => copy(BASE_URL)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-xs font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
            >
              <Copy size={12} /> Copy
            </button>
          </div>

          {/* API Keys */}
          <section className="rounded-xl border border-dash-border bg-dash-card">
            <header className="flex items-center justify-between border-b border-dash-border px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-accent-soft text-dash-accent">
                  <KeyRound size={15} />
                </div>
                <h2 className="text-sm font-semibold text-dash-foreground">
                  API Keys
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateKey(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-dash-accent px-3.5 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
              >
                <Plus size={14} /> Create Key
              </button>
            </header>

            {keysLoading ? (
              <div className="flex flex-col gap-2 p-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-lg bg-dash-hover"
                  />
                ))}
              </div>
            ) : !apiKeys || apiKeys.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-dash-muted">
                No API keys created yet. Create one to get started.
              </div>
            ) : (
              <div className="divide-y divide-dash-border">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          key.environment === "live"
                            ? "border-dash-success-border bg-dash-success-bg text-dash-success"
                            : "border-dash-warning-border bg-dash-warning-bg text-dash-warning"
                        }`}
                      >
                        {key.environment}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-dash-foreground">
                          {key.label || "Untitled key"}
                        </p>
                        <p className="truncate font-mono text-xs text-dash-muted">
                          {maskKey(key)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-dash-muted">
                          Created {fmtDate(key.created_at)}
                        </p>
                        <p className="text-xs text-dash-faint">
                          Last used {fmtDate(key.last_used_at)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRevokeTarget(key)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dash-border px-3 text-xs font-medium text-dash-muted hover:border-dash-error-border hover:bg-dash-error-bg hover:text-dash-error transition-colors"
                      >
                        <Ban size={12} /> Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Webhooks */}
          <section className="rounded-xl border border-dash-border bg-dash-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-accent-soft text-dash-accent">
                  <Bell size={15} />
                </div>
                <h2 className="text-sm font-semibold text-dash-foreground">
                  Webhooks
                </h2>
              </div>
              {webhook?.configured && (
                <span className="text-xs text-dash-faint">
                  Saved{" "}
                  {fmtDate(
                    webhook.updated_at ?? webhook.created_at ?? undefined,
                  )}
                </span>
              )}
            </div>

            {webhookLoading ? (
              <div className="h-32 animate-pulse rounded-lg bg-dash-hover" />
            ) : (
              <>
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                    Webhook URL
                  </span>
                  <HelpCircle size={11} className="text-dash-faint" />
                </div>

                <div className="mb-4 flex items-center gap-3">
                  <Toggle
                    checked={activeInput}
                    onChange={setActiveInput}
                    size="sm"
                    ariaLabel="Enable Events"
                  />
                  <span className="text-sm text-dash-foreground">
                    Enable Events
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://api.your-site.com/webhooks"
                    className="h-10 flex-1 rounded-lg border border-dash-border bg-dash-card px-3 font-mono text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleSaveWebhook}
                    disabled={saveWebhook.isPending || !urlInput.trim()}
                    className="flex h-10 items-center gap-1.5 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                  >
                    {saveWebhook.isPending && (
                      <Loader2 size={13} className="animate-spin" />
                    )}
                    {saveWebhook.isPending ? "Saving…" : "Save"}
                  </button>
                </div>

                {/* Signing Secret */}
                {webhook?.configured && webhook.secret ? (
                  <div className="mt-6">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                      Signing Secret
                    </p>
                    <div className="flex items-stretch gap-2">
                      <div className="relative flex-1">
                        <input
                          type={revealSecret ? "text" : "password"}
                          readOnly
                          value={webhook.secret}
                          className="h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 pr-10 font-mono text-sm text-dash-foreground focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setRevealSecret((v) => !v)}
                          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
                          aria-label={revealSecret ? "Hide" : "Show"}
                        >
                          {revealSecret ? (
                            <EyeOff size={13} />
                          ) : (
                            <Eye size={13} />
                          )}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => copy(webhook.secret!)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
                      >
                        <Copy size={13} /> Copy
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateSecret}
                        disabled={regenerateSecret.isPending}
                        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                      >
                        {regenerateSecret.isPending ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <RefreshCcw size={13} />
                        )}
                        Regenerate
                      </button>
                    </div>
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-dash-warning-border bg-dash-warning-bg px-3 py-2.5">
                      <AlertTriangle
                        size={13}
                        className="mt-0.5 shrink-0 text-dash-warning"
                      />
                      <p className="text-xs text-dash-warning">
                        Keep this secret safe. It validates that events
                        originated from Dexxify.
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-dash-border pt-4">
                      {confirmRemove ? (
                        <>
                          <span className="mr-auto text-xs text-dash-error">
                            Remove this webhook endpoint?
                          </span>
                          <button
                            type="button"
                            onClick={() => setConfirmRemove(false)}
                            className="h-8 rounded-lg border border-dash-border px-3 text-xs font-medium text-dash-muted hover:bg-dash-hover transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveWebhook}
                            disabled={deleteWebhook.isPending}
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-dash-error px-3 text-xs font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                          >
                            {deleteWebhook.isPending && (
                              <Loader2 size={12} className="animate-spin" />
                            )}
                            {deleteWebhook.isPending
                              ? "Removing…"
                              : "Yes, remove"}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRemove(true)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg text-xs font-medium text-dash-muted hover:text-dash-error transition-colors"
                        >
                          <Trash2 size={12} /> Remove webhook
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-dash-faint">
                    Save a webhook URL to generate a signing secret.
                  </p>
                )}
              </>
            )}
          </section>

          {/* Documentation */}
          <section className="rounded-xl border border-dash-border bg-dash-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-accent-soft text-dash-accent">
                <BookOpen size={15} />
              </div>
              <h2 className="text-sm font-semibold text-dash-foreground">
                Documentation
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DocCard
                icon={<Terminal size={16} className="text-dash-purple" />}
                iconBg="rgba(167,139,250,0.12)"
                title="API Reference"
                description="Endpoints, parameters, and code examples."
              />
              <DocCard
                icon={<Rocket size={16} className="text-dash-success" />}
                iconBg="rgba(34,197,94,0.12)"
                title="Quick Start Guide"
                description="Get up and running in minutes."
              />
            </div>
          </section>
        </>
      )}

      {tab === "webhooks" && <WebhookEventsTab />}

      {(tab === "integrations" || tab === "mcp") && (
        <div className="flex items-center justify-center rounded-xl border border-dash-border bg-dash-card py-20 text-sm text-dash-muted">
          Coming soon.
        </div>
      )}

      <CreateApiKeyModal
        open={showCreateKey}
        onClose={() => setShowCreateKey(false)}
      />
      <RevokeApiKeyModal
        apiKey={revokeTarget}
        onClose={() => setRevokeTarget(null)}
      />
    </div>
  );
}

const EVENT_STATUS_CLS: Record<string, string> = {
  delivered: "bg-dash-success-bg text-dash-success border-dash-success-border",
  pending: "bg-dash-warning-bg text-dash-warning border-dash-warning-border",
  failed: "bg-dash-error-bg text-dash-error border-dash-error-border",
};

function fmtDateTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WebhookEventsTab() {
  const [status, setStatus] = useState<"all" | WebhookEventStatus>("all");
  const [event, setEvent] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading } = useWebhookEvents({
    page,
    limit,
    status: status === "all" ? undefined : status,
  });

  // Event type and event-id search aren't backend-supported filters
  const rows = (data?.data ?? []).filter((e) => {
    if (event !== "all" && e.event_type !== event) return false;
    if (
      search.trim() &&
      !e.id.toLowerCase().includes(search.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <section className="rounded-xl border border-dash-border bg-dash-card p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dash-accent-soft text-dash-accent">
          <Bell size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-dash-foreground">
              Webhook Events
            </h2>
            <HelpCircle size={11} className="text-dash-faint" />
          </div>
          <p className="text-xs text-dash-muted">
            Delivery log for your webhook endpoint in the current environment.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-[180px_220px_1fr]">
        <SelectInline
          value={status}
          onChange={(v) => {
            setStatus(v as "all" | WebhookEventStatus);
            setPage(1);
          }}
          options={[
            { label: "All Statuses", value: "all" },
            { label: "Delivered", value: "delivered" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
          ]}
        />
        <SelectInline
          value={event}
          onChange={setEvent}
          options={[
            { label: "All Events (this page)", value: "all" },
            ...WEBHOOK_EVENT_TYPES.map((t) => ({ label: t, value: t })),
          ]}
        />
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-faint"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event ID (this page)..."
            className="h-10 w-full rounded-lg border border-dash-border bg-dash-card pl-9 pr-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-dash-hover"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-dash-muted">
          No webhook events found matching your criteria.
        </div>
      ) : (
        <div className="divide-y divide-dash-border">
          {rows.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelectedEventId(e.id)}
              className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-dash-hover transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    EVENT_STATUS_CLS[e.status] ??
                    "bg-dash-hover text-dash-muted border-dash-border"
                  }`}
                >
                  {e.status}
                </span>
                <span className="truncate font-mono text-sm text-dash-foreground">
                  {e.event_type}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs text-dash-muted">
                <span>
                  {e.attempts} attempt{e.attempts === 1 ? "" : "s"}
                </span>
                <span className="hidden sm:inline">
                  {fmtDateTime(e.created_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {data && data.meta.total > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-dash-border pt-4 text-xs text-dash-muted">
          <span>
            Page {data.meta.page} of {Math.max(data.meta.total_pages, 1)} —{" "}
            {data.meta.total} total
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={!data.meta.has_prev}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-dash-border text-dash-muted hover:bg-dash-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.meta.has_next}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-dash-border text-dash-muted hover:bg-dash-hover disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <WebhookEventDetailModal
        eventId={selectedEventId}
        onClose={() => setSelectedEventId(null)}
      />
    </section>
  );
}

function SelectInline({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-dash-border bg-dash-card px-3 pr-9 text-sm text-dash-foreground focus:border-dash-accent focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dash-muted"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function DocCard({
  icon,
  iconBg,
  title,
  description,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href="#"
      className="flex items-center gap-3 rounded-xl border border-dash-border bg-dash-card p-4 hover:border-dash-accent transition-colors"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-dash-foreground">{title}</p>
          <ExternalLink size={11} className="text-dash-muted" />
        </div>
        <p className="text-xs text-dash-muted">{description}</p>
      </div>
    </a>
  );
}
