"use client";

import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import EmptyState from "@/components/dashboard/shared/EmptyState";

export default function PaymentPagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment Pages"
        description="Manage your Payment Pages"
        actions={
          <Link
            href="/payment-pages/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
          >
            <Plus size={15} />
            New Page
          </Link>
        }
      />

      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <EmptyState
          icon={<FileText size={32} strokeWidth={1.5} />}
          title="No payment pages found."
          description="Create one to start accepting payments."
          className="py-24"
        />
      </section>
    </div>
  );
}
