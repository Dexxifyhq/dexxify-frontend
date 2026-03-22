"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TESTIMONIALS = [
  {
    quote:
      "We cut our crypto integration time from four months to under two weeks. The wallet-per-user model was exactly what we needed for our savings product. No hacks, no workarounds.",
    name: "Chukwuemeka Obi",
    role: "CTO",
    company: "Kashe Finance",
    initials: "CO",
    color: "#2563EB",
  },
  {
    quote:
      "The NGN offramp alone would have taken us three months to build from scratch. With Dexxify it was a single API call. Our users now cash out crypto to their bank accounts in 60 seconds.",
    name: "Amara Nwosu",
    role: "Lead Engineer",
    company: "Sendcash Pro",
    initials: "AN",
    color: "#22C55E",
  },
  {
    quote:
      "Every African fintech dev knows the pain of stitching together five providers. Dexxify is the first API that actually thinks like a developer. The sandbox is production-accurate — I was shocked.",
    name: "Tunde Adeyemi",
    role: "Founder",
    company: "Cribpay",
    initials: "TA",
    color: "#C4B5FD",
  },
];

const STAR = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="#FCD34D">
    <path d="M6 1l1.29 2.61L10.5 4.1l-2.25 2.19.53 3.1L6 7.77 3.22 9.39l.53-3.1L1.5 4.1l3.21-.49L6 1z" />
  </svg>
);

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: headRef.current, start: "top 85%" },
        }
      );

      const cards = cardsRef.current?.querySelectorAll(".testimonial-card");
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 36 },
          {
            opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.12,
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
        <div ref={headRef} className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">
            Testimonials
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight mb-4">
            From the developers building on it.
          </h2>
          <p className="text-[#71717A] text-sm leading-relaxed">
            Early-access teams building real products on Dexxify&apos;s infrastructure.
          </p>
        </div>

        {/* Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="testimonial-card flex flex-col justify-between rounded-xl border border-[#1C1C1F] bg-[#111113] p-6 hover:border-[#1C1C1F]/80 transition-colors duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>{STAR}</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#FAFAFA] text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-[#1C1C1F]">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${t.color}20`, color: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-[#FAFAFA] text-xs font-semibold">{t.name}</p>
                  <p className="text-[#71717A] text-xs">
                    {t.role}, {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
