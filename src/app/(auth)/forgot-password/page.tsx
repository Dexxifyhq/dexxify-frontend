"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { authApi } from "@/lib/auth-api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authApi.forgotPassword({ email });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to login
      </Link>

      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 100 10A5 5 0 009 2zM4 13c-2 1-3 2.5-3 4h16c0-1.5-1-3-3-4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">
          Forgot your password?
        </h1>
        <p className="text-sm text-[#71717A]">
          Enter your email and we&apos;ll send you a reset code.
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#71717A]">Email address</label>
            <input
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              className="w-full h-10 px-3 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                Send reset code
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#71717A] mt-6">
        Remembered it?{" "}
        <Link href="/login" className="text-[#2563EB] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
