"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Token = { type: string; text: string };
type CodeTab = { id: string; label: string; lines: Token[][] };

const TABS: CodeTab[] = [
  {
    id: "wallet",
    label: "Create Wallet",
    lines: [
      [{ type: "keyword", text: "import" }, { type: "property", text: " Dexxify " }, { type: "keyword", text: "from" }, { type: "string", text: ' "@dexxify/node"' }, { type: "punctuation", text: ";" }],
      [],
      [{ type: "keyword", text: "const" }, { type: "property", text: " dexxify" }, { type: "operator", text: " = " }, { type: "keyword", text: "new" }, { type: "function", text: " Dexxify" }, { type: "punctuation", text: "(" }, { type: "punctuation", text: "{" }],
      [{ type: "property", text: "  apiKey" }, { type: "punctuation", text: ":" }, { type: "string", text: ' process.env.DEXXIFY_KEY' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  env" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "sandbox"' }, { type: "punctuation", text: "," }],
      [{ type: "punctuation", text: "});" }],
      [],
      [{ type: "comment", text: "// Create a BTC wallet for a user" }],
      [{ type: "keyword", text: "const" }, { type: "property", text: " wallet" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "property", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "wallets" }, { type: "punctuation", text: "." }, { type: "function", text: "create" }, { type: "punctuation", text: "({" }],
      [{ type: "property", text: "  userId" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "usr_01HXYZ123"' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  currency" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "BTC"' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  label" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "Main wallet"' }, { type: "punctuation", text: "," }],
      [{ type: "punctuation", text: "});" }],
      [],
      [{ type: "comment", text: '// wallet.id      → "wal_01HXYZ456abc"' }],
      [{ type: "comment", text: '// wallet.address → "bc1qxy2kgdygjrsqtzq2n0yrf24..."' }],
      [{ type: "comment", text: '// wallet.network → "mainnet"' }],
    ],
  },
  {
    id: "offramp",
    label: "Offramp USDT → NGN",
    lines: [
      [{ type: "comment", text: "// Get live rate before initiating" }],
      [{ type: "keyword", text: "const" }, { type: "property", text: " rate" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "property", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "rates" }, { type: "punctuation", text: "." }, { type: "function", text: "get" }, { type: "punctuation", text: "({" }],
      [{ type: "property", text: "  from" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "USDT"' }, { type: "punctuation", text: "," }, { type: "property", text: " to" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "NGN"' }, { type: "punctuation", text: "," }],
      [{ type: "punctuation", text: "});" }],
      [{ type: "comment", text: '// rate.buy  → 1620.50 NGN/USDT' }],
      [],
      [{ type: "comment", text: "// Initiate the offramp" }],
      [{ type: "keyword", text: "const" }, { type: "property", text: " tx" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "property", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "offramp" }, { type: "punctuation", text: "." }, { type: "function", text: "create" }, { type: "punctuation", text: "({" }],
      [{ type: "property", text: "  walletId" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "wal_01HXYZ456abc"' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  amount" }, { type: "punctuation", text: ":" }, { type: "number", text: " 500" }, { type: "punctuation", text: "," }, { type: "comment", text: "  // USDT" }],
      [{ type: "property", text: "  bankCode" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "058"' }, { type: "punctuation", text: "," }, { type: "comment", text: "    // GTBank" }],
      [{ type: "property", text: "  accountNumber" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "0123456789"' }, { type: "punctuation", text: "," }],
      [{ type: "punctuation", text: "});" }],
      [],
      [{ type: "comment", text: '// tx.id          → "ofr_01HABC789xyz"' }],
      [{ type: "comment", text: '// tx.ngnAmount   → 810,250.00 NGN' }],
      [{ type: "comment", text: '// tx.status      → "processing"' }],
    ],
  },
  {
    id: "kyc",
    label: "Verify BVN",
    lines: [
      [{ type: "comment", text: "// Verify a user's BVN in one call" }],
      [{ type: "keyword", text: "const" }, { type: "property", text: " kyc" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "property", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "kyc" }, { type: "punctuation", text: "." }, { type: "function", text: "verifyBVN" }, { type: "punctuation", text: "({" }],
      [{ type: "property", text: "  bvn" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "22345678901"' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  firstName" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "Emeka"' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  lastName" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "Okonkwo"' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  dob" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "1995-03-14"' }, { type: "punctuation", text: "," }],
      [{ type: "punctuation", text: "});" }],
      [],
      [{ type: "comment", text: "// Response" }],
      [{ type: "punctuation", text: "{" }],
      [{ type: "property", text: "  verified" }, { type: "punctuation", text: ":" }, { type: "keyword", text: " true" }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  matchScore" }, { type: "punctuation", text: ":" }, { type: "number", text: " 97" }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  kycLevel" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "tier_2"' }, { type: "punctuation", text: "," }],
      [{ type: "property", text: "  userId" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "usr_01HXYZ123"' }, { type: "punctuation", text: "," }],
      [{ type: "punctuation", text: "}" }],
    ],
  },
];

const WEBHOOK_EVENTS = [
  {
    event: "wallet.created",
    time: "09:41:03",
    status: 200,
    data: '{ "id": "wal_01HXYZ456abc", "currency": "BTC" }',
  },
  {
    event: "deposit.confirmed",
    time: "09:41:47",
    status: 200,
    data: '{ "amount": 0.00125, "confirmations": 3 }',
  },
  {
    event: "offramp.completed",
    time: "09:42:12",
    status: 200,
    data: '{ "ngnAmount": 810250, "bank": "GTBank" }',
  },
];

const SDKS = ["Node.js", "Python", "PHP"];

function CodeLine({ tokens }: { tokens: Token[] }) {
  const colorMap: Record<string, string> = {
    keyword: "#93C5FD",
    string: "#86EFAC",
    comment: "#52525B",
    number: "#FCD34D",
    function: "#C4B5FD",
    property: "#FAFAFA",
    punctuation: "#71717A",
    operator: "#93C5FD",
  };
  if (tokens.length === 0) return <div className="h-5" />;
  return (
    <div className="leading-6">
      {tokens.map((t, i) => (
        <span key={i} style={{ color: colorMap[t.type] ?? "#FAFAFA" }}>
          {t.text}
        </span>
      ))}
    </div>
  );
}

export default function CodeShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("wallet");

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true },
        }
      );
      gsap.fromTo(
        showcaseRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: showcaseRef.current, start: "top 80%", once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const activeCode = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <section ref={sectionRef} className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div ref={headRef} className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">
            Developer Experience
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-4">
            In production in hours,{" "}
            <span className="text-[#71717A]">not weeks.</span>
          </h2>
          <p className="text-[#71717A] text-sm leading-relaxed">
            Clean, predictable APIs. Full TypeScript support. SDKs in multiple languages. Ship crypto features before your next standup.
          </p>
        </div>

        <div ref={showcaseRef}>
          {/* SDK pills */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-[#52525B] mr-2">SDK:</span>
            {SDKS.map((sdk) => (
              <span
                key={sdk}
                className="px-3 py-1 text-xs rounded border border-[#1C1C1F] bg-[#111113] text-[#71717A] font-mono cursor-default hover:border-[#2563EB]/40 hover:text-[#FAFAFA] transition-all duration-200"
              >
                {sdk}
              </span>
            ))}
          </div>

          {/* Tabs + Code */}
          <div className="rounded-xl border border-[#1C1C1F] overflow-hidden bg-[#111113]">
            {/* Tab bar */}
            <div className="flex border-b border-[#1C1C1F] bg-[#0C0C0E]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-xs font-mono transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "text-[#FAFAFA] border-[#2563EB]"
                      : "text-[#52525B] border-transparent hover:text-[#71717A]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Code area */}
            <div className="flex overflow-x-auto">
              {/* Line numbers */}
              <div className="py-5 pl-4 pr-3 flex flex-col text-[#3F3F46] select-none text-right min-w-[2.5rem] shrink-0 border-r border-[#1C1C1F]">
                {activeCode.lines.map((_, i) => (
                  <span key={i} className="text-xs leading-6">{i + 1}</span>
                ))}
              </div>
              {/* Code */}
              <div className="py-5 px-5 font-mono text-sm flex-1 min-w-0">
                {activeCode.lines.map((line, i) => (
                  <CodeLine key={`${activeTab}-${i}`} tokens={line} />
                ))}
              </div>
            </div>
          </div>

          {/* Webhook event log */}
          <div className="mt-4 rounded-xl border border-[#1C1C1F] bg-[#111113] overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1C1C1F]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] pulse-dot" />
              <span className="text-xs font-mono text-[#71717A]">Webhook event log</span>
              <span className="ml-auto text-[10px] font-mono text-[#52525B]">live</span>
            </div>
            <div className="divide-y divide-[#1C1C1F]">
              {WEBHOOK_EVENTS.map((ev) => (
                <div
                  key={ev.event}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[#09090B]/50 transition-colors"
                >
                  <span className="text-xs font-mono text-[#52525B] w-16 shrink-0">{ev.time}</span>
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: "#22C55E18", color: "#22C55E", border: "1px solid #22C55E30" }}
                  >
                    {ev.status}
                  </span>
                  <span className="text-xs font-mono text-[#2563EB] shrink-0">{ev.event}</span>
                  <span className="text-xs font-mono text-[#52525B] truncate hidden sm:block">{ev.data}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
