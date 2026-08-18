"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import { useProfile, useProfileDisplay } from "@/lib/hooks/auth/useProfile";
import { cn } from "@/utils/utils";

const SIDEBAR_KEY = "dexxify:sidebar-collapsed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_KEY) === "1";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  function setCollapsedPersisted(value: boolean) {
    setCollapsed(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_KEY, value ? "1" : "0");
    }
  }

  const { data: profile, isLoading, isError } = useProfile();
  const { user } = useProfileDisplay();

  // Derived directly from profile — no useState + useEffect needed.
  // When useSwitchMode calls qc.setQueryData, profile updates in the same
  // render pass and environment is correct immediately.
  const environment = profile?.mode === "live" ? "live" : "test";

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dash-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
      </div>
    );
  }

  if (isError) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-dash-bg">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onExpand={() => setCollapsedPersisted(false)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        environment={environment}
      />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col transition-[padding] duration-200",
          collapsed ? "lg:pl-16" : "lg:pl-60",
        )}
      >
        <Topbar
          environment={environment}
          onToggleSidebar={() => setCollapsedPersisted(!collapsed)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
