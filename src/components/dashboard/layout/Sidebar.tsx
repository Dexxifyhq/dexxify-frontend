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
import {
  useMyBusiness,
  useMyBusinesses,
  useSelectBusiness,
} from "@/lib/hooks/businesses/useBusinesses";
import type { Environment } from "@/lib/types/common";
import { useSwitchMode } from "@/lib/hooks/auth/useProfile";

// ── Nav config ───────────────────────────────────────────────────────────────

type NavLeaf = { label: string; href: string; icon: React.ElementType };
type NavEntry =
  | { kind: "link"; label: string; href: string; icon: React.ElementType }
  | {
      kind: "group";
      label: string;
      icon: React.ElementType;
      children: NavLeaf[];
    };

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
  mobileOpen: boolean;
  onMobileClose: () => void;
  environment: Environment;
}

export default function Sidebar({
  user,
  collapsed,
  onExpand,
  mobileOpen,
  onMobileClose,
  environment,
}: SidebarProps) {
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

  const { data: business } = useMyBusiness();
  const { data: allBusinesses = [] } = useMyBusinesses();
  const selectBusiness = useSelectBusiness();

  const businessName = business?.name || user.businessName || "Business";
  const businessInitial = businessName.charAt(0).toUpperCase() || "B";
  const businessId = business?.id || user.businessId;
  const shortId = businessId ? businessId.slice(0, 8) : "";

  const [bizMenuOpen, setBizMenuOpen] = useState(false);

  // True whenever the sidebar shows full content — desktop expanded OR mobile drawer open.
  const isExpanded = !collapsed || mobileOpen;

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const switchMode = useSwitchMode();
  const isLive = environment === "live";
  function handleEnvToggle() {
    const next: Environment = isLive ? "test" : "live";
    switchMode.mutate(next);
  }

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
              ? "bg-dash-accent-soft font-medium text-dash-foreground"
              : "text-dash-muted hover:bg-dash-hover hover:text-dash-foreground",
          )}
        >
          {active && (
            <span
              className={cn(
                "absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-dash-accent",
                collapsed ? "-left-2" : "-left-3",
              )}
            />
          )}
          <Icon
            size={16}
            className={
              active
                ? "text-dash-accent"
                : "text-dash-faint group-hover:text-dash-foreground"
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
              ? "font-medium text-dash-foreground"
              : "text-dash-muted hover:bg-dash-hover hover:text-dash-foreground",
          )}
        >
          {groupActive && collapsed && (
            <span className="absolute -left-2 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-dash-accent" />
          )}
          <Icon
            size={16}
            className={
              groupActive
                ? "text-dash-accent"
                : "text-dash-faint group-hover:text-dash-foreground"
            }
          />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{entry.label}</span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-dash-faint transition-transform",
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
                      ? "bg-dash-accent-soft font-medium text-dash-foreground"
                      : "text-dash-muted hover:bg-dash-hover hover:text-dash-foreground",
                  )}
                >
                  <CIcon
                    size={15}
                    className={active ? "text-dash-accent" : "text-dash-faint"}
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
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border border-dash-border bg-dash-card transition-[width,transform] duration-200",
          // Desktop: collapse rail, floating with space around it
          "lg:inset-y-32 lg:left-4 lg:translate-x-0 lg:overflow-hidden lg:rounded-2xl lg:shadow-lg",
          collapsed ? "lg:w-16" : "lg:w-60",
          // Mobile: full-width drawer, hidden unless open
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Workspace block */}
        <div className="relative border-b border-dash-border">
          {bizMenuOpen && isExpanded && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setBizMenuOpen(false)}
              />
              <div className="absolute left-3 right-3 top-full z-50 mt-1 overflow-hidden rounded-xl border border-dash-border bg-dash-card py-1 shadow-xl">
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-dash-faint">
                  Workspaces
                </p>

                {allBusinesses.map((biz) => {
                  const isActive = biz.id === businessId;
                  const initial = biz.name.charAt(0).toUpperCase();
                  return (
                    <button
                      key={biz.id}
                      type="button"
                      disabled={isActive || selectBusiness.isPending}
                      onClick={async () => {
                        if (isActive) return;
                        await selectBusiness.mutateAsync(biz.id);
                        setBizMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors disabled:cursor-default",
                        isActive
                          ? "text-dash-foreground"
                          : "text-dash-muted hover:bg-dash-hover hover:text-dash-foreground",
                      )}
                    >
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-[#4F46E5] to-[#9333EA] text-[10px] font-bold text-white">
                        {initial}
                      </div>
                      <span className="flex-1 truncate text-left">
                        {biz.name}
                      </span>
                      {isActive && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dash-success" />
                      )}
                      {!isActive &&
                        selectBusiness.isPending &&
                        selectBusiness.variables === biz.id && (
                          <Loader2
                            size={12}
                            className="animate-spin text-dash-faint"
                          />
                        )}
                    </button>
                  );
                })}

                <div className="my-1 border-t border-dash-border" />
                <button
                  type="button"
                  onClick={() => {
                    router.push("/settings");
                    setBizMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
                >
                  <Settings size={14} />
                  Manage businesses
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              if (!isExpanded) {
                onExpand();
                return;
              }
              setBizMenuOpen((v) => !v);
            }}
            title={!isExpanded ? businessName : undefined}
            className={cn(
              "flex w-full items-center py-4 transition-colors",
              !isExpanded
                ? "justify-center px-0"
                : "gap-2.5 px-4 hover:bg-dash-hover",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg bg-linear-to-br from-[#4F46E5] to-[#9333EA] text-sm font-bold text-white">
              {businessInitial}
            </div>
            {isExpanded && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-dash-foreground">
                    {businessName}
                  </p>
                  {shortId && (
                    <p className="truncate text-[11px] text-dash-faint">
                      ID {shortId}
                    </p>
                  )}
                </div>
                <ChevronsUpDown
                  size={14}
                  className="shrink-0 text-dash-faint"
                />
              </>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto py-4",
            collapsed ? "px-2" : "px-3",
          )}
        >
          <div className="space-y-0.5">{NAV_TOP.map(renderEntry)}</div>
          <div className="my-3 border-t border-dash-border" />
          <div className="space-y-0.5">{NAV_BOTTOM.map(renderEntry)}</div>
        </nav>

        {/* Profile footer */}
        <div className="relative border-t border-dash-border p-3">
          {menuOpen && !collapsed && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute bottom-full left-3 right-3 z-50 mb-2 overflow-hidden rounded-xl border border-dash-border bg-dash-card py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/settings");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
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
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
                >
                  <Settings size={14} />
                  Settings
                </button>
                <div className="my-1 border-t border-dash-border" />
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-dash-error transition-colors hover:bg-dash-hover disabled:opacity-50"
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
              "group flex w-full items-center rounded-lg transition-colors hover:bg-dash-hover",
              collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2 py-2",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-accent text-xs font-semibold text-white">
              {user.initials || "U"}
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-dash-foreground">
                    {user.name || "Account"}
                  </p>
                  {user.role && (
                    <p className="truncate text-[11px] capitalize text-dash-faint">
                      {user.role.toLowerCase()}
                    </p>
                  )}
                </div>
                <ChevronsUpDown
                  size={14}
                  className="shrink-0 text-dash-faint"
                />
              </>
            )}
          </button>
        </div>

        {/* Mobile-only: env toggle */}
        <div className="border-t border-dash-border p-3 lg:hidden">
          <button
            type="button"
            onClick={handleEnvToggle}
            disabled={switchMode.isPending}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-full border py-2 text-xs font-semibold transition-colors disabled:opacity-60",
              isLive
                ? "border-dash-success-border bg-dash-success-bg text-dash-success"
                : "border-dash-warning-border bg-dash-warning-bg text-dash-warning",
            )}
          >
            {switchMode.isPending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isLive ? "bg-dash-success" : "bg-dash-warning",
                )}
              />
            )}
            {isLive ? "LIVE MODE" : "TEST MODE"}
          </button>
        </div>
      </aside>
    </>
  );
}
