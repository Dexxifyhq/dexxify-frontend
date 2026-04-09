import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Dexxify",
    default: "Dexxify",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
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
