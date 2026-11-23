"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ABOUT } from "@/lib/content/about";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

/**
 * About page, after getanchor.co/company/about-us, in black, white and greys:
 * 1. Pinned hero: two-tone headline; a small centre card grows as you scroll,
 *    then its caption and the side texts come in; afterwards the card
 *    crossfades through use cases.
 * 2. Brick wall with "Our mission" / "Our why" pills and text panels.
 * 3. Call to action. 4. Supported-assets marquee. 5. "Latest" docs carousel.
 *
 * Animation rules:
 * - Text that animates starts hidden only when motion is allowed
 *   (motion-safe:invisible) and is revealed by its own animation, so nothing
 *   flashes in place before animating, and reduced motion shows it as is.
 * - The pin is desktop-only. Lenis drives ScrollTrigger
 *   (SmoothScrollProvider), so the pin and scrub follow the smooth scroll.
 * - Arrows are drawn icons, not text characters (iPhones show those as
 *   emoji).
 *
 * Illustrations are plain <img>s so the CSS animation inside the SVGs runs.
 */

const INK = "#0A0A0A";
const BRICK = "#F2F2F2";
const FADE_MS = 1500; // slide crossfade
const HOLD_MS = 2400; // time each slide stays fully shown

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]";

/* eslint-disable @next/next/no-img-element -- decorative SVGs with their own CSS animation */

// ── Shared text animations ───────────────────────────────────────────────────

function useTextAnimations(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: "(max-width: 1023px)" }, (ctx) => {
        const { motion, mobile } = ctx.conditions ?? {};
        if (!motion) return;
        // On phones the hero and the wall pin together; triggers inside that
        // block must say so, so their positions account for the pin.
        const pinned = (el: HTMLElement) =>
          mobile ? (el.closest<HTMLElement>("[data-pin-wrap]") ?? undefined) : undefined;

        // Paragraphs: each line slides up.
        gsap.utils.toArray<HTMLElement>("[data-paragraph-anim]").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(el, { visibility: "visible" });
              return gsap.from(self.lines, {
                opacity: 0,
                yPercent: 100,
                duration: 1.2,
                delay: 0.2,
                ease: "expo.out",
                stagger: 0.2,
                scrollTrigger: { trigger: el, start: "top 75%", once: true, pinnedContainer: pinned(el) },
              });
            },
          });
        });

        // Simple fade in (the hero headline and the call to action).
        gsap.utils.toArray<HTMLElement>("[data-fade-anim]").forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 1.2,
              ease: "power1.out",
              scrollTrigger: { trigger: el, start: "top 85%", once: true, pinnedContainer: pinned(el) },
            },
          );
        });

        // Wall pills drop into their row with a small bounce.
        gsap.utils.toArray<HTMLElement>("[data-wall-pill]").forEach((el) => {
          gsap.fromTo(
            el,
            { y: -80, rotate: -6, autoAlpha: 0 },
            {
              y: 0,
              rotate: 0,
              autoAlpha: 1,
              duration: 1.4,
              ease: "elastic.out(0.75, 0.5)",
              scrollTrigger: { trigger: el, start: "top 80%", once: true, pinnedContainer: pinned(el) },
            },
          );
        });
      });
    },
    { scope },
  );
}

// ── Small pieces ─────────────────────────────────────────────────────────────

function DotLabel({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-6">
      <span className="h-px flex-1 bg-[#EAEAEA]" />
      <span className="flex items-center gap-[10px] text-[16px] text-[#0A0A0A] lg:text-[17px]">
        <span className="h-3 w-3 rounded-full lg:h-[14px] lg:w-[14px]" style={{ background: dark ? INK : "#BDBDBD" }} />
        {children}
      </span>
      <span className="h-px flex-1 bg-[#EAEAEA]" />
    </div>
  );
}

// ── 1. Pinned hero ───────────────────────────────────────────────────────────

// Desktop: the grown card is Anchor's 39.2% × 35.8vw, capped so the card and
// its caption stay on screen.
const cardH = () => Math.min(window.innerWidth * 0.358, window.innerHeight - 430);
const cardW = () => Math.min(window.innerWidth * 0.392, cardH() * 1.12);

// Phones (from Anchor's mobile code): three 85px tiles in a 275px row grow
// into a full-width 280px card with two squares under it, 12px apart.
const M_TILE = 85;
const M_ROW = 275;
const M_CARD_H = 280;
const M_GAP = 12;

/** One picture tile that crossfades to whichever slide `show` points at. */
function SlideTile({ show, fade, className, dataAttr }: { show: number; fade: string; className: string; dataAttr?: Record<string, true> }) {
  return (
    <div aria-hidden="true" className={`overflow-hidden rounded-2xl ${className}`} {...dataAttr}>
      {ABOUT.slides.map((s, i) => (
        <img
          key={s.name}
          src={s.image}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${fade}`}
          style={{ background: s.tile, opacity: i === show ? 1 : 0 }}
        />
      ))}
    </div>
  );
}

/** The caption bar inside the card: slide name, progress bars, line. */
function Caption({ active, className, dataAttr }: { active: number; className: string; dataAttr: Record<string, true> }) {
  const slides = ABOUT.slides;
  return (
    <div aria-live="polite" className={`absolute flex rounded-xl bg-white motion-safe:invisible ${className}`} {...dataAttr}>
      <div className="flex min-w-[180px] flex-col gap-3">
        <span className="flex items-center gap-2 text-[14px] text-[#0A0A0A]">
          <span className="h-[7px] w-[7px] rounded-full bg-[#0A0A0A]" />
          {slides[active].name}
        </span>
        <span className="flex" aria-hidden="true">
          {slides.map((s, i) => (
            <span
              key={s.name}
              className="h-[2px] w-[40px] transition-colors duration-300 lg:w-[48px]"
              style={{ background: i === active ? INK : "#E5E5E5" }}
            />
          ))}
        </span>
      </div>
      <span className="max-w-[260px] text-[13px] leading-[1.5] text-[#767676] lg:text-right">{slides[active].line}</span>
    </div>
  );
}

function Hero() {
  const root = useRef<HTMLElement>(null);
  const slides = ABOUT.slides;
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Crossfade carousel. Starts when the pin ends, or straight away under
  // reduced motion; stops if you scroll back into the pin.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % n), HOLD_MS + FADE_MS);
    return () => window.clearInterval(id);
  }, [playing, n]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop: pin; the centre tile grows, then caption and side texts.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-d-side-text]", { autoAlpha: 0, y: 30 });
        gsap.set("[data-d-caption]", { yPercent: 140, autoAlpha: 0 });
        gsap.set("[data-d-art]", { scale: 0.62 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=1000",
            scrub: 3,
            pin: true,
            invalidateOnRefresh: true,
            onLeave: () => setPlaying(true),
            onEnterBack: () => setPlaying(false),
          },
        });
        tl.to("[data-intro]", { y: -16, autoAlpha: 0, duration: 0.5, ease: "power1.out" })
          .fromTo("[data-d-center]", { width: 150, height: 150 }, { width: cardW, height: cardH, duration: 1, ease: "power1.out" }, "<")
          .to("[data-d-art]", { scale: 1, duration: 1, ease: "power1.out" }, "<")
          .to("[data-d-side-left]", { x: -24, duration: 1, ease: "power1.out" }, "<")
          .to("[data-d-side-right]", { x: 24, duration: 1, ease: "power1.out" }, "<")
          .to("[data-d-caption]", { yPercent: 0, autoAlpha: 1, duration: 1, ease: "power1.out" }, ">")
          .to("[data-d-side-text]", { autoAlpha: 1, y: 0, duration: 1.5, stagger: 0.35, ease: "power1.out" }, ">");
      });

      // Desktop with reduced motion: no pin; the card shows at full size.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: reduce)", () => {
        const size = () => gsap.set("[data-d-center]", { width: cardW(), height: cardH() });
        size();
        window.addEventListener("resize", size);
        setPlaying(true);
        return () => window.removeEventListener("resize", size);
      });

      // ── Phones and tablets, as on Anchor's mobile page: the hero and the
      // brick wall pin together. The three small tiles in a row become the
      // big card with two squares under it, then the texts and the caption
      // come in. Meanwhile the wall, which starts just under the small row
      // (as on Anchor, "Our mission" is visible before you scroll), slides
      // down into place. The pin lasts exactly as long as that slide, so the
      // page below neither jumps nor gets a gap when it ends. The finished
      // layout is the page's own CSS, so reduced motion simply shows it.
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        const hero = root.current;
        const stage = hero?.querySelector<HTMLElement>("[data-m-stage]");
        const left = hero?.querySelector<HTMLElement>("[data-m-left-text]");
        const wrap = hero?.closest<HTMLElement>("[data-pin-wrap]");
        const wall = wrap?.querySelector<HTMLElement>("[data-wall]");
        if (!hero || !stage || !left || !wrap || !wall) return;

        const W = () => stage.offsetWidth;
        const S = () => (W() - M_GAP) / 2; // final square size
        // Starting row, centred in the stage
        const rowX = () => (W() - M_ROW) / 2;
        // Lift the stage up into the space the left text will fill, so the
        // row starts right under the headline
        const lift = () => -(left.offsetHeight + parseFloat(getComputedStyle(stage).marginTop));

        // The wall starts lifted so "Our mission" sits WALL_GAP below the
        // small row (over the hero's still-empty, reserved space), and slides
        // down to its own place. All measured from layout
        // (offsetTop/offsetHeight), which transforms don't affect.
        const WALL_MT = 40; // the wall's own mt-10
        const WALL_GAP = 110; // Anchor's space under the row before scrolling
        const rowBottom = () => stage.offsetTop + lift() + M_TILE;
        const wallStart = () => rowBottom() + WALL_GAP - hero.offsetHeight;
        const slide = () => Math.max(0, WALL_MT - wallStart());

        gsap.set("[data-m-side-text]", { autoAlpha: 0, y: 24 });
        gsap.set("[data-m-caption]", { yPercent: 140, autoAlpha: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrap,
            pin: wrap,
            start: "top top",
            end: () => `+=${slide()}`,
            scrub: 3,
            invalidateOnRefresh: true,
            onLeave: () => setPlaying(true),
            onEnterBack: () => setPlaying(false),
          },
        });
        // Moved with a transform, not its margin: a pinned block's height is
        // fixed while it's pinned, so growing it would spill over the next
        // section once the pin ends.
        tl.fromTo(wall, { y: () => -slide() }, { y: 0, duration: 1.5, ease: "power1.out" }, 0)
          .fromTo(stage, { y: lift }, { y: 0, duration: 1.5, ease: "power1.out" }, 0)
          .fromTo(
            "[data-m-center]",
            { left: () => (W() - M_TILE) / 2, top: 0, width: M_TILE, height: M_TILE },
            { left: 0, top: 0, width: W, height: M_CARD_H, duration: 1.5, ease: "power1.out" },
            "<",
          )
          .fromTo("[data-m-art]", { scale: 0.6 }, { scale: 1, duration: 1.5, ease: "power1.out" }, "<")
          .fromTo(
            "[data-m-tile-left]",
            { left: rowX, top: 0, width: M_TILE, height: M_TILE },
            { left: 0, top: M_CARD_H + M_GAP, width: S, height: S, duration: 1.5, ease: "power1.out" },
            "<",
          )
          .fromTo(
            "[data-m-tile-right]",
            { left: () => rowX() + M_ROW - M_TILE, top: 0, width: M_TILE, height: M_TILE },
            { left: () => W() - S(), top: M_CARD_H + M_GAP, width: S, height: S, duration: 1.5, ease: "power1.out" },
            "<",
          )
          .to("[data-m-side-text]", { autoAlpha: 1, y: 0, duration: 1.5, stagger: 0.35, ease: "power1.out" }, "-=0.5")
          .to("[data-m-caption]", { yPercent: 0, autoAlpha: 1, duration: 1.5, ease: "power1.out" }, "<");
      });

      // Phones and tablets with reduced motion: the finished layout, no pin.
      mm.add("(max-width: 1023px) and (prefers-reduced-motion: reduce)", () => {
        setPlaying(true);
      });
    },
    { scope: root },
  );

  const prev = (active - 1 + n) % n;
  const next = (active + 1) % n;
  const fade = "transition-opacity duration-[1500ms] motion-reduce:transition-none";

  return (
    <section ref={root} className="relative flex flex-col items-center overflow-hidden px-6 pb-12 pt-12 lg:min-h-screen lg:pb-0 lg:pt-16">
      <h1
        data-fade-anim
        className="max-w-[760px] text-center text-[38px] font-normal leading-[1.08] tracking-[-1.5px] text-[#0A0A0A] motion-safe:invisible lg:text-[58px]"
      >
        {ABOUT.headline[0]} <span className="text-[#B5B5B5]">{ABOUT.headline[1]}</span> {ABOUT.headline[2]}
      </h1>
      {/* Desktop only, like Anchor's (their phone hero has no intro line) */}
      <p data-intro className="mt-5 hidden max-w-[460px] text-center text-[16px] leading-[1.6] text-[#767676] lg:block">
        {ABOUT.intro}
      </p>

      {/* ── Desktop ── side texts beside the card, picture row below */}
      <div className="hidden lg:contents">
        <div
          data-d-side-text
          className="absolute left-[5%] top-[34%] w-[22%] max-w-[340px] motion-safe:invisible xl:w-auto"
        >
          <p className="flex items-center gap-2 text-[15px] text-[#0A0A0A]">
            <span className="h-[10px] w-[10px] rounded-full bg-[#0A0A0A]" />
            {ABOUT.left.label}
          </p>
          <p className="mt-4 text-[34px] leading-[1.18] tracking-[-0.6px] text-[#0A0A0A] xl:text-[40px]">{ABOUT.left.text}</p>
        </div>
        <div
          data-d-side-text
          className="absolute right-[5%] top-[44%] w-[22%] max-w-[300px] motion-safe:invisible xl:w-auto"
        >
          <p className="text-[12px] text-[#767676]">{ABOUT.right.label}</p>
          <p className="mt-4 text-[22px] leading-[1.3] text-[#0A0A0A] xl:text-[26px]">{ABOUT.right.text}</p>
        </div>

        <div className="mt-10 flex w-full items-end justify-center gap-[14px]">
          <SlideTile show={prev} fade={fade} className="relative h-[120px] w-[120px] shrink-0" dataAttr={{ "data-d-side-left": true }} />
          <div data-d-center className="relative h-[150px] w-[150px] shrink-0 overflow-hidden rounded-[22px]">
            {slides.map((s, i) => (
              <div key={s.name} aria-hidden="true" className={`absolute inset-0 ${fade}`} style={{ background: s.tile, opacity: i === active ? 1 : 0 }}>
                <img data-d-art src={s.image} alt="" className="absolute inset-x-0 top-0 mx-auto h-[78%] w-auto" />
              </div>
            ))}
            <Caption
              active={active}
              dataAttr={{ "data-d-caption": true }}
              className="inset-x-6 bottom-6 flex-row items-center justify-between gap-6 px-5 py-4"
            />
          </div>
          <SlideTile show={next} fade={fade} className="relative h-[120px] w-[120px] shrink-0" dataAttr={{ "data-d-side-right": true }} />
        </div>
      </div>

      {/* ── Phones and tablets ── left text, stage (card + two squares),
          right text. This CSS is the finished layout. */}
      <div className="mt-8 flex w-full max-w-[340px] flex-col sm:max-w-[420px] lg:hidden">
        <div data-m-left-text data-m-side-text className="motion-safe:invisible">
          <p className="flex items-center gap-2 text-[13px] text-[#0A0A0A]">
            <span className="h-[9px] w-[9px] rounded-full bg-[#0A0A0A]" />
            {ABOUT.left.label}
          </p>
          <p className="mt-3 text-[24px] leading-[1.2] tracking-[-0.5px] text-[#0A0A0A]">{ABOUT.left.text}</p>
        </div>

        <div
          data-m-stage
          className="relative mt-7 h-[calc(292px+(min(100vw-48px,340px)-12px)/2)] w-full sm:h-[calc(292px+(420px-12px)/2)]"
        >
          <div data-m-center className="absolute left-0 top-0 h-[280px] w-full overflow-hidden rounded-[22px]">
            {slides.map((s, i) => (
              <div key={s.name} aria-hidden="true" className={`absolute inset-0 ${fade}`} style={{ background: s.tile, opacity: i === active ? 1 : 0 }}>
                <img data-m-art src={s.image} alt="" className="absolute inset-x-0 top-0 mx-auto h-[78%] w-auto" />
              </div>
            ))}
            <Caption
              active={active}
              dataAttr={{ "data-m-caption": true }}
              className="inset-x-3 bottom-3 flex-col items-start gap-2 px-4 py-3"
            />
          </div>
          <SlideTile
            show={prev}
            fade={fade}
            className="absolute left-0 top-[292px] aspect-square w-[calc(50%-6px)]"
            dataAttr={{ "data-m-tile-left": true }}
          />
          <SlideTile
            show={next}
            fade={fade}
            className="absolute left-[calc(50%+6px)] top-[292px] aspect-square w-[calc(50%-6px)]"
            dataAttr={{ "data-m-tile-right": true }}
          />
        </div>

        <div data-m-side-text className="mt-8 motion-safe:invisible">
          <p className="text-[12px] text-[#767676]">{ABOUT.right.label}</p>
          <p className="mt-3 text-[22px] leading-[1.3] text-[#0A0A0A]">{ABOUT.right.text}</p>
        </div>
      </div>
    </section>
  );
}

// ── 2. Brick wall ────────────────────────────────────────────────────────────

/** A desktop row of bricks: numbers are brick widths, -1 is a flexible gap. */
function BrickRow({ cells }: { cells: number[] }) {
  return (
    <div aria-hidden="true" className="hidden gap-[10px] lg:flex">
      {cells.map((w, i) =>
        w < 0 ? (
          <span key={i} className="flex-1" />
        ) : (
          <span key={i} className="h-[76px] shrink-0 rounded-[15px]" style={{ width: w, background: BRICK }} />
        ),
      )}
    </div>
  );
}

function Wall() {
  return (
    <section data-wall className="mt-10 flex flex-col gap-[10px] overflow-x-clip">
      <BrickRow cells={[180, -1, 460]} />
      <BrickRow cells={[460, -1, 460]} />
      {ABOUT.blocks.map((b, bi) => (
        <div key={b.label} className="flex flex-col gap-[10px]">
          {/* Pill row. Phones (as on the reference): the pill with bricks
              running off the right edge. Desktop: a brick, the pill, three
              bricks. */}
          <div className="flex gap-[10px] pl-6 lg:pl-0">
            <span aria-hidden="true" className="hidden h-[76px] w-[72px] shrink-0 rounded-[15px] lg:block" style={{ background: BRICK }} />
            <h2
              data-wall-pill
              className="flex h-14 w-[62%] max-w-[306px] shrink-0 items-center justify-between rounded-[15px] bg-[#0A0A0A] px-6 text-[20px] font-normal text-white lg:h-[76px] lg:w-[306px] lg:px-7 lg:text-[28px]"
            >
              {b.label}
              <span aria-hidden="true" className="h-3 w-3 rounded-full bg-white lg:h-[14px] lg:w-[14px]" />
            </h2>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`h-14 w-[140px] shrink-0 rounded-[15px] lg:h-[76px] lg:w-auto lg:flex-1 lg:shrink ${i > 0 ? "hidden lg:block" : ""}`}
                style={{ background: BRICK }}
              />
            ))}
          </div>
          {/* Text panel, with a sliver of brick at each screen edge on phones
              and full bricks on desktop. */}
          <div className="flex gap-[10px]">
            <span aria-hidden="true" className="w-[14px] shrink-0 rounded-r-[15px] lg:w-[72px] lg:rounded-[15px]" style={{ background: BRICK }} />
            <div className="relative flex flex-1 flex-col gap-5 rounded-[15px] bg-[#F7F7F7] px-6 py-8 lg:px-20 lg:py-14">
              {b.text.map((t, i) => (
                <p
                  key={i}
                  data-paragraph-anim
                  className="max-w-[840px] text-[16px] leading-[1.55] text-[#0A0A0A] motion-safe:invisible lg:text-[17px]"
                >
                  {t}
                </p>
              ))}
              <img
                src={b.icon}
                alt=""
                aria-hidden="true"
                className="h-[56px] w-auto self-end lg:absolute lg:bottom-3 lg:right-5 lg:h-[70px]"
              />
            </div>
            <span aria-hidden="true" className="w-[14px] shrink-0 rounded-l-[15px] lg:w-[72px] lg:rounded-[15px]" style={{ background: BRICK }} />
          </div>
          {bi === ABOUT.blocks.length - 1 && <BrickRow cells={[300, 300, 300, 300, -1, 72]} />}
        </div>
      ))}
    </section>
  );
}

// ── 3. Call to action ────────────────────────────────────────────────────────

function Cta() {
  const c = ABOUT.cta;
  return (
    <section className="mx-auto mt-24 max-w-[1400px] px-6 lg:mt-32">
      <DotLabel dark>{c.label}</DotLabel>
      <div className="mt-12 flex flex-col items-center text-center lg:mt-16">
        <h2
          data-fade-anim
          className="max-w-[560px] text-[32px] font-normal leading-[1.15] tracking-[-1px] text-[#0A0A0A] motion-safe:invisible lg:text-[46px]"
        >
          {c.title}
        </h2>
        <p data-fade-anim className="mt-4 text-[16px] text-[#767676] motion-safe:invisible lg:text-[18px]">
          {c.text}
        </p>
        <a
          href={c.href}
          className={`mt-9 rounded-xl bg-[#0A0A0A] px-9 py-4 text-[16px] font-medium text-white transition-colors hover:bg-[#262626] ${FOCUS}`}
        >
          {c.button}
        </a>
      </div>
    </section>
  );
}

// ── 4. Marquee ───────────────────────────────────────────────────────────────

function Marquee() {
  const items = ABOUT.marquee.items;
  return (
    <section className="mt-20 lg:mt-24">
      <div className="px-6">
        <DotLabel>{ABOUT.marquee.label}</DotLabel>
      </div>
      <ul className="sr-only">
        {items.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      {/* Uses the homepage marquee's CSS (globals.css): four copies, slid by
          half, paused on hover, static under reduced motion. */}
      <div
        aria-hidden="true"
        className="marquee mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      >
        <div className="marquee-track flex items-center" style={{ animationDuration: "30s" }}>
          {[0, 1, 2, 3].map((copy) =>
            items.map((name) => (
              <span
                key={`${copy}-${name}`}
                className={`flex shrink-0 items-center gap-3 px-8 text-[24px] font-medium tracking-[-0.5px] text-[#0A0A0A] lg:text-[26px] ${copy > 0 ? "marquee-dup" : ""}`}
              >
                <img src={`/crypto/${name.toLowerCase()}.svg`} alt="" className="h-9 w-9 grayscale" />
                {name}
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}

// ── 5. "Latest" carousel ─────────────────────────────────────────────────────

function Posts() {
  const track = useRef<HTMLDivElement>(null);
  const posts = ABOUT.posts.items;
  if (posts.length === 0) return null;

  const go = (dir: 1 | -1) => {
    const card = track.current?.querySelector<HTMLElement>("[data-post]");
    track.current?.scrollBy({ left: dir * ((card?.offsetWidth ?? 344) + 56), behavior: "smooth" });
  };

  return (
    <section className="mt-20 pb-24 lg:pb-28">
      <div className="px-6">
        <DotLabel>{ABOUT.posts.label}</DotLabel>
      </div>
      <div
        ref={track}
        data-lenis-prevent-horizontal
        className="mt-14 flex snap-x snap-mandatory gap-14 overflow-x-auto px-[max(46px,calc(50%_-_172px))] pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => (
          <a
            key={post.href}
            data-post
            href={post.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex h-[400px] w-[290px] shrink-0 snap-center flex-col rounded-[15px] bg-[#EDEDED] px-7 pt-7 text-[#0A0A0A] lg:h-[426px] lg:w-[344px] ${FOCUS}`}
          >
            <span className="flex h-[46px] w-fit items-center rounded-lg bg-white px-4 text-[15px] font-semibold">
              {post.source}
            </span>
            <span className="mt-7 text-[13px] text-[#767676]">{post.source}</span>
            <span className="mt-4 text-[17px] leading-[1.45]">{post.title}</span>
            {/* Dark bar overhangs the card's left and right edges */}
            <span className="absolute -left-[22px] -right-[22px] bottom-8 flex h-[62px] items-center justify-between rounded-xl bg-[#0A0A0A] px-7 text-[17px] text-white lg:text-[18px]">
              Read article
              <ArrowUpRight
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-200 motion-safe:group-hover:-translate-y-[3px] motion-safe:group-hover:translate-x-[3px]"
              />
            </span>
          </a>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2">
        {([-1, 1] as const).map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => go(dir)}
            aria-label={dir < 0 ? "Previous article" : "Next article"}
            className={`grid h-[46px] w-[46px] place-items-center rounded-full bg-[#F2F2F2] text-[#0A0A0A] transition-colors hover:bg-[#E5E5E5] ${FOCUS}`}
          >
            {dir < 0 ? <ArrowLeft size={18} strokeWidth={2} /> : <ArrowRight size={18} strokeWidth={2} />}
          </button>
        ))}
      </div>
    </section>
  );
}

/* eslint-enable @next/next/no-img-element */

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const root = useRef<HTMLElement>(null);
  useTextAnimations(root);
  return (
    <main ref={root} className="overflow-x-clip bg-white">
      <Navbar />
      {/* On phones the hero and the wall pin together (see Hero). */}
      <div data-pin-wrap>
        <Hero />
        <Wall />
      </div>
      <Cta />
      <Marquee />
      <Posts />
      <Footer />
    </main>
  );
}
