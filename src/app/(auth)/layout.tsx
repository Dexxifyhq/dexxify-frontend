import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s — Dexxify",
    default: "Dexxify",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-[#1C1C1F]">
        <Link href="/" className="text-[#FAFAFA] font-bold text-xl tracking-tight">
          Dexxify
        </Link>
        <div className="text-xs text-[#71717A]">
          Need help?{" "}
          <a href="#" className="text-[#2563EB] hover:underline">
            Contact support
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#1C1C1F] flex items-center justify-between">
        <p className="text-xs text-[#71717A]">© 2025 Dexxify</p>
        <div className="flex gap-4">
          <a href="#" className="text-xs text-[#71717A] hover:text-[#FAFAFA] transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-xs text-[#71717A] hover:text-[#FAFAFA] transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
