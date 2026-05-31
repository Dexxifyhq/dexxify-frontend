"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Wallet,
  CreditCard,
  LayoutGrid,
  User,
  Code2,
  Settings,
  FileText,
  ShoppingCart,
  ArrowLeftRight,
  Layout,
  RotateCcw,
  Workflow,
  Landmark,
  Coins,
  Monitor,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Loader2,
} from "lucide-react";
import { cn } from "@/utils/utils";
import { authApi } from "@/lib/auth-api";
import { toast } from "sonner";

// ── Nav config ───────────────────────────────────────────────────────────────

type NavLeaf = { label: string; href: string; icon: React.ElementType };
type NavEntry =
  | { kind: "link"; label: string; href: string; icon: React.ElementType }
  | { kind: "group"; label: string; icon: React.ElementType; children: NavLeaf[] };

const NAV_TOP: NavEntry[] = [
  { kind: "link", label: "Analytics", href: "/dashboard", icon: BarChart3 },
  { kind: "link", label: "Balance", href: "/balance", icon: Wallet },
  {
    kind: "group",
    label: "Payments",
    icon: CreditCard,
    children: [
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Checkout", href: "/checkouts", icon: ShoppingCart },
      { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
      { label: "Payment Pages", href: "/payment-pages", icon: Layout },
      { label: "Refunds", href: "/refunds", icon: RotateCcw },
    ],
  },
  {
    kind: "group",
    label: "Operations",
    icon: LayoutGrid,
    children: [
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "Bank Accounts", href: "/bank-accounts", icon: Landmark },
      { label: "Crypto Wallets", href: "/crypto-wallets", icon: Coins },
      { label: "POS Terminals", href: "/pos-terminals", icon: Monitor },
    ],
  },
  { kind: "link", label: "Customers", href: "/customers", icon: User },
];

const NAV_BOTTOM: NavEntry[] = [
  { kind: "link", label: "Developers", href: "/api-webhooks", icon: Code2 },
  { kind: "link", label: "Settings", href: "/settings", icon: Settings },
];

// ── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  user: {
    businessName: string;
    businessId: string;
    name: string;
    initials: string;
    role: string;
  };
  collapsed: boolean;
  onExpand: () => void;
}

export default function Sidebar({ user, collapsed, onExpand }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Which collapsible group (if any) contains the current route.
  const activeGroup = [...NAV_TOP, ...NAV_BOTTOM].find(
    (e): e is Extract<NavEntry, { kind: "group" }> =>
      e.kind === "group" && e.children.some((c) => isActive(c.href)),
  )?.label;

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    activeGroup ? { [activeGroup]: true } : {},
  );

  // Auto-open the group of the page you navigate to.
  useEffect(() => {
    if (activeGroup) setOpen((o) => ({ ...o, [activeGroup]: true }));
  }, [activeGroup]);

  const businessName = user.businessName || "Business";
  const businessInitial = businessName.charAt(0).toUpperCase() || "B";
  const shortId = user.businessId ? user.businessId.slice(0, 8) : "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await authApi.logout(); // backend + clears httpOnly cookies + memory
    toast.success("Signed out successfully.");
    // Full reload so proxy.ts sees cleared cookies and redirects cleanly.
    window.location.href = "/login";
  }

  function toggleGroup(label: string) {
    // When collapsed, opening a group expands the rail first.
    if (collapsed) {
      onExpand();
      setOpen((o) => ({ ...o, [label]: true }));
      return;
    }
    setOpen((o) => ({ ...o, [label]: !o[label] }));
  }

  function renderEntry(entry: NavEntry) {
    if (entry.kind === "link") {
      const active = isActive(entry.href);
      const Icon = entry.icon;
      return (
        <Link
          key={entry.href}
          href={entry.href}
          title={collapsed ? entry.label : undefined}
          className={cn(
            "group relative flex items-center rounded-lg text-sm transition-colors",
            collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2",
            active
              ? "bg-[#162038] font-medium text-[#FAFAFA]"
              : "text-[#71717A] hover:bg-[#111113] hover:text-[#FAFAFA]",
          )}
        >
          {active && (
            <span
              className={cn(
                "absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#2563EB]",
                collapsed ? "-left-2" : "-left-3",
              )}
            />
          )}
          <Icon
            size={16}
            className={
              active
                ? "text-[#3B82F6]"
                : "text-[#52525B] group-hover:text-[#FAFAFA]"
            }
          />
          {!collapsed && entry.label}
        </Link>
      );
    }

    // group
    const Icon = entry.icon;
    const groupActive = entry.children.some((c) => isActive(c.href));
    const isOpen = !collapsed && !!open[entry.label];
    return (
      <div key={entry.label}>
        <button
          type="button"
          onClick={() => toggleGroup(entry.label)}
          title={collapsed ? entry.label : undefined}
          className={cn(
            "group relative flex w-full items-center rounded-lg text-sm transition-colors",
            collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2",
            groupActive
              ? "font-medium text-[#FAFAFA]"
              : "text-[#71717A] hover:bg-[#111113] hover:text-[#FAFAFA]",
          )}
        >
          {groupActive && collapsed && (
            <span className="absolute -left-2 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#2563EB]" />
          )}
          <Icon
            size={16}
            className={
              groupActive
                ? "text-[#3B82F6]"
                : "text-[#52525B] group-hover:text-[#FAFAFA]"
            }
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{entry.label}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-[#52525B] transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </>
          )}
        </button>

        {isOpen && (
          <div className="mt-0.5 space-y-0.5">
            {entry.children.map((child) => {
              const active = isActive(child.href);
              const CIcon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg py-2 pl-9 pr-3 text-sm transition-colors",
                    active
                      ? "bg-[#162038] font-medium text-[#FAFAFA]"
                      : "text-[#71717A] hover:bg-[#111113] hover:text-[#FAFAFA]",
                  )}
                >
                  <CIcon
                    size={15}
                    className={active ? "text-[#3B82F6]" : "text-[#52525B]"}
                  />
                  {child.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#1C1C1F] bg-[#09090B] transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Workspace block */}
      <div
        className={cn(
          "flex items-center border-b border-[#1C1C1F] py-4",
          collapsed ? "justify-center px-0" : "gap-2.5 px-4",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#9333EA] text-sm font-bold text-white">
          {businessInitial}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#FAFAFA]">
                {businessName}
              </p>
              {shortId && (
                <p className="truncate text-[11px] text-[#52525B]">
                  ID {shortId}
                </p>
              )}
            </div>
            <ChevronsUpDown size={14} className="shrink-0 text-[#52525B]" />
          </>
        )}
      </div>

      {/* Nav */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <div className="space-y-0.5">{NAV_TOP.map(renderEntry)}</div>
        <div className="my-3 border-t border-[#1C1C1F]" />
        <div className="space-y-0.5">{NAV_BOTTOM.map(renderEntry)}</div>
      </nav>

      {/* Profile footer */}
      <div className="relative border-t border-[#1C1C1F] p-3">
        {menuOpen && !collapsed && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute bottom-full left-3 right-3 z-50 mb-2 overflow-hidden rounded-xl border border-[#1C1C1F] bg-[#111113] py-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  router.push("/settings");
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#A1A1AA] transition-colors hover:bg-[#1C1C1F] hover:text-[#FAFAFA]"
              >
                <User size={14} />
                Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/settings");
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#A1A1AA] transition-colors hover:bg-[#1C1C1F] hover:text-[#FAFAFA]"
              >
                <Settings size={14} />
                Settings
              </button>
              <div className="my-1 border-t border-[#1C1C1F]" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#EF4444] transition-colors hover:bg-[#1C1C1F] disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                {loggingOut ? "Signing out…" : "Logout"}
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            if (collapsed) {
              onExpand();
              return;
            }
            setMenuOpen((v) => !v);
          }}
          title={collapsed ? user.name || "Account" : undefined}
          className={cn(
            "group flex w-full items-center rounded-lg transition-colors hover:bg-[#111113]",
            collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2 py-2",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
            {user.initials || "U"}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-[#FAFAFA]">
                  {user.name || "Account"}
                </p>
                {user.role && (
                  <p className="truncate text-[11px] capitalize text-[#52525B]">
                    {user.role.toLowerCase()}
                  </p>
                )}
              </div>
              <ChevronsUpDown size={14} className="shrink-0 text-[#52525B]" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
