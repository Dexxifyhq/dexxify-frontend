"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Token = { type: string; text: string };

const PAYMENT_CODE: Token[][] = [
  [{ type: "keyword", text: "const" }, { type: "property", text: " payment" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "property", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "payments" }, { type: "punctuation", text: "." }, { type: "function", text: "create" }, { type: "punctuation", text: "({" }],
  [{ type: "property", text: "  amount" }, { type: "punctuation", text: ":" }, { type: "number", text: " 50000" }, { type: "punctuation", text: "," }, { type: "comment", text: "       // NGN" }],
  [{ type: "property", text: "  currency" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "NGN"' }, { type: "punctuation", text: "," }],
  [{ type: "property", text: "  asset" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "USDT"' }, { type: "punctuation", text: "," }],
  [{ type: "property", text: "  network" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "TRC20"' }, { type: "punctuation", text: "," }],
  [{ type: "property", text: "  reference" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "order_123"' }, { type: "punctuation", text: "," }],
  [{ type: "punctuation", text: "});" }],
  [],
  [{ type: "comment", text: "// payment.address     → send USDT here" }],
  [{ type: "comment", text: "// payment.amount_usdt → 30.77" }],
  [{ type: "comment", text: "// payment.expires_at  → 30 min window" }],
];

const OFFRAMP_CODE: Token[][] = [
  [{ type: "keyword", text: "const" }, { type: "property", text: " offramp" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "property", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "offramp" }, { type: "punctuation", text: "." }, { type: "function", text: "create" }, { type: "punctuation", text: "({" }],
  [{ type: "property", text: "  amount" }, { type: "punctuation", text: ":" }, { type: "number", text: " 500" }, { type: "punctuation", text: "," }, { type: "comment", text: "          // USDT" }],
  [{ type: "property", text: "  asset" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "USDT"' }, { type: "punctuation", text: "," }],
  [{ type: "property", text: "  network" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "TRC20"' }, { type: "punctuation", text: "," }],
  [{ type: "property", text: "  account_number" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "0123456789"' }, { type: "punctuation", text: "," }],
  [{ type: "property", text: "  bank_code" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "044"' }, { type: "punctuation", text: "," }, { type: "comment", text: "  // Access Bank" }],
  [{ type: "punctuation", text: "});" }],
  [],
  [{ type: "comment", text: "// offramp.deposit_address → send USDT here" }],
  [{ type: "comment", text: "// offramp.ngn_amount      → ₦812,500" }],
  [{ type: "comment", text: "// offramp.rate            → 1,625" }],
];

const WEBHOOK_EVENTS = [
  { event: "payment.created", status: 200, time: "09:41:00.012" },
  { event: "deposit.detected", status: 200, time: "09:41:47.304" },
  { event: "deposit.confirmed", status: 200, time: "09:42:11.817" },
  { event: "conversion.completed", status: 200, time: "09:42:12.042" },
  { event: "settlement.success", status: 200, time: "09:43:03.556" },
];

const SDKS = ["Node.js", "Python", "PHP", "Go", "Ruby"];

const COLOR_MAP: Record<string, string> = {
  keyword: "#93C5FD",
  string: "#86EFAC",
  comment: "#52525B",
  number: "#FCD34D",
  function: "#C4B5FD",
  property: "#FAFAFA",
  punctuation: "#71717A",
  operator: "#93C5FD",
};

function CodeLine({ tokens }: { tokens: Token[] }) {
  if (tokens.length === 0) return <div className="h-4" />;
  return (
    <div className="leading-7">
      {tokens.map((t, i) => (
        <span key={i} style={{ color: COLOR_MAP[t.type] ?? "#FAFAFA" }}>{t.text}</span>
      ))}
    </div>
  );
}

export default function CodeShowcase() {
  const [activeTab, setActiveTab] = useState<"gateway" | "offramp">("gateway");
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([headRef.current, blockRef.current], { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true },
      });
      gsap.fromTo(blockRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: blockRef.current, start: "top 80%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const code = activeTab === "gateway" ? PAYMENT_CODE : OFFRAMP_CODE;
  const filename = activeTab === "gateway" ? "create-payment.js" : "create-offramp.js";

  return (
    <section ref={sectionRef} className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-5xl mx-auto">
        <div ref={headRef} className="mb-12">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">Code</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight">
              Integrate in under 30 minutes
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-lg border border-[#1C1C1F] bg-[#111113] w-fit shrink-0">
              {(["gateway", "offramp"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: activeTab === t ? "#1C1C1F" : "transparent",
                    color: activeTab === t ? "#FAFAFA" : "#71717A",
                  }}
                >
                  {t === "gateway" ? "Payment Gateway" : "Offramp API"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={blockRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Code block */}
          <div className="lg:col-span-3 rounded-xl border border-[#1C1C1F] overflow-hidden" style={{ background: "#111113" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1C1C1F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FCD34D] opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] opacity-70" />
              <span className="ml-3 text-xs text-[#52525B] font-mono">{filename}</span>
              <span className="ml-auto text-[10px] text-[#2563EB] font-mono border border-[#2563EB]/20 bg-[#2563EB]/5 px-2 py-0.5 rounded">Node.js</span>
            </div>
            <div className="px-5 py-5 font-mono text-sm overflow-x-auto">
              <div className="flex gap-4">
                <div className="flex flex-col text-[#3F3F46] select-none text-right min-w-[1.5rem]">
                  {code.map((_, i) => <span key={i} className="leading-7 text-xs">{i + 1}</span>)}
                </div>
                <div className="flex-1">
                  {code.map((line, i) => <CodeLine key={i} tokens={line} />)}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-[#1C1C1F] flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-[#52525B]">SDKs available:</span>
              {SDKS.map((sdk) => (
                <span key={sdk} className="text-[10px] font-mono text-[#71717A] border border-[#1C1C1F] px-2 py-0.5 rounded hover:text-[#FAFAFA] hover:border-[#2563EB] transition-colors duration-200 cursor-pointer">{sdk}</span>
              ))}
            </div>
          </div>

          {/* Webhook log */}
          <div className="lg:col-span-2 rounded-xl border border-[#1C1C1F] overflow-hidden flex flex-col" style={{ background: "#111113" }}>
            <div className="px-4 py-3 border-b border-[#1C1C1F] flex items-center justify-between">
              <span className="text-xs text-[#52525B] font-mono">webhook events</span>
              <span className="flex items-center gap-1.5 text-[10px] text-[#22C55E] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                live
              </span>
            </div>
            <div className="px-4 py-4 flex flex-col gap-3.5 flex-1">
              {WEBHOOK_EVENTS.map((ev, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
                    <span className="font-mono text-xs text-[#FAFAFA] truncate">{ev.event}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-[#22C55E] font-semibold">{ev.status}</span>
                    <span className="font-mono text-[10px] text-[#3F3F46]">{ev.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-[#1C1C1F]">
              <p className="text-[10px] font-mono text-[#52525B]">All events delivered via HTTPS POST to your endpoint</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
