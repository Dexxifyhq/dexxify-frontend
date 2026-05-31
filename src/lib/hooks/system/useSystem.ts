import { useQuery } from "@tanstack/react-query";
import { systemApi } from "@/lib/api/system";

export const systemKeys = {
  all: ["system"] as const,
  health: () => [...systemKeys.all, "health"] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: systemKeys.health(),
    queryFn: systemApi.getHealth,
    staleTime: 30_000,
  });
}
