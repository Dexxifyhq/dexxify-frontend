"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import { useCountdown } from "@/lib/hooks/useCountdown";
import {
  AuthAlert, AuthCard, AuthField, AuthButton,
  AuthBackLink, PasswordInput, PasswordStrength,
} from "@/components/ui/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { count, start } = useCountdown();

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      setSuccessMsg("Password reset! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    },
  });

  const resendMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      setSuccessMsg("A new code was sent to your email.");
      start(60);
      setCode("");
    },
  });

  const errorMessage =
    (resetMutation.error ? (resetMutation.error as ApiError).message : null) ??
    (resendMutation.error ? (resendMutation.error as ApiError).message : null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg(null);
    resetMutation.mutate({ email, code, new_password: newPassword });
  }

  function handleResend() {
    if (count > 0) return;
    setSuccessMsg(null);
    resetMutation.reset();
    resendMutation.mutate({ email });
  }

  return (
    <div className="w-full max-w-sm">
      <AuthBackLink href="/forgot-password" label="Back" />

      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="8" width="12" height="9" rx="1.5" stroke="#2563EB" strokeWidth="1.5" />
            <path d="M6 8V5.5a3 3 0 016 0V8" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">Reset your password</h1>
        <p className="text-sm text-[#71717A]">
          Enter the 6-digit code sent to{" "}
          {email ? <span className="text-[#FAFAFA] font-medium">{email}</span> : "your email"}{" "}
          and choose a new password.
        </p>
      </div>

      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <AuthAlert message={errorMessage} variant="error" />}
          {successMsg && <AuthAlert message={successMsg} variant="success" />}

          <AuthField label="Reset code">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                resetMutation.reset();
              }}
              className="w-full h-12 px-4 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-lg font-mono text-center text-[#FAFAFA] placeholder:text-[#3F3F46] tracking-[0.4em] focus:outline-none focus:border-[#2563EB] transition-colors"
            />
          </AuthField>

          <AuthField label="New password">
            <PasswordInput
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); resetMutation.reset(); }}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
            />
            <PasswordStrength password={newPassword} />
          </AuthField>

          <AuthButton loading={resetMutation.isPending} disabled={code.length < 6}>
            Reset password <ArrowRight size={14} />
          </AuthButton>

          <div className="pt-1 border-t border-[#1C1C1F] text-center">
            <p className="text-xs text-[#71717A] mb-2">Didn&apos;t receive a code?</p>
            <button
              type="button"
              disabled={resendMutation.isPending || count > 0}
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              {resendMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              {count > 0 ? `Resend in ${count}s` : "Resend code"}
            </button>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
