// ── Waitlist ─────────────────────────────────────────────────────────────────

export interface JoinWaitlistDto {
  email: string;
  name: string;
  phone?: string;
  message?: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
}

export interface JoinWaitlistResult {
  /** True when the email was already on the list — treated as a soft success. */
  alreadyOnWaitlist: boolean;
  entry?: WaitlistEntry;
}
