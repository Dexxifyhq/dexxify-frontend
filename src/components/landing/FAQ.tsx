"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Which cryptocurrencies do you support?",
    a: "We support Bitcoin, USDT, USDC, Ethereum, BNB, Solana, Tron, Litecoin and 40+ others across Ethereum, BSC, Polygon, Tron and Solana networks."
  },
  {
    q: "How fast is NGN settlement?",
    a: "Settlement happens in under 2 minutes once your payment is confirmed on-chain. Stablecoins like USDT on Tron confirm in seconds."
  },
  {
    q: "What are your fees?",
    a: "We charge 1% per transaction. No monthly fees. No setup costs. Network gas fees vary by blockchain and are separate."
  },
  {
    q: "Can I accept crypto payments in Nigeria?",
    a: "Yes. Dexxify is built for Nigerian businesses. Accept USDT, BTC and 50+ cryptocurrencies with instant settlement to any Nigerian bank account — Access, Zenith, GTBank, First Bank and more."
  },
  {
    q: "How does the Offramp API work?",
    a: "You call our API with the amount, crypto asset and your user's Nigerian bank account details. We generate a deposit address, you send USDT to it, we convert and deliver Naira to their bank account automatically."
  },
  {
    q: "How do I integrate?",
    a: "Sign up, get your API key and make your first payment in under 30 minutes. We have SDKs in 8 languages, a sandbox environment and full documentation."
  },
  {
    q: "Is Dexxify secure?",
    a: "Yes. We use AES-256 encryption, TLS 1.3 and OAuth 2.0. Every transaction is screened for fraud and AML compliance. We conduct regular security audits."
  }
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-foreground text-base font-medium group-hover:text-white transition-colors">{q}</span>
        <div className="w-6 h-6 rounded-full border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors duration-200">
          {open ? <Minus size={12} className="text-muted" /> : <Plus size={12} className="text-muted" />}
        </div>
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-muted leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-border bg-card text-xs text-muted px-3 py-1.5 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            FAQ
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mt-4">
            Common questions
          </h2>
        </div>

        {/* FAQ list */}
        <div className="bg-card border border-border rounded-2xl px-6">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  );
}
