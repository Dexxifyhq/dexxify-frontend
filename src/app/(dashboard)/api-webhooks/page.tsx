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
      <div className="flex items-center gap-6 border-b border-[#1C1C1F]">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#71717A] hover:text-[#FAFAFA]"
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
                className="flex items-center gap-3 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-4"
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
                  <p className="text-sm font-semibold text-[#FAFAFA]">
                    {sdk.name}
                  </p>
                  <p className="truncate font-mono text-xs text-[#71717A]">
                    {sdk.install}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Base URL */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Base URL
              </span>
              <code className="truncate font-mono text-sm text-[#FAFAFA]">
                {BASE_URL}
              </code>
            </div>
            <button
              type="button"
              onClick={() => copy(BASE_URL)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-xs font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              <Copy size={12} /> Copy
            </button>
          </div>

          {/* API Keys */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
            <header className="flex items-center justify-between border-b border-[#1C1C1F] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                  <KeyRound size={15} />
                </div>
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  API Keys
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
              >
                <Plus size={14} /> Create Key
              </button>
            </header>
            <div className="flex items-center justify-center py-16 text-sm text-[#71717A]">
              No API keys created yet. Create one to get started.
            </div>
          </section>

          {/* Webhooks */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <Bell size={15} />
              </div>
              <h2 className="text-sm font-semibold text-[#FAFAFA]">
                Webhooks
              </h2>
            </div>

            <div className="mb-3 flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Webhook URL
              </span>
              <HelpCircle size={11} className="text-[#52525B]" />
            </div>

            <div className="mb-4 flex items-center gap-3">
              <Toggle
                checked={enableEvents}
                onChange={setEnableEvents}
                size="sm"
                ariaLabel="Enable Events"
              />
              <span className="text-sm text-[#FAFAFA]">Enable Events</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.your-site.com/webhooks"
                className="h-10 flex-1 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 font-mono text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
              <button
                type="button"
                className="h-10 rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
              >
                Save
              </button>
            </div>

            {/* Signing Secret */}
            <div className="mt-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Signing Secret
              </p>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    type={revealSecret ? "text" : "password"}
                    readOnly
                    value={signingSecret}
                    className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 pr-10 font-mono text-sm text-[#FAFAFA] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setRevealSecret((v) => !v)}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
                    aria-label={revealSecret ? "Hide" : "Show"}
                  >
                    {revealSecret ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => copy(signingSecret)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
                >
                  <Copy size={13} /> Copy
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
                >
                  <RefreshCcw size={13} /> Regenerate
                </button>
              </div>
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-2.5">
                <AlertTriangle
                  size={13}
                  className="mt-0.5 shrink-0 text-[#F59E0B]"
                />
                <p className="text-xs text-[#F59E0B]">
                  Keep this secret safe. It validates that events originated
                  from CoinCircuit.
                </p>
              </div>
            </div>
          </section>

          {/* Documentation */}
          <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                <BookOpen size={15} />
              </div>
              <h2 className="text-sm font-semibold text-[#FAFAFA]">
                Documentation
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <DocCard
                icon={
                  <Terminal size={16} className="text-[#A78BFA]" />
                }
                iconBg="rgba(167,139,250,0.12)"
                title="API Reference"
                description="Endpoints, parameters, and code examples."
              />
              <DocCard
                icon={<Rocket size={16} className="text-[#22C55E]" />}
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
        <div className="flex items-center justify-center rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] py-20 text-sm text-[#71717A]">
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
    <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
          <Bell size={16} />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-[#FAFAFA]">
              Webhook Events
            </h2>
            <HelpCircle size={11} className="text-[#52525B]" />
          </div>
          <p className="text-xs text-[#71717A]">
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
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
            className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-center py-16 text-sm text-[#71717A]">
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
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 pr-9 text-sm text-[#FAFAFA] focus:border-[#2563EB] focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]"
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
      className="flex items-center gap-3 rounded-xl border border-[#1C1C1F] bg-[#09090B] p-4 hover:border-[#2563EB]/40 transition-colors"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-[#FAFAFA]">{title}</p>
          <ExternalLink size={11} className="text-[#71717A]" />
        </div>
        <p className="text-xs text-[#71717A]">{description}</p>
      </div>
    </a>
  );
}
