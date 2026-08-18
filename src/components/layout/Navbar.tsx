"use client";
import { useEffect, useRef, useState } from "react";

const NAV_LINKS = ["Products", "Developers", "Company"];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

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

  // Close the mobile panel once the viewport reaches the desktop breakpoint,
  // so the menu never lingers behind the inline desktop nav.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock body scroll and allow Escape to dismiss while the panel is open
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border transition-[background-color,box-shadow] duration-300"
    >
      <div className="max-w-[1300px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <span className="text-foreground font-extrabold text-xl uppercase tracking-widest">
            Dexxify
          </span>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
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
            className="hidden md:inline-flex h-10 px-5 items-center text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover transition-colors duration-200"
          >
            Get Started
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden -mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground"
          >
            <span className="relative block h-4 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 block h-[2px] w-6 bg-current transition-transform duration-300 ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[3px]"
                }`}
              />
              <span
                className={`absolute left-0 block h-[2px] w-6 bg-current transition-transform duration-300 ${
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "top-[11px]"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu — dimmed backdrop plus a dropdown card below the bar */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 bg-foreground/20 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        id="mobile-menu"
        className={`md:hidden absolute inset-x-0 top-16 origin-top px-4 pb-4 transition-all duration-200 ${
          open
            ? "opacity-100 translate-y-0"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-border bg-background shadow-[0_16px_40px_rgb(26_43_59_/_0.12)]">
          <div className="flex flex-col px-5 py-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                onClick={() => setOpen(false)}
                className="py-4 text-[15px] font-medium text-foreground"
              >
                {link}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 border-t border-border px-5 py-4">
            <a
              href="/register"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
            >
              Get Started
              <Chevron className="text-white/80" />
            </a>
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-card"
            >
              Sign in
              <Chevron />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Chevron({ className = "text-slate-light" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
