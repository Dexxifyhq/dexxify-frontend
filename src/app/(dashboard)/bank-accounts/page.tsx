"use client";

import { useState } from "react";
import {
  Landmark,
  Plus,
  Trash2,
  ChevronRight,
  X,
  BadgeCheck,
  Building2,
  Hash,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import LinkBankModal from "@/components/dashboard/bank-accounts/LinkBankModal";
import { useSavedBanks, useDeleteBank } from "@/lib/hooks/misc/useMisc";
import type { SavedBank } from "@/lib/types/misc";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

// ── Detail drawer ──────────────────────────────────────────────────────────

function BankDetailDrawer({
  bank,
  onClose,
  onDelete,
  deleting,
}: {
  bank: SavedBank;
  onClose: () => void;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const rows: { label: string; value: string; icon: React.ReactNode }[] = [
    {
      label: "Account Name",
      value: bank.account_name,
      icon: <BadgeCheck size={13} className="text-[#52525B]" />,
    },
    {
      label: "Account Number",
      value: bank.account_number,
      icon: <Hash size={13} className="text-[#52525B]" />,
    },
    {
      label: "Bank",
      value: bank.bank_name,
      icon: <Landmark size={13} className="text-[#52525B]" />,
    },
    {
      label: "Currency",
      value: bank.currency.toUpperCase(),
      icon: <CreditCard size={13} className="text-[#52525B]" />,
    },
    {
      label: "Account Type",
      value: bank.type.toUpperCase(),
      icon: <Building2 size={13} className="text-[#52525B]" />,
    },
    {
      label: "Added",
      value: new Date(bank.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      icon: <Calendar size={13} className="text-[#52525B]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1F] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[#FAFAFA]">
              {bank.bank_name}
            </p>
            <p className="mt-0.5 text-xs text-[#71717A]">
              {bank.account_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          {bank.primary && (
            <span className="rounded-full border border-[#14532D]/50 bg-[#052E16]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#22C55E]">
              Primary
            </span>
          )}
          {/* {bank.is_business && (
            <span className="rounded-full border border-[#1d3461]/50 bg-[#0f172a]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#60A5FA]">
              Business
            </span>
          )} */}
          {bank.auto_settlement && (
            <span className="rounded-full border border-[#78350F]/50 bg-[#451A03]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#F59E0B]">
              Auto-settle
            </span>
          )}
          {bank.disabled && (
            <span className="rounded-full border border-[#7f1d1d]/50 bg-[#450a0a]/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#f87171]">
              Disabled
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col divide-y divide-[#1C1C1F] rounded-xl border border-[#1C1C1F]">
            {rows.map(({ label, value, icon }) => (
              <li key={label} className="flex items-center gap-3 px-4 py-3">
                <span className="shrink-0">{icon}</span>
                <span className="w-28 shrink-0 text-xs text-[#71717A]">
                  {label}
                </span>
                <span className="truncate text-xs font-medium text-[#FAFAFA]">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Delete */}
        <div className="border-t border-[#1C1C1F] px-5 py-4">
          <button
            onClick={() => onDelete(bank.id)}
            disabled={deleting}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#7f1d1d]/40 bg-[#450a0a]/40 text-sm font-medium text-[#f87171] hover:bg-[#450a0a]/70 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            {deleting ? "Removing…" : "Remove Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function BankAccountsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<SavedBank | null>(null);

  const { data: savedBanks, isLoading } = useSavedBanks();
  const deleteBank = useDeleteBank();

  const banks: SavedBank[] = Array.isArray(savedBanks)
    ? savedBanks
    : ((savedBanks as any)?.data ?? []);

  function handleDelete(id: string) {
    deleteBank.mutate(id, {
      onSuccess: () => {
        toast.success("Bank account removed.");
        setSelected(null);
      },
      onError: (err: any) => {
        toast.error(err?.message ?? "Failed to remove account.");
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bank Accounts"
        description="Manage bank accounts for fiat withdrawals."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3.5 text-sm font-medium text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
          >
            <Plus size={15} />
            Add Account
          </button>
        }
      />

      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-[#3F3F46]" />
          </div>
        ) : banks.length === 0 ? (
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
              onClick={() => setModalOpen(true)}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
            >
              <Plus size={15} />
              Add Bank Account
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#1C1C1F]">
            {banks.map((bank) => (
              <li key={bank.id}>
                <button
                  type="button"
                  onClick={() => setSelected(bank)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#111113]"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1C1C1F] bg-[#111113]">
                    <Landmark size={15} className="text-[#52525B]" />
                  </div>

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-[#FAFAFA]">
                        {bank.account_name}
                      </p>
                      {bank.primary && (
                        <span className="shrink-0 rounded-full border border-[#14532D]/50 bg-[#052E16]/60 px-2 py-px text-[10px] font-semibold text-[#22C55E]">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[#71717A]">
                      {bank.bank_name} · {bank.account_number}
                    </p>
                  </div>

                  {/* Currency pill + chevron */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-md border border-[#1C1C1F] px-2 py-0.5 text-[11px] font-medium text-[#71717A]">
                      {bank.currency.toUpperCase()}
                    </span>
                    <ChevronRight size={15} className="text-[#3F3F46]" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <LinkBankModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => toast.success("Bank account added!")}
      />

      {selected && (
        <BankDetailDrawer
          bank={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
          deleting={deleteBank.isPending}
        />
      )}
    </div>
  );
}
