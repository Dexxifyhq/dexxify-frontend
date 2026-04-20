"use client";

import { useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  Plus,
  Inbox,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import {
  SearchInput,
  FilterSelect,
} from "@/components/dashboard/shared/FilterBar";
import CreateInvoiceModal, {
  type InvoiceFormValues,
} from "@/components/dashboard/invoices/CreateInvoiceModal";

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Expired", value: "expired" },
];

export default function InvoicesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const handleCreate = async (payload: InvoiceFormValues) => {
    // TODO: wire up to backend (POST /invoices) once API is ready
    console.log("create invoice", payload);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="View and manage all your invoices"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <Plus size={15} />
            Create Invoice
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Invoices"
          value="0"
          icon={<FileText size={15} />}
        />
        <StatCard label="Pending" value="0" icon={<Clock size={15} />} />
        <StatCard
          label="Paid"
          value="0"
          icon={<CheckCircle2 size={15} />}
        />
      </div>

      {/* All Invoices */}
      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">All Invoices</h2>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              placeholder="Search invoices…"
              value={search}
              onChange={setSearch}
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
          icon={<Inbox size={32} strokeWidth={1.5} />}
          title="No invoices found"
          description="Create your first invoice to get started"
        />
      </section>

      <CreateInvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
