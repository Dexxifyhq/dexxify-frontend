"use client";
import { useState } from "react";
import { highlight } from "@/lib/utils/highlight";

const GATEWAY_CODE = `import Dexxify from "@dexxify/node";

const dexxify = new Dexxify({
  apiKey: process.env.DEXXIFY_KEY
});

const payment = await dexxify.payments.create({
  amount: 50000,
  currency: "NGN",
  asset: "USDT",
  network: "TRC20",
  reference: "order_123"
});

// payment.address     → send USDT here
// payment.amount_usdt → 30.77 USDT
// payment.expires_at  → 30 minute window`;

const OFFRAMP_CODE = `import Dexxify from "@dexxify/node";

const dexxify = new Dexxify({
  apiKey: process.env.DEXXIFY_KEY
});

const payout = await dexxify.offramp.create({
  amount: 500,
  asset: "USDT",
  network: "TRC20",
  account_number: "0123456789",
  bank_code: "044"
});

// payout.address    → send USDT here
// payout.ngn_amount → ₦812,500
// payout.rate       → 1,625 NGN/USDT`;

const WEBHOOK_EVENTS = [
  { event: "payment.created", status: "200" },
  { event: "deposit.detected", status: "200" },
  { event: "deposit.confirmed", status: "200" },
  { event: "conversion.completed", status: "200" },
  { event: "settlement.success", status: "200" },
];

const SDK_LANGS = ["Node.js", "Python", "Go", "PHP", "Ruby", "Java", ".NET", "Rust"];

function WebhookLog() {
  return (
    <div className="bg-deeper border border-border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
          <div className="w-2.5 h-2.5 rounded-full bg-border" />
        </div>
        <span className="text-xs text-muted ml-2">Webhook Events</span>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          <span className="text-[10px] text-muted">live</span>
        </div>
      </div>

      <div className="flex-1 p-4 font-mono text-xs space-y-2.5 overflow-hidden">
        {WEBHOOK_EVENTS.map((e) => (
          <div key={e.event} className="webhook-row flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-success/10 border border-success/20 flex items-center justify-center shrink-0 text-success">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-foreground flex-1">{e.event}</span>
            <span className="text-success font-medium">{e.status}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-border">
        <div className="text-[10px] text-muted">POST https://your-domain.com/webhooks/dexxify</div>
      </div>
    </div>
  );
}

export default function CodeShowcase() {
  const [activeTab, setActiveTab] = useState<"gateway" | "offramp">("gateway");
  const code = activeTab === "gateway" ? GATEWAY_CODE : OFFRAMP_CODE;

  return (
    <section className="py-16 px-5 sm:py-24 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 border border-border bg-card text-xs text-muted px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Developer API
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4 mb-3">
            Built for developers
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-xl">
            SDKs in 8+ languages. Webhooks, sandbox, and API reference included.
          </p>

          {/* Tabs */}
          <div className="flex gap-1 mt-8 bg-card border border-border rounded-lg p-1 w-fit">
            {(["gateway", "offramp"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-primary text-white font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab === "gateway" ? "Payment Gateway" : "Offramp API"}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-5 gap-4">

          {/* Code block — 3 cols */}
          <div className="lg:col-span-3 bg-code-bg border border-code-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-code-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-code-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-code-border" />
                <div className="w-2.5 h-2.5 rounded-full bg-code-border" />
              </div>
              <span className="text-xs text-code-muted ml-2 font-mono">
                {activeTab === "gateway" ? "payment.ts" : "payout.ts"}
              </span>
            </div>

            <div className="flex-1 p-5 font-mono text-sm text-code-fg overflow-auto">
              {highlight(code)}
            </div>

            <div className="px-4 py-3 border-t border-code-border flex gap-2 flex-wrap">
              {SDK_LANGS.map(lang => (
                <span key={lang} className="text-[10px] text-code-muted border border-code-border bg-code-fg/5 px-2 py-0.5 rounded">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Webhook log — 2 cols */}
          <div className="lg:col-span-2">
            <WebhookLog />
          </div>
        </div>
      </div>
    </section>
  );
}
