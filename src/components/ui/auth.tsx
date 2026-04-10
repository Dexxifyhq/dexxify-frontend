"use client";
/**
 * Shared primitives for all auth pages.
 * Import from here — never duplicate in individual page files.
 */

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from "lucide-react";

// ── Alert ──────────────────────────────────────────────────────────────────

interface AlertProps {
  message: string;
  variant: "error" | "success";
}

export function AuthAlert({ message, variant }: AlertProps) {
  const isError = variant === "error";
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border ${
        isError
          ? "bg-[#EF4444]/8 border-[#EF4444]/20"
          : "bg-[#22C55E]/8 border-[#22C55E]/20"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isError ? "bg-[#EF4444]" : "bg-[#22C55E]"
        }`}
      />
      <p className={`text-sm ${isError ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
        {message}
      </p>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────

export function AuthCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[#111113] border border-[#1C1C1F] rounded-2xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

// ── Label ──────────────────────────────────────────────────────────────────

export function AuthLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="text-xs font-medium text-[#71717A]">
      {children}
      {optional && <span className="text-[#3F3F46] ml-1">(optional)</span>}
    </label>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────

export const inputClass =
  "w-full h-10 px-3 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#2563EB] transition-colors";

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

// ── Password input with show/hide toggle ───────────────────────────────────

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function PasswordInput({ value, onChange, ...rest }: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...rest}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`${inputClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#FAFAFA] transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ── Password strength ──────────────────────────────────────────────────────

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 pt-1">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1">
          <div
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
              c.pass
                ? "bg-[#22C55E]/10 border border-[#22C55E]/30"
                : "bg-[#1C1C1F] border border-[#1C1C1F]"
            }`}
          >
            {c.pass && (
              <Check size={8} className="text-[#22C55E]" strokeWidth={3} />
            )}
          </div>
          <span
            className={`text-[10px] ${c.pass ? "text-[#22C55E]" : "text-[#71717A]"}`}
          >
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Submit button ──────────────────────────────────────────────────────────

interface AuthButtonProps {
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function AuthButton({ loading, disabled, children }: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : children}
    </button>
  );
}

// ── Back link ──────────────────────────────────────────────────────────────

export function AuthBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors mb-8"
    >
      <ArrowLeft size={14} />
      {label}
    </Link>
  );
}

// ── Field wrapper (label + input stacked) ─────────────────────────────────

export function AuthField({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <AuthLabel optional={optional}>{label}</AuthLabel>
      {children}
    </div>
  );
}
