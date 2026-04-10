"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    // Ensure navbar is always visible — GSAP fade-in is a progressive enhancement
    gsap.set(navRef.current, { opacity: 1 });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.from(navRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.1,
        });

        // Scroll state: add/remove CSS class (no inline color strings)
        ScrollTrigger.create({
          start: "top+=50 top",
          onEnter: () => navRef.current?.classList.add("nav-scrolled"),
          onLeaveBack: () => navRef.current?.classList.remove("nav-scrolled"),
        });
      });
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span className="text-foreground font-bold text-xl tracking-tight">Dexxify</span>
          <nav className="hidden md:flex items-center gap-8">
            {["Products", "Developers", "Company"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-muted hover:text-foreground transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden md:inline-flex h-9 px-4 items-center text-sm text-muted border border-border rounded-md hover:border-primary hover:text-foreground transition-all duration-200"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="inline-flex h-9 px-4 items-center text-sm font-medium text-white bg-primary rounded-md hover:brightness-110 transition-all duration-200"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
