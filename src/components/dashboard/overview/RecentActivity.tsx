import { cn } from "@/utils/utils";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import type { ActivityItem } from "@/lib/types/dashboard";

const TYPE_LABELS: Record<ActivityItem["type"], string> = {
  payment: "Payment",
  withdrawal: "Withdrawal",
  swap: "Swap",
  deposit: "Deposit",
  refund: "Refund",
};

const STATUS_STYLES: Record<ActivityItem["status"], string> = {
  completed: "bg-dash-success-bg text-dash-success",
  pending: "bg-dash-warning-bg text-dash-warning",
  failed: "bg-dash-error-bg text-dash-error",
};

function Skeleton() {
  return (
    <div className="divide-y divide-dash-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-dash-hover" />
            <div className="space-y-1.5">
              <div className="h-3 w-36 animate-pulse rounded bg-dash-hover" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-dash-hover" />
            </div>
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-dash-hover" />
        </div>
      ))}
    </div>
  );
}

interface RecentActivityProps {
  items?: ActivityItem[];
  loading?: boolean;
}

export default function RecentActivity({ items, loading }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-dash-border bg-dash-card p-5">
      <p className="mb-4 text-sm font-semibold text-dash-foreground">Recent Activity</p>

      {loading && <Skeleton />}

      {!loading && (!items || items.length === 0) && (
        <EmptyState description="No recent activity to display." />
      )}

      {!loading && items && items.length > 0 && (
        <div className="divide-y divide-dash-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3.5 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dash-hover text-dash-muted text-xs font-medium">
                  {TYPE_LABELS[item.type][0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-dash-foreground">{item.description ?? item.type}</p>
                  <p className="text-xs text-dash-faint">
                    {new Date(item.created_at).toLocaleDateString("en", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <p className={`text-sm font-medium ${item.direction === "credit" ? "text-dash-success" : item.direction === "debit" ? "text-dash-error" : "text-dash-foreground"}`}>
                  {item.direction === "credit" ? "+" : item.direction === "debit" ? "-" : ""}{item.amount.toLocaleString()} {item.currency}
                </p>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLES[item.status])}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
