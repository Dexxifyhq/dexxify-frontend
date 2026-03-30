"use client";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);

// QR pattern component
function QRPattern() {
  return (
    <div className="w-20 h-20 bg-[#0D0D0F] border border-[#1C1C1F] rounded-sm grid grid-cols-5 gap-0.5 p-1.5">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[1px]"
          style={{ backgroundColor: [0,1,2,5,6,7,10,11,12,14,18,20,22,24].includes(i) ? "#FAFAFA" : "transparent" }}
        />
      ))}
    </div>
  );
}

// Payment panel component
function PaymentPanel() {
  const statusRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      // Step 1: waiting
      tl.set(statusRef.current, { opacity: 1 });
      tl.to({}, { duration: 1.5 });
      // Step 2: change text to detected
      tl.to(statusRef.current, { opacity: 0, duration: 0.3 })
        .call(() => { if (statusRef.current) statusRef.current.textContent = "Deposit detected..."; })
        .to(statusRef.current, { opacity: 1, duration: 0.3 });
      tl.to({}, { duration: 1.5 });
      // Step 3: confirmed + show check
      tl.to(statusRef.current, { opacity: 0, duration: 0.3 })
        .call(() => { if (statusRef.current) statusRef.current.textContent = "✓ Confirmed"; if (statusRef.current) statusRef.current.style.color = "#22C55E"; })
        .to(statusRef.current, { opacity: 1, duration: 0.3 })
        .to(checkRef.current, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
      tl.to({}, { duration: 2 });
      // Reset
      tl.to([statusRef.current, checkRef.current], { opacity: 0, duration: 0.3 })
        .call(() => {
          if (statusRef.current) { statusRef.current.textContent = "Waiting for payment..."; statusRef.current.style.color = "#71717A"; }
          gsap.set(checkRef.current, { scale: 0 });
        })
        .to(statusRef.current, { opacity: 1, duration: 0.3 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex-1 p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
        <span className="text-xs text-[#71717A] font-medium">Payment Gateway</span>
      </div>

      <div>
        <div className="text-xs text-[#71717A] mb-1">Pay with</div>
        <div className="flex items-center justify-between bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#26A17B] text-white text-[8px] flex items-center justify-center font-bold">₮</div>
            <span className="text-sm text-[#FAFAFA]">USDT · TRC20</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-[#71717A] mb-0.5">Amount</div>
          <div className="text-2xl font-bold text-[#FAFAFA]">30.77 USDT</div>
          <div className="text-sm text-[#71717A]">≈ ₦50,000</div>
        </div>
        <QRPattern />
      </div>

      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[#1C1C1F]">
        <div ref={checkRef} style={{ scale: 0, opacity: 0 }} className="w-5 h-5 rounded-full bg-[#22C55E]/10 border border-[#22C55E] flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4 7L8 3" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span ref={statusRef} className="text-xs text-[#71717A]">Waiting for payment...</span>
      </div>
    </div>
  );
}

// Offramp panel component
function OfframpPanel() {
  const toastRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(toastRef.current, { y: 20, opacity: 0 });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, delay: 2 });
      tl.to(toastRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
      tl.to({}, { duration: 2 });
      tl.to(toastRef.current, { y: -10, opacity: 0, duration: 0.3, ease: "power2.in" });
      tl.set(toastRef.current, { y: 20 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 border-l border-[#1C1C1F] relative overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
        <span className="text-xs text-[#71717A] font-medium">Offramp API</span>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-xs text-[#71717A] mb-1">USDT Amount</div>
          <div className="flex items-center bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg px-3 py-2 gap-2">
            <div className="w-4 h-4 rounded-full bg-[#26A17B] text-white text-[8px] flex items-center justify-center font-bold">₮</div>
            <span className="text-sm text-[#FAFAFA]">500 USDT</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-[#71717A] mb-1">Bank Account</div>
          <div className="flex items-center bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg px-3 py-2 gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#F97316] flex items-center justify-center">
              <span className="text-[6px] font-bold text-white">GT</span>
            </div>
            <span className="text-sm text-[#FAFAFA]">GTBank · 0123456789</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-[#1C1C1F]">
        <div className="text-xs text-[#71717A] mb-1">1 USDT = ₦1,625</div>
        <div className="text-2xl font-bold text-[#FAFAFA]">₦812,500</div>
        <div className="text-xs text-[#71717A]">delivered to bank</div>
      </div>

      {/* Toast notification */}
      <div ref={toastRef} className="absolute bottom-4 left-4 right-4 bg-[#0D2B1B] border border-[#22C55E]/20 rounded-lg px-3 py-2 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#22C55E]/20 border border-[#22C55E] flex items-center justify-center shrink-0">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <span className="text-xs text-[#22C55E]">Naira delivered to GTBank</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // Badge
        gsap.from(badgeRef.current, { opacity: 0, y: -10, duration: 0.5, ease: "power2.out", delay: 0.3 });

        // Headline word reveal
        const split = new SplitText(headlineRef.current, { type: "words" });
        gsap.from(split.words, {
          opacity: 0,
          y: 20,
          stagger: 0.06,
          duration: 0.7,
          ease: "power3.out",
          delay: 0.5,
        });

        // Sub + CTA + pills sequence
        gsap.from(subRef.current, { opacity: 0, y: 15, duration: 0.6, ease: "power2.out", delay: 0.9 });
        gsap.from(ctaRef.current, { opacity: 0, y: 10, duration: 0.5, ease: "power2.out", delay: 1.1 });

        // Pills stagger
        gsap.from(pillsRef.current?.children ? Array.from(pillsRef.current.children) : [], {
          opacity: 0, y: 8, stagger: 0.08, duration: 0.4, ease: "power2.out", delay: 1.3
        });

        // Panels float
        gsap.from(panelsRef.current, { opacity: 0, y: 30, duration: 0.8, ease: "power2.out", delay: 1.5 });
        gsap.to(panelsRef.current, { y: -8, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2.3 });

      }, sectionRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  const stats = ["50+ cryptocurrencies", "NGN settlement", "Under 2 minutes", "1% flat fee"];

  return (
    <section ref={sectionRef} className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Gradient glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#2563EB]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div ref={badgeRef} className="inline-flex items-center gap-2 border border-[#1C1C1F] bg-[#111113] text-xs text-[#71717A] px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            Now in private beta
          </div>
        </div>

        {/* Headline */}
        <h1 ref={headlineRef} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-center">
          Crypto payments and payouts{" "}
          <span className="italic text-[#2563EB]">settled in Naira.</span>
        </h1>

        {/* Sub */}
        <p ref={subRef} className="mt-6 text-[#71717A] text-lg md:text-xl max-w-2xl mx-auto text-center leading-relaxed">
          Accept crypto from your customers. Pay your users in crypto. Either way — Naira lands in the right bank account in under 2 minutes.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <a href="#" className="inline-flex h-11 px-6 items-center text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:brightness-110 transition-all duration-200 gap-2">
            Get Started
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
          <a href="#" className="inline-flex h-11 px-6 items-center text-sm font-medium text-[#71717A] border border-[#1C1C1F] rounded-lg hover:text-[#FAFAFA] hover:border-[#2563EB] transition-all duration-200">
            Read the Docs
          </a>
        </div>

        {/* Stats */}
        <div ref={pillsRef} className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {stats.map(s => (
            <div key={s} className="text-xs text-[#71717A] border border-[#1C1C1F] bg-[#111113] px-3 py-1.5 rounded-full">
              {s}
            </div>
          ))}
        </div>

        {/* Animated panels */}
        <div className="flex justify-center mt-16">
          <div ref={panelsRef} className="w-full max-w-3xl rounded-2xl border border-[#1C1C1F] overflow-hidden bg-[#111113] flex">
            <PaymentPanel />
            <OfframpPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
