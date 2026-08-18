"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
import { cn } from "@/utils/utils";
import ChartCard from "./ChartCard";
import { formatDateShort } from "./chart-utils";
import type { RevenueDataPoint } from "@/lib/types/dashboard";
import type { DateRange } from "@/lib/types/common";

interface StackedBarChartProps {
  title: string;
  description?: string;
  data?: RevenueDataPoint[];
  loading?: boolean;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
  { label: "All", value: "all" },
];

const SEGMENTS = [
  { key: "ngn" as const, label: "NGN", color: "var(--chart-1)" },
  { key: "usdt" as const, label: "USDT", color: "var(--chart-2)" },
  { key: "usdc" as const, label: "USDC", color: "var(--chart-6)" },
];

export default function StackedBarChart({
  title,
  description,
  data,
  loading,
  range,
  onRangeChange,
}: StackedBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const isEmpty = !loading && (!data || data.length === 0);

  const totals = data?.map((d) => d.ngn + d.usdt + d.usdc) ?? [];
  const max = Math.max(...totals, 1);

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={<Layers size={28} strokeWidth={1.5} />}
      emptyDescription="No spend data for the selected period."
      actions={
        <div className="flex items-center gap-0.5 rounded-lg border border-dash-border p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRangeChange(opt.value)}
              className={cn(
                "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                range === opt.value
                  ? "bg-dash-accent-soft text-dash-accent"
                  : "text-dash-muted hover:text-dash-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="relative flex h-40 items-end gap-1">
        {data?.map((d, i) => (
          <div
            key={i}
            className="group relative flex h-full flex-1 flex-col justify-end"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
          >
            <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-sm">
              {SEGMENTS.map((seg) => {
                const value = d[seg.key];
                const heightPct = (value / max) * 100;
                return value > 0 ? (
                  <div
                    key={seg.key}
                    style={{ height: `${Math.max(heightPct, 1)}%`, backgroundColor: seg.color }}
                  />
                ) : null;
              })}
            </div>

            {hovered === i && (
              <div className="pointer-events-none absolute bottom-full mb-2 z-10 w-max -translate-x-1/2 left-1/2 rounded-lg border border-dash-border bg-dash-card px-3 py-2 text-xs shadow-lg">
                <p className="mb-1 font-medium text-dash-foreground">{formatDateShort(d.date)}</p>
                {SEGMENTS.map((seg) => (
                  <p key={seg.key} className="flex items-center gap-1.5 text-dash-muted">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                    {seg.label}: <span className="font-medium text-dash-foreground">{d[seg.key].toLocaleString()}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 text-xs text-dash-muted">
        {SEGMENTS.map((seg) => (
          <span key={seg.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}
