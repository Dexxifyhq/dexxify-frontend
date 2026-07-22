"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import { useProfile, useProfileDisplay } from "@/lib/hooks/auth/useProfile";
import { cn } from "@/utils/utils";
import type { Environment } from "@/lib/types/common";

const SIDEBAR_KEY = "dexxify:sidebar-collapsed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [environment, setEnvironment] = useState<Environment>("test");
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === "1";
  });

  function setCollapsedPersisted(value: boolean) {
    setCollapsed(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_KEY, value ? "1" : "0");
    }
  }

  const { data: profile, isLoading, isError } = useProfile();
  const { user } = useProfileDisplay();

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  // Sync environment with what the backend has stored for this session.
  useEffect(() => {
    if (profile?.mode)
      setEnvironment(profile.mode === "live" ? "live" : "test");
  }, [profile?.mode]);

  // First load (and the refresh-retry window): hold the dashboard behind a
  // spinner so child queries don't flash against a half-authed shell.
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  // Logged out — the effect above is redirecting; render nothing meanwhile.
  if (isError) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090B]">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onExpand={() => setCollapsedPersisted(false)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col transition-[padding] duration-200",
          collapsed ? "pl-16" : "pl-60",
        )}
      >
        <Topbar
          environment={environment}
          onEnvToggle={() =>
            setEnvironment((e) => (e === "test" ? "live" : "test"))
          }
          onToggleSidebar={() => setCollapsedPersisted(!collapsed)}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
