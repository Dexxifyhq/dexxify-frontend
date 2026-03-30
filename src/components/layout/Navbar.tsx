"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // fade in on mount
        gsap.from(navRef.current, { y: -20, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.1 });

        // scroll trigger for border + bg
        ScrollTrigger.create({
          start: "top+=50 top",
          onEnter: () => {
            gsap.to(navRef.current, {
              backgroundColor: "rgba(9,9,11,0.92)",
              borderBottomColor: "#1C1C1F",
              duration: 0.3
            });
          },
          onLeaveBack: () => {
            gsap.to(navRef.current, {
              backgroundColor: "transparent",
              borderBottomColor: "transparent",
              duration: 0.3
            });
          }
        });
      });
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      style={{ opacity: 0, borderBottomColor: "transparent", backgroundColor: "transparent" }}
      className="fixed top-0 left-0 right-0 z-50 border-b"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="text-[#FAFAFA] font-bold text-xl tracking-tight">Dexxify</span>
          <nav className="hidden md:flex items-center gap-8">
            {["Products", "Developers", "Company"].map(link => (
              <a key={link} href="#" className="text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors duration-200">{link}</a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="hidden md:inline-flex h-9 px-4 items-center text-sm text-[#71717A] border border-[#1C1C1F] rounded-md hover:border-[#2563EB] hover:text-[#FAFAFA] transition-all duration-200">Sign in</a>
          <a href="#" className="inline-flex h-9 px-4 items-center text-sm font-medium text-white bg-[#2563EB] rounded-md hover:brightness-110 transition-all duration-200">Get Started</a>
        </div>
      </div>
    </nav>
  );
}
