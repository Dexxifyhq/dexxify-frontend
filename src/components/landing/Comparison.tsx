"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FEATURES = [
  "Wallet creation per user",
  "Send & Receive crypto",
  "Swap API",
  "NGN On/Off Ramp",
  "KYC built in",
  "Virtual NGN accounts",
  "Webhooks",
  "Sandbox environment",
  "Developer dashboard",
  "Multi-tenant API keys",
];

type Status = true | false | "partial";

const COMPETITORS: {
  name: string;
  highlight?: boolean;
  values: Status[];
}[] = [
  {
    name: "Bitnob direct",
    values: [true, true, false, false, false, false, true, true, true, false],
  },
  {
    name: "Breet",
    values: [false, false, false, true, false, false, false, false, true, false],
  },
  {
    name: "Ivorypay",
    values: [false, false, false, true, false, false, false, false, true, false],
  },
  {
    name: "Dexxify",
    highlight: true,
    values: [true, true, true, true, true, true, true, true, true, true],
  },
];

function Cell({ val, highlight }: { val: Status; highlight?: boolean }) {
  if (val === true) {
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full"
        style={{
          background: highlight ? "#22C55E18" : "#22C55E0D",
          color: "#22C55E",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (val === "partial") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FCD34D]/10 text-[#FCD34D]">
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
          <rect width="10" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EF4444]/10 text-[#EF4444]">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Comparison() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

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

      const rows = tableRef.current?.querySelectorAll("tbody tr");
      if (rows) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.05,
            scrollTrigger: { trigger: tableRef.current, start: "top 80%", once: true },
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
        <div ref={headRef} className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">
            Comparison
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-4">
            Not just another crypto API.
          </h2>
          <p className="text-[#71717A] text-sm leading-relaxed">
            See how Dexxify stacks up against alternatives when building a real product.
          </p>
        </div>

        {/* Table */}
        <div ref={tableRef} className="overflow-x-auto rounded-xl border border-[#1C1C1F]">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1C1C1F]">
                <th className="text-left px-6 py-4 text-[#71717A] font-normal text-xs font-mono bg-[#111113]">
                  Feature
                </th>
                {COMPETITORS.map((c) => (
                  <th
                    key={c.name}
                    className="px-6 py-4 text-center font-semibold text-sm"
                    style={{
                      background: c.highlight ? "#2563EB08" : "#111113",
                      color: c.highlight ? "#2563EB" : "#71717A",
                      borderLeft: c.highlight ? "1px solid #2563EB20" : "1px solid #1C1C1F",
                    }}
                  >
                    {c.name}
                    {c.highlight && (
                      <span className="block text-[10px] font-mono text-[#2563EB]/60 font-normal mt-0.5">
                        recommended
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat, fi) => (
                <tr
                  key={feat}
                  className="border-b border-[#1C1C1F] last:border-0 hover:bg-[#111113]/50 transition-colors"
                >
                  <td className="px-6 py-3.5 text-[#71717A] text-xs font-mono bg-[#111113]">
                    {feat}
                  </td>
                  {COMPETITORS.map((c) => (
                    <td
                      key={c.name}
                      className="px-6 py-3.5 text-center"
                      style={{
                        background: c.highlight ? "#2563EB05" : "transparent",
                        borderLeft: c.highlight ? "1px solid #2563EB20" : "1px solid #1C1C1F",
                      }}
                    >
                      <Cell val={c.values[fi]} highlight={c.highlight} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <p className="text-center text-xs text-[#3F3F46] font-mono mt-5">
          Comparison based on publicly available documentation as of Q1 2025.
        </p>
      </div>
    </section>
  );
}
