"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FLOW_NODES = [
  {
    label: "Your App",
    sub: "Any framework",
    color: "#FAFAFA",
    border: "#1C1C1F",
    badge: null,
  },
  {
    label: "Dexxify API",
    sub: "Single integration",
    color: "#2563EB",
    border: "#2563EB",
    badge: "One call",
  },
  {
    label: "Infrastructure",
    sub: "Hidden complexity",
    color: "#71717A",
    border: "#1C1C1F",
    badge: null,
    hidden: true,
  },
];

const VENDORS = ["Bitnob", "Paystack", "Smile ID", "Lightning", "On-chain"];

const COLUMNS = [
  {
    icon: "01",
    title: "You call one API",
    desc: "A single REST endpoint — predictable, versioned, documented. One SDK. One auth token. One support channel.",
    accent: "#2563EB",
  },
  {
    icon: "02",
    title: "We handle the complexity",
    desc: "Routing, retries, KYC orchestration, rate sourcing, webhook delivery, compliance — Dexxify manages all of it.",
    accent: "#22C55E",
  },
  {
    icon: "03",
    title: "Your users get crypto features",
    desc: "Wallets, swaps, NGN payouts, virtual accounts — working in your product within hours of integrating.",
    accent: "#C4B5FD",
  },
];

export default function Solution() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);

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
        flowRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: flowRef.current, start: "top 80%", once: true },
        }
      );

      const cols = colsRef.current?.querySelectorAll(".sol-col");
      if (cols) {
        gsap.fromTo(
          cols,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12,
            scrollTrigger: { trigger: colsRef.current, start: "top 80%", once: true },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div ref={headRef} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">
            The Solution
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-5">
            Everything crypto.{" "}
            <span className="text-[#71717A]">Nothing else to build.</span>
          </h2>
        </div>

        {/* Flow diagram */}
        <div ref={flowRef} className="mb-16">
          <div
            className="rounded-xl border border-[#1C1C1F] bg-[#111113] p-8 sm:p-12"
          >
            {/* Top row: App → Dexxify */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {/* Developer App */}
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg border border-[#1C1C1F] bg-[#09090B] px-6 py-4 text-center min-w-[140px]">
                  <div className="font-mono text-xs text-[#71717A] mb-1">Your App</div>
                  <div className="font-semibold text-[#FAFAFA] text-sm">Developer App</div>
                  <div className="text-[10px] text-[#52525B] mt-1">Any framework</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-1">
                <div className="hidden sm:flex items-center gap-1">
                  <div className="w-12 h-px bg-[#1C1C1F]" />
                  <div className="text-[#2563EB] text-xs font-mono px-2 py-0.5 rounded border border-[#2563EB]/30 bg-[#2563EB]/5">
                    REST / SDK
                  </div>
                  <div className="w-12 h-px bg-[#1C1C1F]" />
                </div>
                <div className="sm:hidden text-[#1C1C1F] text-xl">↓</div>
              </div>

              {/* Dexxify */}
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-lg border border-[#2563EB] bg-[#2563EB]/5 px-6 py-4 text-center min-w-[140px] relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#2563EB] text-white font-mono">
                      One call
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#2563EB] mb-1">API Layer</div>
                  <div className="font-bold text-[#FAFAFA] text-sm">Dexxify API</div>
                  <div className="text-[10px] text-[#71717A] mt-1">Single integration</div>
                </div>
              </div>
            </div>

            {/* Divider label */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-[#1C1C1F]" />
              <span className="text-xs text-[#52525B] font-mono">Hidden complexity ↓</span>
              <div className="flex-1 h-px bg-[#1C1C1F]" />
            </div>

            {/* Bottom row: vendors */}
            <div className="flex flex-wrap justify-center gap-3">
              {VENDORS.map((v) => (
                <div
                  key={v}
                  className="rounded-md border border-[#1C1C1F] bg-[#09090B] px-4 py-2 text-xs text-[#52525B] font-mono"
                >
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Three columns */}
        <div ref={colsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {COLUMNS.map((col) => (
            <div
              key={col.title}
              className="sol-col rounded-xl border border-[#1C1C1F] bg-[#111113] p-6"
            >
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-mono font-bold mb-5"
                style={{ background: `${col.accent}18`, color: col.accent }}
              >
                {col.icon}
              </div>
              <h3 className="font-semibold text-[#FAFAFA] text-base mb-2">{col.title}</h3>
              <p className="text-[#71717A] text-sm leading-relaxed">{col.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
