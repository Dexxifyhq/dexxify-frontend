"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, X, Sparkles, User, Settings, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { authApi } from "@/lib/auth-api";
import type { Environment } from "@/lib/types/common";

// ── Pending actions panel ──────────────────────────────────────────────────

function PendingActionsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-16 top-12 z-50 w-72 rounded-xl border border-[#1C1C1F] bg-[#111113] p-4 shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-[#FAFAFA]">Pending Actions</p>
          <p className="text-xs text-[#71717A]">No pending actions</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-4">
        <p className="text-xs text-[#52525B]">You&apos;re all caught up</p>
      </div>
    </div>
  );
}

// ── User dropdown ──────────────────────────────────────────────────────────

function UserDropdown({ user, onClose }: {
  user: { name: string; role: string; initials: string };
  onClose: () => void;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await authApi.logout(); // calls backend + clears httpOnly cookies + clears memory
    toast.success("Signed out successfully.");
    // Full page reload so proxy.ts sees cleared cookies and redirects cleanly
    window.location.href = "/login";
  }

  return (
    <div className="absolute right-4 top-12 z-50 w-56 rounded-xl border border-[#1C1C1F] bg-[#111113] py-1 shadow-xl cursor-pointer">
      {/* User info */}
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-[#1C1C1F]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
          {user.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#FAFAFA]">{user.name}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#52525B]">{user.role}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="py-1">
        <button
          onClick={() => { router.push("/settings"); onClose(); }}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
        >
          <User size={14} />
          Profile
        </button>
        <button
          onClick={() => { router.push("/settings"); onClose(); }}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
        >
          <Settings size={14} />
          Settings
        </button>
      </div>

      <div className="border-t border-[#1C1C1F] py-1 cursor-pointer">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-[#EF4444] hover:bg-[#1C1C1F] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loggingOut
            ? <Loader2 size={14} className="animate-spin" />
            : <LogOut size={14} />
          }
          {loggingOut ? "Signing out…" : "Logout"}
        </button>
      </div>
    </div>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────

interface TopbarProps {
  user: { name: string; role: string; initials: string };
  environment: Environment;
  onEnvToggle: () => void;
  showVerificationBanner?: boolean;
}

export default function Topbar({ user, environment, onEnvToggle, showVerificationBanner = true }: TopbarProps) {
  const [bannerVisible, setBannerVisible] = useState(showVerificationBanner);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isLive = environment === "live";

  function closeAll() {
    setShowNotifications(false);
    setShowUserMenu(false);
  }

  return (
    <>
      {/* Overlay to close dropdowns */}
      {(showNotifications || showUserMenu) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#1C1C1F] bg-[#09090B]/95 backdrop-blur-sm px-6">
        {/* Left: verification banner */}
        <div className="flex items-center gap-3">
          {bannerVisible && (
            <div className="flex items-center gap-2 rounded-lg border border-[#78350F]/40 bg-[#78350F]/10 px-3 py-1.5">
              <AlertTriangle size={13} className="text-[#F59E0B] shrink-0" />
              <span className="text-xs font-medium text-[#F59E0B]">Complete verification</span>
              <button
                onClick={() => setBannerVisible(false)}
                className="ml-1 text-[#F59E0B]/60 hover:text-[#F59E0B] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right: controls */}
        <div className="relative flex items-center gap-1">
          {/* Notification bell */}
          <button
            onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
          >
            <Bell size={15} />
          </button>

          {/* Sandbox / Live toggle */}
          <button
            onClick={onEnvToggle}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
              isLive
                ? "bg-[#052E16]/60 border-[#14532D]/50 text-[#22C55E]"
                : "bg-[#451A03]/60 border-[#78350F]/50 text-[#F59E0B]"
            )}
          >
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              isLive ? "bg-[#22C55E]" : "bg-[#F59E0B]"
            )} />
            {isLive ? "LIVE" : "SANDBOX"}
          </button>

          {/* Sparkle / what's new */}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors">
            <Sparkles size={15} />
          </button>

          {/* User avatar */}
          <button
            onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false); }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C1C1F] text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            <User size={15} />
          </button>

          {/* Dropdowns */}
          {showNotifications && <PendingActionsPanel onClose={() => setShowNotifications(false)} />}
          {showUserMenu && <UserDropdown user={user} onClose={() => setShowUserMenu(false)} />}
        </div>
      </header>
    </>
  );
}
