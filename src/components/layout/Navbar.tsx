"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // Fade in on load
      gsap.fromTo(
        navRef.current,
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: prefersReducedMotion ? 0 : 0.1,
        }
      );

      // Border + background on scroll — pure GSAP, no useState
      ScrollTrigger.create({
        start: "top -50px",
        onEnter: () => {
          gsap.to(navRef.current, {
            borderBottomColor: "#1C1C1F",
            backgroundColor: "rgba(12,12,14,0.92)",
            duration: 0.3,
            ease: "power2.out",
          });
        },
        onLeaveBack: () => {
          gsap.to(navRef.current, {
            borderBottomColor: "transparent",
            backgroundColor: "#0C0C0E",
            duration: 0.3,
            ease: "power2.out",
          });
        },
      });
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "#0C0C0E",
        borderBottom: "1px solid transparent",
        opacity: 0,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <a
          href="/"
          className="text-[#FAFAFA] font-bold text-lg tracking-tight select-none"
        >
          Dexxify
        </a>

        <div className="hidden md:flex items-center gap-8">
          {["Product", "Docs", "Company"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors duration-200"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden sm:inline-flex text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors duration-200 px-3 py-1.5"
          >
            Sign in
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-md bg-[#2563EB] text-white hover:bg-[#1d4ed8] transition-colors duration-200"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
