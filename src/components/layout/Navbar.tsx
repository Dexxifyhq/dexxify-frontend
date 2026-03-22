"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Fade in on load
    gsap.fromTo(
      navRef.current,
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 }
    );

    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: "#0C0C0E",
        borderBottom: scrolled ? "1px solid #1C1C1F" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="text-[#FAFAFA] font-bold text-lg tracking-tight select-none"
        >
          Dexxify
        </a>

        {/* Nav links — center */}
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

        {/* Right side */}
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
            Get API Access
          </a>
        </div>
      </div>
    </nav>
  );
}
