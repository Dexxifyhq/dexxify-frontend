import { PieChart } from "lucide-react";
import ChartCard from "./ChartCard";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  title: string;
  description?: string;
  slices?: DonutSlice[];
  total?: number;
  centerLabel?: string;
  loading?: boolean;
}

const R = 15.5;
const CIRC = 2 * Math.PI * R;

export default function DonutChart({
  title,
  description,
  slices,
  total,
  centerLabel = "Total",
  loading,
}: DonutChartProps) {
  const sum = slices?.reduce((acc, s) => acc + s.value, 0) ?? 0;
  const isEmpty = !loading && (!slices || slices.length === 0 || sum === 0);

  let offset = 0;

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={<PieChart size={28} strokeWidth={1.5} />}
      emptyDescription="No breakdown available for the selected period."
    >
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          <circle cx="18" cy="18" r={R} fill="none" stroke="var(--dash-hover)" strokeWidth="4" />
          {!isEmpty &&
            slices?.map((s) => {
              const dash = (s.value / sum) * CIRC;
              const el = (
                <circle
                  key={s.label}
                  cx="18"
                  cy="18"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="4"
                  strokeDasharray={`${dash} ${CIRC - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return el;
            })}
        </svg>
        <div className="absolute text-center">
          <p className="text-lg font-bold text-dash-foreground">{(total ?? sum).toLocaleString()}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-dash-faint">{centerLabel}</p>
        </div>
      </div>

      <div className="space-y-2">
        {slices?.map((s) => (
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
