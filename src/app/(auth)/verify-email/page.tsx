"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { AuthAlert, AuthCard, AuthField, AuthBackLink } from "@/components/ui/auth";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { count, start } = useCountdown();

  const verifyMutation = useMutation({
    mutationFn: (otp: string) => authApi.verifyOtp({ email, code: otp }),
    onSuccess: () => {
      setSuccessMsg("Email verified! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp({ email }),
    onSuccess: () => {
      setSuccessMsg("A new code was sent to your email.");
      start(60);
      setCode("");
    },
  });

  const errorMessage =
    (verifyMutation.error ? (verifyMutation.error as ApiError).message : null) ??
    (resendMutation.error ? (resendMutation.error as ApiError).message : null);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
    verifyMutation.reset();
    resendMutation.reset();
    if (val.length === 6) verifyMutation.mutate(val);
  }

  function handleResend() {
    if (!email || count > 0) return;
    setSuccessMsg(null);
    resendMutation.mutate();
  }

  const isLoading = verifyMutation.isPending;
  const isResending = resendMutation.isPending;

  return (
    <div className="w-full max-w-sm">
      <AuthBackLink href="/register" label="Back to register" />

      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5l7 5 7-5M2 5h14v10H2V5z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">Check your email</h1>
        <p className="text-sm text-[#71717A]">
          We sent a 6-digit code to{" "}
          {email ? <span className="text-[#FAFAFA] font-medium">{email}</span> : "your email address"}
        </p>
      </div>

      <AuthCard className="space-y-4">
        {errorMessage && <AuthAlert message={errorMessage} variant="error" />}
        {successMsg && <AuthAlert message={successMsg} variant="success" />}

        <AuthField label="Verification code">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            disabled={isLoading}
            autoFocus
            className="w-full h-12 px-4 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-lg font-mono text-center text-[#FAFAFA] placeholder:text-[#3F3F46] tracking-[0.4em] focus:outline-none focus:border-[#2563EB] disabled:opacity-50 transition-colors"
          />
          <p className="text-xs text-[#71717A] mt-1">Enter the 6-digit code — it expires in 10 minutes</p>
        </AuthField>

        <button
          type="button"
          disabled={isLoading || code.length < 6}
          onClick={() => verifyMutation.mutate(code)}
          className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : "Verify email"}
        </button>

        <div className="pt-1 border-t border-[#1C1C1F] text-center">
          <p className="text-xs text-[#71717A] mb-2">Didn&apos;t receive a code?</p>
          <button
            type="button"
            disabled={isResending || count > 0}
            onClick={handleResend}
            className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            {isResending ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
            {count > 0 ? `Resend in ${count}s` : "Resend code"}
          </button>
        </div>
      </AuthCard>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailForm /></Suspense>;
}
