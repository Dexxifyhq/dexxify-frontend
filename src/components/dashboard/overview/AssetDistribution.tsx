import type { AssetDistributionData } from "@/lib/types/dashboard";

interface AssetDistributionProps {
  data?: AssetDistributionData;
  loading?: boolean;
}

function Skeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="h-28 w-28 animate-pulse rounded-full bg-[#1C1C1F]" />
      <div className="h-4 w-16 animate-pulse rounded bg-[#1C1C1F]" />
    </div>
  );
}

export default function AssetDistribution({ data, loading }: AssetDistributionProps) {
  const isEmpty = !loading && (!data?.assets || data.assets.length === 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-5 h-full">
      <div>
        <p className="text-sm font-semibold text-[#FAFAFA]">Asset Distribution</p>
        <p className="text-xs text-[#71717A]">Revenue breakdown by cryptocurrency</p>
      </div>

      {loading && <Skeleton />}

      {(isEmpty) && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
          {/* Empty donut ring */}
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1C1C1F" strokeWidth="4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#FAFAFA]">$0</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">TOTAL</p>
          </div>
        </div>
      )}

      {!loading && data && data.assets.length > 0 && (
        <>
          {/* Simple donut */}
          <div className="relative flex h-28 w-28 mx-auto items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              {data.assets.map((asset, i) => {
                const circumference = 2 * Math.PI * 14;
                const offset = data.assets
                  .slice(0, i)
                  .reduce((acc, a) => acc + (a.percentage / 100) * circumference, 0);
                return (
                  <circle
                    key={asset.symbol}
                    cx="18" cy="18" r="14"
                    fill="none"
                    stroke={asset.color}
                    strokeWidth="4"
                    strokeDasharray={`${(asset.percentage / 100) * circumference} ${circumference}`}
                    strokeDashoffset={-offset}
                  />
                );
              })}
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[#FAFAFA]">${data.total_usd.toLocaleString()}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">TOTAL</p>
          </div>
          <div className="space-y-2">
            {data.assets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="text-[#A1A1AA]">{asset.name}</span>
                </div>
                <span className="font-medium text-[#FAFAFA]">{asset.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
