"use client";

import { useState } from "react";
import { Plus, Ban, Smartphone } from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import { usePosDevices } from "@/lib/hooks/pos-devices/usePosDevices";
import { useProfile } from "@/lib/hooks/auth/useProfile";
import LinkDeviceModal from "@/components/dashboard/pos-devices/LinkDeviceModal";
import RevokeDeviceModal from "@/components/dashboard/pos-devices/RevokeDeviceModal";
import type { PosDevice } from "@/lib/types/pos-devices";

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PosTerminalsPage() {
  const [showLinkDevice, setShowLinkDevice] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<PosDevice | null>(null);
  const { data: profile } = useProfile();
  const isLive = profile?.mode === "live";
  const { data: posDevices, isLoading } = usePosDevices({ enabled: isLive });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="POS Terminals"
        description="Link point-of-sale devices to your business and manage their access."
        actions={
          isLive ? (
            <button
              type="button"
              onClick={() => setShowLinkDevice(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-dash-accent px-3.5 text-sm font-medium text-white hover:bg-dash-accent-hover transition-colors"
            >
              <Plus size={14} /> Link Device
            </button>
          ) : undefined
        }
      />

      {!isLive ? (
        <section className="rounded-xl border border-dash-border bg-dash-card">
          <div className="flex items-center justify-center py-16 text-sm text-dash-muted">
            Switch to live mode to link POS terminals.
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-dash-border bg-dash-card">
          <header className="flex items-center gap-2 border-b border-dash-border px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-accent-soft text-dash-accent">
              <Smartphone size={15} />
            </div>
            <h2 className="text-sm font-semibold text-dash-foreground">
              Linked Devices
            </h2>
          </header>

          {isLoading ? (
            <div className="flex flex-col gap-2 p-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-lg bg-dash-hover"
                />
              ))}
            </div>
          ) : !posDevices || posDevices.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-dash-muted">
              No devices linked yet. Link a POS device to get started.
            </div>
          ) : (
            <div className="divide-y divide-dash-border">
              {posDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dash-foreground">
                      {device.device_name || "Unknown device"}
                    </p>
                    <p className="truncate text-xs text-dash-muted">
                      Linked {fmtDate(device.created_at)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRevokeTarget(device)}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-dash-border px-3 text-xs font-medium text-dash-muted hover:border-dash-error-border hover:bg-dash-error-bg hover:text-dash-error transition-colors"
                  >
                    <Ban size={12} /> Unlink
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {isLive && (
        <>
          <LinkDeviceModal
            open={showLinkDevice}
            onClose={() => setShowLinkDevice(false)}
          />
          <RevokeDeviceModal
            device={revokeTarget}
            onClose={() => setRevokeTarget(null)}
          />
        </>
      )}
    </div>
  );
}
