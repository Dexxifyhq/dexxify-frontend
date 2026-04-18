'use client';

import EmptyState from '@/components/dashboard/shared/EmptyState';
import { BarChart2 } from 'lucide-react';
import type { RevenueChartData } from '@/lib/types/dashboard';

interface RevenueChartProps {
  data?: RevenueChartData;
  loading?: boolean;
}

function Skeleton() {
  return (
    <div className="flex items-end justify-between gap-1 h-40 px-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-sm bg-[#1C1C1F]"
          style={{ height: `${20 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  );
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  const isEmpty = !loading && (!data?.data || data.data.length === 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5 h-full">
      <p className="text-sm font-semibold text-[#FAFAFA]">Revenue Overview</p>

      {loading && <Skeleton />}

      {isEmpty && (
        <EmptyState
          icon={<BarChart2 size={32} strokeWidth={1.5} />}
          description="No revenue data for the selected period."
        />
      )}

      {!loading && data && data.data.length > 0 && (
        <div className="flex items-end justify-between gap-1 h-40">
          {data.data.map((point, i) => {
            const max = Math.max(...data.data.map((d) => d.revenue));
            const height = max > 0 ? (point.revenue / max) * 100 : 0;
            return (
              <div
                key={i}
                className="group relative flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-sm bg-[#2563EB] transition-all group-hover:bg-[#3B82F6]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className="text-[9px] text-[#3F3F46]">
                  {new Date(point.date).toLocaleDateString('en', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
