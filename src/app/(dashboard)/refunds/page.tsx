"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Success", value: "success" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

export default function RefundsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Refunds"
        description="View and manage your refund history."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value="0" icon={<FileText size={15} />} />
        <StatCard
          label="Success"
          value="0"
          icon={<CheckCircle2 size={15} />}
        />
        <StatCard label="Pending" value="0" icon={<Clock size={15} />} />
        <StatCard label="Failed" value="0" icon={<XCircle size={15} />} />
      </div>

      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">All Refunds</h2>
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
                placeholder="Search by reference..."
                className="h-9 w-72 rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
            </div>
            <FilterSelect
              label="All Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
          </div>
        </header>

        <EmptyState
          icon={<Filter size={28} strokeWidth={1.5} />}
          description="No refunds found matching your criteria."
        />
      </section>
    </div>
  );
}
