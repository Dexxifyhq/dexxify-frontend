"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Coins, Zap, CircleDollarSign, Code2, Webhook, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
gsap.registerPlugin(ScrollTrigger);

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FEATURES: Feature[] = [
  { icon: Coins, title: "Crypto Payments", desc: "Accept 50+ cryptocurrencies across 8 networks including Ethereum, BSC, Tron, Solana and Polygon." },
  { icon: Zap, title: "Instant Settlement", desc: "NGN in your bank in under 2 minutes. Stablecoins on Tron confirm in seconds." },
  { icon: CircleDollarSign, title: "Cost Efficiency", desc: "1% flat fee. No monthly fees. No setup costs. No surprises on your invoice." },
  { icon: Code2, title: "Developer-First API", desc: "SDKs in 8 languages. Full API reference, sandbox environment and Postman collection included." },
  { icon: Webhook, title: "Real-time Webhooks", desc: "Every event. Every state change. Delivered to your endpoint instantly with retry logic." },
  { icon: LayoutDashboard, title: "Unified Dashboard", desc: "Payments, payouts, analytics and webhook logs in one clean screen. No context switching." },
];

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from(headRef.current, {
          opacity: 0, y: 14, duration: 1.1, ease: "power2.out",
          immediateRender: false, scrollTrigger: { trigger: headRef.current, start: "top 85%" }
        });
        const cards = gridRef.current?.querySelectorAll(".feature-card");
        if (cards) {
          gsap.from(Array.from(cards), {
            opacity: 0, y: 14, stagger: 0.15, duration: 1.0, ease: "power2.out",
            immediateRender: false, scrollTrigger: { trigger: gridRef.current, start: "top 80%" }
          });
        }
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
          <div className="inline-flex items-center gap-2 border border-border bg-card text-xs text-muted px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Platform
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-4">
            Every tool you need<br />
            <span className="text-muted">to get paid and scale</span>
          </h2>
        </div>

        {/* Grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feature-card bg-card border border-border rounded-xl p-6 hover:border-primary/20 transition-colors duration-300 group"
            >
              <div className="w-9 h-9 rounded-lg bg-deeper border border-border flex items-center justify-center mb-4 group-hover:border-primary/20 transition-colors duration-300">
                <f.icon size={16} className="text-primary" />
              </div>
              <h3 className="text-foreground font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
