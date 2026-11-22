"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DOCS_URL } from "@/lib/constants/links";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Developers — Anchor-style, black and white. Copy and docs button on the
 * left, a tilted code window on the right, and a wall of pale bricks below
 * with four "code pills" that fall into it when it scrolls into view.
 *
 * Claims checked against dexxify-backend/src: POST /api/v1/payment-sessions
 * takes amount, currency, title, expires_in_minutes and metadata
 * (payment-sessions/dto); /payouts, /swaps and /kyc exist; webhooks are
 * HMAC-SHA256 signed (signWebhookPayload, webhooks.service.ts) and API keys
 * stored as SHA-256 hashes (hashApiKey, common/utils). Keys are prefixed
 * dex_test_ / dex_live_; the one shown here is masked.
 */

// ── Code window ──────────────────────────────────────────────────────────────

type Tok = [text: string, colour?: string];
const KEY = "#FFFFFF"; // keys and commands
const STR = "#9A9A9A"; // strings and values
const PUN = "#5C5C5C"; // punctuation and flags

// "Create a payment session", as in the docs.
const CODE: Tok[][] = [
  [["curl ", KEY], ["--request ", PUN], ["POST ", KEY], ["\\", PUN]],
  [["  --url ", PUN], ["https://api.dexxify.com/api/v1/payment-sessions ", STR], ["\\", PUN]],
  [["  --header ", PUN], ["'Authorization: Bearer dex_test_••••••••' ", STR], ["\\", PUN]],
  [["  --header ", PUN], ["'Content-Type: application/json' ", STR], ["\\", PUN]],
  [["  --data ", PUN], ["'{", PUN]],
  [['    "amount"', KEY], [": ", PUN], ["50000", STR], [",", PUN]],
  [['    "currency"', KEY], [": ", PUN], ['"NGN"', STR], [",", PUN]],
  [['    "title"', KEY], [": ", PUN], ['"Payment for Order #1234"', STR], [",", PUN]],
  [['    "expires_in_minutes"', KEY], [": ", PUN], ["30", STR], [",", PUN]],
  [['    "metadata"', KEY], [": { ", PUN], ['"order_id"', KEY], [": ", PUN], ['"ord_xyz"', STR], [" }", PUN]],
  [["  }'", PUN]],
];

function CodeWindow() {
  return (
    // The tilt lives here; GSAP animates the wrapper around this, so its
    // transforms never replace the tilt.
    <div className="w-full overflow-hidden rounded-[22px] border-[6px] border-[#1C1C1C] bg-[#0A0A0A] shadow-[0_40px_80px_rgba(0,0,0,0.18)] [transform:perspective(1200px)_rotateX(4deg)_rotateY(-6deg)_rotateZ(-2deg)]">
      <div className="flex items-end gap-4 bg-[#141414] px-4 pt-3">
        <span className="flex gap-[7px] pb-3" aria-hidden="true">
          {["#5C5C5C", "#7A7A7A", "#9A9A9A"].map((c) => (
            <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="rounded-t-[10px] bg-[#0A0A0A] px-5 py-[10px] text-[14px] font-medium text-white">
          create-session.sh
        </span>
      </div>
      {/* Scrolls sideways on small screens; the smooth-scroll library leaves
          horizontal gestures here to the browser. */}
      <pre
        data-lenis-prevent-horizontal
        className="overflow-x-auto py-5 font-mono text-[12px] leading-[1.75] lg:text-[13px]"
      >
        <code>
          {CODE.map((line, i) => (
            <div key={i} className="flex">
              <span
                aria-hidden="true"
                className="w-11 shrink-0 select-none pr-4 text-right text-[#3D3D3D]"
              >
                {i + 1}
              </span>
              <span className="whitespace-pre pr-6">
                {line.map(([text, colour], j) => (
                  <span key={j} style={{ color: colour }}>
                    {text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// ── Brick wall and pills ─────────────────────────────────────────────────────

type Pill = { id: string; parts: Tok[]; bg: string; rot: number; lift: number };

const PILLS: Pill[] = [
  { id: "checkout", parts: [["<Checkout/>", "#FFFFFF"]], bg: "#0A0A0A", rot: -11.5, lift: -45 },
  { id: "payout", parts: [["await ", "#767676"], ["createPayout()", "#0A0A0A"]], bg: "#DCDCDC", rot: 7, lift: 0 },
  { id: "swap", parts: [["export ", "#767676"], ["({Swap})", "#0A0A0A"]], bg: "#EDEDED", rot: 2, lift: 0 },
  { id: "webhooks", parts: [["Webhooks", "#FFFFFF"]], bg: "#262626", rot: 0, lift: 0 },
];
const PILL_BY_ID = Object.fromEntries(PILLS.map((p) => [p.id, p]));

// Wall rows: numbers are empty bricks (width in px), strings are pill ids.
const ROWS: (number | string)[][] = [
  [180, "checkout", "payout", 200],
  [170, 110, "swap", 260, 180],
  [210, 190, "webhooks", 200, 210],
];

// Below 1024px the whole wall is drawn at this scale (widths and the
// checkout pill's lift), so it keeps the desktop arrangement, as on the
// Anchor mobile reference.
const MOBILE_SCALE = 0.3;

function PillView({ p }: { p: Pill }) {
  return (
    <span
      data-dev-pill
      data-rot={p.rot}
      data-lift={p.lift}
      // Final resting place, from the CSS variables (scaled lift on phones).
      // GSAP animates to these same values.
      className="relative z-[1] flex h-9 w-[150px] shrink-0 items-center rounded-lg px-3 text-[12px] [transform:translateY(calc(var(--lift)*0.3))_rotate(var(--rot))] lg:h-[82px] lg:w-[495px] lg:rounded-[15px] lg:px-8 lg:text-[24px] lg:[transform:translateY(var(--lift))_rotate(var(--rot))]"
      style={
        {
          background: p.bg,
          "--lift": `${p.lift}px`,
          "--rot": `${p.rot}deg`,
        } as React.CSSProperties
      }
    >
      {p.parts.map(([text, colour], i) => (
        <span key={i} className="whitespace-pre" style={{ color: colour }}>
          {text}
        </span>
      ))}
    </span>
  );
}

// How much further than its final tilt each pill starts spun (degrees).
const EXTRA_SPIN = [65, -55, 80, -50];

// ── Section ──────────────────────────────────────────────────────────────────

export default function Developers() {
  const sectionRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Every screen size: the code window settles in, and the pills fall
      // into the wall. Phones use the wall's scaled-down lift.
      mm.add(
        {
          desktop: "(min-width: 1024px)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop, motion } = ctx.conditions ?? {};
          if (!motion) return;
          const scale = desktop ? 1 : MOBILE_SCALE;

          gsap.fromTo(
            "[data-dev-window]",
            { y: 40, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1.2,
              ease: "expo.out",
              scrollTrigger: { trigger: topRef.current, start: "top 80%", once: true },
            },
          );

          const pills = gsap.utils.toArray<HTMLElement>("[data-dev-pill]");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: wallRef.current, start: "top 75%", once: true },
          });
          pills.forEach((pill, i) => {
            const rot = Number(pill.dataset.rot ?? 0);
            const lift = Number(pill.dataset.lift ?? 0) * scale;
            const at = i * 0.15;
            // Drop and spin into place with an elastic landing…
            tl.fromTo(
              pill,
              { y: lift - window.innerHeight * 1.2, rotation: rot + (EXTRA_SPIN[i] ?? 60) },
              { y: lift, rotation: rot, duration: 2.2, ease: "elastic.out(0.75, 0.45)" },
              at,
            );
            // …and fade in on a plain curve, so the elastic ease can't make
            // the opacity flicker. Hidden while waiting, so pills parked above
            // the wall never show over the section above.
            tl.fromTo(
              pill,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.3, ease: "none" },
              at,
            );
          });
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    // overflow-x-clip: pills and wide brick rows never cause a horizontal
    // scrollbar, without clipping anything vertically.
    <section ref={sectionRef} className="overflow-x-clip pb-10 pt-14 lg:pt-24">
      {/* Top: copy left, tilted code window right (stacked on phones) */}
      <div
        ref={topRef}
        className="mx-auto flex max-w-[1180px] flex-col gap-10 px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-0"
      >
        <div className="flex max-w-[420px] flex-col gap-4 lg:gap-[22px]">
          <h2 className="text-[28px] font-normal leading-[1.15] tracking-[-0.8px] text-[#0A0A0A] lg:text-[58px] lg:leading-[1.1] lg:tracking-[-1.4px]">
            Built for developers, by developers.
          </h2>
          <p className="text-[14px] leading-[1.6] text-[#767676] lg:text-[16px]">
            One REST API for checkout, payouts, swaps and KYC, with signed
            webhooks and hashed keys by default.
          </p>
          {/* Fits its label on phones; full column width on desktop. */}
          <a
            href={DOCS_URL}
            className="mt-2 self-start rounded-2xl bg-[#0A0A0A] px-8 py-3.5 text-center text-[15px] font-medium text-white transition-colors hover:bg-[#262626] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A] lg:mt-0 lg:self-stretch lg:px-10 lg:py-4 lg:text-[17px]"
          >
            View docs
          </a>
        </div>
        <div data-dev-window className="w-full max-w-[560px]">
          <CodeWindow />
        </div>
      </div>

      {/* Brick wall with the code pills landed in it. Decorative: the pills
          restate the copy above. */}
      <div
        ref={wallRef}
        aria-hidden="true"
        className="mt-12 flex flex-col gap-1.5 lg:mt-28 lg:gap-[14px]"
      >
        {ROWS.map((row, r) => (
          // Rows are wider than a phone screen; they stay centred and run off
          // both edges (clipped by the section).
          <div key={r} className="flex justify-center gap-1.5 lg:gap-[14px]">
            {row.map((cell, i) =>
              typeof cell === "number" ? (
                <span
                  key={i}
                  className="h-9 w-[calc(var(--w)*0.3)] shrink-0 rounded-lg bg-[#F2F2F2] lg:h-[82px] lg:w-(--w) lg:rounded-[15px]"
                  style={{ "--w": `${cell}px` } as React.CSSProperties}
                />
              ) : (
                <PillView key={cell} p={PILL_BY_ID[cell]} />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
