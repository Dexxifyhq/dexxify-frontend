"use client";

import { Send, X, Info, ChevronDown, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/utils";

export interface StaffPermissionDef {
  key: string;
  title: string;
  description: string;
}

export interface StaffPermissionGroup {
  key: string;
  label: string;
  permissions: StaffPermissionDef[];
}

const GROUPS: StaffPermissionGroup[] = [
  {
    key: "account",
    label: "Account Management",
    permissions: [
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
    ],
  },
  {
    key: "financial",
    label: "Financial Operations",
    permissions: [
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
    ],
  },
];

const ROLES = [
  { label: "Staff", value: "staff" },
  { label: "Admin", value: "admin" },
  { label: "Owner", value: "owner" },
];

const STATUSES = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

interface InviteStaffModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    email: string;
    role: string;
    status: string;
    permissions: string[];
  }) => void | Promise<void>;
}

export default function InviteStaffModal({
  open,
  onClose,
  onSubmit,
}: InviteStaffModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [status, setStatus] = useState("active");
  const [perms, setPerms] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setRole("staff");
      setStatus("active");
      setPerms({});
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

  const togglePerm = (key: string) =>
    setPerms((p) => ({ ...p, [key]: !p[key] }));

  const setGroupAll = (group: StaffPermissionGroup, value: boolean) =>
    setPerms((p) => {
      const next = { ...p };
      group.permissions.forEach((perm) => {
        next[perm.key] = value;
      });
      return next;
    });

  const groupAllChecked = useMemo(
    () =>
      Object.fromEntries(
        GROUPS.map((g) => [
          g.key,
          g.permissions.every((perm) => perms[perm.key]),
        ]),
      ),
    [perms],
  );

  const canSubmit = email.trim() !== "" && email.includes("@");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    const enabled = Object.entries(perms)
      .filter(([, v]) => v)
      .map(([k]) => k);
    try {
      setSubmitting(true);
      await onSubmit?.({ email, role, status, permissions: enabled });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

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

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[#1F1F23] bg-[#111113] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6">
          <div className="flex items-center gap-3">
            <Send size={18} className="text-[#2563EB]" />
            <h2 className="text-xl font-bold text-[#FAFAFA]">
              Invite Staff Member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#71717A] transition-colors hover:bg-[#1C1C1F] hover:text-[#FAFAFA]"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto border-y border-[#1F1F23] px-7 py-6">
            {/* Work Email */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-[#FAFAFA]">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="h-11 w-full rounded-lg border border-[#26262B] bg-[#0A0B0E] px-3.5 text-sm text-[#FAFAFA] transition-colors placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none"
                required
              />
              <p className="mt-2 text-xs leading-relaxed text-[#71717A]">
                An invitation email will be sent to this address. They will set
                their own password during onboarding.
              </p>
            </div>

            {/* Role */}
            <div className="mb-7">
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#FAFAFA]">
                Role
                <Info size={13} className="text-[#71717A]" />
              </label>
              <Select value={role} onChange={setRole} options={ROLES} />
            </div>

            {/* Permissions */}
            <div className="mb-7">
              <h3 className="mb-4 text-[15px] font-semibold text-[#FAFAFA]">
                Permissions
              </h3>

              {GROUPS.map((g) => (
                <div key={g.key} className="mb-6 last:mb-0">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                      {g.label}
                    </p>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#FAFAFA]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-[#3F3F46] bg-transparent accent-[#2563EB]"
                        checked={groupAllChecked[g.key] ?? false}
                        onChange={(e) => setGroupAll(g, e.target.checked)}
                      />
                      Select all
                    </label>
                  </div>

                  <div className="divide-y divide-[#1F1F23] rounded-xl border border-[#26262B]">
                    {g.permissions.map((perm) => {
                      const on = !!perms[perm.key];
                      return (
                        <div
                          key={perm.key}
                          className="flex items-center justify-between gap-4 px-5 py-4"
                        >
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-[#FAFAFA]">
                              {perm.title}
                            </p>
                            <p className="mt-0.5 text-sm text-[#71717A]">
                              {perm.description}
                            </p>
                          </div>
                          <PermPill
                            checked={on}
                            onChange={() => togglePerm(perm.key)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Account Status */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#FAFAFA]">
                Account Status
              </label>
              <Select value={status} onChange={setStatus} options={STATUSES} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-7 py-5">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg border border-[#26262B] bg-transparent px-6 text-sm font-semibold text-[#FAFAFA] transition-colors hover:bg-[#1C1C1F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="h-11 rounded-lg bg-[#FAFAFA] px-6 text-sm font-semibold text-[#09090B] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
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
        className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[#26262B] bg-[#0A0B0E] px-3.5 pr-10 text-sm text-[#FAFAFA] transition-colors focus:border-[#2563EB] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A]"
      />
    </div>
  );
}

function PermPill({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "inline-flex h-9 min-w-[64px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors",
        checked
          ? "border-[#3F3F46] bg-[#1C1C1F] text-[#FAFAFA]"
          : "border-[#26262B] bg-transparent text-[#52525B] hover:border-[#3F3F46] hover:text-[#A1A1AA]",
      )}
    >
      {checked && <Check size={13} />}
      {checked ? "On" : "Off"}
    </button>
  );
}
