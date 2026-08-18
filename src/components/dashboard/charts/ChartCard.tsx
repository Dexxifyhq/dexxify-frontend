import { cn } from "@/utils/utils";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { BarChart2 } from "lucide-react";

interface ChartCardProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyDescription?: string;
  className?: string;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  description,
  actions,
  loading,
  isEmpty,
  emptyIcon,
  emptyDescription,
  className,
  children,
}: ChartCardProps) {
  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border border-dash-border bg-dash-card p-5 h-full", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-dash-foreground">{title}</p>
          {description && <p className="text-xs text-dash-muted">{description}</p>}
        </div>
        {actions}
      </div>

      {loading && (
        <div className="flex-1 animate-pulse rounded-lg bg-dash-hover min-h-32" />
      )}

      {!loading && isEmpty && (
        <EmptyState
          icon={emptyIcon ?? <BarChart2 size={28} strokeWidth={1.5} />}
          description={emptyDescription ?? "No data for the selected period."}
        />
      )}

      {!loading && !isEmpty && children}
    </div>
  );
}
