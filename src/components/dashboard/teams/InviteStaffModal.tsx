"use client";

import { Send, X, Info, ChevronDown, Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { BusinessRole } from "@/lib/auth-api";

export interface StaffPermissionDef {
  key: string;
  title: string;
  description: string;
}

const OWNER_PERMISSIONS: StaffPermissionDef[] = [
  {
    key: "manage_balance",
    title: "Manage Balance",
    description: "View the entire balance",
  },
  {
    key: "manage_bank_accounts",
    title: "Manage Bank Accounts",
    description: "Create, update, and delete bank accounts",
  },
  {
    key: "manage_crypto_addresses",
    title: "Manage Crypto Addresses",
    description: "Create, update, and delete crypto addresses",
  },
  {
    key: "manage_payment_pages",
    title: "Manage Payment Pages",
    description: "Create and manage payment pages",
  },
  {
    key: "withdraw_bank",
    title: "Withdraw to Bank",
    description: "Initiate fiat withdrawals to bank accounts",
  },
  {
    key: "withdraw_crypto",
    title: "Withdraw Crypto",
    description: "Initiate crypto withdrawals",
  },
  {
    key: "swap_balance",
    title: "Swap Balance",
    description: "Swap between currencies",
  },
  {
    key: "initiate_refunds",
    title: "Initiate Refunds",
    description: "Process refunds payments",
  },
  {
    key: "manage_invoices",
    title: "Manage Invoices",
    description: "Create and manage invoices",
  },
  {
    key: "manage_checkouts",
    title: "Manage Checkouts",
    description: "Create and manage checkouts",
  },
  {
    key: "manage_customers",
    title: "Manage Customers",
    description: "Create and manage customers",
  },
];

const ADMIN_PERMISSIONS: StaffPermissionDef[] = [
  {
    key: "manage_balance",
    title: "Manage Balance",
    description: "View the entire balance",
  },
  {
    key: "manage_bank_accounts",
    title: "Manage Bank Accounts",
    description: "Create, update, and delete bank accounts",
  },
  {
    key: "manage_crypto_addresses",
    title: "Manage Crypto Addresses",
    description: "Create, update, and delete crypto addresses",
  },
  {
    key: "manage_payment_pages",
    title: "Manage Payment Pages",
    description: "Create and manage payment pages",
  },
  {
    key: "withdraw_bank",
    title: "Withdraw to Bank",
    description: "Initiate fiat withdrawals to bank accounts",
  },
  {
    key: "withdraw_crypto",
    title: "Withdraw Crypto",
    description: "Initiate crypto withdrawals",
  },
  {
    key: "swap_balance",
    title: "Swap Balance",
    description: "Swap between currencies",
  },
  {
    key: "initiate_refunds",
    title: "Initiate Refunds",
    description: "Process refunds payments",
  },
  {
    key: "manage_invoices",
    title: "Manage Invoices",
    description: "Create and manage invoices",
  },
  {
    key: "manage_checkouts",
    title: "Manage Checkouts",
    description: "Create and manage checkouts",
  },
  {
    key: "manage_customers",
    title: "Manage Customers",
    description: "Create and manage customers",
  },
];

const STAFF_PERMISSIONS: StaffPermissionDef[] = [
  {
    key: "manage_payment_pages",
    title: "Manage Payment Pages",
    description: "Create and manage payment pages",
  },
  {
    key: "manage_invoices",
    title: "Manage Invoices",
    description: "Create and manage invoices",
  },
  {
    key: "manage_checkouts",
    title: "Manage Checkouts",
    description: "Create and manage checkouts",
  },
  {
    key: "manage_customers",
    title: "Manage Customers",
    description: "Create and manage customers",
  },
  {
    key: "initiate_refunds",
    title: "Initiate Refunds",
    description: "Process refunds payments",
  },
];

const ROLE_PERMISSIONS: Record<BusinessRole, StaffPermissionDef[]> = {
  owner: OWNER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
};

const ROLES: { label: string; value: BusinessRole }[] = [
  { label: "Staff", value: "staff" },
  { label: "Admin", value: "admin" },
  { label: "Owner", value: "owner" },
];

interface InviteStaffModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    email: string;
    role: BusinessRole;
  }) => void | Promise<void>;
}

export default function InviteStaffModal({
  open,
  onClose,
  onSubmit,
}: InviteStaffModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BusinessRole>("staff");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setRole("staff");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canSubmit = email.trim() !== "" && email.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    try {
      setSubmitting(true);
      await onSubmit?.({ email, role });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  const permissions = ROLE_PERMISSIONS[role];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Invite Staff Member"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6">
          <div className="flex items-center gap-3">
            <Send size={18} className="text-dash-accent" />
            <h2 className="text-xl font-bold text-dash-foreground">
              Invite Staff Member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto border-y border-dash-border px-7 py-6">
            {/* Work Email */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-dash-foreground">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="h-11 w-full rounded-lg border border-dash-border bg-dash-card px-3.5 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-dash-accent focus:outline-none"
                required
              />
              <p className="mt-2 text-xs leading-relaxed text-dash-muted">
                An invitation email will be sent to this address. They will set
                their own password during onboarding.
              </p>
            </div>

            {/* Role */}
            <div className="mb-7">
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-dash-foreground">
                Role
                <Info size={13} className="text-dash-muted" />
              </label>
              <Select
                value={role}
                onChange={(v) => setRole(v as BusinessRole)}
                options={ROLES}
              />
            </div>

            {/* Permissions — read-only preview of what this role grants */}
            <div className="mb-7">
              <h3 className="mb-1 text-[15px] font-semibold text-dash-foreground">
                Permissions
              </h3>
              <p className="mb-4 text-sm text-dash-muted">
                Fixed by role and enforced by the server — not something you
                assign per invite.
              </p>

              <div className="divide-y divide-dash-border rounded-xl border border-dash-border">
                {permissions.map((perm) => (
                  <div
                    key={perm.key}
                    className="flex items-center gap-3.5 px-5 py-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-dash-success-bg text-dash-success">
                      <Check size={13} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-dash-foreground">
                        {perm.title}
                      </p>
                      <p className="mt-0.5 text-sm text-dash-muted">
                        {perm.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-7 py-5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-dash-border bg-transparent px-6 text-sm font-semibold text-dash-foreground transition-colors hover:bg-dash-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="h-11 rounded-lg bg-dash-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? "Sending…" : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-dash-border bg-dash-card px-3.5 pr-10 text-sm text-dash-foreground transition-colors focus:border-dash-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-muted"
      />
    </div>
  );
}
