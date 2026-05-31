// ── System / health ──────────────────────────────────────────────────────────

/**
 * Response of GET /health. The endpoint is public (no auth) and its shape is
 * not declared in the OpenAPI spec, so this is kept permissive — refine the
 * named fields once the real shape is verified.
 */
export interface HealthStatus {
  status?: string;
  uptime?: number;
  timestamp?: string;
  version?: string;
  [key: string]: unknown;
}
