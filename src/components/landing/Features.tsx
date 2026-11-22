import {
  FlaskConical,
  KeyRound,
  Landmark,
  Link2,
  Users,
  Webhook,
  type LucideIcon,
} from "lucide-react";

/**
 * Feature grid — Anchor-style, on white like the developers section.
 *
 * Desktop: a large isometric illustration bleeds off the left edge; the
 * heading and feature list sit to its right.
 * Phones and tablets: no illustration; the heading, then the features
 * stacked below, each with a line icon above its title.
 *
 * The illustration is an <img>, not inline SVG, on purpose: its gear spin and
 * badge float are CSS inside the file (and stop under reduced motion).
 *
 * Every feature was checked against dexxify-backend/src:
 * - Bank cash-out: POST /payouts sends NGN to a bank account.
 * - Webhooks: signWebhookPayload() HMAC-SHA256 with the endpoint's own secret
 *   (webhooks.service.ts).
 * - API keys: hashApiKey() stores SHA-256 hashes (common/utils).
 * - Test mode: keys are issued as dex_test_ / dex_live_.
 * - Roles: Owner / Admin / Staff, with @Roles guards on team management.
 * - On-chain hashes: tx_hash on the crypto transaction entity.
 */

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Landmark,
    title: "Cash out to your bank",
    desc: "Send Naira from your balance to a Nigerian bank account.",
  },
  {
    icon: Webhook,
    title: "Signed webhooks",
    desc: "Every event is signed with HMAC-SHA256 using your endpoint's own secret.",
  },
  {
    icon: KeyRound,
    title: "Hashed API keys",
    desc: "Keys are stored only as SHA-256 hashes, never in plain text.",
  },
  {
    icon: FlaskConical,
    title: "Test mode",
    desc: "Build against test keys, then switch to live when you're ready.",
  },
  {
    icon: Users,
    title: "Team roles",
    desc: "Owner, admin and staff roles control who can manage your team.",
  },
  {
    icon: Link2,
    title: "On-chain records",
    desc: "Transaction hashes are recorded, so crypto movements can be checked on a block explorer.",
  },
];

export default function Features() {
  return (
    // overflow-x-clip (not hidden): the illustration bleeds off the screen
    // edge without a horizontal scrollbar, and nothing is clipped vertically.
    <section className="relative overflow-x-clip bg-white pb-14 pt-10 lg:flex lg:min-h-[860px] lg:items-center lg:py-28">
      {/* Desktop: 620px wide (680:860), 80px past the left edge, centred
          vertically. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- must be an
          <img> so the SVG's own CSS animation runs */}
      <img
        src="/illustrations/features.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[-80px] top-1/2 hidden w-[620px] -translate-y-1/2 lg:block"
      />

      {/* Content. On desktop the left padding clears the illustration (which
          ends 540px from the screen edge) and the right edge lines up with
          the 1180px column used by the sections above. */}
      <div className="relative w-full px-8 lg:pl-[600px] lg:pr-[max(24px,calc((100%_-_1180px)/2))]">
        {/* PLACEHOLDER HEADING — no copy was supplied; replace when final. */}
        {/* Phones: left-aligned and kept to 60% of the column, so it wraps
            onto a few short lines (as on the reference). */}
        <h2 className="max-w-[60%] text-[30px] font-normal leading-[1.15] tracking-[-0.8px] text-[#0A0A0A] lg:max-w-[560px] lg:text-[46px] lg:leading-[1.18] lg:tracking-[-1px]">
          Everything you need to go live faster.
        </h2>

        {/* One column on phones and at 1024–1279px, where the space beside
            the illustration is only ~400px wide. */}
        <ul className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:mt-12 lg:grid-cols-1 lg:gap-y-8 xl:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f.title} className="border-t border-[#DCDCDC] pt-5">
              <f.icon
                size={20}
                strokeWidth={1.6}
                aria-hidden="true"
                className="text-[#0A0A0A]"
              />
              <h3 className="mt-3 text-[17px] font-normal text-[#0A0A0A] lg:text-[18px] lg:font-medium">
                {f.title}
              </h3>
              <p className="mt-1.5 max-w-[75%] text-[15px] leading-[1.6] text-[#767676] lg:mt-2 lg:max-w-none lg:text-[15px]">
                {f.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
