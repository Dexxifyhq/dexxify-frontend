"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MODULES = [
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6" />
      </svg>
    ),
    title: "WaaS API",
    desc: "Create non-custodial wallets per user instantly. BTC, USDT, Lightning — one call.",
    badge: "Core",
    badgeColor: "#2563EB",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: "Send & Receive",
    desc: "On-chain and Lightning Network transactions with real-time status webhooks.",
    badge: null,
    badgeColor: null,
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: "Swap API",
    desc: "BTC ↔ USDT conversions at real market rates, settled in seconds. Single endpoint.",
    badge: null,
    badgeColor: null,
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: "On/Off Ramp",
    desc: "Seamless crypto ↔ NGN conversion with live rate feeds. Bank transfer or USSD.",
    badge: "Popular",
    badgeColor: "#22C55E",
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Payout API",
    desc: "NGN payouts to any Nigerian bank account in under 60 seconds via NIP.",
    badge: null,
    badgeColor: null,
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    title: "Virtual Accounts",
    desc: "Dedicated NUBAN per user. Receive NGN deposits mapped directly to a user wallet.",
    badge: null,
    badgeColor: null,
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "KYC API",
    desc: "BVN, NIN, document verification, and liveness checks. One unified API, instant results.",
    badge: null,
    badgeColor: null,
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Webhooks",
    desc: "Real-time event delivery for every transaction. Signed payloads. Retry logic included.",
    badge: null,
    badgeColor: null,
  },
];

export default function ProductModules() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" },
        }
      );

      const cards = gridRef.current?.querySelectorAll(".module-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 36 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08,
            scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
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
        <div ref={headRef} className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">
            Product Modules
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-4">
            The complete crypto stack.
          </h2>
          <p className="text-[#71717A] text-sm leading-relaxed">
            Eight production-ready modules. One integration. Every crypto feature your
            product needs — without building any of it.
          </p>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {MODULES.map((mod) => (
            <div
              key={mod.title}
              className="module-card group relative rounded-xl border border-[#1C1C1F] bg-[#111113] p-5 hover:border-[#2563EB]/40 transition-all duration-300 cursor-default"
            >
              {mod.badge && (
                <span
                  className="absolute top-3 right-3 text-[10px] font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: `${mod.badgeColor}18`,
                    color: mod.badgeColor ?? undefined,
                    border: `1px solid ${mod.badgeColor}30`,
                  }}
                >
                  {mod.badge}
                </span>
              )}
              <div className="w-8 h-8 rounded-md bg-[#09090B] border border-[#1C1C1F] flex items-center justify-center text-[#71717A] group-hover:text-[#2563EB] group-hover:border-[#2563EB]/30 transition-all duration-300 mb-4">
                {mod.icon}
              </div>
              <h3 className="font-semibold text-[#FAFAFA] text-sm mb-1.5">{mod.title}</h3>
              <p className="text-[#71717A] text-xs leading-relaxed">{mod.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
