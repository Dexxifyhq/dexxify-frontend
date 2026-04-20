"use client";

import { useState } from "react";
import { Users, UserPlus, UserCheck, UserCog, Search } from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="View and manage all your customers"
        actions={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3.5 text-sm font-medium text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
          >
            <UserPlus size={14} />
            Create Customer
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Customers"
          value="0"
          icon={<Users size={15} />}
        />
        <StatCard
          label="New Customers"
          value="0"
          change={{ value: 0, direction: "up", percent: 0 }}
          icon={<UserPlus size={15} />}
        />
        <StatCard
          label="Active Customers"
          value="0"
          change={{ value: 0, direction: "up", percent: 0 }}
          icon={<UserCog size={15} />}
        />
        <StatCard
          label="Verified Customers"
          value="0"
          change={{ value: 0, direction: "up", percent: 0 }}
          icon={<UserCheck size={15} />}
        />
      </div>

      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">
            All Customers
          </h2>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="h-9 w-72 rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
            />
          </div>
        </header>

        <EmptyState
          icon={<Users size={30} strokeWidth={1.5} />}
          title="No customers found"
          description=""
        />
      </section>
    </div>
  );
}
