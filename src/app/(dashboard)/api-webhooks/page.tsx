"use client";

import { useState } from "react";
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
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import Toggle from "@/components/dashboard/shared/Toggle";

const TABS = [
  { key: "keys", label: "Overview & Keys" },
  { key: "integrations", label: "Integrations" },
  { key: "mcp", label: "MCP" },
  { key: "webhooks", label: "Webhook Events" },
];

const SDKS = [
  {
    name: "Node.js SDK",
    install: "npm install coincircuit",
    badge: "JS",
    color: "#F7DF1E",
  },
  {
    name: "Python SDK",
    install: "pip install coincircuit",
    badge: "Py",
    color: "#3776AB",
  },
  {
    name: "Checkout SDK",
    install: "npm install @coincircuit/checkout",
    badge: "⚛",
    color: "#61DAFB",
  },
];

const BASE_URL = "https://api.coincircuit.io";

export default function ApiWebhooksPage() {
  const [tab, setTab] = useState("keys");
  const [enableEvents, setEnableEvents] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [revealSecret, setRevealSecret] = useState(false);
  const signingSecret = "whsec_•••••••••••••••••••••••••••••••";

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
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-dash-accent px-3.5 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
              >
                <Plus size={14} /> Create Key
              </button>
            </header>
            <div className="flex items-center justify-center py-16 text-sm text-dash-muted">
              No API keys created yet. Create one to get started.
            </div>
          </section>

          {/* Webhooks */}
          <section className="rounded-xl border border-dash-border bg-dash-card p-5">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-accent-soft text-dash-accent">
                <Bell size={15} />
              </div>
              <h2 className="text-sm font-semibold text-dash-foreground">
                Webhooks
              </h2>
            </div>

            <div className="mb-3 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                Webhook URL
              </span>
              <HelpCircle size={11} className="text-dash-faint" />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <Toggle
                checked={enableEvents}
                onChange={setEnableEvents}
                size="sm"
                ariaLabel="Enable Events"
              />
              <span className="text-sm text-dash-foreground">Enable Events</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.your-site.com/webhooks"
                className="h-10 flex-1 rounded-lg border border-dash-border bg-dash-card px-3 font-mono text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
              />
              <button
                type="button"
                className="h-10 rounded-lg bg-dash-accent px-4 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
              >
                Save
              </button>
            </div>

            {/* Signing Secret */}
            <div className="mt-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                Signing Secret
              </p>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    type={revealSecret ? "text" : "password"}
                    readOnly
                    value={signingSecret}
                    className="h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 pr-10 font-mono text-sm text-dash-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealSecret((v) => !v)}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
                    aria-label={revealSecret ? "Hide" : "Show"}
                  >
                    {revealSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => copy(signingSecret)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
                >
                  <Copy size={13} /> Copy
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dash-border bg-dash-card px-3 text-sm font-medium text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
                >
                  <RefreshCcw size={13} /> Regenerate
                </button>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-dash-warning-border bg-dash-warning-bg px-3 py-2.5">
                <AlertTriangle
                  size={13}
                  className="mt-0.5 shrink-0 text-dash-warning"
                />
                <p className="text-xs text-dash-warning">
                  Keep this secret safe. It validates that events originated
                  from CoinCircuit.
                </p>
              </div>
            </div>
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
                icon={
                  <Terminal size={16} className="text-dash-purple" />
                }
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
    </div>
  );
}

function WebhookEventsTab() {
  const [status, setStatus] = useState("all");
  const [event, setEvent] = useState("all");
  const [search, setSearch] = useState("");

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
            Monitor real-time events delivered to your server.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-2 md:grid-cols-[180px_180px_1fr]">
        <SelectInline
          value={status}
          onChange={setStatus}
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
            { label: "All Events", value: "all" },
            { label: "checkout.completed", value: "checkout.completed" },
            { label: "payment.succeeded", value: "payment.succeeded" },
            { label: "payment.failed", value: "payment.failed" },
            { label: "invoice.paid", value: "invoice.paid" },
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
            placeholder="Search by Session ID..."
            className="h-10 w-full rounded-lg border border-dash-border bg-dash-card pl-9 pr-3 text-sm text-dash-foreground placeholder:text-dash-faint focus:border-dash-accent focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-center py-16 text-sm text-dash-muted">
        No webhook events found matching your criteria.
      </div>
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
