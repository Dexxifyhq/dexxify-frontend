"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { opacity: 0, y: 32 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: innerRef.current, start: "top 82%" },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-2xl mx-auto text-center" ref={innerRef}>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-4">
          Stop building infrastructure.{" "}
          <br className="hidden sm:block" />
          <span className="text-[#71717A]">Start building your product.</span>
        </h2>
        <p className="text-[#71717A] text-base leading-relaxed mb-10 max-w-lg mx-auto">
          Dexxify handles crypto wallets, NGN settlement, swaps and KYC — in a
          single integration built for African developers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors duration-200"
          >
            Get API Access
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md border border-[#1C1C1F] text-[#71717A] text-sm font-medium hover:text-[#FAFAFA] hover:border-[#2563EB] transition-all duration-200"
          >
            Talk to us
          </a>
        </div>

        <p className="text-xs text-[#52525B] font-mono">
          No credit card required · Sandbox access is instant
        </p>
      </div>
    </section>
  );
}
