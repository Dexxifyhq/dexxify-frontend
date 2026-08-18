"use client";

import { useState } from "react";
import {
  Banknote,
  ArrowDownToLine,
  CreditCard,
  Users,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import AssetDistribution from "@/components/dashboard/overview/AssetDistribution";
import RecentActivity from "@/components/dashboard/overview/RecentActivity";
import BalanceCarousel from "@/components/dashboard/overview/BalanceCarousel";
import FanGauge from "@/components/dashboard/charts/FanGauge";
import AreaLineChart from "@/components/dashboard/charts/AreaLineChart";
import ActivityHeatmap from "@/components/dashboard/charts/ActivityHeatmap";
import GroupedBarChart from "@/components/dashboard/charts/GroupedBarChart";
import DonutChart from "@/components/dashboard/charts/DonutChart";
import StackedBarChart from "@/components/dashboard/charts/StackedBarChart";
import {
  useDashboardStats,
  useDashboardOverview,
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

const CURRENCIES: FiatCurrency[] = ["NGN"];

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
        className="h-9 appearance-none rounded-lg border border-dash-border bg-dash-card pl-3 pr-8 text-sm font-medium text-dash-muted hover:border-dash-accent focus:border-dash-accent focus:outline-none transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dash-faint"
      />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [currency, setCurrency] = useState<FiatCurrency>("NGN");
  const [stackedRange, setStackedRange] = useState<DateRange>("30d");

  const params = { range, currency };

  const { data: stats, isLoading: statsLoading } = useDashboardStats(params);
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: revenueChart, isLoading: chartLoading } =
    useRevenueChart(params);
  const { data: stackedChart, isLoading: stackedLoading } = useRevenueChart({
    range: stackedRange,
    currency,
  });
  const { data: assetDist, isLoading: assetLoading } = useAssetDistribution();
  const { data: activity, isLoading: activityLoading } = useRecentActivity(10);

  const flat: StatChange = { value: 0, percent: 0, direction: "flat" };

  const fmtNgn = (v: number) =>
    `₦${v.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sessionSegments = overview
    ? [
        { label: "Completed", value: overview.payment_sessions.completed?.count ?? 0, color: "var(--dash-success)" },
        { label: "Pending", value: overview.payment_sessions.pending?.count ?? 0, color: "var(--dash-warning)" },
        { label: "Expired", value: overview.payment_sessions.expired?.count ?? 0, color: "var(--dash-faint)" },
        { label: "Failed", value: overview.payment_sessions.failed?.count ?? 0, color: "var(--dash-error)" },
      ]
    : undefined;

  const invoiceSlices = overview
    ? [
        { label: "Paid", value: overview.invoices.paid?.count ?? 0, color: "var(--dash-success)" },
        { label: "Pending", value: overview.invoices.pending?.count ?? 0, color: "var(--dash-warning)" },
        { label: "Overdue", value: overview.invoices.overdue?.count ?? 0, color: "var(--dash-error)" },
      ]
    : undefined;

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
            <button className="flex h-9 items-center gap-2 rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-muted hover:border-dash-accent hover:text-dash-foreground transition-colors">
              <SlidersHorizontal size={13} />
              Filters
            </button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="NGN Balance"
          value={stats ? fmtNgn(stats.ngn_balance.value) : "₦0.00"}
          change={stats?.ngn_balance.change ?? flat}
          icon={<Banknote size={15} />}
          loading={statsLoading}
        />
        <StatCard
          label="Total Received (NGN)"
          value={stats ? fmtNgn(stats.total_received_ngn.value) : "₦0.00"}
          change={stats?.total_received_ngn.change ?? flat}
          icon={<ArrowDownToLine size={15} />}
          loading={statsLoading}
        />
        <StatCard
          label="Payment Sessions"
          value={stats ? stats.payment_sessions.total.toLocaleString() : "0"}
          change={stats?.payment_sessions.change ?? flat}
          description={
            stats ? `${stats.payment_sessions.completed} completed` : undefined
          }
          icon={<CreditCard size={15} />}
          loading={statsLoading}
        />
        <StatCard
          label="Customers"
          value={stats ? stats.customers.total.toLocaleString() : "0"}
          change={stats?.customers.change ?? flat}
          description={
            stats && stats.customers.new_this_month > 0
              ? `+${stats.customers.new_this_month} this month`
              : undefined
          }
          icon={<Users size={15} />}
          loading={statsLoading}
        />
      </div>

      {/* Session breakdown + revenue trend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FanGauge
          title="Payment Sessions"
          description="Breakdown by status"
          segments={sessionSegments}
          total={overview?.payment_sessions.total}
          totalLabel="Sessions"
          loading={overviewLoading}
        />
        <div className="lg:col-span-2">
          <AreaLineChart
            title="Revenue Trend"
            description="Daily revenue over the selected period"
            data={revenueChart?.data}
            loading={chartLoading}
          />
        </div>
      </div>

      {/* NGN vs stablecoin + invoice status */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GroupedBarChart
            title="NGN vs Stablecoin"
            description="Revenue split by settlement currency"
            data={revenueChart?.data}
            loading={chartLoading}
          />
        </div>
        <DonutChart
          title="Invoices"
          description="Breakdown by status"
          slices={invoiceSlices}
          total={overview?.invoices.total}
          centerLabel="Invoices"
          loading={overviewLoading}
        />
      </div>

      {/* Asset mix + activity heatmap */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AssetDistribution data={assetDist || undefined} loading={assetLoading} />
        <div className="lg:col-span-2">
          <ActivityHeatmap
            title="Transaction Activity"
            description="Daily transaction volume"
            data={revenueChart?.data}
            loading={chartLoading}
          />
        </div>
      </div>

      {/* Revenue by currency + balances/activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StackedBarChart
            title="Revenue by Currency"
            description="Daily revenue split across settlement currencies"
            data={stackedChart?.data}
            loading={stackedLoading}
            range={stackedRange}
            onRangeChange={setStackedRange}
          />
        </div>
        <div className="flex flex-col gap-4">
          <BalanceCarousel balances={overview?.balances} loading={overviewLoading} />
          <RecentActivity items={activity || undefined} loading={activityLoading} />
        </div>
      </div>
    </div>
  );
}
