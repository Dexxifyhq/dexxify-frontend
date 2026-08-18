"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { cn } from "@/utils/utils";
import ChartCard from "./ChartCard";
import { formatDateShort } from "./chart-utils";
import type { RevenueDataPoint } from "@/lib/types/dashboard";

interface GroupedBarChartProps {
  title: string;
  description?: string;
  data?: RevenueDataPoint[];
  loading?: boolean;
}

export default function GroupedBarChart({
  title,
  description,
  data,
  loading,
}: GroupedBarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const isEmpty = !loading && (!data || data.length === 0);

  const rows =
    data?.map((d) => ({ point: d, ngn: d.ngn, stable: d.usdt + d.usdc })) ?? [];
  const max = Math.max(...rows.map((r) => Math.max(r.ngn, r.stable)), 1);
  const labelEvery = Math.max(1, Math.ceil(rows.length / 8));

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={<BarChart3 size={28} strokeWidth={1.5} />}
      emptyDescription="No revenue data for the selected period."
      actions={
        <div className="flex items-center gap-3 text-xs text-dash-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-1" /> NGN
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-chart-2" /> Stablecoin
          </span>
        </div>
      }
    >
      <div className="relative flex h-44 items-end gap-1">
        {rows.map((row, i) => (
          <div
            key={i}
            className="group relative flex h-full flex-1 items-end justify-center gap-0.5"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
          >
            <div
              className="w-full rounded-t-sm bg-chart-1 transition-opacity"
              style={{
                height: `${Math.max((row.ngn / max) * 100, row.ngn > 0 ? 2 : 0)}%`,
              }}
            />
            <div
              className="w-full rounded-t-sm bg-chart-2 transition-opacity"
              style={{
                height: `${Math.max((row.stable / max) * 100, row.stable > 0 ? 2 : 0)}%`,
              }}
            />

            {hovered === i && (
              <div className="pointer-events-none absolute bottom-full mb-2 z-10 w-max -translate-x-1/2 left-1/2 rounded-lg border border-dash-border bg-dash-card px-3 py-2 text-xs shadow-lg">
                <p className="font-medium text-dash-foreground">
                  {formatDateShort(row.point.date)}
                </p>
                <p className="text-dash-muted">
                  NGN:{" "}
                  <span className="font-medium text-dash-foreground">
                    ₦{row.ngn.toLocaleString()}
                  </span>
                </p>
                <p className="text-dash-muted">
                  Stablecoin:{" "}
                  <span className="font-medium text-dash-foreground">
                    ${row.stable.toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[9px] text-dash-faint">
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
    </ChartCard>
  );
}
