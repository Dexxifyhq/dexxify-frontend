"use client";
/**
 * Shared primitives for all auth pages.
 * Import from here — never duplicate in individual page files.
 *
 * Colours come from the dash-* tokens. On auth routes those are redefined dark
 * by `.theme-auth-dark` on the (auth) layout, so nothing here hardcodes a
 * light or dark value.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import PhoneInputBase, { type Value as PhoneValue } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Eye, EyeOff, ArrowLeft, Loader2, Check } from "lucide-react";
import { highlight } from "@/lib/utils/highlight";

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

/**
 * Formerly a bordered box. The split-screen layout places forms directly on
 * the page, so this is now a plain wrapper, kept so pages keep their structure.
 */
export function AuthCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
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
    <label className="text-sm font-medium text-dash-foreground">
      {children}
      {optional && <span className="text-dash-muted font-normal ml-1">(optional)</span>}
    </label>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────

export const inputClass =
  "w-full h-11 px-3.5 bg-transparent border border-dash-border rounded-lg text-sm text-dash-foreground placeholder:text-dash-faint focus:outline-none focus:border-dash-muted transition-colors";

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

// ── Phone input — international format, outputs E.164 (e.g. +2348065924354) ─

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PhoneField({ value, onChange, placeholder }: PhoneFieldProps) {
  return (
    <div
      className={`
        flex h-11 w-full items-center gap-2 rounded-lg border border-dash-border bg-transparent px-3.5 text-dash-foreground
        transition-colors focus-within:border-dash-muted
        [&_.PhoneInputCountry]:gap-1.5
        [&_.PhoneInputCountrySelectArrow]:opacity-60
        [&_.PhoneInputInput]:h-full [&_.PhoneInputInput]:w-full [&_.PhoneInputInput]:border-0
        [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-sm [&_.PhoneInputInput]:text-dash-foreground
        [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-dash-faint
      `}
    >
      <PhoneInputBase
        international
        defaultCountry="NG"
        value={value as PhoneValue}
        onChange={(v) => onChange(v ?? "")}
        placeholder={placeholder ?? "801 234 5678"}
        className="w-full"
      />
    </div>
  );
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
        aria-label={show ? "Hide password" : "Show password"}
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
      // text-dash-bg rather than text-white: on the dark auth theme the accent
      // is a light ramp step, so the label must be the dark ground colour.
      className="w-full h-11 flex items-center justify-center gap-2 bg-dash-accent text-dash-bg text-sm font-medium rounded-lg hover:bg-dash-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
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
    <div className="space-y-2">
      <AuthLabel optional={optional}>{label}</AuthLabel>
      {children}
    </div>
  );
}

// ── Code panel — right side of the auth layout ─────────────────────────────

/**
 * A real request, typed out. Plain fetch rather than an SDK call because there
 * is no Dexxify SDK: POST /payment-sessions with Bearer API-key auth and the
 * fields the dashboard actually sends. ${API_URL} and ${API_KEY} stand in for
 * the base URL and the key.
 */
const AUTH_SNIPPET = `const res = await fetch(\`\${API_URL}/payment-sessions\`, {
  method: "POST",
  headers: { Authorization: \`Bearer \${API_KEY}\` },
  body: JSON.stringify({
    amount: 300,
    currency: "USD",
    crypto_asset: "USDT",
    network: "tron"
  })
});`;

const TYPE_DELAY_MS = 28;

export function AuthCodePanel() {
  const [count, setCount] = useState(0);
  const done = count >= AUTH_SNIPPET.length;

  // One character per tick. State is only ever set from the timer callback;
  // under reduced motion the first tick jumps straight to the full snippet.
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => {
      const reduce =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setCount((c) => (reduce ? AUTH_SNIPPET.length : c + 1));
    }, TYPE_DELAY_MS);
    return () => clearTimeout(t);
  }, [count, done]);

  const lines = AUTH_SNIPPET.slice(0, count).split("\n");

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-code-border bg-code-bg shadow-2xl">
      <div className="min-h-[340px] overflow-x-auto p-6 font-mono text-[13px] text-code-fg">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="mr-5 w-5 shrink-0 select-none text-right text-code-muted/50">
              {i + 1}
            </span>
            <div className="flex whitespace-pre">
              {highlight(line)}
              {i === lines.length - 1 && (
                <span className="caret-blink ml-px inline-block h-5 w-[2px] translate-y-0.5 bg-code-fg" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
