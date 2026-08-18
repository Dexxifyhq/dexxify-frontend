"use client";
/**
 * Shared primitives for all auth pages.
 * Import from here — never duplicate in individual page files.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
          ? "bg-dash-error-bg border-dash-error-border"
          : "bg-dash-success-bg border-dash-success-border"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isError ? "bg-dash-error" : "bg-dash-success"
        }`}
      />
      <p className={`text-sm ${isError ? "text-dash-error" : "text-dash-success"}`}>
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
      className={`bg-dash-card border border-dash-border rounded-2xl p-6 ${className}`}
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
    <label className="text-xs font-medium text-dash-muted">
      {children}
      {optional && <span className="text-dash-faint ml-1">(optional)</span>}
    </label>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────

export const inputClass =
  "w-full h-10 px-3 bg-dash-card border border-dash-border rounded-lg text-sm text-dash-foreground placeholder:text-dash-faint focus:outline-none focus:border-dash-accent transition-colors";

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
        className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-muted hover:text-dash-foreground transition-colors"
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
                ? "bg-dash-success-bg border border-dash-success-border"
                : "bg-dash-hover border border-dash-border"
            }`}
          >
            {c.pass && (
              <Check size={8} className="text-dash-success" strokeWidth={3} />
            )}
          </div>
          <span
            className={`text-[10px] ${c.pass ? "text-dash-success" : "text-dash-muted"}`}
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
      className="w-full h-10 flex items-center justify-center gap-2 bg-dash-accent text-white text-sm font-medium rounded-lg hover:bg-dash-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
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
      className="inline-flex items-center gap-1.5 text-sm text-dash-muted hover:text-dash-foreground transition-colors mb-8"
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

// ── Logo — links back to the marketing landing page ────────────────────────

export function AuthLogo() {
  return (
    <Link href="/" className="mb-6 inline-flex items-center justify-center" aria-label="Back to Dexxify home">
      <Image
        src="/dexxify_icon.jpg"
        alt="Dexxify"
        width={40}
        height={40}
        className="h-10 w-10 rounded-xl object-cover"
      />
    </Link>
  );
}
