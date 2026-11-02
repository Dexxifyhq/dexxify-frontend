import { useMutation } from "@tanstack/react-query";
import { waitlistApi } from "@/lib/api/waitlist";
import type { JoinWaitlistDto } from "@/lib/types/waitlist";

export function useJoinWaitlist() {
  return useMutation({
    mutationFn: (payload: JoinWaitlistDto) => waitlistApi.join(payload),
  });
}
