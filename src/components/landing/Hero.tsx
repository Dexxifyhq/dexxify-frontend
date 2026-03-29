"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const STATS = [
  { label: "USDT & BTC" },
  { label: "NGN settlement" },
  { label: "Under 2 minutes" },
  { label: "1% flat fee" },
  { label: "50+ cryptocurrencies" },
];

const CODE_LINES = [
  { tokens: [{ type: "keyword", text: "const" }, { type: "property", text: " payment" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "function", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "payments" }, { type: "punctuation", text: "." }, { type: "function", text: "create" }, { type: "punctuation", text: "({" }] },
  { tokens: [{ type: "property", text: "  amount" }, { type: "punctuation", text: ":" }, { type: "number", text: " 50000" }, { type: "punctuation", text: "," }, { type: "comment", text: "    // NGN" }] },
  { tokens: [{ type: "property", text: "  currency" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "NGN"' }, { type: "punctuation", text: "," }] },
  { tokens: [{ type: "property", text: "  asset" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "USDT"' }, { type: "punctuation", text: "," }] },
  { tokens: [{ type: "property", text: "  network" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "TRC20"' }, { type: "punctuation", text: "," }] },
  { tokens: [{ type: "property", text: "  reference" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "order_123"' }, { type: "punctuation", text: "," }] },
  { tokens: [{ type: "punctuation", text: "});" }] },
  { tokens: [] },
  { tokens: [{ type: "comment", text: "// payment.address     → send USDT here" }] },
  { tokens: [{ type: "comment", text: "// payment.amount_usdt → 30.77" }] },
  { tokens: [{ type: "comment", text: "// payment.expires_at  → 30 min window" }] },
];

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

function CodeLine({ tokens }: { tokens: { type: string; text: string }[] }) {
  if (tokens.length === 0) return <div className="h-4" />;
  return (
    <div className="leading-7">
      {tokens.map((t, i) => (
        <span key={i} style={{ color: COLOR_MAP[t.type] ?? "#FAFAFA" }}>{t.text}</span>
      ))}
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    if (!section) return;

    gsap.set(glowRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      gsap.to(glowRef.current, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        overwrite: true,
      });
    };
    const onMouseLeave = () => gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);

    if (prefersReducedMotion) {
      gsap.set([badgeRef.current, headlineRef.current, subRef.current, codeRef.current], { opacity: 1, y: 0, scale: 1 });
      const pills = statsRef.current?.querySelectorAll(".stat-pill");
      if (pills) gsap.set(pills, { opacity: 1, y: 0 });
      const ctaBtns = ctaRef.current?.querySelectorAll("a");
      if (ctaBtns) gsap.set(ctaBtns, { opacity: 1, y: 0 });
      return () => {
        section.removeEventListener("mousemove", onMouseMove);
        section.removeEventListener("mouseleave", onMouseLeave);
      };
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 0.2);

      const split = new SplitText(headlineRef.current, { type: "words" });
      gsap.set(headlineRef.current, { opacity: 1 });
      tl.fromTo(
        split.words,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 },
        0.4
      );

      tl.fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7);

      const ctaBtns = ctaRef.current?.querySelectorAll("a");
      if (ctaBtns) {
        tl.fromTo(ctaBtns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.9);
      }

      const pills = statsRef.current?.querySelectorAll(".stat-pill");
      if (pills) {
        tl.fromTo(pills, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07 }, 1.05);
      }

      tl.fromTo(codeRef.current, { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 1.15);

      tl.call(() => {
        gsap.to(codeRef.current, { y: -8, duration: 3, ease: "sine.inOut", repeat: -1, yoyo: true });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-24 text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.07) 0%, transparent 55%)" }}
      />

      <div
        ref={glowRef}
        className="absolute pointer-events-none"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)",
          top: 0,
          left: 0,
          willChange: "transform",
        }}
      />

      <div ref={badgeRef} className="opacity-0 mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-[#1C1C1F] bg-[#111113] text-[#71717A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          Now in private beta
        </span>
      </div>

      <h1
        ref={headlineRef}
        className="opacity-0 max-w-3xl mx-auto mb-5 text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.08] tracking-tight text-[#FAFAFA]"
      >
        Crypto payments and payouts —{" "}
        <em style={{ fontStyle: "italic", color: "#71717A" }}>settled in Naira.</em>
      </h1>

      <p
        ref={subRef}
        className="opacity-0 max-w-lg mx-auto text-[#71717A] text-base sm:text-lg leading-relaxed mb-9"
      >
        Accept crypto from your customers or pay your users in crypto. Either way, Naira lands in the right bank account in under 2 minutes.
      </p>

      <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <a
          href="#"
          style={{ opacity: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors duration-200"
        >
          Get Started
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7h9M7 3l4 4-4 4" />
          </svg>
        </a>
        <a
          href="#"
          style={{ opacity: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-[#1C1C1F] text-[#71717A] text-sm font-medium hover:text-[#FAFAFA] hover:border-[#2563EB] transition-all duration-200"
        >
          View Docs
        </a>
      </div>

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

      <div ref={codeRef} className="opacity-0 w-full max-w-xl mx-auto">
        <div className="rounded-xl border border-[#1C1C1F] overflow-hidden text-left" style={{ background: "#111113" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1C1C1F]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCD34D] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] opacity-70" />
            <span className="ml-3 text-xs text-[#52525B] font-mono">create-payment.js</span>
            <span className="ml-auto text-[10px] text-[#2563EB] font-mono border border-[#2563EB]/20 bg-[#2563EB]/5 px-2 py-0.5 rounded">Node.js</span>
          </div>
          <div className="px-5 py-5 font-mono text-sm overflow-x-auto">
            <div className="flex gap-4">
              <div className="flex flex-col text-[#3F3F46] select-none text-right min-w-[1.5rem]">
                {CODE_LINES.map((_, i) => (
                  <span key={i} className="leading-7 text-xs">{i + 1}</span>
                ))}
              </div>
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
