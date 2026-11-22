"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PRODUCT_TABS, type ProductContent, type TileIcon } from "@/lib/content/products";

/**
 * Shared layout for the products page (/products?tab=<slug>), after
 * getanchor.co/products, in black, white and greys:
 * 1. Hero: tab menu overlapping a big rounded panel. Inactive labels tuck
 *    under the panel's edge; the active tab is a pill over it, and its
 *    colour, size and padding animate (0.4s) when the tab changes.
 * 2. API statement.
 * 3. Numbered cards with big illustrations cut off by the card edges.
 * 4. "Your X, your rules" with an illustration panel and 4 tiles.
 *
 * Tabs switch in place: the content swaps instantly, the URL updates
 * (?tab=…), and back/forward work. A tab with no content yet navigates
 * normally instead.
 *
 * No scroll or entrance animations: everything shows straight away. The only
 * motion is the tab pill's transition.
 *
 * Illustrations are plain <img>s so the CSS animation inside the SVGs runs.
 */

const GET_STARTED_HREF = "/register"; // same as the navbar's Get started

// ── Theme ────────────────────────────────────────────────────────────────────
// Every product uses the light theme (light panel, black accent). Numbered
// cards cycle light / dark.
const LIGHT_A = { bg: "#F4F4F4", title: "#0A0A0A", text: "#5C5C5C" };
const LIGHT_B = { bg: "#EAEAEA", title: "#0A0A0A", text: "#5C5C5C" };
const DARK_A = { bg: "#0A0A0A", title: "#E5E5E5", text: "#A3A3A3" };
const DARK_B = { bg: "#262626", title: "#F2F2F2", text: "#A3A3A3" };
const THEME = {
  panel: "#F4F4F4", // hero panel, rules panel
  accent: "#0A0A0A", // hero heading, button, active tab pill
  onAccent: "#F4F4F4", // text on the accent
  text: "#5C5C5C", // hero paragraph
  cards: [LIGHT_A, DARK_A, LIGHT_B, DARK_B],
};

// ── Tile icons (20px, 1.6 stroke) ────────────────────────────────────────────
const ICONS: Record<TileIcon, React.ReactNode> = {
  clock: (<><circle cx="10" cy="10" r="7.5" /><path d="M10 5.5V10l3 2" /></>),
  tag: (<><path d="M3 3h6.5l7.5 7.5-6.5 6.5L3 9.5z" /><circle cx="7" cy="7" r="1.2" /></>),
  coins: (<><ellipse cx="8" cy="6" rx="5" ry="2.5" /><path d="M3 6v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V6" /><path d="M7 14.5c.3 1.2 2.3 2 4.5 2 2.8 0 5-1.1 5-2.5v-4c0-1-1.1-1.9-2.8-2.3" /></>),
  redirect: (<><path d="M4 16V9a4 4 0 0 1 4-4h8" /><path d="M12.5 1.5 16 5l-3.5 3.5" /></>),
  shield: (<><path d="M10 2.5 3.5 5v5c0 4 2.8 6.6 6.5 7.5 3.7-.9 6.5-3.5 6.5-7.5V5z" /><path d="m7 10 2 2 4-4" /></>),
  bell: (<><path d="M5 8a5 5 0 0 1 10 0v4l1.5 2.5h-13L5 12z" /><path d="M8.5 17a1.6 1.6 0 0 0 3 0" /></>),
  users: (<><circle cx="7.5" cy="7" r="3" /><path d="M2 17c.6-3 2.8-4.5 5.5-4.5S12.4 14 13 17" /><path d="M13 4.2a3 3 0 0 1 0 5.6M15 12.8c1.6.6 2.6 2 3 4.2" /></>),
  doc: (<><path d="M5 2.5h7l3.5 3.5v11.5H5z" /><path d="M12 2.5V6h3.5M8 10h5M8 13h5" /></>),
};

function Icon({ name }: { name: TileIcon }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/** Decorative illustration. Plain <img> so SVG animations run. */
function Art(props: { src: string; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see comment above
    <img
      src={props.src}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none ${props.className}`}
    />
  );
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage({
  products,
  initialSlug,
}: {
  products: ProductContent[];
  initialSlug: string;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const p = products.find((x) => x.slug === slug) ?? products[0];
  const t = THEME;

  // Keep the tab in step with back / forward.
  useEffect(() => {
    const onPop = () => {
      const tab = new URLSearchParams(window.location.search).get("tab");
      const next = products.find((x) => x.slug === tab) ?? products[0];
      setSlug(next.slug);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [products]);

  // Update the browser tab title to match (the root layout's template).
  useEffect(() => {
    document.title = `${p.meta.title} - Dexxify`;
  }, [p]);

  // Show another product in place and update the URL.
  const goTo = useCallback(
    (next: string) => {
      if (next === slug) return;
      window.history.pushState(null, "", `/products?tab=${next}`);
      setSlug(next);
    },
    [slug],
  );

  // Switch tabs in place when that product has content; otherwise let the
  // link navigate normally.
  const onTabClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, next: string) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (!products.some((x) => x.slug === next)) return;
      e.preventDefault();
      goTo(next);
    },
    [products, goTo],
  );

  const tabIndex = PRODUCT_TABS.findIndex((x) => x.slug === p.slug);

  return (
    <main className="overflow-x-clip bg-white">
      <Navbar />

      {/* 1 · Hero: tab menu overlapping the panel */}
      <section className="relative mx-auto mt-6 max-w-[1280px] px-6 lg:px-10">
        {/* Phones and tablets: one dark bar with the current product and a
            dot per product (as on Anchor's mobile page). Tap a dot, or the
            bar to go to the next product. */}
        <div
          className="mb-4 flex h-14 items-center justify-between rounded-[15px] px-5 lg:hidden"
          style={{ background: t.accent, color: t.onAccent }}
        >
          <button
            type="button"
            onClick={() => goTo(PRODUCT_TABS[(tabIndex + 1) % PRODUCT_TABS.length].slug)}
            aria-label={`${PRODUCT_TABS[tabIndex]?.label}. Show next product`}
            className="flex items-center gap-3 text-[16px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span aria-hidden="true" className="text-[12px]">›</span>
            {PRODUCT_TABS[tabIndex]?.label}
          </button>
          <div className="flex items-center gap-1" role="group" aria-label="Products">
            {PRODUCT_TABS.map((tab) => {
              const on = tab.slug === p.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => goTo(tab.slug)}
                  aria-label={tab.label}
                  aria-current={on ? "page" : undefined}
                  className="grid h-6 w-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span
                    className={`block h-2 w-2 rounded-full transition-colors duration-300 ${on ? "bg-white" : "bg-[#5C5C5C]"}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: tab menu overlapping the panel's left edge */}
        <nav
          aria-label="Products"
          className="hidden lg:absolute lg:left-10 lg:top-[110px] lg:flex lg:w-[210px] lg:flex-col lg:gap-1"
        >
          {PRODUCT_TABS.map((tab) => {
            const on = tab.slug === p.slug;
            return (
              <a
                key={tab.slug}
                href={`/products?tab=${tab.slug}`}
                onClick={(e) => onTabClick(e, tab.slug)}
                aria-current={on ? "page" : undefined}
                className={`relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-[15px] px-5 py-3 transition-[background-color,color,font-size,padding] duration-[400ms] ease-out lg:h-[68px] ${FOCUS} ${
                  on
                    ? "z-[2] text-[17px] lg:w-[210px] lg:px-7 lg:text-[22px]"
                    : "z-0 text-[15px] text-[#0A0A0A] hover:text-[#767676] lg:px-1 lg:text-[16px]"
                }`}
                style={on ? { background: t.accent, color: t.onAccent } : undefined}
              >
                <span aria-hidden="true" className="text-[0.75em]">›</span>
                {tab.label}
              </a>
            );
          })}
        </nav>

        <div
          className="relative z-[1] flex min-h-[520px] flex-col overflow-hidden rounded-[28px] px-6 pt-10 lg:ml-[130px] lg:min-h-[640px] lg:flex-row lg:items-center lg:pl-20 lg:pr-0 lg:pt-0 xl:pl-[134px]"
          style={{ background: t.panel }}
        >
          {/* Centred on phones, left-aligned on desktop. Narrower between
              1024 and 1280px, where the panel is too narrow for the
              full-size text and illustration side by side. */}
          <div className="relative z-[1] mx-auto flex max-w-[460px] flex-col items-center gap-6 text-center lg:mx-0 lg:max-w-[360px] lg:items-start lg:gap-7 lg:text-left xl:max-w-[460px]">
            <h1
              className="text-[32px] font-normal leading-[1.12] tracking-[-1px] lg:text-[46px] lg:leading-[1.1] lg:tracking-[-1.4px] xl:text-[54px]"
              style={{ color: t.accent }}
            >
              {p.hero.title}
            </h1>
            <p className="max-w-[360px] text-[14px] leading-[1.6] lg:text-[16px]" style={{ color: t.text }}>
              {p.hero.text}
            </p>
            <a
              href={GET_STARTED_HREF}
              className={`w-fit rounded-[15px] px-10 py-4 text-[16px] font-medium transition-opacity hover:opacity-85 lg:px-[46px] lg:py-[18px] lg:text-[18px] ${FOCUS}`}
              style={{ background: t.accent, color: t.onAccent }}
            >
              Get started
            </a>
          </div>
          {/* Huge illustration, cut off by the panel's right and bottom edges
              (on phones, it peeks in from the bottom-right corner) */}
          <Art
            src={p.hero.image}
            className="-mb-10 -mr-10 mt-6 h-[240px] w-auto self-end lg:absolute lg:-bottom-12 lg:-right-14 lg:m-0 lg:h-[380px] xl:h-[540px]"
          />
        </div>
      </section>

      <div key={p.slug}>
        {/* 2 · API statement */}
        <section className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 py-14 lg:flex-row lg:items-end lg:justify-between lg:gap-6 lg:px-0 lg:py-28">
          <h2 className="max-w-[560px] text-[28px] font-normal leading-[1.15] tracking-[-0.8px] text-[#0A0A0A] lg:text-[50px] lg:leading-[1.12] lg:tracking-[-1px]">
            {p.api.title}
          </h2>
          <p className="max-w-[380px] text-[15px] leading-[1.6] text-[#767676]">
            {p.api.text}
          </p>
        </section>

        {/* 3 · Numbered feature cards */}
        <section className="mx-auto flex max-w-[1180px] flex-col gap-5 px-6 lg:px-0">
          {p.features.map((f, i) => {
            const c = t.cards[i % t.cards.length];
            const flip = i % 2 === 1; // even-numbered cards: text right, illustration left
            return (
              <article
                key={f.title}
                className="relative flex min-h-[420px] flex-col overflow-hidden rounded-[22px] px-6 pt-8 lg:block lg:min-h-[310px] lg:px-0 lg:pt-0"
                style={{ background: c.bg }}
              >
                {/* Text alternates sides on every screen size, as on the
                    reference: odd cards left, even cards right-aligned. */}
                <span
                  className={`block text-[15px] lg:absolute lg:top-9 lg:text-[26px] ${flip ? "text-right lg:right-10" : "lg:left-10"}`}
                  style={{ color: c.title }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className={`relative z-[1] mt-3 flex flex-col gap-4 lg:absolute lg:top-[72px] lg:mt-0 lg:max-w-[520px] lg:gap-6 ${
                    flip ? "items-end text-right lg:right-[100px]" : "lg:left-[100px]"
                  }`}
                >
                  <h3
                    className="text-[28px] font-normal leading-[1.1] tracking-[-0.8px] lg:text-[46px] lg:leading-[1.08] lg:tracking-[-1px]"
                    style={{ color: c.title }}
                  >
                    {f.title}
                  </h3>
                  <p className="max-w-[460px] text-[14px] leading-[1.6] lg:text-[15px]" style={{ color: c.text }}>
                    {f.text}
                  </p>
                </div>
                {/* Big illustration, cut off by the card's edges: in the
                    bottom corner opposite the text on phones, beside it on
                    desktop */}
                <Art
                  src={f.image}
                  className={`absolute bottom-0 h-[200px] w-auto translate-y-4 lg:bottom-auto lg:h-[400px] lg:translate-y-0 ${
                    flip ? "-left-8 lg:-left-6 lg:top-[-40px]" : "-right-8 lg:-right-6 lg:top-[-10px]"
                  }`}
                />
              </article>
            );
          })}
        </section>

        {/* 4 · "Your X, your rules" */}
        <section className="mx-auto mt-16 max-w-[1180px] px-6 lg:mt-32 lg:px-0">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-10">
            <div className="flex max-w-[460px] flex-col justify-center gap-5 lg:gap-8">
              <h2 className="text-[28px] font-normal leading-[1.15] tracking-[-0.8px] text-[#0A0A0A] lg:text-[50px] lg:leading-[1.1] lg:tracking-[-1px]">
                {p.rules.title}
              </h2>
              <p className="max-w-[330px] text-[15px] leading-[1.6] text-[#767676] lg:ml-[150px]">
                {p.rules.text}
              </p>
            </div>
            <div className="flex justify-center overflow-hidden rounded-[28px] pt-10 lg:w-[540px]" style={{ background: t.panel }}>
              {/* Extra room at the bottom on phones, where the tiles overlap
                  the panel, so the illustration stays visible above them. */}
              <Art src={p.rules.image} className="mb-12 h-[280px] w-auto translate-y-8 sm:mb-0 lg:h-[440px]" />
            </div>
          </div>

          {/* Tiles: on phones a side-scrolling row that overlaps the bottom
              of the illustration panel (as on the reference); a grid below
              the panel from 640px. */}
          <div
            data-lenis-prevent-horizontal
            className="relative z-[1] -mx-6 -mt-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [scroll-padding-inline:24px] [scrollbar-width:none] sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
          >
            {p.rules.tiles.map((tile, i) => {
              const c = t.cards[i % 2 === 0 ? 2 : 0]; // light card shades
              return (
                <div
                  key={tile.title}
                  className="flex min-h-[240px] w-[78%] shrink-0 snap-start flex-col justify-between rounded-[22px] p-6 sm:w-auto lg:min-h-[280px]"
                  style={{ background: c.bg, color: c.title }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <Icon name={tile.icon} />
                    <p className="max-w-[170px] text-right text-[13px] leading-[1.55]" style={{ color: c.text }}>
                      {tile.text}
                    </p>
                  </div>
                  <h3 className="text-[26px] font-normal tracking-[-0.6px]">{tile.title}</h3>
                </div>
              );
            })}
          </div>

          <a
            href={GET_STARTED_HREF}
            className={`mt-10 inline-flex items-center gap-2 rounded-md text-[15px] font-medium text-[#0A0A0A] hover:underline ${FOCUS}`}
          >
            Get started <span aria-hidden="true">↗</span>
          </a>
        </section>
      </div>

      <div className="h-28" />
      <Footer />
    </main>
  );
}
