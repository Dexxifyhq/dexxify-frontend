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
  completed: "bg-[#052E16] text-[#22C55E]",
  pending: "bg-[#1C1401] text-[#EAB308]",
  failed: "bg-[#2D0A0A] text-[#EF4444]",
};

function Skeleton() {
  return (
    <div className="divide-y divide-[#1C1C1F]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3.5 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-[#1C1C1F]" />
            <div className="space-y-1.5">
              <div className="h-3 w-36 animate-pulse rounded bg-[#1C1C1F]" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-[#1C1C1F]" />
            </div>
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-[#1C1C1F]" />
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
    <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
      <p className="mb-4 text-sm font-semibold text-[#FAFAFA]">Recent Activity</p>

      {loading && <Skeleton />}

      {!loading && (!items || items.length === 0) && (
        <EmptyState description="No recent activity to display." />
      )}

      {!loading && items && items.length > 0 && (
        <div className="divide-y divide-[#1C1C1F]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3.5 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1C1C1F] text-[#71717A] text-xs font-medium">
                  {TYPE_LABELS[item.type][0]}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#FAFAFA]">{item.description}</p>
                  <p className="text-xs text-[#52525B]">
                    {new Date(item.created_at).toLocaleDateString("en", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <p className="text-sm font-medium text-[#FAFAFA]">
                  {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()} {item.currency}
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
