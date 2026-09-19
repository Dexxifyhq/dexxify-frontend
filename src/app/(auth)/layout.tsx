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
    // .theme-auth-light sets the page ground to pure white for everything
    // below; the rest of the dash-* tokens are already light.
    <div className="theme-auth-light relative grid min-h-screen bg-dash-bg text-dash-foreground lg:grid-cols-2">
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
          {/* Full lockup — the artwork already contains the wordmark, so there
              is no text beside it. Black version, since the page is white. */}
          <Link href="/" aria-label="Dexxify home" className="inline-flex">
            <Image
              src="/logo-set/dexxify.png"
              alt="Dexxify"
              width={2103}
              height={748}
              priority
              className="h-12 w-auto"
            />
          </Link>
        </header>

        {/* pb-8 balances the header's py-8 now that there's no footer below. */}
        <main className="flex flex-1 items-center justify-center pb-8">
          {children}
        </main>
      </div>

      {/* Right — decorative code panel; hidden below lg where it would push
          the form off-screen. */}
      {/* Tinted panel so the split still reads on a white page — the form side
          is pure white, this one is the next ramp step up. */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden border-l border-dash-border bg-dash-hover bg-dots-light lg:flex lg:items-center lg:justify-center lg:px-12"
      >
        <AuthBands />
        <div className="relative z-10 flex w-full justify-center">
          <AuthCodePanel />
        </div>
      </aside>
    </div>
  );
}
