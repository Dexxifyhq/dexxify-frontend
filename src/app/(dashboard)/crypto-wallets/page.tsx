"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Wallet,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import AddAddressModal from "@/components/dashboard/crypto-wallets/AddAddressModal";
import {
  useSavedWithdrawalAddresses,
  useDeleteWithdrawalAddress,
} from "@/lib/hooks/wallet/useWallets";
import type { WithdrawalAddress } from "@/lib/types/wallet";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

// ── Helpers ────────────────────────────────────────────────────────────────

const NETWORK_LABEL: Record<string, string> = {
  ERC20: "ERC-20 · Ethereum",
  TRC20: "TRC-20 · Tron",
  SOL: "Solana",
  BSC: "BEP-20 · BSC",
  TON: "TON",
};

const NETWORK_COLOR: Record<string, string> = {
  ERC20: "bg-[#1e3a5f]/60 text-[#60A5FA] border-[#1d3461]/50",
  TRC20: "bg-[#1a0a2e]/60 text-[#a855f7] border-[#3b0764]/50",
  SOL: "bg-[#0f2618]/60 text-[#4ade80] border-[#14532D]/50",
  BSC: "bg-[#2d1a00]/60 text-[#F59E0B] border-[#78350F]/50",
  TON: "bg-[#0c1a30]/60 text-[#38BDF8] border-[#1e3a5f]/50",
};

function NetworkBadge({ network }: { network: string }) {
  const cls =
    NETWORK_COLOR[network] ??
    "bg-[#18181B]/60 text-[#71717A] border-[#27272A]/50";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        cls,
      )}
    >
      {NETWORK_LABEL[network] ?? network}
    </span>
  );
}

function truncateAddress(addr: string) {
  if (addr.length <= 20) return addr;
  return `${addr.slice(0, 10)}…${addr.slice(-8)}`;
}

// ── Address card ───────────────────────────────────────────────────────────

function AddressCard({
  item,
  onDelete,
  deleting,
}: {
  item: WithdrawalAddress;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1C1C1F] bg-[#111113]">
            <Wallet size={14} className="text-[#52525B]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-[#FAFAFA]">
                {item.label}
              </p>
              {item.primary && (
                <Star size={11} className="shrink-0 fill-[#F59E0B] text-[#F59E0B]" />
              )}
            </div>
            <p className="mt-0.5 font-mono text-xs text-[#52525B]">
              {truncateAddress(item.address)}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-md border border-[#1C1C1F] px-2 py-0.5 text-[11px] font-semibold text-[#71717A]">
          {item.token}
        </span>
      </div>

      {/* Network badge */}
      <NetworkBadge network={item.network} />

      {/* Delete */}
      {confirm ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="flex-1 h-8 rounded-lg border border-[#1C1C1F] text-xs font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={deleting}
            className="flex flex-1 h-8 items-center justify-center gap-1.5 rounded-lg bg-[#450a0a]/60 text-xs font-medium text-[#f87171] hover:bg-[#450a0a]/90 disabled:opacity-50 transition-colors"
          >
            {deleting ? <Loader2 size={12} className="animate-spin" /> : null}
            {deleting ? "Removing…" : "Yes, remove"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-[#1C1C1F] text-xs text-[#52525B] hover:border-[#7f1d1d]/40 hover:text-[#f87171] transition-colors"
        >
          <Trash2 size={12} />
          Remove
        </button>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const NETWORK_FILTERS = [
  { label: "All Networks", value: "all" },
  { label: "ERC-20", value: "ERC20" },
  { label: "TRC-20", value: "TRC20" },
  { label: "Solana", value: "SOL" },
  { label: "BEP-20", value: "BSC" },
  { label: "TON", value: "TON" },
];

export default function CryptoWalletsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [networkFilter, setNetworkFilter] = useState("all");

  const { data, isLoading, isError } = useSavedWithdrawalAddresses();
  const deleteAddress = useDeleteWithdrawalAddress();

  const allAddresses: WithdrawalAddress[] = Array.isArray(data)
    ? data
    : ((data as any)?.data ?? []);

  const filtered = allAddresses.filter((a) => {
    const matchNet = networkFilter === "all" || a.network === networkFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.address.toLowerCase().includes(q) ||
      a.label.toLowerCase().includes(q) ||
      a.token.toLowerCase().includes(q);
    return matchNet && matchSearch;
  });

  function handleDelete(id: string) {
    deleteAddress.mutate(id, {
      onSuccess: () => toast.success("Address removed."),
      onError: (err: any) =>
        toast.error(err?.message ?? "Failed to remove address."),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Crypto Wallets"
        description="Manage withdrawal addresses for stablecoin payouts."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
          >
            <Plus size={15} />
            Add Address
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address or label…"
            className="h-9 w-full rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2a2a30] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#1C1C1F] bg-[#09090B] p-1">
          {NETWORK_FILTERS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setNetworkFilter(opt.value)}
              className={cn(
                "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
                networkFilter === opt.value
                  ? "bg-[#1C1C1F] text-[#FAFAFA]"
                  : "text-[#52525B] hover:text-[#A1A1AA]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-[#3F3F46]" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
          <AlertCircle size={24} className="text-[#3F3F46]" strokeWidth={1.5} />
          <p className="text-sm text-[#71717A]">Failed to load addresses.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <div className="text-[#3F3F46]">
            <Wallet size={32} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#FAFAFA]">
              {search || networkFilter !== "all"
                ? "No addresses match your filters."
                : "No withdrawal addresses yet."}
            </p>
            {!search && networkFilter === "all" && (
              <p className="mt-1 text-xs text-[#71717A]">
                Add a crypto address to start receiving stablecoin payouts.
              </p>
            )}
          </div>
          {!search && networkFilter === "all" && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
            >
              <Plus size={14} />
              Add Address
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <AddressCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              deleting={deleteAddress.isPending}
            />
          ))}
        </div>
      )}

      <AddAddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => toast.success("Withdrawal address saved.")}
      />
    </div>
  );
}
