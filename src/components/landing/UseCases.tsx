import {
  ShoppingCart,
  Monitor,
  Trophy,
  Wrench,
  Palette,
  BarChart2,
  Briefcase,
  Plane,
  Gamepad2,
  Wallet,
  type LucideIcon,
} from "lucide-react";

interface UseCase {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/**
 * Copy is held to what the product does today. Changes from the original
 * WhoItsFor copy:
 * - E-commerce no longer says "without a crypto wallet" — paying in crypto
 *   needs one.
 * - SaaS no longer says "subscriptions" — invoices are one-off, there is no
 *   recurring billing.
 * - Betting and gaming lose "instantly"/"instant" — no settlement timing we
 *   can't verify.
 */
const COLLECT: UseCase[] = [
  { icon: ShoppingCart, title: "E-commerce stores", desc: "Accept crypto from customers anywhere and settle to your bank." },
  { icon: Monitor, title: "SaaS platforms", desc: "Bill customers with crypto invoices and payment links." },
  { icon: Trophy, title: "Betting platforms", desc: "Take crypto deposits that settle to your bank." },
  { icon: Wrench, title: "Service businesses", desc: "Invoice clients in crypto, get paid in Naira." },
  { icon: Palette, title: "Digital creators", desc: "Sell digital products globally, receive Naira locally." },
];

const PAY_OUT: UseCase[] = [
  { icon: BarChart2, title: "Crypto exchanges", desc: "Automate NGN withdrawals and replace manual P2P desks." },
  { icon: Briefcase, title: "Freelance platforms", desc: "Pay Nigerian contractors in Naira from USDT balances." },
  { icon: Plane, title: "Remittance apps", desc: "Crypto in from abroad, Naira out to any Nigerian bank." },
  { icon: Gamepad2, title: "Gaming platforms", desc: "Crypto-to-Naira payouts for Nigerian players." },
  { icon: Wallet, title: "Payroll tools", desc: "Disburse salaries in Naira from a stablecoin treasury." },
];

function UseCaseColumn({
  label,
  items,
}: {
  label: string;
  items: UseCase[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </h3>
      </div>
      <ul className="divide-y divide-border">
        {items.map((u) => (
          <li key={u.title} className="flex items-start gap-4 px-6 py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
              <u.icon size={14} className="text-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{u.title}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">
                {u.desc}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function UseCases() {
  return (
    <section className="relative border-b border-border">
      <div className="max-w-[1200px] mx-auto border-x border-border">
        <div className="px-6 py-16 sm:py-24">
          {/* Two-tone heading, same construction as Hero and Infrastructure */}
          <h2 className="max-w-3xl text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.2]">
            <span className="font-bold text-foreground">
              Built for every Nigerian business.
            </span>{" "}
            <span className="font-normal text-slate-light">
              From storefronts collecting crypto to platforms paying out in
              Naira.
            </span>
          </h2>

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <UseCaseColumn label="Businesses that get paid" items={COLLECT} />
            <UseCaseColumn label="Platforms that pay out" items={PAY_OUT} />
          </div>
        </div>
      </div>
    </section>
  );
}
