import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AuthCodePanel } from "@/components/ui/auth";
import { AuthBands } from "@/components/ui/auth-bands";

export const metadata: Metadata = {
  title: {
    template: "%s — Dexxify",
    default: "Dexxify",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // .theme-auth-dark redefines the dash-* tokens for everything below, which
    // is what turns every auth page dark without touching their classes.
    <div className="theme-auth-dark relative grid min-h-screen bg-dash-bg text-dash-foreground lg:grid-cols-2">
      {/* Close — back to the marketing site */}
      <Link
        href="/"
        aria-label="Close and return to the Dexxify homepage"
        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-muted"
      >
        <X size={18} />
      </Link>

      {/* Left — brand, form, small print */}
      <div className="flex min-h-screen flex-col px-6 sm:px-10">
        <header className="py-8">
          <Link
            href="/"
            aria-label="Dexxify home"
            className="inline-flex items-center gap-2.5"
          >
            <Image
              src="/dexxify_icon.jpg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg object-cover"
            />
            <span className="text-lg font-bold tracking-tight text-dash-foreground">
              Dexxify
            </span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          {children}
        </main>

        {/* Auth routes are prerendered, so the year is fixed at build time and
            rolls over on the next deploy after New Year. */}
        <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-6 text-xs text-dash-muted">
          <span>© {new Date().getFullYear()} Dexxify</span>
          <span aria-hidden="true">·</span>
          <a href="#" className="hover:text-dash-foreground transition-colors">
            Privacy Policy
          </a>
          <span aria-hidden="true">·</span>
          <a href="#" className="hover:text-dash-foreground transition-colors">
            Terms of Service
          </a>
        </footer>
      </div>

      {/* Right — decorative code panel; hidden below lg where it would push
          the form off-screen. */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden border-l border-dash-border bg-dots-dark lg:flex lg:items-center lg:justify-center lg:px-12"
      >
        <AuthBands />
        <div className="relative z-10 flex w-full justify-center">
          <AuthCodePanel />
        </div>
      </aside>
    </div>
  );
}
