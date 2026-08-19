"use client";

import { useState } from "react";
import { Layers, ChevronDown } from "lucide-react";
import { cn } from "@/utils/utils";
import ChartCard from "./ChartCard";
import { formatCompactNumber, formatDateShort } from "./chart-utils";
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

type Currency = "ngn" | "usdt" | "usdc";

const CURRENCY_META: Record<Currency, { label: string; symbol: string }> = {
  ngn: { label: "NGN", symbol: "₦" },
  usdt: { label: "USDT", symbol: "$" },
  usdc: { label: "USDC", symbol: "$" },
};

const CURRENCY_OPTIONS: Currency[] = ["ngn", "usdt", "usdc"];

export default function StackedBarChart({
  title,
  description,
  data,
  loading,
  range,
  onRangeChange,
}: StackedBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [currency, setCurrency] = useState<Currency>("ngn");
  const isEmpty = !loading && (!data || data.length === 0);

  const symbol = CURRENCY_META[currency].symbol;

  const rows =
    data?.map((d) => ({
      point: d,
      credit: d[`credit_${currency}`],
      debit: d[`debit_${currency}`],
    })) ?? [];
  const maxVal = Math.max(...rows.flatMap((r) => [r.credit, r.debit]), 1);
  const labelEvery = Math.max(1, Math.ceil(rows.length / 8));

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={<Layers size={28} strokeWidth={1.5} />}
      emptyDescription="No revenue data for the selected period."
      actions={
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="h-7 appearance-none rounded-md border border-dash-border bg-dash-card pl-2 pr-6 text-[11px] font-medium text-dash-muted hover:border-dash-accent focus:border-dash-accent focus:outline-none transition-colors cursor-pointer"
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_META[c].label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-dash-faint"
            />
          </div>
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
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-xl gap-2">
        {/* Axis labels */}
        <div className="flex h-56 flex-col justify-between py-0.5 text-[9px] text-dash-faint">
          <span>
            {symbol}
            {formatCompactNumber(maxVal)}
          </span>
          <span>0</span>
          <span>
            {symbol}
            {formatCompactNumber(maxVal)}
          </span>
        </div>

        <div className="relative flex h-56 flex-1 items-stretch gap-1">
          {rows.map((row, i) => (
            <div
              key={i}
              className="group relative flex h-full flex-1 flex-col items-center"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              {/* Credit — grows up from center */}
              <div className="flex h-1/2 w-full items-end justify-center">
                <div
                  className={cn(
                    "w-full rounded-2xl bg-dash-success transition-opacity",
                    hovered !== null && hovered !== i && "opacity-30",
                  )}
                  style={{
                    height: `${Math.max((row.credit / maxVal) * 100, row.credit > 0 ? 4 : 0)}%`,
                  }}
                />
              </div>

              {/* Center baseline */}
              <div className="h-px w-full shrink-0 bg-dash-border" />

              {/* Debit — grows down from center */}
              <div className="flex h-1/2 w-full items-start justify-center">
                <div
                  className={cn(
                    "w-full rounded-2xl bg-dash-error transition-opacity",
                    hovered !== null && hovered !== i && "opacity-30",
                  )}
                  style={{
                    height: `${Math.max((row.debit / maxVal) * 100, row.debit > 0 ? 4 : 0)}%`,
                  }}
                />
              </div>

              {hovered === i && (
                <div className="pointer-events-none absolute -top-2 left-1/2 z-10 w-max -translate-x-1/2 -translate-y-full rounded-lg border border-dash-border bg-dash-card px-3 py-2 text-xs shadow-lg">
                  <p className="mb-1 font-medium text-dash-foreground">
                    {formatDateShort(row.point.date)}
                  </p>
                  <p className="flex items-center gap-1.5 text-dash-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-dash-success" />
                    Credit:{" "}
                    <span className="font-medium text-dash-foreground">
                      {symbol}
                      {row.credit.toLocaleString()}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5 text-dash-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-dash-error" />
                    Debit:{" "}
                    <span className="font-medium text-dash-foreground">
                      {symbol}
                      {row.debit.toLocaleString()}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xl gap-2">
        <div className="w-[38px] shrink-0" />
        <div className="flex flex-1 justify-between text-[9px] text-dash-faint">
          {rows.map((row, i) => (
            <span
              key={i}
              className={cn(
                "flex-1 text-center",
                i % labelEvery !== 0 && "invisible",
              )}
            >
              {formatDateShort(row.point.date)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-xs text-dash-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-dash-success" /> Credit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-dash-error" /> Debit
        </span>
      </div>
    </ChartCard>
  );
}
