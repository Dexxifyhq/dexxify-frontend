"use client";

import {
  ShoppingCart, Monitor, Trophy, Wrench, Palette,
  BarChart2, Briefcase, Plane, Gamepad2, Wallet,
  type LucideIcon,
} from "lucide-react";

const GATEWAY_USERS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ShoppingCart, title: "E-commerce stores", desc: "Accept crypto from global customers without a crypto wallet." },
  { icon: Monitor, title: "SaaS platforms", desc: "Collect crypto subscriptions and receive NGN automatically." },
  { icon: Trophy, title: "Betting platforms", desc: "Fast crypto deposits that settle to your bank instantly." },
  { icon: Wrench, title: "Service businesses", desc: "Invoice clients in crypto, get paid in Naira." },
  { icon: Palette, title: "Digital creators", desc: "Sell digital products globally, receive Naira locally." },
];

const OFFRAMP_USERS: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: BarChart2, title: "Crypto exchanges", desc: "Automate NGN withdrawals. Replace manual P2P desks." },
  { icon: Briefcase, title: "Freelance platforms", desc: "Pay Nigerian contractors Naira from USDT balances." },
  { icon: Plane, title: "Remittance apps", desc: "Crypto in from abroad. Naira out to any Nigerian bank." },
  { icon: Gamepad2, title: "Gaming platforms", desc: "Instant crypto-to-Naira payouts for Nigerian players." },
  { icon: Wallet, title: "Payroll tools", desc: "Disburse salaries in Naira from a crypto treasury." },
];

export default function WhoItsFor() {
  return (
    <section className="py-28 px-6 border-t border-[#1C1C1F]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-16">
          <p className="text-xs font-mono text-[#2563EB] uppercase tracking-widest mb-4">Who it&apos;s for</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#FAFAFA] leading-tight">
            Built for every Nigerian business
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Gateway column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
              <span className="text-xs font-mono text-[#2563EB] uppercase tracking-wider">Payment Gateway — businesses that get paid</span>
            </div>
            <div className="flex flex-col gap-3">
              {GATEWAY_USERS.map((u) => (
                <div
                  key={u.title}
                  className="user-card flex items-start gap-4 rounded-xl border border-[#1C1C1F] bg-[#111113] px-5 py-4 hover:border-[#2563EB]/30 transition-colors duration-300"
                >
                  <u.icon size={16} className="shrink-0 mt-0.5 text-[#71717A]" />
                  <div>
                    <div className="font-semibold text-[#FAFAFA] text-sm">{u.title}</div>
                    <div className="text-[#71717A] text-xs leading-relaxed mt-0.5">{u.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offramp API column */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span className="text-xs font-mono text-[#22C55E] uppercase tracking-wider">Offramp API — platforms that pay out</span>
            </div>
            <div className="flex flex-col gap-3">
              {OFFRAMP_USERS.map((u) => (
                <div
                  key={u.title}
                  className="user-card flex items-start gap-4 rounded-xl border border-[#1C1C1F] bg-[#111113] px-5 py-4 hover:border-[#22C55E]/30 transition-colors duration-300"
                >
                  <u.icon size={16} className="shrink-0 mt-0.5 text-[#71717A]" />
                  <div>
                    <div className="font-semibold text-[#FAFAFA] text-sm">{u.title}</div>
                    <div className="text-[#71717A] text-xs leading-relaxed mt-0.5">{u.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
