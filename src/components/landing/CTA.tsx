"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function CTA() {
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
      <div className="max-w-xl mx-auto text-center" ref={innerRef}>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-4">
          Start in minutes.{" "}
          <span className="text-[#71717A]">Scale without limits.</span>
        </h2>
        <p className="text-[#71717A] text-base leading-relaxed mb-10 max-w-md mx-auto">
          Whether you&apos;re accepting crypto or paying out in Naira — Dexxify handles everything in between.
        </p>

        <div className="mb-6">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors duration-200"
          >
            Create free account
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 7h9M7 3l4 4-4 4" />
            </svg>
          </a>
        </div>

        <p className="text-xs text-[#52525B] font-mono">
          No credit card required · Sandbox access is instant · Go live in under 30 minutes
        </p>
      </div>
    </section>
  );
}
