"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Download,
  ChevronDown,
  Filter,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";
import CreatePaymentModal, {
  type PaymentFormValues,
} from "@/components/dashboard/checkouts/CreatePaymentModal";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

export default function CheckoutsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const handleCreate = async (payload: PaymentFormValues) => {
    // TODO: wire to backend (POST /checkouts)
    console.log("create payment", payload);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Checkout"
        description="Manage and monitor all your payments"
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3.5 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              <Download size={14} />
              Export CSV
              <ChevronDown size={13} />
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
            >
              <Plus size={15} />
              New Payment
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value="0" icon={<FileText size={15} />} />
        <StatCard
          label="Completed"
          value="0"
          icon={<CheckCircle2 size={15} />}
        />
        <StatCard label="Pending" value="0" icon={<Clock size={15} />} />
        <StatCard label="Failed" value="0" icon={<XCircle size={15} />} />
      </div>

      {/* All Payments */}
      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">All Payments</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, address, or tx"
              className="h-9 w-72 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
            />
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
          description="No checkout sessions found matching your filters."
        />
      </section>

      <CreatePaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
