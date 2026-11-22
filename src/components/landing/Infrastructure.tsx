"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Products section — a row of tall cards, Anchor-style, black and white.
 *
 * Each card: description at the top, an isometric illustration bleeding off
 * the bottom, and a tab label that overhangs the card by 10px on each side.
 * The row is wider than most screens, so it scrolls sideways (as on the
 * reference). Sits directly under the hero, before the asset marquee.
 *
 * On scroll into view the cards slide in from the right, once, on every
 * screen size. Nothing animates under reduced motion.
 *
 * Illustrations live in public/illustrations/.
 */

type Product = {
  title: string;
  description: string;
  href: string;
  image: string;
  bg: string;
  fg: string;
  tabBg: string;
  tabFg: string;
};

// Order and copy are the section's existing ones. Each card takes the
// colours of the closest illustration. QR Payments has no illustration of its
// own, so it uses the Swap one.
const PRODUCTS: Product[] = [
  {
    title: "Crypto Checkout",
    description:
      "Accept crypto payments with branded checkout pages or payment links created straight from the API.",
    href: "#",
    image: "/illustrations/checkout.svg",
    bg: "#EDEDED",
    fg: "#0A0A0A",
    tabBg: "#0A0A0A",
    tabFg: "#FFFFFF",
  },
  {
    title: "Invoices",
    description: "Create, send and track invoices your customers pay in crypto.",
    href: "#",
    image: "/illustrations/invoices.svg",
    bg: "#DCDCDC",
    fg: "#0A0A0A",
    tabBg: "#FFFFFF",
    tabFg: "#0A0A0A",
  },
  {
    title: "QR Payments",
    description:
      "Every payment session comes with a QR code of its payment link, so customers can scan and pay at the counter.",
    href: "#",
    image: "/illustrations/swap.svg",
    bg: "#0A0A0A",
    fg: "#FFFFFF",
    tabBg: "#E5E5E5",
    tabFg: "#0A0A0A",
  },
  {
    title: "Built-in KYC and compliance",
    description:
      "Verify individuals with BVN, NIN or vNIN, and businesses with their CAC registration.",
    href: "#",
    image: "/illustrations/kyc.svg",
    bg: "#F5F5F5",
    fg: "#0A0A0A",
    tabBg: "#0A0A0A",
    tabFg: "#FFFFFF",
  },
  {
    title: "Payouts",
    description:
      "Send stablecoin and fiat payouts, to wallets or bank accounts, in a single API call.",
    href: "#",
    image: "/illustrations/payouts.svg",
    bg: "#262626",
    fg: "#FFFFFF",
    tabBg: "#F5F5F5",
    tabFg: "#0A0A0A",
  },
];

function ProductCard({ title, description, href, image, bg, fg, tabBg, tabFg }: Product) {
  return (
    <a
      href={href}
      className="group relative block h-[480px] w-[272px] shrink-0 rounded-2xl transition-transform duration-300 motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0A0A0A]"
      style={{ background: bg, color: fg }}
    >
      <div className="relative h-full overflow-hidden rounded-2xl">
        <p className="relative z-[1] px-[30px] pt-[30px] text-[18px] leading-[1.55]">
          {description}
        </p>
        {/* Bleeds off the left, right and bottom edges; clipped by the
            card's rounded corners. */}
        <div className="absolute inset-x-0 bottom-0 h-[300px] transition-transform duration-500 motion-safe:group-hover:scale-[1.03]">
          <Image
            src={image}
            alt=""
            fill
            unoptimized
            sizes="272px"
            className="object-cover object-bottom"
          />
        </div>
      </div>

      {/* Tab label: overhangs the card by 10px on each side. */}
      <h3
        className="absolute -left-[10px] -right-[10px] bottom-[14px] flex h-[76px] items-center rounded-xl px-[30px] text-[20px] font-normal"
        style={{
          background: tabBg,
          color: tabFg,
          border: tabBg === "#FFFFFF" ? "1px solid #E5E5E5" : undefined,
        }}
      >
        {title}
      </h3>
    </a>
  );
}

// How far right each card starts, as a percentage of its own width. The first
// card travels furthest, so the cards arrive as a fanned deck.
const SLIDE_FROM = [500, 400, 300, 300, 200];

export default function Infrastructure() {
  const rowRef = useRef<HTMLDivElement>(null);

  // Entrance animation, plays once, the same on every screen size: the cards
  // slide in from the right, one after another, and settle with a slight
  // bounce. gsap.matchMedia reverts it if the motion preference changes.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>(
            "[data-product-card]",
            rowRef.current,
          );
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 60%",
              once: true,
            },
          });
          cards.forEach((card, i) => {
            tl.fromTo(
              card,
              { xPercent: SLIDE_FROM[i] ?? 200, opacity: 0 },
              { xPercent: 0, opacity: 1, duration: 1.5, ease: "back.out(1.2)" },
              i === 0 ? 0 : "<0.25", // 0.25s after the previous card starts
            );
          });
        },
      );
    },
    { scope: rowRef },
  );

  return (
    // No top padding: the cards sit directly under the hero's brick band.
    // overflow-x-clip (not hidden) keeps off-screen cards from adding a page
    // scrollbar without clipping anything vertically.
    <section aria-label="Products" className="relative overflow-x-clip sm:pb-10">
      {/* Sideways-scrolling row. Side padding lines the first card up with
          the page's 1200px content column (24px gutter) plus 10px so the
          tabs' overhang isn't clipped. pt/pb leave room for the hover lift.
          The smooth-scroll library leaves horizontal gestures here to the
          browser. */}
      <div
        ref={rowRef}
        data-lenis-prevent-horizontal
        className="flex gap-9 overflow-x-auto px-[max(34px,calc((100%_-_1200px)/2_+_34px))] pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PRODUCTS.map((p, i) => (
          // GSAP moves this wrapper, not the card: the card's CSS transition
          // (for the hover lift) would otherwise smear every animation frame.
          // Earlier cards sit on top while they overlap mid-flight.
          <div
            key={p.title}
            data-product-card
            className="relative shrink-0"
            style={{ zIndex: PRODUCTS.length - i }}
          >
            <ProductCard {...p} />
          </div>
        ))}
      </div>
    </section>
  );
}
