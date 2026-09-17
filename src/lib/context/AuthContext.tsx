"use client";

import { createContext, useContext, useMemo } from "react";
import { useProfile } from "@/lib/hooks/auth/useProfile";
import type { BusinessRole } from "@/lib/auth-api";
import { hasPermission, type PermissionKey } from "@/lib/permissions";

interface AuthContextValue {
  role: BusinessRole | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  role: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useProfile();

  const value = useMemo<AuthContextValue>(
    () => ({ role: profile?.role ?? null, isLoading }),
    [profile?.role, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useHasPermission(key: PermissionKey) {
  const { role } = useAuth();
  return hasPermission(role, key);
}
