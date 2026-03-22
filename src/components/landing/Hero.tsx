"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const CODE_LINES = [
  { tokens: [{ type: "keyword", text: "const" }, { type: "property", text: " wallet" }, { type: "operator", text: " = " }, { type: "keyword", text: "await" }, { type: "function", text: " dexxify" }, { type: "punctuation", text: "." }, { type: "function", text: "wallets" }, { type: "punctuation", text: "." }, { type: "function", text: "create" }, { type: "punctuation", text: "({" }] },
  { tokens: [{ type: "property", text: "  userId" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "usr_01HXYZ123"' }, { type: "punctuation", text: "," }] },
  { tokens: [{ type: "property", text: "  currency" }, { type: "punctuation", text: ":" }, { type: "string", text: ' "BTC"' }, { type: "punctuation", text: "," }] },
  { tokens: [{ type: "punctuation", text: "});" }] },
  { tokens: [] },
  { tokens: [{ type: "comment", text: "// wallet.address: bc1qxy2kgdygjrsqtzq2n0yrf24..." }] },
  { tokens: [{ type: "comment", text: "// wallet.id:      wal_01HXYZ456abc" }] },
];

const STATS = [
  { label: "BTC + USDT supported" },
  { label: "NGN settlement" },
  { label: "KYC built in" },
  { label: "Sandbox ready" },
];

const METRICS = [
  { end: 3, suffix: "+", label: "Chains" },
  { end: 60, suffix: "s", label: "Settlement" },
  { end: 100, suffix: "%", label: "Sandbox parity" },
  { end: 1, suffix: " API", label: "Integration" },
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
  const metricsRef = useRef<HTMLDivElement>(null);
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
      gsap.set([badgeRef.current, headlineRef.current, subRef.current, metricsRef.current, codeRef.current], { opacity: 1, y: 0, scale: 1 });
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
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 },
        0.4
      );

      tl.fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7);

      const ctaBtns = ctaRef.current?.querySelectorAll("a");
      if (ctaBtns) {
        tl.fromTo(ctaBtns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.9);
      }

      const pills = statsRef.current?.querySelectorAll(".stat-pill");
      if (pills) {
        tl.fromTo(pills, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 1.05);
      }

      tl.fromTo(metricsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, 1.15);

      const metricEls = metricsRef.current?.querySelectorAll(".metric-value");
      if (metricEls) {
        metricEls.forEach((el, i) => {
          const target = METRICS[i];
          const obj = { val: 0 };
          tl.to(obj, {
            val: target.end,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(obj.val) + target.suffix; },
          }, 1.2);
        });
      }

      tl.fromTo(codeRef.current, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 1.1);

      tl.call(() => {
        gsap.to(codeRef.current, {
          y: -8,
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
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
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 60%)" }}
      />

      <div
        ref={glowRef}
        className="absolute pointer-events-none"
        style={{
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
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
        className="opacity-0 max-w-3xl mx-auto mb-6 text-[2.5rem] sm:text-[3.25rem] lg:text-[3.75rem] font-bold leading-[1.1] tracking-tight text-[#FAFAFA]"
      >
        The crypto infrastructure{" "}
        <em style={{ fontStyle: "italic" }}>API for Africa.</em>
      </h1>

      <p
        ref={subRef}
        className="opacity-0 max-w-xl mx-auto text-[#71717A] text-base sm:text-lg leading-relaxed mb-8"
      >
        One API to add crypto wallets, Naira settlement, swaps and KYC to your product.{" "}
        <span className="text-[#FAFAFA]">Stop integrating 5 vendors. Start building.</span>
      </p>

      <div ref={ctaRef} className="flex flex-col sm:flex-row items-center gap-3 mb-10">
        <a
          href="#"
          style={{ opacity: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors duration-200"
        >
          Get API Access
        </a>
        <a
          href="#"
          style={{ opacity: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md border border-[#1C1C1F] text-[#71717A] text-sm font-medium hover:text-[#FAFAFA] hover:border-[#2563EB] transition-all duration-200"
        >
          Read the Docs
        </a>
      </div>

      <div ref={statsRef} className="flex flex-wrap justify-center gap-2 mb-8">
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

      <div
        ref={metricsRef}
        className="opacity-0 flex items-center justify-center gap-8 sm:gap-12 mb-16 border-t border-b border-[#1C1C1F] py-5 w-full max-w-lg"
      >
        {METRICS.map((m) => (
          <div key={m.label} className="text-center">
            <div className="metric-value font-bold text-xl text-[#FAFAFA] font-mono tabular-nums">
              0{m.suffix}
            </div>
            <div className="text-[10px] text-[#52525B] mt-0.5 uppercase tracking-wider">{m.label}</div>
          </div>
        ))}
      </div>

      <div ref={codeRef} className="opacity-0 w-full max-w-lg mx-auto">
        <div className="rounded-xl border border-[#1C1C1F] overflow-hidden text-left" style={{ background: "#111113" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1C1C1F]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FCD34D] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] opacity-70" />
            <span className="ml-3 text-xs text-[#52525B] font-mono">create-wallet.js</span>
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
