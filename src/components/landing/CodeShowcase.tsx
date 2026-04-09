"use client";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

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
  { event: "payment.created", status: "200", color: "#22C55E" },
  { event: "deposit.detected", status: "200", color: "#22C55E" },
  { event: "deposit.confirmed", status: "200", color: "#22C55E" },
  { event: "conversion.completed", status: "200", color: "#22C55E" },
  { event: "settlement.success", status: "200", color: "#22C55E" },
];

const SDK_LANGS = ["Node.js", "Python", "Go", "PHP", "Ruby", "Java", ".NET", "Rust"];

// Syntax highlight function
function highlight(code: string): React.ReactNode {
  // Split into lines and highlight keywords
  return code.split("\n").map((line, i) => {
    const parts: React.ReactNode[] = [];
    // Simple tokenizer
    const tokens = line.split(/(import|from|const|await|process|new|\/\/.+$|"[^"]*"|`[^`]*`|\b\d+\b)/g);
    tokens.forEach((token, j) => {
      if (!token) return;
      if (/^(import|from|const|await|new)$/.test(token)) {
        parts.push(<span key={j} className="text-[#93C5FD]">{token}</span>);
      } else if (/^\/\//.test(token)) {
        parts.push(<span key={j} className="text-[#52525B] italic">{token}</span>);
      } else if (/^"/.test(token) || /^`/.test(token)) {
        parts.push(<span key={j} className="text-[#86EFAC]">{token}</span>);
      } else if (/^\d+$/.test(token)) {
        parts.push(<span key={j} className="text-[#FCD34D]">{token}</span>);
      } else if (/^process$/.test(token)) {
        parts.push(<span key={j} className="text-[#C4B5FD]">{token}</span>);
      } else {
        parts.push(<span key={j}>{token}</span>);
      }
    });
    return <div key={i} className="leading-6">{parts}</div>;
  });
}

function WebhookLog() {
  const logRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const rows = logRef.current?.querySelectorAll(".webhook-row");
      if (!rows) return;

      gsap.set(Array.from(rows), { opacity: 0, x: -10 });

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
      Array.from(rows).forEach((row, i) => {
        tl.to(row, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, `+=${i === 0 ? 0 : 0.5}`);
      });
      tl.to({}, { duration: 1.5 });
      tl.to(Array.from(rows), { opacity: 0, x: -10, stagger: 0.05, duration: 0.2 });
      tl.set(Array.from(rows), { x: -10, opacity: 0 });
    });
    return () => ctx.revert();
  }, []);

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

      <div ref={logRef} className="flex-1 p-4 font-mono text-xs space-y-2.5 overflow-hidden">
        {WEBHOOK_EVENTS.map((e) => (
          <div key={e.event} className="webhook-row flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from(headRef.current, {
          opacity: 0, y: 30, duration: 1.1, ease: "power2.out",
          immediateRender: false, scrollTrigger: { trigger: headRef.current, start: "top 85%" }
        });
        gsap.from(contentRef.current, {
          opacity: 0, y: 30, duration: 1.1, ease: "power2.out", delay: 0.15,
          immediateRender: false, scrollTrigger: { trigger: contentRef.current, start: "top 80%" }
        });
      }, sectionRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  const code = activeTab === "gateway" ? GATEWAY_CODE : OFFRAMP_CODE;

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headRef} className="mb-12">
          <div className="inline-flex items-center gap-2 border border-border bg-card text-xs text-muted px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Developer API
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4 mb-3">
            Built for developers
          </h2>
          <p className="text-muted text-lg max-w-xl">
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
        <div ref={contentRef} className="grid lg:grid-cols-5 gap-4">

          {/* Code block — 3 cols */}
          <div className="lg:col-span-3 bg-deeper border border-border rounded-xl overflow-hidden flex flex-col">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-error/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-success/40" />
              </div>
              <span className="text-xs text-muted ml-2 font-mono">
                {activeTab === "gateway" ? "payment.ts" : "payout.ts"}
              </span>
            </div>

            {/* Code */}
            <div className="flex-1 p-5 font-mono text-sm text-foreground overflow-auto">
              {highlight(code)}
            </div>

            {/* SDK pills footer */}
            <div className="px-4 py-3 border-t border-border flex gap-2 flex-wrap">
              {SDK_LANGS.map(lang => (
                <span key={lang} className="text-[10px] text-muted border border-border bg-card px-2 py-0.5 rounded">
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
