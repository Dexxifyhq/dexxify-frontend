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
  Landmark,
  Coins,
  Monitor,
  ChevronDown,
  ChevronLeft,
  ChevronsUpDown,
  LogOut,
  Loader2,
  Send,
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
import { useAuth } from "@/lib/context/AuthContext";
import {
  hasPermission,
  PERMISSIONS,
  type PermissionKey,
} from "@/lib/permissions";

// ── Nav config ───────────────────────────────────────────────────────────────

type NavLeaf = {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: PermissionKey;
};
type NavEntry =
  | {
      kind: "link";
      label: string;
      href: string;
      icon: React.ElementType;
      permission?: PermissionKey;
    }
  | {
      kind: "group";
      label: string;
      icon: React.ElementType;
      children: NavLeaf[];
    };

const NAV_TOP: NavEntry[] = [
  { kind: "link", label: "Analytics", href: "/dashboard", icon: BarChart3 },
  {
    kind: "link",
    label: "Balance",
    href: "/balance",
    icon: Wallet,
    permission: PERMISSIONS.MANAGE_BALANCE,
  },
  {
    kind: "group",
    label: "Payments",
    icon: CreditCard,
    children: [
      { label: "Invoices", href: "/invoices", icon: FileText },
      { label: "Checkout", href: "/checkouts", icon: ShoppingCart },
      { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
      { label: "Payment Links", href: "/payment-pages", icon: Layout },
      { label: "Refunds", href: "/refunds", icon: RotateCcw },
      {
        label: "Payouts",
        href: "/payouts",
        icon: Send,
        permission: PERMISSIONS.WITHDRAW_BANK,
      },
    ],
  },
  {
    kind: "group",
    label: "Operations",
    icon: LayoutGrid,
    children: [
      {
        label: "Bank Accounts",
        href: "/bank-accounts",
        icon: Landmark,
        permission: PERMISSIONS.MANAGE_BANK_ACCOUNTS,
      },
      {
        label: "Crypto Wallets",
        href: "/crypto-wallets",
        icon: Coins,
        permission: PERMISSIONS.MANAGE_CRYPTO_ADDRESSES,
      },
      { label: "POS Terminals", href: "/pos-terminals", icon: Monitor },
    ],
  },
  { kind: "link", label: "Customers", href: "/customers", icon: User },
];

const NAV_BOTTOM: NavEntry[] = [
  { kind: "link", label: "Developers", href: "/developers", icon: Code2 },
  { kind: "link", label: "Settings", href: "/settings", icon: Settings },
];

// Shared row styles. Active rows get a soft fill plus a hairline border; the
// border is always present (transparent when idle) so rows never shift.
const ROW =
  "group relative flex items-center rounded-xl border text-[15px] transition-colors";
const ROW_ACTIVE =
  "border-dash-border bg-dash-accent-soft font-semibold text-dash-foreground";
const ROW_IDLE =
  "border-transparent text-dash-foreground/80 hover:bg-dash-hover hover:text-dash-foreground";

// ── Workspace mark ───────────────────────────────────────────────────────────

// The business's uploaded logo, or its initial on a dark tile when it has none.
function WorkspaceMark({
  name,
  logoUrl,
  className,
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded, arbitrary host
      <img
        src={logoUrl}
        alt={name}
        className={cn("shrink-0 rounded-lg object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex shrink-0 select-none items-center justify-center rounded-lg bg-dash-accent font-bold text-white",
        className,
      )}
    >
      {name.charAt(0).toUpperCase() || "B"}
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  user: {
    businessName: string;
    businessId: string;
    name: string;
    initials: string;
    role: string;
    email: string;
  };
  collapsed: boolean;
  onExpand: () => void;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  environment: Environment;
}

export default function Sidebar({
  user,
  collapsed,
  onExpand,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  environment,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const { role } = useAuth();
  const switchMode = useSwitchMode();
  // Optimistic, like the Topbar switch: show the requested mode while the
  // switch is in flight; a failure falls back to the real mode.
  const isLive =
    (switchMode.isPending && switchMode.variables
      ? switchMode.variables
      : environment) === "live";
  const canSeeLeaf = (c: NavLeaf | Extract<NavEntry, { kind: "link" }>) => {
    if (c.permission && !hasPermission(role, c.permission)) return false;
    return true;
  };
  const canSee = (entry: NavEntry) => {
    if (entry.kind === "link") {
      return canSeeLeaf(entry);
    }
    // A group with every child gated out has nothing left to expand into.
    return entry.children.some(canSeeLeaf);
  };
  const visibleNavTop = NAV_TOP.filter(canSee);
  const visibleNavBottom = NAV_BOTTOM.filter(canSee);

  // Which collapsible group (if any) contains the current route.
  const activeGroup = [...visibleNavTop, ...visibleNavBottom].find(
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
  const businessId = business?.id || user.businessId;

  // True whenever the sidebar shows full content — desktop expanded OR mobile drawer open.
  const isExpanded = !collapsed || mobileOpen;

  const [bizMenuOpen, setBizMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  function handleEnvToggle() {
    const next: Environment = isLive ? "test" : "live";
    switchMode.mutate(next);
  }

  async function handleLogout() {
    setLoggingOut(true);
    await authApi.logout();
    toast.success("Signed out successfully.");
    window.location.href = "/login";
  }

  function toggleGroup(label: string) {
    // When collapsed, opening a group expands the rail first.
    if (!isExpanded) {
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
          onClick={onMobileClose}
          title={!isExpanded ? entry.label : undefined}
          className={cn(
            ROW,
            !isExpanded ? "justify-center px-0 py-3" : "gap-3.5 px-4 py-3",
            active ? ROW_ACTIVE : ROW_IDLE,
          )}
        >
          <Icon size={20} strokeWidth={1.75} className="shrink-0" />
          {isExpanded && entry.label}
        </Link>
      );
    }

    // group
    const Icon = entry.icon;
    const visibleChildren = entry.children.filter(canSeeLeaf);
    const groupActive = entry.children.some((c) => isActive(c.href));
    const isOpen = isExpanded && !!open[entry.label];
    return (
      <div key={entry.label}>
        <button
          type="button"
          onClick={() => toggleGroup(entry.label)}
          title={!isExpanded ? entry.label : undefined}
          className={cn(
            ROW,
            "w-full",
            !isExpanded ? "justify-center px-0 py-3" : "gap-3.5 px-4 py-3",
            // Collapsed, the rail can't show the active child, so the group
            // itself takes the active treatment.
            groupActive && !isExpanded
              ? ROW_ACTIVE
              : cn(ROW_IDLE, groupActive && "font-semibold text-dash-foreground"),
          )}
        >
          <Icon size={20} strokeWidth={1.75} className="shrink-0" />
          {isExpanded && (
            <>
              <span className="flex-1 text-left">{entry.label}</span>
              <ChevronDown
                size={16}
                className={cn(
                  "text-dash-faint transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </>
          )}
        </button>

        {isOpen && (
          <div className="ml-6.25 mt-1 space-y-1 border-l border-dash-border pl-3">
            {visibleChildren.map((child) => {
              const active = isActive(child.href);
              const CIcon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    active ? ROW_ACTIVE : ROW_IDLE,
                  )}
                >
                  <CIcon size={17} strokeWidth={1.75} className="shrink-0" />
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
          "dash-sidebar fixed inset-y-3 left-3 z-50 flex w-72 flex-col rounded-2xl border border-dash-border bg-dash-card shadow-(--shadow-card) transition-[width,transform] duration-200",
          // Desktop: full-height floating card, 24px top/bottom to line up
          // with the Topbar and main card, 16px from the left edge.
          "lg:inset-y-6 lg:left-4 lg:translate-x-0",
          collapsed ? "lg:w-19" : "lg:w-64",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-[calc(100%+1rem)] lg:translate-x-0",
        )}
      >
        {/* Collapse tab — hangs off the right edge, desktop only */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute left-full top-1/2 hidden h-10 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-dash-border bg-dash-card text-dash-faint transition-colors hover:text-dash-foreground lg:flex"
        >
          <ChevronLeft
            size={14}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>

        {/* Workspace — opens the switcher */}
        <div
          className={cn(
            "relative shrink-0 pb-2 pt-4",
            !isExpanded ? "px-3" : "px-4",
          )}
        >
          {bizMenuOpen && isExpanded && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setBizMenuOpen(false)}
              />
              <div className="absolute left-4 right-4 top-full z-50 overflow-hidden rounded-xl border border-dash-border bg-dash-card py-1 shadow-xl">
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-dash-faint">
                  Workspaces
                </p>

                {allBusinesses.map((biz) => {
                  const isCurrent = biz.id === businessId;
                  return (
                    <button
                      key={biz.id}
                      type="button"
                      disabled={isCurrent || selectBusiness.isPending}
                      onClick={async () => {
                        if (isCurrent) return;
                        await selectBusiness.mutateAsync(biz.id);
                        setBizMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors disabled:cursor-default",
                        isCurrent
                          ? "text-dash-foreground"
                          : "text-dash-muted hover:bg-dash-hover hover:text-dash-foreground",
                      )}
                    >
                      <WorkspaceMark
                        name={biz.name}
                        logoUrl={biz.logo_url}
                        className="h-6 w-6 rounded-md text-[10px]"
                      />
                      <span className="flex-1 truncate text-left">
                        {biz.name}
                      </span>
                      {isCurrent && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-dash-success" />
                      )}
                      {!isCurrent &&
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
              "flex h-14 w-full items-center rounded-xl transition-colors",
              !isExpanded
                ? "justify-center"
                : "gap-3 px-2 hover:bg-dash-hover",
            )}
          >
            <WorkspaceMark
              name={businessName}
              logoUrl={business?.logo_url}
              className="h-9 w-9 text-sm"
            />
            {isExpanded && (
              <>
                <span className="min-w-0 flex-1 truncate text-left text-[17px] font-bold text-dash-foreground">
                  {businessName}
                </span>
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
            "flex-1 overflow-y-auto pb-4 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            !isExpanded ? "px-3" : "px-4",
          )}
        >
          <div className="space-y-1">{visibleNavTop.map(renderEntry)}</div>
          <div className="my-3 border-t border-dash-border" />
          <div className="space-y-1">{visibleNavBottom.map(renderEntry)}</div>
        </nav>

        {/* Footer */}
        <div className={cn("shrink-0", !isExpanded ? "px-3 pb-4" : "px-4 pb-4")}>
          <div className="mb-4 border-t border-dash-border" />

          {/* Mobile-only: env toggle */}
          <button
            type="button"
            onClick={handleEnvToggle}
            disabled={switchMode.isPending}
            className={cn(
              "mb-3 flex w-full items-center justify-center gap-2 rounded-full border py-2 text-xs font-semibold transition-colors lg:hidden",
              isLive
                ? "border-dash-success-border bg-dash-success-bg text-dash-success"
                : "border-dash-warning-border bg-dash-warning-bg text-dash-warning",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isLive ? "bg-dash-success" : "bg-dash-warning",
              )}
            />
            {isLive ? "LIVE MODE" : "TEST MODE"}
          </button>

          <div className="relative">
            {menuOpen && isExpanded && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-dash-border bg-dash-card py-1 shadow-xl">
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
                if (!isExpanded) {
                  onExpand();
                  return;
                }
                setMenuOpen((v) => !v);
              }}
              title={!isExpanded ? user.name || "Account" : undefined}
              className={cn(
                "flex w-full items-center transition-colors",
                !isExpanded
                  ? "justify-center"
                  : "gap-3 rounded-2xl border border-dash-border bg-dash-bg px-3 py-3 hover:bg-dash-hover",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dash-accent text-sm font-semibold text-white">
                {user.initials || "U"}
              </div>
              {isExpanded && (
                <>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-semibold text-dash-foreground">
                      {user.name || "Account"}
                    </p>
                    <p className="truncate text-xs text-dash-faint">
                      {user.email || user.role.toLowerCase()}
                    </p>
                  </div>
                  <ChevronsUpDown
                    size={14}
                    className="shrink-0 text-dash-faint"
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
