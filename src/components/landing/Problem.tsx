"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PROBLEMS = [
  {
    n: "01",
    title: "Fragmented crypto stack",
    desc: "You need Bitnob for wallets, Binance for swaps, and another provider for on-ramp. Three contracts. Three integrations. Three failure points.",
  },
  {
    n: "02",
    title: "Manual NGN settlement",
    desc: "Converting crypto to Naira means navigating P2P desks, manual bank transfers, and unreliable rates. No API. No automation.",
  },
  {
    n: "03",
    title: "No unified KYC layer",
    desc: "BVN verification, NIN checks, liveness detection — each from a different vendor with different SDKs, pricing models, and support contracts.",
  },
  {
    n: "04",
    title: "No sandbox environment",
    desc: "Testing means burning real funds or setting up complex mock servers. Ship to production blind, or don't ship at all.",
  },
  {
    n: "05",
    title: "Built for exchanges, not developers",
    desc: "Existing African crypto APIs are designed for end-user apps, not infrastructure. No multi-tenant support. No per-user wallets. No webhooks.",
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 85%" },
        }
      );

      const cards = cardsRef.current?.querySelectorAll(".problem-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1,
            scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
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
        <div ref={headingRef} className="max-w-2xl mb-16">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-5">
            Africa&apos;s developers deserve better crypto infrastructure.
          </h2>
          <p className="text-[#71717A] text-base leading-relaxed">
            Right now, adding crypto to your product means stitching together
            multiple vendors, managing compliance across providers, and building
            everything from scratch.
          </p>
        </div>

        {/* Problem cards */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROBLEMS.map((p) => (
            <div
              key={p.n}
              className="problem-card group rounded-xl border border-[#1C1C1F] bg-[#111113] p-6 hover:border-[#2563EB]/30 transition-colors duration-300"
            >
              <span className="font-mono text-xs text-[#2563EB] mb-4 block">{p.n}</span>
              <h3 className="font-semibold text-[#FAFAFA] text-base mb-2">{p.title}</h3>
              <p className="text-[#71717A] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}

          {/* Last card — "The result" */}
          <div className="problem-card rounded-xl border border-[#1C1C1F] bg-[#111113] p-6 sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
            <span className="font-mono text-xs text-[#EF4444] mb-4 block">Result</span>
            <p className="text-[#71717A] text-sm leading-relaxed">
              Months wasted on infrastructure. Products delayed. Founders stuck
              being glue code engineers instead of building their actual business.
            </p>
            <div className="mt-6 pt-4 border-t border-[#1C1C1F]">
              <p className="text-xs text-[#52525B] font-mono">avg. time lost: ~3–6 months</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
