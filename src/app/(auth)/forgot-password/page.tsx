"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import { AuthAlert, AuthCard, AuthField, AuthInput, AuthButton, AuthBackLink } from "@/components/ui/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success("Reset code sent! Check your inbox.");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    },
    onError: (err) => {
      toast.error((err as ApiError).message ?? "Could not send reset code. Please try again.");
    },
  });

  const errorMessage = error ? (error as ApiError).message : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate({ email });
  }

  return (
    <div className="w-full max-w-sm">
      <AuthBackLink href="/login" label="Back to login" />

      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5 5 0 100 10A5 5 0 009 2zM4 13c-2 1-3 2.5-3 4h16c0-1.5-1-3-3-4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">Forgot your password?</h1>
        <p className="text-sm text-[#71717A]">Enter your email and we&apos;ll send you a reset code.</p>
      </div>

      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <AuthAlert message={errorMessage} variant="error" />}

          <AuthField label="Email address">
            <AuthInput
              type="email"
              required
              autoComplete="email"
              autoFocus
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); reset(); }}
            />
          </AuthField>

          <AuthButton loading={isPending}>
            Send reset code <ArrowRight size={14} />
          </AuthButton>
        </form>
      </AuthCard>

      <p className="text-center text-sm text-[#71717A] mt-6">
        Remembered it?{" "}
        <Link href="/login" className="text-[#2563EB] hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
