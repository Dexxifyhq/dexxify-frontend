"use client";

import { useState } from "react";
import { Download, ArrowDownToLine, ArrowLeftRight, Clock, CreditCard, Wallet, ChevronDown, ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import BalanceCard from "@/components/dashboard/balance/BalanceCard";
import FilterBar, { SearchInput, FilterSelect } from "@/components/dashboard/shared/FilterBar";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { useBalanceOverview, useBalanceHistory, useSwaps, usePayouts } from "@/lib/hooks/balance/useBalance";
import { cn } from "@/utils/utils";
import type { CryptoCurrency } from "@/lib/types/common";
import type { BalanceHistoryFilters, BalanceTxType } from "@/lib/types/balance";

// ── Tab types ──────────────────────────────────────────────────────────────

type Tab = "history" | "swaps" | "payouts";

const TABS: { label: string; value: Tab }[] = [
  { label: "History", value: "history" },
  { label: "Swaps", value: "swaps" },
  { label: "Payouts", value: "payouts" },
];

const CURRENCIES: CryptoCurrency[] = ["USDT", "USDC", "BTC", "ETH", "BNB"];

const TX_TYPES: { label: string; value: BalanceTxType | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "Credit", value: "credit" },
  { label: "Debit", value: "debit" },
  { label: "Swap", value: "swap" },
  { label: "Payout", value: "payout" },
  { label: "Fee", value: "fee" },
];

const STATUSES = [
  { label: "All Status", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Failed", value: "failed" },
];

// ── History table ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-[#052E16] text-[#22C55E]",
  pending: "bg-[#1C1401] text-[#EAB308]",
  processing: "bg-[#0D1F3C] text-[#60A5FA]",
  failed: "bg-[#2D0A0A] text-[#EF4444]",
  cancelled: "bg-[#1C1C1F] text-[#71717A]",
};

function HistoryTab() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [currency, setCurrency] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filters: BalanceHistoryFilters = {
    search: search || undefined,
    type: type as BalanceTxType | "all",
    currency: currency as CryptoCurrency | "all",
    status: status as "all",
  };

  const { data, isLoading } = useBalanceHistory(filters);

  return (
    <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
      {/* Table header + filters */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-[#1C1C1F]">
        <p className="text-sm font-semibold text-[#FAFAFA]">Balance History</p>
        <FilterBar>
          <SearchInput
            placeholder="Search by reference or hash."
            value={search}
            onChange={setSearch}
          />
          <FilterSelect
            label="All Types"
            options={TX_TYPES}
            value={type}
            onChange={setType}
          />
          <FilterSelect
            label="All Currencies"
            options={[{ label: "All Currencies", value: "all" }, ...CURRENCIES.map((c) => ({ label: c, value: c }))]}
            value={currency}
            onChange={setCurrency}
          />
          <FilterSelect
            label="All Status"
            options={STATUSES}
            value={status}
            onChange={setStatus}
          />
        </FilterBar>
      </div>

      {/* Table */}
      {isLoading && (
        <div className="divide-y divide-[#1C1C1F]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <div className="h-3 flex-1 animate-pulse rounded bg-[#1C1C1F]" />
              <div className="h-3 w-20 animate-pulse rounded bg-[#1C1C1F]" />
              <div className="h-3 w-16 animate-pulse rounded bg-[#1C1C1F]" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data?.data || data.data.length === 0) && (
        <EmptyState description="No balance history found matching your filters." />
      )}

      {!isLoading && data && data.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1C1C1F]">
                {["Reference", "Type", "Amount", "Currency", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1F]">
              {data.data.map((item) => (
                <tr key={item.id} className="hover:bg-[#111113] transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-[#A1A1AA]">{item.reference}</td>
                  <td className="px-4 py-3.5 capitalize text-[#A1A1AA]">{item.type}</td>
                  <td className="px-4 py-3.5 font-medium text-[#FAFAFA]">{item.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-[#A1A1AA]">{item.currency}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLES[item.status] ?? STATUS_STYLES.cancelled)}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#52525B]">
                    {new Date(item.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SwapsTab() {
  const { data, isLoading } = useSwaps();
  if (isLoading) return <div className="py-8 text-center text-sm text-[#52525B]">Loading…</div>;
  if (!data?.data?.length) return <EmptyState description="No swaps found." />;
  return (
    <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[#1C1C1F]">
          {["From", "To", "Rate", "Status", "Date"].map((h) => (
            <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">{h}</th>
          ))}
        </tr></thead>
        <tbody className="divide-y divide-[#1C1C1F]">
          {data.data.map((swap) => (
            <tr key={swap.id} className="hover:bg-[#111113] transition-colors">
              <td className="px-4 py-3.5 text-[#FAFAFA]">{swap.from_amount} {swap.from_currency}</td>
              <td className="px-4 py-3.5 text-[#FAFAFA]">{swap.to_amount} {swap.to_currency}</td>
              <td className="px-4 py-3.5 text-[#A1A1AA]">{swap.rate}</td>
              <td className="px-4 py-3.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLES[swap.status] ?? STATUS_STYLES.cancelled)}>
                  {swap.status}
                </span>
              </td>
              <td className="px-4 py-3.5 text-xs text-[#52525B]">
                {new Date(swap.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayoutsTab() {
  const { data, isLoading } = usePayouts();
  if (isLoading) return <div className="py-8 text-center text-sm text-[#52525B]">Loading…</div>;
  if (!data?.data?.length) return <EmptyState description="No payouts found." />;
  return (
    <div className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-[#1C1C1F]">
          {["Reference", "Amount", "Destination", "Status", "Date"].map((h) => (
            <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">{h}</th>
          ))}
        </tr></thead>
        <tbody className="divide-y divide-[#1C1C1F]">
          {data.data.map((payout) => (
            <tr key={payout.id} className="hover:bg-[#111113] transition-colors">
              <td className="px-4 py-3.5 font-mono text-xs text-[#A1A1AA]">{payout.reference}</td>
              <td className="px-4 py-3.5 font-medium text-[#FAFAFA]">{payout.amount} {payout.currency}</td>
              <td className="px-4 py-3.5 text-xs text-[#A1A1AA] truncate max-w-[160px]">{payout.destination}</td>
              <td className="px-4 py-3.5">
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", STATUS_STYLES[payout.status] ?? STATUS_STYLES.cancelled)}>
                  {payout.status}
                </span>
              </td>
              <td className="px-4 py-3.5 text-xs text-[#52525B]">
                {new Date(payout.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function BalancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [currency, setCurrency] = useState<CryptoCurrency>("USDT");

  const { data: overview, isLoading } = useBalanceOverview(currency);

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Balance"
        description="Manage your balances and payouts"
        actions={
          <>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CryptoCurrency)}
                className="h-9 appearance-none rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] pl-3 pr-8 text-sm font-medium text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none transition-colors cursor-pointer"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525B]" />
            </div>
            <button className="flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3 text-sm text-[#A1A1AA] hover:border-[#2563EB] hover:text-[#FAFAFA] transition-colors">
              <Download size={13} /> Export CSV
            </button>
            <button className="flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3 text-sm text-[#A1A1AA] hover:border-[#2563EB] hover:text-[#FAFAFA] transition-colors">
              <ArrowDownToLine size={13} /> Deposit
            </button>
            <button className="flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3 text-sm text-[#A1A1AA] hover:border-[#2563EB] hover:text-[#FAFAFA] transition-colors">
              <ArrowLeftRight size={13} /> Swap
            </button>
          </>
        }
      />

      {/* Balance cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BalanceCard
          label="Total Paid Out"
          amount={isLoading ? "—" : fmt(overview?.total_paid_out ?? 0)}
          icon={<CreditCard size={16} />}
          badge={
            <span className="flex items-center gap-1 rounded-full bg-[#052E16] px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
              <ArrowUpRight size={10} /> LIFETIME
            </span>
          }
          loading={isLoading}
        />
        <BalanceCard
          label="Processing"
          amount={isLoading ? "—" : fmt(overview?.processing ?? 0)}
          icon={<Clock size={16} />}
          loading={isLoading}
        />
        <BalanceCard
          label="Available Funds"
          amount={isLoading ? "—" : fmt(overview?.available ?? 0)}
          icon={<Wallet size={16} />}
          action={
            <button className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all">
              Withdraw <ArrowUpRight size={11} />
            </button>
          }
          loading={isLoading}
        />
      </div>

      {/* Tabs */}
      <div>
        <div className="flex items-center border-b border-[#1C1C1F] gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.value
                  ? "border-[#2563EB] text-[#FAFAFA]"
                  : "border-transparent text-[#71717A] hover:text-[#A1A1AA]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {activeTab === "history" && <HistoryTab />}
          {activeTab === "swaps" && <SwapsTab />}
          {activeTab === "payouts" && <PayoutsTab />}
        </div>
      </div>
    </div>
  );
}
