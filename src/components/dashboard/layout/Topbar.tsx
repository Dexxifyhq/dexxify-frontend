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
    <div className="absolute right-2 top-12 z-50 w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-dash-border bg-dash-card p-4 shadow-xl sm:right-16">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-dash-foreground">Pending Actions</p>
          <p className="text-xs text-dash-muted">No pending actions</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-4">
        <p className="text-xs text-dash-faint">You&apos;re all caught up</p>
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

      <header className="sticky top-0 z-30 mx-4 mt-4 flex h-18 items-center justify-between rounded-2xl border border-dash-border bg-dash-card/95 px-4 backdrop-blur-sm shadow-xs sm:mx-6 sm:mt-6 sm:px-4">
        {/* Left: sidebar toggle + verification banner */}
        <div className="flex items-center gap-3">
          {/* Mobile: open drawer */}
          <button
            onClick={onOpenMobile}
            aria-label="Open menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors lg:hidden"
          >
            <Menu size={18} />
          </button>
          {/* Desktop: collapse rail */}
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors lg:flex"
          >
            <PanelLeft size={16} />
          </button>
          {showBanner && (
            <div className="hidden items-center gap-2 rounded-lg border border-dash-warning-border bg-dash-warning-bg px-3 py-1.5 md:flex">
              <AlertTriangle size={13} className="shrink-0 text-dash-warning" />
              <Link
                href="/settings"
                className="text-xs font-medium text-dash-warning transition-colors hover:opacity-80"
              >
                Complete verification
              </Link>
              <button
                onClick={() => setBannerDismissed(true)}
                className="ml-1 text-dash-warning/60 transition-colors hover:text-dash-warning"
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
            className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:text-dash-foreground hover:bg-dash-hover transition-colors"
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
                ? "bg-dash-success-bg border-dash-success-border text-dash-success"
                : "bg-dash-warning-bg border-dash-warning-border text-dash-warning",
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
            {isLive ? "LIVE" : "TEST"}
          </button>

          {/* Sparkle / what's new */}
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted hover:text-dash-foreground hover:bg-dash-hover transition-colors">
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
