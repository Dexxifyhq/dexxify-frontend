"use client";

import { Send, X, Info, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
        description: "Initiate crypto withdrawals to external addresses",
      },
      {
        key: "swap_balance",
        title: "Swap Balance",
        description: "Swap between balance currencies",
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

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1C1C1F] px-6 py-4">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-[#2563EB]" />
            <h2 className="text-base font-semibold text-[#FAFAFA]">
              Invite Staff Member
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Work Email */}
            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-semibold text-[#FAFAFA]">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                required
              />
              <p className="mt-2 text-xs leading-relaxed text-[#71717A]">
                An invitation email will be sent to this address. They will set
                their own password during onboarding.
              </p>
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#FAFAFA]">
                Role
                <Info size={13} className="text-[#71717A]" />
              </label>
              <Select value={role} onChange={setRole} options={ROLES} />
            </div>

            {/* Permissions */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-[#FAFAFA]">
                Permissions
              </h3>

              {GROUPS.map((g) => (
                <div key={g.key} className="mb-5 last:mb-0">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                      {g.label}
                    </p>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#A1A1AA]">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 cursor-pointer rounded border-[#3F3F46] bg-[#09090B] accent-[#2563EB]"
                        checked={groupAllChecked[g.key] ?? false}
                        onChange={(e) => setGroupAll(g, e.target.checked)}
                      />
                      Select all
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    {g.permissions.map((perm) => {
                      const on = !!perms[perm.key];
                      return (
                        <div
                          key={perm.key}
                          className="flex items-center justify-between gap-3 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#FAFAFA]">
                              {perm.title}
                            </p>
                            <p className="text-xs text-[#71717A]">
                              {perm.description}
                            </p>
                          </div>
                          <Toggle
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
              <label className="mb-1.5 block text-sm font-semibold text-[#FAFAFA]">
                Account Status
              </label>
              <Select value={status} onChange={setStatus} options={STATUSES} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-[#1C1C1F] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#1C1C1F] bg-transparent px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="h-9 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
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
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 pr-9 text-sm text-[#FAFAFA] focus:border-[#2563EB] focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]"
      />
    </div>
  );
}

function Toggle({
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
      className={`relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full border px-0.5 text-[9px] font-semibold uppercase tracking-wide transition-colors ${
        checked
          ? "justify-start border-[#2563EB] bg-[#2563EB] text-white"
          : "justify-end border-[#1C1C1F] bg-[#09090B] text-[#52525B]"
      }`}
    >
      <span className="px-1">{checked ? "On" : "Off"}</span>
      <span
        className={`absolute top-1/2 h-[16px] w-[16px] -translate-y-1/2 rounded-full bg-white transition-all ${
          checked ? "right-[2px]" : "left-[2px] bg-[#52525B]"
        }`}
      />
    </button>
  );
}
