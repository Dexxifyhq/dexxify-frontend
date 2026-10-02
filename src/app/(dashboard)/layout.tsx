"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import { useProfile, useProfileDisplay } from "@/lib/hooks/auth/useProfile";
import { useMyBusiness } from "@/lib/hooks/businesses/useBusinesses";
import { AuthProvider } from "@/lib/context/AuthContext";
import { RealtimeProvider } from "@/lib/context/RealtimeContext";
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

  const environment = profile?.mode === "live" ? "live" : "test";

  useEffect(() => {
    if (isError) router.replace("/login");
  }, [isError, router]);

  // First-run setup. Signup creates a business with no type, so an owner
  // whose business still has type === null hasn't been through /welcome yet.
  // Staff aren't redirected — defining the business is the owner's call.
  const { data: business, isLoading: businessLoading } = useMyBusiness();
  const needsWelcome =
    !!profile &&
    !!business &&
    business.type === null &&
    business.owner_user_id === profile.id;

  useEffect(() => {
    if (needsWelcome) router.replace("/welcome");
  }, [needsWelcome, router]);

  // Hold on the spinner until the business is known, so a new owner never
  // sees the dashboard flash before the redirect.
  if (isLoading || businessLoading || needsWelcome) {
    return (
      <div className="flex h-screen items-center justify-center bg-dash-bg">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-dash-accent border-t-transparent" />
      </div>
    );
  }

  if (isError) return null;

  return (
    <AuthProvider>
      <RealtimeProvider>
        <div className="flex h-screen overflow-hidden bg-dash-bg">
          <Sidebar
            user={user}
            collapsed={collapsed}
            onExpand={() => setCollapsedPersisted(false)}
            onToggleCollapse={() => setCollapsedPersisted(!collapsed)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            environment={environment}
          />

          <div
            className={cn(
              "flex min-w-0 flex-1 flex-col transition-[padding] duration-200",
              collapsed ? "lg:pl-25" : "lg:pl-70",
            )}
          >
            <Topbar
              environment={environment}
              onOpenMobile={() => setMobileOpen(true)}
            />
            {/* No card, like the Topbar: pages sit straight on the page
                background, and their own cards are the surfaces. Margin plus
                the 8px padding puts content on the same 16/24px gutter as the
                Topbar; the padding keeps card borders and shadows (up to shadow-md)
                from being clipped by the scroll container. Scrolling stays on
                this element so the Topbar holds its place. */}
            <main className="dash-main mx-2 mt-1 flex-1 overflow-y-auto px-2 pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-4 sm:mt-2 sm:pb-6 [&::-webkit-scrollbar]:hidden">
              {children}
            </main>
          </div>
        </div>
      </RealtimeProvider>
    </AuthProvider>
  );
}
