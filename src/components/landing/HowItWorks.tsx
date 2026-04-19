"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TABS = {
  gateway: {
    label: "Payment Gateway",
    headline: "Get paid in crypto in 3 steps",
    steps: [
      {
        n: "01",
        title: "Customer selects crypto at checkout",
        desc: "Your checkout page calls the Dexxify API. We return a payment address and a 30-minute session window.",
        tag: "Your store",
      },
      {
        n: "02",
        title: "Scans QR code and sends payment",
        desc: "The customer scans the QR code with their wallet app and sends the exact USDT or BTC amount shown.",
        tag: "Customer wallet",
      },
      {
        n: "03",
        title: "Naira lands in your bank account",
        desc: "We confirm the deposit, convert at the locked rate, and send NGN to your account. Under 2 minutes.",
        tag: "Your bank",
      },
    ],
  },
  offramp: {
    label: "Offramp API",
    headline: "Pay out in 3 steps",
    steps: [
      {
        n: "01",
        title: "Call POST /v1/offramp with bank details",
        desc: "Pass the USDT amount, network, and your user's bank account number and bank code. Get back a deposit address.",
        tag: "Your backend",
      },
      {
        n: "02",
        title: "Send USDT to deposit address",
        desc: "Transfer exactly the specified USDT amount to the unique address returned. We track it in real time.",
        tag: "USDT transfer",
      },
      {
        n: "03",
        title: "User receives Naira bank alert",
        desc: "Once confirmed, we convert and initiate the NGN transfer. Your user gets an SMS alert from their bank.",
        tag: "User's bank",
      },
    ],
  },
};

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"gateway" | "offramp">("gateway");
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set([headRef.current, stepsRef.current], { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(headRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: headRef.current, start: "top 80%", once: true },
      });
      gsap.fromTo(stepsRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: stepsRef.current, start: "top 80%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const tab = TABS[activeTab];

  return (
    <section ref={sectionRef} className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-5xl mx-auto">
        <div ref={headRef} className="mb-14">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">How it works</p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight max-w-xs">
              {tab.headline}
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-lg border border-[#1C1C1F] bg-[#111113] w-fit shrink-0">
              {(["gateway", "offramp"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap"
                  style={{
                    background: activeTab === t ? "#1C1C1F" : "transparent",
                    color: activeTab === t ? "#FAFAFA" : "#71717A",
                  }}
                >
                  {TABS[t].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div ref={stepsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tab.steps.map((step, i) => (
            <div key={`${activeTab}-${step.n}`} className="relative">
              {i < tab.steps.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-[calc(100%+12px)] w-6 h-px bg-[#1C1C1F]" />
              )}
              <div className="rounded-xl border border-[#1C1C1F] bg-[#111113] p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs text-[#2563EB]">{step.n}</span>
                  <span className="text-[10px] font-mono text-[#52525B] border border-[#1C1C1F] px-2 py-0.5 rounded">{step.tag}</span>
                </div>
                <h3 className="font-semibold text-[#FAFAFA] text-sm leading-snug mb-3">{step.title}</h3>
                <p className="text-[#71717A] text-xs leading-relaxed flex-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
