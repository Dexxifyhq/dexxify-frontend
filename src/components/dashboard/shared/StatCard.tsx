import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/utils/utils";
import type { StatChange } from "@/lib/types/dashboard";

interface StatCardProps {
  label: string;
  value: string;
  change?: StatChange;
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
        isUp && "bg-[#052E16] text-[#22C55E]",
        isDown && "bg-[#2D0A0A] text-[#EF4444]",
        !isUp && !isDown && "bg-[#1C1C1F] text-[#71717A]"
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
  return <div className={cn("animate-pulse rounded bg-[#1C1C1F]", className)} />;
}

export default function StatCard({ label, value, change, icon, loading }: StatCardProps) {
  return (
    <div className="relative flex flex-col gap-4 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
      {/* Label + icon */}
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
          {icon}
        </div>
      </div>

      {/* Value */}
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-[#FAFAFA]">{value}</p>
      )}

      {/* Change */}
      {loading ? (
        <Skeleton className="h-5 w-16" />
      ) : change ? (
        <ChangeBadge change={change} />
      ) : null}
    </div>
  );
}
