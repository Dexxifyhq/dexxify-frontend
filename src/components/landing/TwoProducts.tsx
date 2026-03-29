"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CreditCard, Zap, Landmark, Upload, Bell, type LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function TwoProducts() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([headRef.current, cardsRef.current], { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true },
      });
      const cards = cardsRef.current?.querySelectorAll(".product-card");
      if (cards) {
        gsap.fromTo(cards, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.15,
          scrollTrigger: { trigger: cardsRef.current, start: "top 80%", once: true },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-5xl mx-auto">
        <div ref={headRef} className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">Products</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight">
            One platform. Two powerful products.
          </h2>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Gateway */}
          <div className="product-card rounded-2xl border border-[#1C1C1F] bg-[#111113] p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 uppercase tracking-wider">
                For businesses
              </span>
              <span className="font-mono text-xs text-[#3F3F46]">01</span>
            </div>

            <h3 className="text-2xl font-bold text-[#FAFAFA] mb-3">Accept crypto payments</h3>
            <p className="text-[#71717A] text-sm leading-relaxed mb-8">
              Let your customers pay in USDT, BTC or 50+ cryptocurrencies. Dexxify converts automatically and settles Naira directly into your bank account. No crypto knowledge needed.
            </p>

            <div className="rounded-xl border border-[#1C1C1F] bg-[#09090B] p-5 mb-8">
              <div className="flex flex-col gap-0">
                <FlowRow icon={CreditCard} label="Customer pays crypto" sub="Any wallet, any amount" />
                <FlowDivider />
                <FlowRow icon={Zap} label="Dexxify converts" sub="Real-time rate lock" highlight />
                <FlowDivider />
                <FlowRow icon={Landmark} label="Naira to your bank" sub="Under 2 minutes" success />
              </div>
            </div>

            <div className="mt-auto">
              <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#93C5FD] transition-colors duration-200">
                Start accepting
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 7h9M7 3l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>

          {/* Offramp API */}
          <div className="product-card rounded-2xl border border-[#1C1C1F] bg-[#111113] p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 uppercase tracking-wider">
                For platforms
              </span>
              <span className="font-mono text-xs text-[#3F3F46]">02</span>
            </div>

            <h3 className="text-2xl font-bold text-[#FAFAFA] mb-3">Pay users in Naira</h3>
            <p className="text-[#71717A] text-sm leading-relaxed mb-8">
              Running an exchange, freelance platform or remittance app? Send USDT to your users and Dexxify delivers Naira straight to their bank account. One API call.
            </p>

            <div className="rounded-xl border border-[#1C1C1F] bg-[#09090B] p-5 mb-8">
              <div className="flex flex-col gap-0">
                <FlowRow icon={Upload} label="You send USDT" sub="Via a single API call" />
                <FlowDivider />
                <FlowRow icon={Zap} label="Dexxify converts" sub="Best available rate" highlight />
                <FlowDivider />
                <FlowRow icon={Bell} label="Naira to user's bank" sub="Any Nigerian bank" success />
              </div>
            </div>

            <div className="mt-auto">
              <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#22C55E] hover:text-[#86EFAC] transition-colors duration-200">
                Explore the API
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 7h9M7 3l4 4-4 4" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowRow({ icon: Icon, label, sub, highlight, success }: { icon: LucideIcon; label: string; sub: string; highlight?: boolean; success?: boolean }) {
  const color = highlight ? "#2563EB" : success ? "#22C55E" : "#FAFAFA";
  const bg = highlight ? "rgba(37,99,235,0.06)" : success ? "rgba(34,197,94,0.06)" : "transparent";
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: bg }}>
      <Icon size={16} style={{ color }} className="shrink-0" />
      <div>
        <div className="text-sm font-medium" style={{ color }}>{label}</div>
        <div className="text-[11px] text-[#52525B] mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function FlowDivider() {
  return (
    <div className="flex items-center pl-5 py-1">
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
        <line x1="5" y1="0" x2="5" y2="8" stroke="#1C1C1F" strokeWidth="1.5" />
        <path d="M2 8l3 4 3-4" stroke="#3F3F46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}
