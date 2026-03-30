"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Coins, QrCode, CheckCircle2, Landmark, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  { number: "01", icon: Coins, title: "Select currency", desc: "Customer picks USDT, BTC or any of 50+ supported cryptocurrencies" },
  { number: "02", icon: QrCode, title: "Scan and pay", desc: "A deposit address and QR code appear. Customer sends the exact amount" },
  { number: "03", icon: CheckCircle2, title: "Confirmed", desc: "On-chain confirmation fires in seconds. Webhook event sent to your server" },
  { number: "04", icon: Landmark, title: "Settled", desc: "Naira hits your bank account. Under 2 minutes from confirmation" },
];

export default function CheckoutFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // Section header fade in
        gsap.from(headRef.current, {
          opacity: 0, y: 30, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" }
        });

        // Steps stagger left to right
        const stepCards = stepsRef.current?.querySelectorAll(".step-card");
        if (stepCards) {
          gsap.from(Array.from(stepCards), {
            opacity: 0, y: 30, stagger: 0.12, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: stepsRef.current, start: "top 80%" }
          });
        }

        // Note fade
        gsap.from(noteRef.current, {
          opacity: 0, y: 10, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: noteRef.current, start: "top 90%" }
        });
      }, sectionRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-[#1C1C1F] bg-[#111113] text-xs text-[#71717A] px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            How it works
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAFAFA] mt-4">
            Get paid in under 2 minutes
          </h2>
          <p className="mt-4 text-[#71717A] text-lg max-w-xl mx-auto">
            Four steps from crypto to Naira. Fully automated.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {STEPS.map((step, i) => (
            <div key={step.number} className="relative flex items-start gap-1">
              <div className="step-card flex-1 bg-[#111113] border border-[#1C1C1F] rounded-xl p-6 hover:border-[#2563EB]/30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-[#71717A]">{step.number}</span>
                  <div className="w-8 h-8 rounded-lg bg-[#0D0D0F] border border-[#1C1C1F] flex items-center justify-center">
                    <step.icon size={14} className="text-[#2563EB]" />
                  </div>
                </div>
                <h3 className="text-[#FAFAFA] font-semibold text-base mb-2">{step.title}</h3>
                <p className="text-[#71717A] text-sm leading-relaxed">{step.desc}</p>
              </div>
              {/* Arrow connector — only between steps on desktop */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex items-center justify-center w-5 shrink-0 mt-8">
                  <ArrowRight size={14} className="text-[#1C1C1F]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Note */}
        <p ref={noteRef} className="text-center text-sm text-[#71717A] mt-8 border border-[#1C1C1F] bg-[#111113] rounded-full px-5 py-2 inline-flex items-center gap-2 mx-auto w-full justify-center max-w-fit">
          <span className="text-[#22C55E]">✓</span>
          Same flow works for Offramp — your users receive Naira instead
        </p>
      </div>
    </section>
  );
}
