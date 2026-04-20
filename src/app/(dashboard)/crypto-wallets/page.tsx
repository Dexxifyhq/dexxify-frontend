"use client";

import { useState } from "react";
import { Plus, Search, LayoutGrid, List } from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import { FilterSelect } from "@/components/dashboard/shared/FilterBar";
import AddAddressModal from "@/components/dashboard/crypto-wallets/AddAddressModal";

const NETWORK_OPTIONS = [
  { label: "All Networks", value: "all" },
  { label: "Ethereum", value: "ethereum" },
  { label: "Polygon", value: "polygon" },
  { label: "BSC", value: "bsc" },
  { label: "Base", value: "base" },
  { label: "Bitcoin", value: "bitcoin" },
  { label: "Solana", value: "solana" },
  { label: "Tron", value: "tron" },
];

export default function CryptoWalletsPage() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [network, setNetwork] = useState("all");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Crypto Wallets"
        description="Manage crypto wallets for crypto withdrawals"
        actions={
          <>
            <div className="flex h-9 items-center rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] p-0.5">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  view === "grid"
                    ? "bg-[#2563EB] text-white"
                    : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                  view === "list"
                    ? "bg-[#2563EB] text-white"
                    : "text-[#71717A] hover:text-[#FAFAFA]"
                }`}
              >
                <List size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
            >
              <Plus size={15} />
              Add Address
            </button>
          </>
        }
      />

      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[260px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by address or label..."
            className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] pl-9 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
          />
        </div>
        <FilterSelect
          label="All Networks"
          options={NETWORK_OPTIONS}
          value={network}
          onChange={setNetwork}
        />
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <h3 className="text-base font-semibold text-[#FAFAFA]">
          No Addresses Found
        </h3>
        <p className="text-sm text-[#71717A]">
          Add your first wallet address to start receiving payouts.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 inline-flex h-9 items-center rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
        >
          Create Address
        </button>
      </div>

      <AddAddressModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => {
          // TODO: POST /crypto-addresses
          console.log("add address", payload);
        }}
      />
    </div>
  );
}
