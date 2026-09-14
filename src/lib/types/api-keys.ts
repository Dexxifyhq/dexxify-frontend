// ── API keys ───────────────────────────────────────────────────────────────

export type ApiKeyEnvironment = "sandbox" | "live";

export interface ApiKey {
  id: string;
  label?: string;
  environment: ApiKeyEnvironment;
  key?: string; // returned in plaintext only on create
  prefix?: string; // safe to display in lists
  last_four?: string;
  ip_whitelist?: string[];
  last_used_at?: string;
  created_at: string;
  updated_at?: string;
  revoked_at?: string;
}

export interface CreateApiKeyDto {
  label?: string;
}

export interface UpdateApiKeyDto {
  label?: string;
  ip_whitelist?: string[];
}
