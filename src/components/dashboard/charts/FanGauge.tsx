import { Gauge } from "lucide-react";
import ChartCard from "./ChartCard";
import { describeArc } from "./chart-utils";

export interface FanGaugeSegment {
  label: string;
  value: number;
  color: string;
}

interface FanGaugeProps {
  title: string;
  description?: string;
  segments?: FanGaugeSegment[];
  total?: number;
  totalLabel?: string;
  loading?: boolean;
}

const CX = 100;
const CY = 100;
const R = 78;
const STROKE = 16;

export default function FanGauge({
  title,
  description,
  segments,
  total,
  totalLabel = "Total",
  loading,
}: FanGaugeProps) {
  const sum = segments?.reduce((acc, s) => acc + s.value, 0) ?? 0;
  const isEmpty = !loading && (!segments || segments.length === 0 || sum === 0);

  let cursor = 180;
  const arcs =
    !isEmpty && segments
      ? segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const sweep = (s.value / sum) * 180;
            const startAngle = cursor;
            const endAngle = cursor - sweep;
            cursor = endAngle;
            return { ...s, d: describeArc(CX, CY, R, startAngle, endAngle) };
          })
      : [];

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={<Gauge size={28} strokeWidth={1.5} />}
      emptyDescription="No breakdown available for the selected period."
    >
      <div className="relative mx-auto w-full max-w-[220px]">
        <svg viewBox="0 0 200 112" className="w-full">
          <path
            d={describeArc(CX, CY, R, 180, 0)}
            fill="none"
            stroke="var(--dash-hover)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {arcs.map((arc) => (
            <path
              key={arc.label}
              d={arc.d}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <p className="text-2xl font-bold text-dash-foreground">{total?.toLocaleString() ?? sum.toLocaleString()}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-dash-faint">{totalLabel}</p>
        </div>
      </div>

      <div className="space-y-2">
        {segments?.map((s) => (
          <div key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-dash-muted">{s.label}</span>
            </div>
            <span className="font-medium text-dash-foreground">{s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
