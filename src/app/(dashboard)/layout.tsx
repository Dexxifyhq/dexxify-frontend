"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import Topbar from "@/components/dashboard/layout/Topbar";
import { getToken } from "@/lib/auth-api";
import type { Environment } from "@/lib/types/common";

// Hardcoded for now — replace with useProfile() query once profile API is ready
const MOCK_USER = {
  name: "Samuel Uzor",
  role: "Owner",
  initials: "SU",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [environment, setEnvironment] = useState<Environment>("sandbox");
  const [ready, setReady] = useState(false);

  // Client-side auth guard
  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090B]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#09090B]">
      <Sidebar user={MOCK_USER} />

      {/* Main area — offset by sidebar width */}
      <div className="flex flex-1 flex-col pl-60">
        <Topbar
          user={MOCK_USER}
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
