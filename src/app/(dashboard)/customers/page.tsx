"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  CreditCard,
  Search,
  X,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import StatCard from "@/components/dashboard/shared/StatCard";
import EmptyState from "@/components/dashboard/shared/EmptyState";
import CreateCustomerModal from "@/components/dashboard/customers/CreateCustomerModal";
import {
  useCustomers,
  useUpdateCustomer,
  useDeleteCustomer,
} from "@/lib/hooks/customers/useCustomers";
import type { Customer, CustomerStatus } from "@/lib/types/customers";
import { toast } from "sonner";
import { cn } from "@/utils/utils";

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<CustomerStatus, { label: string; className: string }> =
  {
    active: {
      label: "Active",
      className: "border-[#14532D]/50 bg-[#052E16]/60 text-[#22C55E]",
    },
    inactive: {
      label: "Inactive",
      className: "border-[#78350F]/50 bg-[#451A03]/60 text-[#F59E0B]",
    },
  };

function StatusBadge({ status }: { status: CustomerStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.active;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}

function CustomerAvatar({ customer }: { customer: Customer }) {
  const initials =
    customer.first_name?.[0]?.toUpperCase() ??
    customer.email?.[0]?.toUpperCase() ??
    "?";

  const COLORS = [
    "bg-[#1e3a5f] text-[#60A5FA]",
    "bg-[#14532D] text-[#4ade80]",
    "bg-[#451A03] text-[#F59E0B]",
    "bg-[#3b0764] text-[#c084fc]",
    "bg-[#164e63] text-[#67e8f9]",
  ];
  const colorIdx =
    (customer.first_name?.charCodeAt(0) ?? customer.email?.charCodeAt(0) ?? 0) %
    COLORS.length;

  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        COLORS[colorIdx],
      )}
    >
      {initials}
    </div>
  );
}

function fullName(c: Customer) {
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ");
  return name || c.email || "—";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

// ── Detail drawer ──────────────────────────────────────────────────────────

function CustomerDrawer({
  customer,
  onClose,
  onDeleted,
}: {
  customer: Customer;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [firstName, setFirstName] = useState(customer.first_name ?? "");
  const [lastName, setLastName] = useState(customer.last_name ?? "");
  const [email, setEmail] = useState(customer.email ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");

  const isDirty =
    firstName !== (customer.first_name ?? "") ||
    lastName !== (customer.last_name ?? "") ||
    email !== (customer.email ?? "") ||
    phone !== (customer.phone ?? "");

  const handleSave = () => {
    updateCustomer.mutate(
      {
        customerId: customer.id,
        payload: {
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        },
      },
      {
        onSuccess: () => toast.success("Customer updated."),
        onError: (err: any) =>
          toast.error(err?.message ?? "Failed to update customer."),
      },
    );
  };

  const handleDelete = () => {
    deleteCustomer.mutate(customer.id, {
      onSuccess: () => {
        toast.success("Customer deleted.");
        onDeleted();
        onClose();
      },
      onError: (err: any) =>
        toast.error(err?.message ?? "Failed to delete customer."),
    });
  };

  const inputCls =
    "h-9 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1C1C1F] px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <CustomerAvatar customer={customer} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#FAFAFA]">
                {fullName(customer)}
              </p>
              <p className="mt-0.5 truncate text-xs text-[#71717A]">
                {customer.email ?? "No email"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Status + joined */}
        <div className="flex items-center justify-between border-b border-[#1C1C1F] px-5 py-3">
          <StatusBadge status={customer.status} />
          <span className="flex items-center gap-1.5 text-xs text-[#52525B]">
            <Calendar size={11} />
            Joined {formatDate(customer.created_at)}
          </span>
        </div>

        {/* Edit fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
            Details
          </p>
          <div className="flex flex-col gap-3">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#52525B]">
                  F
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className={inputCls}
                />
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#52525B]">
                  L
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className={inputCls}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className={inputCls}
              />
            </div>
          </div>

          {isDirty && (
            <button
              type="button"
              onClick={handleSave}
              disabled={updateCustomer.isPending}
              className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#FAFAFA] text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {updateCustomer.isPending && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {updateCustomer.isPending ? "Saving…" : "Save Changes"}
            </button>
          )}
        </div>

        {/* Delete */}
        <div className="border-t border-[#1C1C1F] px-5 py-4">
          {confirmDelete ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#f87171]">
                This will permanently delete this customer. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-9 rounded-lg border border-[#1C1C1F] text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteCustomer.isPending}
                  className="flex flex-1 h-9 items-center justify-center gap-2 rounded-lg bg-[#7f1d1d] text-sm font-medium text-[#f87171] hover:bg-[#991b1b] disabled:opacity-50 transition-colors"
                >
                  {deleteCustomer.isPending && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  {deleteCustomer.isPending ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-[#7f1d1d]/40 bg-[#450a0a]/40 text-sm font-medium text-[#f87171] hover:bg-[#450a0a]/70 transition-colors"
            >
              Delete Customer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Filters ────────────────────────────────────────────────────────────────

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Customer | null>(null);

  const { data, isLoading, isError } = useCustomers();

  const allCustomers: Customer[] = Array.isArray(data)
    ? data
    : ((data as any)?.data ?? []);

  // Stats
  const total = allCustomers.length;
  const active = allCustomers.filter((c) => c.status === "active").length;
  const newThisMonth = allCustomers.filter((c) =>
    isThisMonth(c.created_at),
  ).length;
  const paying = allCustomers.filter((c) => c.has_paid).length;

  // Filter
  const filtered = allCustomers.filter((c) => {
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.first_name?.toLowerCase().includes(q) ||
      c.last_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="View and manage all your customers."
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FAFAFA] px-3.5 text-sm font-medium text-[#09090B] hover:bg-white transition-colors"
          >
            <UserPlus size={15} />
            Create Customer
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={String(total)}
          icon={<Users size={15} />}
        />
        <StatCard
          label="New This Month"
          value={String(newThisMonth)}
          icon={<UserPlus size={15} />}
        />
        <StatCard
          label="Active"
          value={String(active)}
          icon={<UserCheck size={15} />}
        />
        <StatCard
          label="Paying"
          value={String(paying)}
          icon={<CreditCard size={15} />}
        />
      </div>

      {/* Table */}
      <section className="rounded-xl border border-[#1C1C1F] bg-[#0D0D0F]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C1C1F] px-5 py-4">
          <h2 className="text-sm font-semibold text-[#FAFAFA]">
            All Customers
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone…"
                className="h-9 w-60 rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2a2a30] focus:outline-none transition-colors"
              />
            </div>
            {/* Status pills */}
            <div className="flex items-center gap-1 rounded-lg border border-[#1C1C1F] bg-[#09090B] p-1">
              {STATUS_FILTERS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
                    statusFilter === opt.value
                      ? "bg-[#1C1C1F] text-[#FAFAFA]"
                      : "text-[#52525B] hover:text-[#A1A1AA]",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-[#3F3F46]" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <AlertCircle
              size={24}
              className="text-[#3F3F46]"
              strokeWidth={1.5}
            />
            <p className="text-sm text-[#71717A]">Failed to load customers.</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={28} strokeWidth={1.5} />}
            description={
              search || statusFilter !== "all"
                ? "No customers match your filters."
                : "No customers yet. Create your first one."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1C1C1F]">
                  {["Customer", "Email", "Phone", "Status", "Joined", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#52525B]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C1C1F]">
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setSelected(customer)}
                    className="cursor-pointer transition-colors hover:bg-[#111113]"
                  >
                    {/* Customer */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar customer={customer} />
                        <span className="font-medium text-[#FAFAFA]">
                          {[customer.first_name, customer.last_name]
                            .filter(Boolean)
                            .join(" ") || (
                            <span className="text-[#52525B]">No name</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[#A1A1AA]">
                        {customer.email ?? (
                          <span className="text-[#3F3F46]">—</span>
                        )}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[#A1A1AA]">
                        {customer.phone ?? (
                          <span className="text-[#3F3F46]">—</span>
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={customer.status} />
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-[#71717A]">
                        {formatDate(customer.created_at)}
                      </span>
                    </td>

                    {/* Arrow */}
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} className="text-[#3F3F46]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CreateCustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => toast.success("Customer created.")}
      />

      {selected && (
        <CustomerDrawer
          customer={selected}
          onClose={() => setSelected(null)}
          onDeleted={() => setSelected(null)}
        />
      )}
    </div>
  );
}
