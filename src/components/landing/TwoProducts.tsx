import { Check, CreditCard, ArrowUpRight } from "lucide-react";

const GATEWAY_FEATURES = [
  "Hosted checkout page",
  "Embeddable widget",
  "REST API + SDKs",
  "Instant NGN settlement",
];

const OFFRAMP_FEATURES = [
  "Single API endpoint",
  "Any Nigerian bank",
  "Real-time webhooks",
  "Instant NGN delivery",
];

export default function TwoProducts() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Two products. One integration.
          </h2>
          <p className="mt-4 text-muted text-lg max-w-xl mx-auto">
            Whether you&apos;re collecting payments or paying out users, Dexxify handles both ends.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Card 1 — Payment Gateway */}
          <div className="product-card group bg-card border border-border rounded-2xl p-8 flex flex-col gap-6 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 border border-primary/20 bg-primary/5 text-primary text-xs px-2.5 py-1 rounded-full mb-4">
                  For businesses
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">Accept crypto payments</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-primary" />
              </div>
            </div>

            <p className="text-muted leading-relaxed">
              Your customers pay in USDT, BTC or 50+ cryptocurrencies. You receive Naira directly in your bank account. No crypto exposure. No P2P. No manual steps.
            </p>

            <ul className="space-y-2.5">
              {GATEWAY_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-primary" strokeWidth={2.5} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4 border-t border-border">
              <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all duration-200">
                Learn more
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 2 — Offramp API */}
          <div className="product-card group bg-card border border-border rounded-2xl p-8 flex flex-col gap-6 hover:border-success/20 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-success/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 border border-success/20 bg-success/5 text-success text-xs px-2.5 py-1 rounded-full mb-4">
                  For platforms
                </div>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">Pay users in Naira</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                <ArrowUpRight size={18} className="text-success" />
              </div>
            </div>

            <p className="text-muted leading-relaxed">
              Send USDT to your users. Dexxify converts and delivers Naira straight to their bank account. One API call handles everything — conversion, compliance, settlement.
            </p>

            <ul className="space-y-2.5">
              {OFFRAMP_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <div className="w-4 h-4 rounded-full bg-success/10 border border-success/30 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-success" strokeWidth={2.5} />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-4 border-t border-border">
              <a href="#" className="inline-flex items-center gap-1.5 text-sm font-medium text-success hover:gap-2.5 transition-all duration-200">
                Learn more
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
