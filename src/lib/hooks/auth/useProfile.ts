import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

/**
 * Fetches GET /api/v1/auth/profile.
 *
 * On first load after a page refresh the access token may not be in memory
 * yet — the first call will 401, the interceptor silently refreshes via the
 * httpOnly cookie, and TanStack Query retries automatically.
 *
 * staleTime: 5 min — profile data rarely changes mid-session.
 */
export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: authApi.getProfile,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry hard auth failures — let the interceptor handle 401s
      const status = (error as { status?: number })?.status;
      if (status === 403) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Derived helper — returns the display shape consumed by Sidebar / Topbar.
 * Falls back gracefully while loading or if the API hasn't responded yet.
 */
export function useProfileDisplay() {
  const { data, isLoading } = useProfile();
  // console.log(data);

  const name = data?.data
    ? `${data.data.first_name} ${data.data.last_name}`.trim()
    : "";

  const initials = data?.data
    ? `${data.data.first_name?.at(0) ?? ""}${data.data.last_name?.at(0) ?? ""}`.toUpperCase()
    : "";

  return {
    isLoading,
    user: {
      name,
      initials,
      email: data?.data?.email ?? "",
      businessName: data?.data?.business_name ?? "",
    },
  };
}
