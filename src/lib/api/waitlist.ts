import { publicPost, PublicApiError } from "@/lib/api-public";
import type {
  JoinWaitlistDto,
  JoinWaitlistResult,
  WaitlistEntry,
} from "@/lib/types/waitlist";

export const waitlistApi = {
  join: async (payload: JoinWaitlistDto): Promise<JoinWaitlistResult> => {
    try {
      const entry = await publicPost<WaitlistEntry>("/waitlist", payload);
      return { alreadyOnWaitlist: false, entry };
    } catch (err) {
      if (err instanceof PublicApiError && err.status === 409) {
        return { alreadyOnWaitlist: true };
      }
      throw err;
    }
  },
};
