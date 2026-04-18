import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative bg-card border border-border rounded-2xl p-12 text-center overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/8 rounded-full blur-[80px]" />
          </div>

          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Start accepting crypto today.
            </h2>
            <p className="text-muted text-lg mb-8 max-w-md mx-auto">
              560M+ people hold crypto. Most Nigerian businesses can&apos;t accept it yet.
            </p>

            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              <a
                href="/register"
                className="inline-flex h-12 px-8 items-center text-sm font-medium text-white bg-primary rounded-lg hover:brightness-110 transition-all duration-200 gap-2"
              >
                Create free account
                <ArrowRight size={16} />
              </a>
              <a
                href="#"
                className="inline-flex h-12 px-6 items-center text-sm font-medium text-muted hover:text-foreground transition-colors duration-200 gap-1"
              >
                Read the docs
                <ArrowRight size={14} />
              </a>
            </div>

            <p className="text-xs text-muted">
              No credit card required · Sandbox access is instant · Go live in 30 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
