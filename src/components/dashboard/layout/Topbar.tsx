"use client";

import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  X,
  Sparkles,
  PanelLeft,
  Menu,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/utils";
import type { Environment } from "@/lib/types/common";
import { useSwitchMode } from "@/lib/hooks/auth/useProfile";
import { useIndividualKycStatus } from "@/lib/hooks/kyc/useKyc";

// ── Pending actions panel ──────────────────────────────────────────────────

function PendingActionsPanel({ onClose: _onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-2 top-12 z-50 w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-[#1C1C1F] bg-[#111113] p-4 shadow-xl sm:right-16">
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

// ── Topbar ─────────────────────────────────────────────────────────────────

interface TopbarProps {
  environment: Environment;
  onToggleSidebar: () => void;
  onOpenMobile?: () => void;
}

export default function Topbar({
  environment,
  onToggleSidebar,
  onOpenMobile,
}: TopbarProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const switchMode = useSwitchMode();
  const { data: kycStatus, isLoading: kycLoading } = useIndividualKycStatus();
  const isKycVerified = kycStatus?.overall_status === "verified";
  const showBanner = !bannerDismissed && !kycLoading && !isKycVerified;

  const isLive = environment === "live";

  function handleEnvToggle() {
    const next: Environment = isLive ? "test" : "live";
    switchMode.mutate(next);
  }

  function closeAll() {
    setShowNotifications(false);
  }

  return (
    <>
      {/* Overlay to close dropdowns */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-[#1C1C1F] bg-[#09090B]/95 backdrop-blur-sm px-4 sm:px-6">
        {/* Left: sidebar toggle + verification banner */}
        <div className="flex items-center gap-3">
          {/* Mobile: open drawer */}
          <button
            onClick={onOpenMobile}
            aria-label="Open menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors lg:hidden"
          >
            <Menu size={18} />
          </button>
          {/* Desktop: collapse rail */}
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors lg:flex"
          >
            <PanelLeft size={16} />
          </button>
          {showBanner && (
            <div className="hidden items-center gap-2 rounded-lg border border-[#78350F]/40 bg-[#78350F]/10 px-3 py-1.5 md:flex">
              <AlertTriangle size={13} className="shrink-0 text-[#F59E0B]" />
              <Link
                href="/settings"
                className="text-xs font-medium text-[#F59E0B] transition-colors hover:text-[#FCD34D]"
              >
                Complete verification
              </Link>
              <button
                onClick={() => setBannerDismissed(true)}
                className="ml-1 text-[#F59E0B]/60 transition-colors hover:text-[#F59E0B]"
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
            onClick={() => setShowNotifications((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
          >
            <Bell size={15} />
          </button>

          {/* Live / Test toggle — desktop (mobile has it in the drawer) */}
          <button
            onClick={handleEnvToggle}
            disabled={switchMode.isPending}
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs cursor-pointer font-semibold transition-colors border disabled:opacity-60 disabled:cursor-not-allowed lg:flex",
              isLive
                ? "bg-[#052E16]/60 border-[#14532D]/50 text-[#22C55E]"
                : "bg-[#451A03]/60 border-[#78350F]/50 text-[#F59E0B]",
            )}
          >
            {switchMode.isPending ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isLive ? "bg-[#22C55E]" : "bg-[#F59E0B]",
                )}
              />
            )}
            {isLive ? "LIVE" : "TEST"}
          </button>

          {/* Sparkle / what's new */}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors">
            <Sparkles size={15} />
          </button>

          {/* Dropdowns */}
          {showNotifications && (
            <PendingActionsPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </header>
    </>
  );
}
