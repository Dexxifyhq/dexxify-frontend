"use client";

import { useState } from "react";
import {
  Banknote,
  Wallet,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Plus,
  ChevronDown,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import RevenueChart from "@/components/dashboard/overview/RevenueChart";
import AssetDistribution from "@/components/dashboard/overview/AssetDistribution";
import RecentActivity from "@/components/dashboard/overview/RecentActivity";
import {
  useDashboardStats,
  useRevenueChart,
  useAssetDistribution,
  useRecentActivity,
} from "@/lib/hooks/dashboard/useDashboardStats";
import type { DateRange, FiatCurrency } from "@/lib/types/common";
import type { StatChange } from "@/lib/types/dashboard";

// ── Controls ───────────────────────────────────────────────────────────────

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "1 Year", value: "1y" },
  { label: "All Time", value: "all" },
];

const CURRENCIES: FiatCurrency[] = ["NGN", "USD"];

function SelectButton({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] pl-3 pr-8 text-sm font-medium text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B]"
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [currency, setCurrency] = useState<FiatCurrency>("NGN");

  const params = { range, currency };

  const { data: stats, isLoading: statsLoading } = useDashboardStats(params);
  const { data: revenueChart, isLoading: chartLoading } =
    useRevenueChart(params);
  const { data: assetDist, isLoading: assetLoading } = useAssetDistribution();
  const { data: activity, isLoading: activityLoading } = useRecentActivity(10);

  const flat: StatChange = { value: 0, percent: 0, direction: "flat" };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your financial performance"
        actions={
          <>
            <SelectButton
              value={range}
              options={DATE_RANGES}
              onChange={(v) => setRange(v as DateRange)}
            />
            <SelectButton
              value={currency}
              options={CURRENCIES.map((c) => ({ label: c, value: c }))}
              onChange={(v) => setCurrency(v as FiatCurrency)}
            />
            <button className="flex h-9 items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3 text-sm text-[#A1A1AA] hover:border-[#2563EB] hover:text-[#FAFAFA] transition-colors">
              <SlidersHorizontal size={13} />
              Filters
            </button>
            <button className="flex h-9 items-center gap-2 rounded-lg bg-[#2563EB] px-3 text-sm font-medium text-white hover:brightness-110 transition-all">
              <Plus size={13} />
              New Payment
            </button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Volume"
          value={stats ? `₦${stats.total_volume.value.toLocaleString()}` : "₦0"}
          change={stats?.total_volume.change ?? flat}
          icon={<Banknote size={15} />}
          loading={statsLoading}
        />
        <StatCard
          label="Wallets"
          value={stats ? stats.wallets.value.toLocaleString() : "0"}
          change={stats?.wallets.change ?? flat}
          icon={<Wallet size={15} />}
          loading={statsLoading}
        />
        <StatCard
          label="Payouts"
          value={stats ? stats.payouts.value.toLocaleString() : "0"}
          change={stats?.payouts.change ?? flat}
          icon={<Send size={15} />}
          loading={statsLoading}
        />
        <StatCard
          label="KYC Verifications"
          value={stats ? stats.kyc_verifications.value.toLocaleString() : "0"}
          change={stats?.kyc_verifications.change ?? flat}
          icon={<ShieldCheck size={15} />}
          loading={statsLoading}
        />
      </div>

      {/* Revenue chart + Asset distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <RevenueChart data={revenueChart || undefined} loading={chartLoading} />
        <AssetDistribution
          data={assetDist || undefined}
          loading={assetLoading}
        />
      </div>

      {/* Recent activity */}
      <RecentActivity items={activity || undefined} loading={activityLoading} />
    </div>
  );
}
