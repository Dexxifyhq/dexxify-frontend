"use client";

import { useState } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Search,
  Filter,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const CHAIN_OPTIONS = [
  { label: "All Chains", value: "all" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Polygon", value: "polygon" },
  { label: "BSC", value: "bsc" },
  { label: "Base", value: "base" },
];

const ASSET_OPTIONS = [
  { label: "All Assets", value: "all" },
  { label: "USDT", value: "usdt" },
  { label: "USDC", value: "usdc" },
  { label: "ETH", value: "eth" },
  { label: "BTC", value: "btc" },
];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [chain, setChain] = useState("all");
  const [asset, setAsset] = useState("all");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="Monitor real-time blockchain transactions."
        actions={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3.5 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Transactions"
          value="0"
          icon={<ArrowLeftRight size={15} />}
        />
        <StatCard
          label="Confirmed"
          value="0"
          icon={<CheckCircle2 size={15} />}
        />
        <StatCard label="Pending" value="0" icon={<Clock size={15} />} />
        <StatCard label="Failed" value="0" icon={<XCircle size={15} />} />
      </div>

      {/* All Transactions */}
      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">
            All Transactions
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by hash, address..."
                className="h-9 w-72 rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
            </div>
            <FilterSelect
              label="All Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
            <FilterSelect
              label="All Chains"
              options={CHAIN_OPTIONS}
              value={chain}
              onChange={setChain}
            />
            <FilterSelect
              label="All Assets"
              options={ASSET_OPTIONS}
              value={asset}
              onChange={setAsset}
            />
          </div>
        </header>

        <EmptyState
          icon={<Filter size={28} strokeWidth={1.5} />}
          description="No transactions found matching your filters."
        />
      </section>
    </div>
  );
}
