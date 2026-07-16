"use client";

import { useState, useEffect } from "react";
import { X, Mail, Phone, User, Loader2 } from "lucide-react";
import { useCreateCustomer } from "@/lib/hooks/customers/useCustomers";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCustomerModal({ open, onClose, onSuccess }: Props) {
  const createCustomer = useCreateCustomer();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setError(null);
    createCustomer.reset();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit =
    !!(firstName.trim() || lastName.trim() || email.trim() || phone.trim());

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || createCustomer.isPending) return;
    setError(null);
    createCustomer.mutate(
      {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err: any) =>
          setError(err?.message ?? "Failed to create customer."),
      },
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#1C1C1F] bg-[#0D0D0F] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold text-[#FAFAFA]">
              Create Customer
            </h2>
            <p className="mt-0.5 text-xs text-[#71717A]">
              At least one field is required.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#71717A] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                First Name
              </label>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
                />
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                Last Name
              </label>
              <div className="relative">
                <User
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Email
            </label>
            <div className="relative">
              <Mail
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
              Phone
            </label>
            <div className="relative">
              <Phone
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+2348012345678"
                className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] pl-8 pr-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-[#7f1d1d]/40 bg-[#450a0a]/60 px-3 py-2.5 text-xs text-[#f87171]">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-[#1C1C1F] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-[#1C1C1F] px-4 text-sm font-medium text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || createCustomer.isPending}
              className="flex h-9 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-medium text-[#09090B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              {createCustomer.isPending && (
                <Loader2 size={13} className="animate-spin" />
              )}
              {createCustomer.isPending ? "Creating…" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
