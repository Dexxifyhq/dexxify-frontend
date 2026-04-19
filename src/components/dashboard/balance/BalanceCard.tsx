import { cn } from "@/utils/utils";

interface BalanceCardProps {
  label: string;
  amount: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  loading?: boolean;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-[#1C1C1F]", className)} />;
}

export default function BalanceCard({ label, amount, icon, badge, action, loading }: BalanceCardProps) {
  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5">
      {/* Top row: icon + badge/action */}
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1C1C1F] text-[#71717A]">
          {icon}
        </div>
        {badge && <div>{badge}</div>}
        {action && !badge && <div>{action}</div>}
      </div>

      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">{label}</p>

      {/* Amount */}
      {loading ? (
        <Skeleton className="h-10 w-32" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-[#FAFAFA]">
          <span className="text-xl text-[#71717A] mr-0.5">$</span>
          {amount}
        </p>
      )}

      {/* Action below amount if badge is present */}
      {badge && action && <div>{action}</div>}
    </div>
  );
}
