"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Wallet } from "lucide-react";
import { cn } from "@/utils/utils";

interface BalanceCarouselProps {
  balances?: { ngn: number; usdt: number; usdc: number };
  loading?: boolean;
}

const SLIDES = [
  { key: "ngn" as const, label: "NGN Balance", prefix: "₦", gradient: "from-[#2563EB] to-[#1D4ED8]" },
  { key: "usdt" as const, label: "USDT Balance", prefix: "$", gradient: "from-[#10B981] to-[#059669]" },
  { key: "usdc" as const, label: "USDC Balance", prefix: "$", gradient: "from-[#2775CA] to-[#1A5FA8]" },
];

function Skeleton() {
  return (
    <div className="rounded-xl border border-dash-border bg-dash-card p-5">
      <div className="h-32 animate-pulse rounded-lg bg-dash-hover" />
    </div>
  );
}

export default function BalanceCarousel({ balances, loading }: BalanceCarouselProps) {
  const [index, setIndex] = useState(0);

  if (loading) return <Skeleton />;

  const slide = SLIDES[index];
  const value = balances?.[slide.key] ?? 0;

  return (
    <div className="rounded-xl border border-dash-border bg-dash-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-dash-foreground">Balances</p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
            aria-label="Previous balance"
            className="flex h-6 w-6 items-center justify-center rounded-md text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
            aria-label="Next balance"
            className="flex h-6 w-6 items-center justify-center rounded-md text-dash-muted hover:bg-dash-hover hover:text-dash-foreground transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className={cn("rounded-xl bg-linear-to-br p-5 text-white", slide.gradient)}>
        <div className="mb-6 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-white/70">{slide.label}</span>
          <Wallet size={16} className="text-white/70" />
        </div>
        <p className="text-2xl font-bold tracking-tight">
          {slide.prefix}
          {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setIndex(i)}
            aria-label={`Show ${s.label}`}
            className={cn("h-1.5 rounded-full transition-all", i === index ? "w-4 bg-dash-accent" : "w-1.5 bg-dash-border")}
          />
        ))}
      </div>
    </div>
  );
}
