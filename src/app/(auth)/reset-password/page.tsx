"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, RotateCcw, Check } from "lucide-react";
import { authApi } from "@/lib/auth-api";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 pt-1">
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-1">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.pass ? "bg-[#22C55E]/10 border border-[#22C55E]/30" : "bg-[#1C1C1F] border border-[#1C1C1F]"}`}>
            {c.pass && <Check size={8} className="text-[#22C55E]" strokeWidth={3} />}
          </div>
          <span className={`text-[10px] ${c.pass ? "text-[#22C55E]" : "text-[#71717A]"}`}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authApi.resetPassword({
      email,
      code,
      new_password: newPassword,
    });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    setSuccess("Password reset! Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  }

  async function handleResend() {
    if (countdown > 0) return;
    setResending(true);
    setError(null);

    const { error } = await authApi.forgotPassword({ email });

    setResending(false);
    if (error) {
      setError(error);
    } else {
      setSuccess("A new code was sent to your email.");
      setCountdown(60);
      setCode("");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="8" width="12" height="9" rx="1.5" stroke="#2563EB" strokeWidth="1.5"/>
            <path d="M6 8V5.5a3 3 0 016 0V8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">
          Reset your password
        </h1>
        <p className="text-sm text-[#71717A]">
          Enter the 6-digit code sent to{" "}
          {email ? <span className="text-[#FAFAFA] font-medium">{email}</span> : "your email"}
          {" "}and choose a new password.
        </p>
      </div>

      <div className="bg-[#111113] border border-[#1C1C1F] rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-lg px-3 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-[#22C55E]/8 border border-[#22C55E]/20 rounded-lg px-3 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
              <p className="text-sm text-[#22C55E]">{success}</p>
            </div>
          )}

          {/* Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#71717A]">Reset code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }}
              className="w-full h-12 px-4 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-lg font-mono text-center text-[#FAFAFA] placeholder:text-[#3F3F46] tracking-[0.4em] focus:outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#71717A]">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(null); }}
                className="w-full h-10 px-3 pr-10 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#2563EB] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#FAFAFA] transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <PasswordStrength password={newPassword} />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <>Reset password <ArrowRight size={14} /></>}
          </button>

          {/* Resend */}
          <div className="pt-1 border-t border-[#1C1C1F] text-center">
            <p className="text-xs text-[#71717A] mb-2">Didn&apos;t receive a code?</p>
            <button
              type="button"
              disabled={resending || countdown > 0}
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              {resending ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
