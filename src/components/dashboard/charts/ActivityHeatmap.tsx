import { CalendarDays } from "lucide-react";
import { cn } from "@/utils/utils";
import ChartCard from "./ChartCard";
import type { RevenueDataPoint } from "@/lib/types/dashboard";

interface ActivityHeatmapProps {
  title: string;
  description?: string;
  data?: RevenueDataPoint[];
  loading?: boolean;
}

interface Cell {
  date: Date;
  count: number;
}

function buildWeeks(data: RevenueDataPoint[]): Cell[][] {
  const counts = new Map(data.map((d) => [d.date.slice(0, 10), d.tx_count]));
  const times = data.map((d) => new Date(d.date).getTime());
  if (times.length === 0) return [];

  const last = new Date(Math.max(...times));
  const start = new Date(Math.min(...times));
  // Align to the Monday on/before the first date.
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  const weeks: Cell[][] = [];
  let week: Cell[] = [];
  const cursor = new Date(start);

  while (cursor <= last || week.length > 0) {
    const key = cursor.toISOString().slice(0, 10);
    week.push({ date: new Date(cursor), count: counts.get(key) ?? 0 });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    cursor.setDate(cursor.getDate() + 1);
    if (cursor > last && week.length === 0) break;
  }
  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ date: new Date(cursor), count: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

const LEVEL_CLASSES = ["bg-dash-hover", "bg-dash-accent/20", "bg-dash-accent/45", "bg-dash-accent/70", "bg-dash-accent"];

function levelFor(count: number, max: number) {
  if (count === 0 || max === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export default function ActivityHeatmap({ title, description, data, loading }: ActivityHeatmapProps) {
  const isEmpty = !loading && (!data || data.length === 0);
  const weeks = data ? buildWeeks(data) : [];
  const max = Math.max(...weeks.flat().map((c) => c.count), 0);

  return (
    <ChartCard
      title={title}
      description={description}
      loading={loading}
      isEmpty={isEmpty}
      emptyIcon={<CalendarDays size={28} strokeWidth={1.5} />}
      emptyDescription="No transaction activity for the selected period."
    >
      <div className="overflow-x-auto">
        <div className="inline-grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}>
          {weeks.flatMap((week, wi) =>
            week.map((cell, di) => (
              <div
                key={`${wi}-${di}`}
                title={`${cell.date.toLocaleDateString("en", { month: "short", day: "numeric" })} — ${cell.count} tx`}
                className={cn("h-2.5 w-2.5 rounded-sm", LEVEL_CLASSES[levelFor(cell.count, max)])}
              />
            )),
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[10px] text-dash-faint">
        Less
        {LEVEL_CLASSES.map((c) => (
          <span key={c} className={cn("h-2.5 w-2.5 rounded-sm", c)} />
        ))}
        More
      </div>
    </ChartCard>
  );
}
