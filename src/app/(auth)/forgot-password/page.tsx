"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, UserRound } from "lucide-react";
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
        <div className="w-10 h-10 rounded-xl bg-dash-accent-soft border border-dash-accent/20 flex items-center justify-center mb-4">
          <UserRound size={18} strokeWidth={1.5} className="text-dash-accent" />
        </div>
        <h1 className="text-2xl font-bold text-dash-foreground tracking-tight mb-2">Forgot your password?</h1>
        <p className="text-sm text-dash-muted">Enter your email and we&apos;ll send you a reset code.</p>
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

      <p className="text-center text-sm text-dash-muted mt-6">
        Remembered it?{" "}
        <Link href="/login" className="text-dash-accent hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
