"use client";
import { useEffect, useRef } from "react";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Native scroll listener toggles the nav-scrolled class
    const onScroll = () => {
      if (window.scrollY > 50) {
        navRef.current?.classList.add("nav-scrolled");
      } else {
        navRef.current?.classList.remove("nav-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border transition-[background-color,box-shadow] duration-300"
    >
      <div className="max-w-[1600px] mx-auto px-6 sm:px-10 h-18 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <span className="text-foreground font-extrabold text-xl uppercase tracking-widest">
            Dexxify
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {["Products", "Developers", "Company"].map((link) => (
              <a
                key={link}
                href="#"
                className="text-[15px] font-medium text-slate-light hover:text-foreground transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/login"
            className="hidden md:inline-flex text-[15px] font-medium text-slate-light hover:text-foreground transition-colors duration-200"
          >
            Sign in
          </a>
          <a
            href="/register"
            className="inline-flex h-10 px-5 items-center text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover transition-colors duration-200"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
