import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Dexxify",
    default: "Dexxify",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dash-bg flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-dash-border flex items-center justify-between">
        <p className="text-xs text-dash-muted">© 2025 Dexxify</p>
        <div className="flex gap-4">
          <a href="#" className="text-xs text-dash-muted hover:text-dash-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-xs text-dash-muted hover:text-dash-foreground transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
