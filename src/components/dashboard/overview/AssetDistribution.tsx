import type { AssetDistributionData } from "@/lib/types/dashboard";

interface AssetDistributionProps {
  data?: AssetDistributionData;
  loading?: boolean;
}

function Skeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <div className="h-28 w-28 animate-pulse rounded-full bg-dash-hover" />
      <div className="h-4 w-16 animate-pulse rounded bg-dash-hover" />
    </div>
  );
}

const RING_GAP = 3.6;
const OUTER_RADIUS = 15;
const STROKE = 2.6;

export default function AssetDistribution({ data, loading }: AssetDistributionProps) {
  const isEmpty = !loading && (!data?.assets || data.assets.length === 0);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dash-border bg-dash-card p-5 h-full">
      <div>
        <p className="text-sm font-semibold text-dash-foreground">Asset Mix</p>
        <p className="text-xs text-dash-muted">Revenue breakdown by cryptocurrency</p>
      </div>

      {loading && <Skeleton />}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r={OUTER_RADIUS} fill="none" stroke="var(--dash-hover)" strokeWidth={STROKE} />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-dash-foreground">$0</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-dash-faint">TOTAL</p>
          </div>
        </div>
      )}

      {!loading && data && data.assets.length > 0 && (
        <>
          {/* Concentric rings — one per asset, each ring's arc length is that
              asset's share of total revenue, radiating outward from the center. */}
          <div className="relative flex h-28 w-28 mx-auto items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              {data.assets.map((asset, i) => {
                const r = Math.max(OUTER_RADIUS - i * RING_GAP, 3);
                const circumference = 2 * Math.PI * r;
                const dash = (asset.percentage / 100) * circumference;
                return (
                  <g key={asset.symbol}>
                    <circle cx="18" cy="18" r={r} fill="none" stroke="var(--dash-hover)" strokeWidth={STROKE} />
                    <circle
                      cx="18" cy="18" r={r}
                      fill="none"
                      stroke={asset.color}
                      strokeWidth={STROKE}
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${circumference - dash}`}
                    />
                  </g>
                );
              })}
            </svg>
            <div className="absolute text-center">
              <p className="text-lg font-bold text-dash-foreground">${data.total_usd.toLocaleString()}</p>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-dash-faint">TOTAL</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.assets.map((asset) => (
              <div key={asset.symbol} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="text-dash-muted">{asset.name}</span>
                </div>
                <span className="font-medium text-dash-foreground">{asset.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
