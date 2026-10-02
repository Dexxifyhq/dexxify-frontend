"use client";

import { useState } from "react";
import { Bell, AlertTriangle, X, Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/utils";
import type { Environment } from "@/lib/types/common";
import { useSwitchMode } from "@/lib/hooks/auth/useProfile";
import { useIndividualKycStatus } from "@/lib/hooks/kyc/useKyc";

// ── Pending actions panel ──────────────────────────────────────────────────

function PendingActionsPanel({ onClose: _onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-dash-border bg-dash-card p-4 shadow-xl">
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

// Round icon button on the page background, no border — it only shows a
// surface on hover, matching the cardless bar.
const ICON_BTN =
  "flex h-10 w-10 items-center justify-center rounded-full bg-dash-bg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground";

const MODES: { value: Environment; label: string }[] = [
  { value: "live", label: "Live" },
  { value: "test", label: "Test" },
];

interface TopbarProps {
  environment: Environment;
  onOpenMobile?: () => void;
}

export default function Topbar({
  environment,
  onOpenMobile,
}: TopbarProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const switchMode = useSwitchMode();
  // Optimistic: the knob moves to the requested mode on click rather than
  // waiting on the request — the page's skeletons are the loading signal.
  // If the switch fails, isPending drops and this falls back to the real mode.
  const shownEnv: Environment =
    switchMode.isPending && switchMode.variables
      ? switchMode.variables
      : environment;
  const { data: kycStatus, isLoading: kycLoading } = useIndividualKycStatus();
  const isKycVerified = kycStatus?.overall_status === "verified";
  const showBanner = !bannerDismissed && !kycLoading && !isKycVerified;

  function closeAll() {
    setShowNotifications(false);
  }

  return (
    <>
      {/* Overlay to close dropdowns */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      {/* No card: the bar sits on the page background, leaving the main card
          as the only surface beside the sidebar. */}
      <header className="mx-4 mt-2 flex h-12 shrink-0 items-center justify-between gap-3 sm:mx-6 sm:mt-4">
        {/* Left: mobile menu (an empty slot on desktop keeps the controls
            pinned right) */}
        <div className="flex items-center">
          <button
            onClick={onOpenMobile}
            aria-label="Open menu"
            className={cn(ICON_BTN, "lg:hidden")}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Right: controls */}
        <div className="relative flex shrink-0 items-center gap-2">
          {showBanner && (
            <div className="hidden h-10 items-center gap-2 rounded-full border border-dash-warning-border bg-dash-warning-bg pl-3.5 pr-2.5 md:flex">
              <AlertTriangle size={14} className="shrink-0 text-dash-warning" />
              <Link
                href="/settings"
                className="text-xs font-medium text-dash-warning transition-colors hover:opacity-80"
              >
                Complete verification
              </Link>
              <button
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss"
                className="ml-0.5 text-dash-warning/60 transition-colors hover:text-dash-warning"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Live / Test switch — desktop (mobile has it in the drawer).
              A recessed track (inset shadow) with a raised knob that slides
              under the selected mode, coloured by status: green live, amber
              test. */}
          <div
            role="radiogroup"
            aria-label="Environment"
            className="relative hidden h-10 grid-cols-2 rounded-full bg-dash-bg p-1 shadow-[inset_0_2px_5px_rgb(0_0_0/0.12),inset_0_-1px_1px_rgb(255_255_255/0.9)] lg:grid"
          >
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full shadow-[0_2px_6px_rgb(0_0_0/0.2),inset_0_1px_1px_rgb(255_255_255/0.35)] transition-[transform,background-color] duration-700 ease-in-out",
                shownEnv === "live"
                  ? "translate-x-0 bg-dash-success"
                  : "translate-x-full bg-dash-warning",
              )}
            />
            {MODES.map((m) => {
              const selected = shownEnv === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={selected || switchMode.isPending}
                  onClick={() => switchMode.mutate(m.value)}
                  className={cn(
                    "relative flex h-full items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors duration-700 ease-in-out",
                    selected
                      ? "text-white"
                      : "cursor-pointer text-dash-muted hover:text-dash-foreground disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowNotifications((v) => !v)}
            aria-label="Notifications"
            className={ICON_BTN}
          >
            <Bell size={16} />
          </button>

          {showNotifications && (
            <PendingActionsPanel onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </header>
    </>
  );
}
