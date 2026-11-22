"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth (eased) wheel scrolling for the marketing site, via Lenis.
 *
 * Lenis runs on GSAP's ticker, not its own animation loop. Lenis was removed
 * once (402a847) because it and GSAP ScrollTrigger each ran a separate loop
 * and fought over frames. Driving Lenis from gsap.ticker and telling
 * ScrollTrigger on every Lenis scroll is the integration both libraries
 * document, and keeps them in step. Keep it this way if either changes.
 *
 * - Touch scrolling stays native (Lenis's default), so phones feel normal.
 * - Same-page links like /#pricing glide to their target (`anchors`).
 * - Off for visitors who ask for reduced motion.
 * - Scrollable panels inside the page opt out with `data-lenis-prevent`.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ anchors: true, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000); // seconds → ms
    gsap.ticker.add(tick);
    // GSAP otherwise "catches up" after a dropped frame, which makes the
    // scroll jump.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
