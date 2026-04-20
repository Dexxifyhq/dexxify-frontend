"use client";

import { useState } from "react";
import { Landmark, Plus } from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import LinkBankModal from "@/components/dashboard/bank-accounts/LinkBankModal";

export default function BankAccountsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bank Accounts"
        description="Manage bank accounts for fiat withdrawals."
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3.5 text-sm font-medium text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
          >
            <Plus size={15} />
            Add Account
          </button>
        }
      />

      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="text-[#3F3F46]">
            <Landmark size={36} strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-semibold text-[#FAFAFA]">
              No Bank Accounts
            </h3>
            <p className="max-w-sm text-sm text-[#71717A]">
              You haven&apos;t connected any bank accounts yet. Add your first
              account to start receiving fiat withdrawals.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
          >
            <Plus size={15} />
            Add Bank Account
          </button>
        </div>
      </section>

      <LinkBankModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => {
          // TODO: POST /bank-accounts
          console.log("link bank", payload);
        }}
      />
    </div>
  );
}
