"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DOCS_URL, PRODUCT_LINKS, type ProductLink } from "@/lib/constants/links";

/** Small "Soon" label for products that aren't available yet. */
function SoonBadge() {
  return (
    <span className="rounded-full bg-[#F2F2F2] px-2 py-0.5 text-[11px] font-medium text-[#767676]">
      Soon
    </span>
  );
}

/**
 * Marketing navbar — black-and-white, Anchor-style layout.
 *
 * Desktop: logo left, nav centred, actions right in a three-column grid.
 * Products opens a dropdown on click; Escape or a click outside
 * closes it. Mobile (<768px): logo plus a menu button that opens a
 * full-height panel, where the dropdown becomes an expandable row.
 *
 * Palette is limited to #0A0A0A, #767676, #F5F5F5, #EEEEEE and white. The font
 * is inherited from the site (no font of its own).
 *
 * There are no product or about pages yet, so those links point at /#…
 * anchors; Pricing likewise until a pricing section exists.
 */

type MenuItem = ProductLink;
type NavEntry =
  | { kind: "link"; label: string; href: string; external?: boolean }
  | { kind: "menu"; label: string; items: MenuItem[] };

const NAV: NavEntry[] = [
  {
    kind: "menu",
    label: "Products",
    items: PRODUCT_LINKS,
  },
  { kind: "link", label: "Developers", href: DOCS_URL, external: true },
  { kind: "link", label: "Pricing", href: "/#pricing" },
  { kind: "link", label: "About", href: "/#about" },
];

const SIGN_IN_HREF = "/login";
const GET_STARTED_HREF = "/register";

// Shared focus ring: visible for keyboard users only.
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]";

// ── Desktop dropdown ─────────────────────────────────────────────────────────

function Dropdown({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Click outside or Escape closes it; Escape returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      // Closes when keyboard focus moves outside the dropdown.
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-md text-[16px] transition-colors duration-200 ${
          open ? "text-[#0A0A0A]" : "text-[#767676] hover:text-[#0A0A0A]"
        } ${FOCUS}`}
      >
        {label}
        <ChevronDown open={open} />
      </button>

      {/* Panel's left edge lines up with the trigger's left edge. */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute left-0 top-full z-50 pt-4"
      >
        {/* shadow-xl matches the dashboard's dropdowns. */}
        <ul className="w-60 rounded-2xl border border-[#EEEEEE] bg-white p-2 shadow-xl">
          {items.map((item) => (
            <li key={item.label}>
              {item.soon ? (
                // Not available yet: shown, but not a link.
                <span className="flex items-center justify-between gap-3 px-4 py-3 text-[16px] text-[#9A9A9A]">
                  {item.label}
                  <SoonBadge />
                </span>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-[16px] text-[#767676] transition-colors duration-150 hover:bg-[#F5F5F5] ${FOCUS}`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Mobile expandable row ────────────────────────────────────────────────────

function MobileGroup({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: MenuItem[];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <li className="border-b border-[#EEEEEE]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between py-4 text-[17px] font-medium text-[#0A0A0A] ${FOCUS}`}
      >
        {label}
        <ChevronDown open={open} />
      </button>
      <ul id={panelId} hidden={!open} className="pb-3">
        {items.map((item) => (
          <li key={item.label}>
            {item.soon ? (
              <span className="flex items-center justify-between gap-3 px-3 py-2.5 text-[15px] text-[#9A9A9A]">
                {item.label}
                <SoonBadge />
              </span>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`block rounded-xl px-3 py-2.5 text-[15px] text-[#767676] hover:bg-[#F5F5F5] hover:text-[#0A0A0A] ${FOCUS}`}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Close the mobile panel once the viewport reaches the desktop breakpoint,
  // so the menu never lingers behind the inline desktop nav.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);

    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock body scroll and allow Escape to dismiss while the panel is open
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    // Not sticky: the bar sits at the top of the page and scrolls away.
    <nav aria-label="Main" className="relative z-50 bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-2 md:grid md:grid-cols-[1fr_auto_1fr] md:px-[48px] md:py-[22px]">
        {/* Logo — the site's existing wordmark. dexxify-tight.png is the
            cropped version: 24px tall on phones, 28px from md. */}
        <Link
          href="/"
          aria-label="Dexxify home"
          className={`inline-flex justify-self-start rounded-md ${FOCUS}`}
        >
          <Image
            src="/logo-set/dexxify-tight.png"
            alt="Dexxify"
            width={1424}
            height={347}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        {/* Centre nav (desktop) */}
        <ul className="hidden items-center gap-9 md:flex">
          {NAV.map((entry) => (
            <li key={entry.label}>
              {entry.kind === "menu" ? (
                <Dropdown label={entry.label} items={entry.items} />
              ) : entry.external ? (
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-md text-[16px] text-[#767676] transition-colors duration-200 hover:text-[#0A0A0A] ${FOCUS}`}
                >
                  {entry.label}
                </a>
              ) : (
                <Link
                  href={entry.href}
                  className={`rounded-md text-[16px] text-[#767676] transition-colors duration-200 hover:text-[#0A0A0A] ${FOCUS}`}
                >
                  {entry.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Actions (desktop) + menu button (mobile) */}
        <div className="flex items-center justify-self-end gap-7">
          <Link
            href={SIGN_IN_HREF}
            className={`hidden rounded-md text-[17px] text-[#767676] transition-colors duration-200 hover:text-[#0A0A0A] md:inline-flex ${FOCUS}`}
          >
            Sign in
          </Link>
          <Link
            href={GET_STARTED_HREF}
            className={`hidden items-center rounded-[16px] bg-[#0A0A0A] px-[34px] py-[15px] text-[17px] font-medium leading-none text-white transition-opacity duration-200 hover:opacity-85 md:inline-flex ${FOCUS}`}
          >
            Get started
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className={`-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-[#0A0A0A] md:hidden ${FOCUS}`}
          >
            {/* Three lines; when open, the outer two cross into an X and the
                middle one fades out. */}
            <span className="relative block h-4 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 block h-[2px] w-6 bg-current transition-transform duration-300 ${
                  open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-[2px] w-6 -translate-y-1/2 bg-current transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-[2px] w-6 bg-current transition-transform duration-300 ${
                  open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile panel — fills the screen below the bar. Positioned from the
          bar (not the viewport) because the bar scrolls with the page. */}
      <div
        id="mobile-menu"
        hidden={!open}
        // Scrolls on its own; keeps smooth scroll from moving the page instead.
        data-lenis-prevent
        className="absolute inset-x-0 top-full h-[calc(100dvh-56px)] overflow-y-auto border-t border-[#EEEEEE] bg-white md:hidden"
      >
        <div className="flex min-h-full flex-col px-5 pb-8 pt-2">
          <ul>
            {NAV.map((entry) =>
              entry.kind === "menu" ? (
                <MobileGroup
                  key={entry.label}
                  label={entry.label}
                  items={entry.items}
                  onNavigate={close}
                />
              ) : (
                <li key={entry.label} className="border-b border-[#EEEEEE]">
                  {entry.external ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={close}
                      className={`block py-4 text-[17px] font-medium text-[#0A0A0A] ${FOCUS}`}
                    >
                      {entry.label}
                    </a>
                  ) : (
                    <Link
                      href={entry.href}
                      onClick={close}
                      className={`block py-4 text-[17px] font-medium text-[#0A0A0A] ${FOCUS}`}
                    >
                      {entry.label}
                    </Link>
                  )}
                </li>
              ),
            )}
          </ul>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Link
              href={GET_STARTED_HREF}
              onClick={close}
              className={`flex items-center justify-center rounded-[16px] bg-[#0A0A0A] py-[15px] text-[17px] font-medium text-white ${FOCUS}`}
            >
              Get started
            </Link>
            <Link
              href={SIGN_IN_HREF}
              onClick={close}
              className={`flex items-center justify-center rounded-[16px] border border-[#EEEEEE] py-[15px] text-[17px] font-medium text-[#0A0A0A] hover:bg-[#F5F5F5] ${FOCUS}`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
