"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/utils";
import CurrencyBalanceCard, {
  CURRENCY_CARDS,
} from "@/components/dashboard/shared/CurrencyBalanceCard";

interface BalanceCarouselProps {
  balances?: { ngn: number; usdt: number; usdc: number };
  loading?: boolean;
}

const SLIDES = CURRENCY_CARDS;

const AUTOPLAY_MS = 10_000;

function Skeleton() {
  return (
    <div className="rounded-2xl border border-dash-border bg-dash-card p-5">
      <div className="h-40 animate-pulse rounded-xl bg-dash-hover" />
    </div>
  );
}

export default function BalanceCarousel({
  balances,
  loading,
}: BalanceCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Advance every 10s. Keyed on index, so a manual move restarts the wait;
  // hovering the card holds it.
  useEffect(() => {
    if (loading || paused) return;
    const t = setTimeout(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(t);
  }, [index, paused, loading]);

  if (loading) return <Skeleton />;

  return (
    <div
      className="rounded-2xl border border-dash-border bg-dash-card p-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-dash-foreground">Balances</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)
            }
            aria-label="Previous balance"
            className="flex h-6 w-6 items-center justify-center rounded-md text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
            aria-label="Next balance"
            className="flex h-6 w-6 items-center justify-center rounded-md text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Slides sit side by side; the track slides to the current one. */}
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((s, i) => (
            <CurrencyBalanceCard
              key={s.key}
              aria-hidden={i !== index}
              currency={s}
              balance={balances?.[s.key]}
              className="w-full shrink-0"
            />
          ))}
        </div>
      </div>

      {/* Dots — the active one fills over the 10s until the next slide. */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setIndex(i)}
            aria-label={`Show ${s.code} balance`}
            className={cn(
              "relative h-1.5 overflow-hidden rounded-full bg-dash-border transition-all duration-300",
              i === index ? "w-6" : "w-1.5",
            )}
          >
            {i === index && (
              <span
                key={index}
                className="carousel-progress absolute inset-y-0 left-0 rounded-full bg-dash-accent"
                style={{
                  animationDuration: `${AUTOPLAY_MS}ms`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
