"use client";
import { useState, useLayoutEffect, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import gsap from "gsap";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { authApi } from "@/lib/auth-api";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const cardRef = useRef<HTMLDivElement>(null);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useLayoutEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0, y: 20, duration: 0.5, ease: "power2.out", delay: 0.1
    });
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function verify(otp: string) {
    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await authApi.verifyOtp({ email, code: otp });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    setSuccess("Email verified! Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
    setError(null);
    if (val.length === 6) verify(val);
  }

  async function handleResend() {
    if (!email || countdown > 0) return;
    setResending(true);
    setError(null);
    setSuccess(null);

    const { error } = await authApi.resendOtp({ email });

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
    <div ref={cardRef} className="w-full max-w-sm">
      {/* Back */}
      <Link
        href="/register"
        className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to register
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 5l7 5 7-5M2 5h14v10H2V5z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">
          Check your email
        </h1>
        <p className="text-sm text-[#71717A]">
          We sent a 6-digit code to{" "}
          {email ? (
            <span className="text-[#FAFAFA] font-medium">{email}</span>
          ) : (
            "your email address"
          )}
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#111113] border border-[#1C1C1F] rounded-2xl p-6 space-y-4">
        {/* Error / Success */}
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

        {/* Code input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#71717A]">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            disabled={loading}
            autoFocus
            className="w-full h-12 px-4 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-lg font-mono text-center text-[#FAFAFA] placeholder:text-[#3F3F46] tracking-[0.4em] focus:outline-none focus:border-[#2563EB] disabled:opacity-50 transition-colors"
          />
          <p className="text-xs text-[#71717A]">
            Enter the 6-digit code — it expires in 10 minutes
          </p>
        </div>

        {/* Verify button */}
        <button
          type="button"
          disabled={loading || code.length < 6}
          onClick={() => verify(code)}
          className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            "Verify email"
          )}
        </button>

        {/* Resend */}
        <div className="pt-1 border-t border-[#1C1C1F] text-center">
          <p className="text-xs text-[#71717A] mb-2">
            Didn&apos;t receive a code?
          </p>
          <button
            type="button"
            disabled={resending || countdown > 0}
            onClick={handleResend}
            className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-opacity"
          >
            {resending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RotateCcw size={13} />
            )}
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
