"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(innerRef.current, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(innerRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: innerRef.current, start: "top 80%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-2xl mx-auto">
        <div ref={innerRef} className="text-center">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-4">
            Simple, transparent pricing
          </h2>

          {/* Big number */}
          <div className="my-14">
            <div className="text-[6rem] sm:text-[8rem] font-bold leading-none tracking-tight tabular-nums">
              <span className="text-[#FAFAFA]">1</span><span className="text-[#2563EB]">%</span>
            </div>
            <p className="text-lg font-semibold text-[#FAFAFA] mt-3 mb-2">per transaction</p>
            <p className="text-[#71717A] text-sm max-w-sm mx-auto">
              No monthly fees. No setup costs. No hidden charges. You only pay when you earn.
            </p>
          </div>

          {/* Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[#1C1C1F] bg-[#111113]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              <span className="text-sm font-medium text-[#FAFAFA]">Payment Gateway</span>
              <span className="text-sm font-bold text-[#2563EB] ml-1">1%</span>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-[#1C1C1F] bg-[#111113]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span className="text-sm font-medium text-[#FAFAFA]">Offramp API</span>
              <span className="text-sm font-bold text-[#22C55E] ml-1">1%</span>
            </div>
          </div>

          <p className="text-xs text-[#52525B] font-mono">
            Network / gas fees are passed through at cost
          </p>
        </div>
      </div>
    </section>
  );
}
