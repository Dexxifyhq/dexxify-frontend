import {
  KeyRound,
  Webhook,
  LockKeyhole,
  Gauge,
  Users,
  Link2,
  type LucideIcon,
} from "lucide-react";

interface Control {
  icon: LucideIcon;
  title: string;
  desc: string;
}

/**
 * Every control below was checked against dexxify-backend/src:
 * - API keys: hashApiKey() stores SHA-256 hashes (common/utils).
 * - Webhooks: signWebhookPayload() HMAC-SHA256 with the endpoint's own secret
 *   (webhooks.service.ts).
 * - Passwords: bcrypt, cost 12 (auth.service.ts); email verification and
 *   password reset both take a one-time code.
 * - Rate limiting: ThrottlerModule on Redis (app.module.ts); helmet() headers
 *   and a CORS origin allowlist (main.ts).
 * - Roles: Owner / Admin / Staff, with @Roles guards on team management.
 * - On-chain hashes: tx_hash on the crypto transaction entity.
 *
 * Removed from the previous version because nothing in the backend backs
 * them: AES-256, TLS 1.3, OAuth 2.0, GDPR / NDPR, AML screening on every
 * transaction, fraud and anomaly detection, 24/7 monitoring, audit logs, and a
 * hardcoded "All systems operational" status widget that looked live but
 * wasn't. Compliance statements like GDPR / NDPR can come back once legal
 * confirms them — they aren't provable from code either way.
 */
const CONTROLS: Control[] = [
  {
    icon: KeyRound,
    title: "Hashed API keys",
    desc: "API keys are stored only as SHA-256 hashes, never in plain text.",
  },
  {
    icon: Webhook,
    title: "Signed webhooks",
    desc: "Webhooks are signed with HMAC-SHA256 using your endpoint's own secret, so you can verify every event came from Dexxify.",
  },
  {
    icon: LockKeyhole,
    title: "Protected accounts",
    desc: "Passwords are hashed with bcrypt, and email verification and password resets use one-time codes.",
  },
  {
    icon: Gauge,
    title: "Rate-limited API",
    desc: "Requests are rate limited, responses carry hardened security headers, and only approved origins are accepted.",
  },
  {
    icon: Users,
    title: "Team roles",
    desc: "Owner, admin and staff roles control who can invite people and manage your team.",
  },
  {
    icon: Link2,
    title: "On-chain records",
    desc: "On-chain transaction hashes are recorded, so crypto movements can be checked on a block explorer.",
  },
];

export default function TrustSecurity() {
  return (
    <section className="relative border-b border-border">
      <div className="max-w-[1200px] mx-auto border-x border-border">
        <div className="px-6 py-16 sm:py-24">
          {/* Two-tone heading, same construction as the sections above */}
          <h2 className="max-w-3xl text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-[1.2]">
            <span className="font-bold text-foreground">
              Security built into the stack.
            </span>{" "}
            <span className="font-normal text-slate-light">
              Keys, passwords and webhooks are protected by default, from your
              first request.
            </span>
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONTROLS.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
                  <c.icon size={16} className="text-foreground" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
