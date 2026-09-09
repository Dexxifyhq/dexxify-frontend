"use client";

import { createContext, useContext, useMemo } from "react";
import { useProfile } from "@/lib/hooks/auth/useProfile";
import type { BusinessRole } from "@/lib/auth-api";

interface AuthContextValue {
  role: BusinessRole | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  role: null,
  isLoading: true,
});

/**
 * Wraps the authenticated app (mount inside (dashboard)/layout.tsx, not the
 * public root layout — it calls useProfile(), which would 401 and bounce
 * anonymous visitors on public pages via the refresh interceptor).
 *
 * Role is derived from GET /auth/profile rather than tracked independently:
 * every endpoint that can change it (login, verify-otp, select-business)
 * already causes a profile fetch/refetch on success (first mount after
 * redirect, or the explicit invalidation in useSelectBusiness), and the
 * endpoints that don't change it (refresh, switch-mode) don't need to.
 */
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
