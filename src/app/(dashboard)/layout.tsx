"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import { useProfileDisplay } from "@/lib/hooks/auth/useProfile";
import { setMemoryToken, getMemoryToken } from "@/lib/api-client";
import type { Environment } from "@/lib/types/common";

const SKELETON_USER = { name: "", initials: "", role: "Owner" };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [environment, setEnvironment] = useState<Environment>("sandbox");
  // tokenReady gates all child queries so they never fire without a token
  const [tokenReady, setTokenReady] = useState(
    // If memory already has a token (client-side nav from login page), skip
    // the restore round-trip entirely — dashboard is instant.
    () => typeof window !== "undefined" && !!getMemoryToken()
  );

  useEffect(() => {
    if (tokenReady) return; // already have a token, nothing to do

    // Page was refreshed or opened in a new tab — silently restore the
    // access token using the httpOnly __dexxify_rt cookie.
    axios
      .post<{ access_token: string }>("/api/auth/refresh")
      .then(({ data }) => setMemoryToken(data.access_token))
      .catch(() => {
        // Refresh failed (no cookie or expired).
        // proxy.ts will handle the redirect on the next navigation.
        // We still set tokenReady so the layout doesn't hang indefinitely.
      })
      .finally(() => setTokenReady(true));
  }, [tokenReady]);

  const { user, isLoading } = useProfileDisplay();
  const displayUser = isLoading || !tokenReady ? SKELETON_USER : user;

  if (!tokenReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <Sidebar user={displayUser} />

      <div className="flex flex-1 flex-col pl-60">
        <Topbar
          user={displayUser}
          environment={environment}
          onEnvToggle={() =>
            setEnvironment((e) => (e === "sandbox" ? "live" : "sandbox"))
          }
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
