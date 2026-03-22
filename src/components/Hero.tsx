"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const CODE_LINES = [
  { tokens: [
    { type: "keyword", text: "const" },
    { type: "property", text: " wallet" },
    { type: "operator", text: " = " },
    { type: "keyword", text: "await" },
    { type: "function", text: " dexxify" },
    { type: "punctuation", text: "." },
    { type: "function", text: "wallets" },
    { type: "punctuation", text: "." },
    { type: "function", text: "create" },
    { type: "punctuation", text: "(" },
    { type: "punctuation", text: "{" },
  ]},
  { tokens: [
    { type: "property", text: "  userId" },
    { type: "punctuation", text: ":" },
    { type: "string", text: ' "usr_01HXYZ123"' },
    { type: "punctuation", text: "," },
  ]},
  { tokens: [
    { type: "property", text: "  currency" },
    { type: "punctuation", text: ":" },
    { type: "string", text: ' "BTC"' },
    { type: "punctuation", text: "," },
  ]},
  { tokens: [
    { type: "punctuation", text: "});" },
  ]},
  { tokens: [] }, // blank line
  { tokens: [
    { type: "comment", text: "// → wallet.address: bc1qxy2kgdygjrsqtzq2n0yrf24..." },
  ]},
  { tokens: [
    { type: "comment", text: "// → wallet.id:      wal_01HXYZ456abc" },
  ]},
];

function CodeLine({ tokens }: { tokens: { type: string; text: string }[] }) {
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
  if (tokens.length === 0) return <div className="h-4" />;
  return (
    <div className="leading-7">
      {tokens.map((t, i) => (
        <span key={i} style={{ color: colorMap[t.type] ?? "#FAFAFA" }}>
          {t.text}
        </span>
      ))}
    </div>
  );
}

const STATS = [
  { label: "BTC + USDT supported" },
  { label: "NGN settlement" },
  { label: "KYC built in" },
  { label: "Sandbox ready" },
];

export default function Hero() {
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    // Badge
    tl.fromTo(badgeRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, 0.5);

    // Headline words stagger
    const words = headlineRef.current?.querySelectorAll(".word");
    if (words) {
      tl.fromTo(
        words,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 },
        0.7
      );
    }

    // Subheadline
    tl.fromTo(subRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.2);

    // CTAs
    tl.fromTo(ctaRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 1.4);

    // Stats
    const statPills = statsRef.current?.querySelectorAll(".stat-pill");
    if (statPills) {
      tl.fromTo(
        statPills,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
        1.55
      );
    }

    // Code block
    tl.fromTo(codeRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 }, 1.7);

    // Floating loop for code block
    gsap.to(codeRef.current, {
      y: -8,
      duration: 3.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 2.4,
    });
  }, []);

  const headline = "The crypto infrastructure API for Africa.";
  const words = headline.split(" ");

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Beta badge */}
      <div ref={badgeRef} className="opacity-0 mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-[#1C1C1F] bg-[#111113] text-[#71717A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] pulse-dot" />
          Now in private beta
        </span>
      </div>

      {/* Headline */}
      <div
        ref={headlineRef}
        className="max-w-3xl mx-auto mb-6 text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] font-bold leading-[1.1] tracking-tight"
      >
        {words.map((word, i) => {
          const isItalic = word === "Africa.";
          return (
            <span key={i} className="word inline-block opacity-0 mr-[0.25em]">
              {isItalic ? (
                <em className="not-italic" style={{ fontStyle: "italic", color: "#FAFAFA" }}>
                  {word}
                </em>
              ) : (
                <span className="text-[#FAFAFA]">{word}</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Subheadline */}
      <p
        ref={subRef}
        className="opacity-0 max-w-xl mx-auto text-[#71717A] text-base sm:text-lg leading-relaxed mb-8"
      >
        One API to add crypto wallets, Naira settlement, swaps and KYC to your
        product.{" "}
        <span className="text-[#FAFAFA]">
          Stop integrating 5 vendors. Start building.
        </span>
      </p>

      {/* CTAs */}
      <div ref={ctaRef} className="opacity-0 flex flex-col sm:flex-row items-center gap-3 mb-10">
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors duration-200"
        >
          Get API Access
        </a>
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-[#1C1C1F] text-[#71717A] text-sm font-medium hover:text-[#FAFAFA] hover:border-[#2563EB] transition-all duration-200"
        >
          Read the Docs
        </a>
      </div>

      {/* Stat pills */}
      <div ref={statsRef} className="flex flex-wrap justify-center gap-2 mb-16">
        {STATS.map((s) => (
          <span
            key={s.label}
            className="stat-pill opacity-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-[#1C1C1F] bg-[#111113] text-[#71717A]"
          >
            <span className="w-1 h-1 rounded-full bg-[#2563EB]" />
            {s.label}
          </span>
        ))}
      </div>

      {/* Code block */}
      <div ref={codeRef} className="opacity-0 w-full max-w-lg mx-auto">
        <div
          className="rounded-xl border border-[#1C1C1F] overflow-hidden text-left"
          style={{ background: "#111113" }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1C1C1F]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCD34D] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] opacity-70" />
            <span className="ml-3 text-xs text-[#52525B] font-mono">create-wallet.js</span>
          </div>

          {/* Code */}
          <div className="px-5 py-5 font-mono text-sm overflow-x-auto">
            <div className="flex gap-4">
              {/* Line numbers */}
              <div className="flex flex-col text-[#3F3F46] select-none text-right min-w-[1.5rem]">
                {CODE_LINES.map((_, i) => (
                  <span key={i} className="leading-7 text-xs">{i + 1}</span>
                ))}
              </div>
              {/* Code content */}
              <div className="flex-1">
                {CODE_LINES.map((line, i) => (
                  <CodeLine key={i} tokens={line.tokens} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
