"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Wallet, GitBranch, FileText, ShoppingCart,
  ArrowLeftRight, Layout, RotateCcw, Users, Users2, Landmark,
  HardDrive, Monitor, Webhook, Settings, ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/utils";

// ── Nav config ─────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    links: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "BALANCE",
    links: [
      { label: "Balance", href: "/balance", icon: Wallet },
      { label: "Workflows", href: "/workflows", icon: GitBranch },
    ],
  },
  {
    label: "PAYMENTS",
    links: [
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Checkouts", href: "/checkouts", icon: ShoppingCart },
      { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
      { label: "Payment Pages", href: "/payment-pages", icon: Layout },
      { label: "Refunds", href: "/refunds", icon: RotateCcw },
    ],
  },
  {
    label: "PEOPLE",
    links: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Teams", href: "/teams", icon: Users2 },
    ],
  },
  {
    label: "MANAGEMENT",
    links: [
      { label: "Bank Accounts", href: "/bank-accounts", icon: Landmark },
      { label: "Crypto Wallets", href: "/crypto-wallets", icon: HardDrive },
      { label: "POS Terminals", href: "/pos-terminals", icon: Monitor },
    ],
  },
  {
    label: "DEVELOPERS",
    links: [
      { label: "API & Webhooks", href: "/api-webhooks", icon: Webhook },
    ],
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-[#1C1C1F] text-[#FAFAFA] font-medium"
          : "text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#111113]"
      )}
    >
      <Icon size={15} className={active ? "text-[#FAFAFA]" : "text-[#52525B]"} />
      {label}
    </Link>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  user: { name: string; role: string; initials: string };
}

export default function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#09090B] border-r border-[#1C1C1F]">
      {/* User / workspace block */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[#1C1C1F]">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white select-none">
          {user.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#FAFAFA]">{user.name}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#52525B]">{user.role}</p>
        </div>
        <ChevronDown size={14} className="shrink-0 text-[#52525B]" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#3F3F46]">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings pinned at bottom */}
      <div className="border-t border-[#1C1C1F] px-3 py-3">
        <NavLink href="/settings" icon={Settings} label="Settings" />
      </div>
    </aside>
  );
}
