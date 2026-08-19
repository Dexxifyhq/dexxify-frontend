"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import ChartCard from "./ChartCard";
import { formatDateShort } from "./chart-utils";
import type { RevenueDataPoint } from "@/lib/types/dashboard";

interface AreaLineChartProps {
  title: string;
  description?: string;
  data?: RevenueDataPoint[];
  loading?: boolean;
  valueLabel?: string;
  formatValue?: (v: number) => string;
}

const WIDTH = 600;
const HEIGHT = 200;
const PAD_X = 8;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

export default function AreaLineChart({
  title,
  description,
  data,
  loading,
  valueLabel = "Revenue",
  formatValue = (v) => `₦${v.toLocaleString()}`,
}: AreaLineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const isEmpty = !loading && (!data || data.length === 0);

  const values = data?.map((d) => d.credit_ngn) ?? [];
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points =
    data?.map((d, i) => {
      const x = data.length === 1 ? WIDTH / 2 : PAD_X + (i / (data.length - 1)) * (WIDTH - PAD_X * 2);
      const y =
        PAD_TOP + (1 - (d.credit_ngn - min) / range) * (HEIGHT - PAD_TOP - PAD_BOTTOM);
      return { x, y, point: d };
    }) ?? [];

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${HEIGHT - PAD_BOTTOM} L ${points[0].x} ${HEIGHT - PAD_BOTTOM} Z`
      : "";

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    if (points.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHovered(nearest);
  }

  const hoveredPoint = hovered !== null ? points[hovered] : null;
  const labelEvery = Math.max(1, Math.ceil((data?.length ?? 1) / 6));

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={<TrendingUp size={28} strokeWidth={1.5} />}
      emptyDescription="No revenue data for the selected period."
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="area-line-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--dash-accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--dash-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {areaPath && <path d={areaPath} fill="url(#area-line-fill)" />}
          {linePath && (
            <path d={linePath} fill="none" stroke="var(--dash-accent)" strokeWidth={2} />
          )}

          {hoveredPoint && (
            <>
              <line
                x1={hoveredPoint.x}
                y1={PAD_TOP}
                x2={hoveredPoint.x}
                y2={HEIGHT - PAD_BOTTOM}
                stroke="var(--dash-border-strong)"
                strokeDasharray="3 3"
              />
              <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r={4} fill="var(--dash-accent)" />
            </>
          )}

          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text
                key={i}
                x={p.x}
                y={HEIGHT - 6}
                textAnchor="middle"
                fontSize={9}
                fill="var(--dash-faint)"
              >
                {formatDateShort(p.point.date)}
              </text>
            ) : null,
          )}
        </svg>

        {hoveredPoint && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-dash-border bg-dash-card px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(hoveredPoint.x / WIDTH) * 100}%`,
              top: `${(hoveredPoint.y / HEIGHT) * 100 - 4}%`,
            }}
          >
            <p className="font-medium text-dash-foreground">{formatDateShort(hoveredPoint.point.date)}</p>
            <p className="text-dash-muted">
              {valueLabel}: <span className="font-medium text-dash-foreground">{formatValue(hoveredPoint.point.credit_ngn)}</span>
            </p>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
