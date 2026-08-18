import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/utils/utils";
import type { StatChange } from "@/lib/types/dashboard";

interface StatCardProps {
  label: string;
  value: string;
  change?: StatChange;
  description?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

function ChangeBadge({ change }: { change: StatChange }) {
  const isUp = change.direction === "up";
  const isDown = change.direction === "down";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        isUp && "bg-dash-success-bg text-dash-success",
        isDown && "bg-dash-error-bg text-dash-error",
        !isUp && !isDown && "bg-dash-hover text-dash-muted"
      )}
    >
      {isUp && <TrendingUp size={10} />}
      {isDown && <TrendingDown size={10} />}
      {!isUp && !isDown && <Minus size={10} />}
      {isUp ? "+" : ""}{change.percent.toFixed(1)}%
    </span>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-dash-hover", className)} />;
}

export default function StatCard({ label, value, change, description, icon, loading }: StatCardProps) {
  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-dash-border bg-dash-card p-5">
      {/* Label + icon */}
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-dash-faint">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-accent-soft text-dash-accent">
          {icon}
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-dash-foreground">{value}</p>
      )}

      {/* Change / description */}
      {loading ? (
        <Skeleton className="h-5 w-16" />
      ) : description ? (
        <p className="text-xs text-dash-faint">{description}</p>
      ) : change ? (
        <ChangeBadge change={change} />
      ) : null}
    </div>
  );
}
