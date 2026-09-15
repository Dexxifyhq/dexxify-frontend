"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { AuthAlert, AuthButton, inputClass } from "@/components/ui/auth";

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const { count, start } = useCountdown();

  const verifyMutation = useMutation({
    mutationFn: (otp: string) => authApi.verifyOtp({ email, code: otp }),
    // Verifying signs the user in — the backend's verifyOtp sets the session
    // cookies — so a new account goes straight to first-run setup instead of
    // being made to sign in again. /welcome forwards to the dashboard if the
    // business is already set up.
    onSuccess: () => {
      toast.success("Email verified!");
      router.replace("/welcome");
    },
    onError: (err) => {
      toast.error((err as ApiError).message ?? "Verification failed. Please try again.");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp({ email }),
    onSuccess: () => {
      toast.success("A new code was sent to your email.");
      start(60);
      setCode("");
    },
    onError: (err) => {
      toast.error((err as ApiError).message ?? "Could not resend code. Please try again.");
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
    resendMutation.mutate();
  }

  const isLoading = verifyMutation.isPending;
  const isResending = resendMutation.isPending;

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-dash-foreground">
        Verify your email
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-dash-muted">
        We emailed a verification code to{" "}
        {email ? (
          <span className="text-dash-foreground">{email}</span>
        ) : (
          "your email address"
        )}
        . Enter it below to continue.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Six digits already auto-submit, so guard against Enter re-sending.
          if (code.length === 6 && !verifyMutation.isPending) {
            verifyMutation.mutate(code);
          }
        }}
        className="mt-8 space-y-5"
      >
        {errorMessage && <AuthAlert message={errorMessage} variant="error" />}

        {/* No visible label, as in the reference, so it's named for assistive
            tech instead. Still auto-submits once six digits are in. */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete="one-time-code"
          aria-label="Verification code"
          value={code}
          onChange={handleCodeChange}
          placeholder="Verification code"
          disabled={isLoading}
          autoFocus
          className={`${inputClass} disabled:opacity-50`}
        />

        <AuthButton loading={isLoading} disabled={code.length < 6}>
          Verify <Check size={15} />
        </AuthButton>
      </form>

      {/* Not in the reference, kept on purpose: without it a user whose code
          never arrived or expired has no way forward. */}
      <p className="mt-6 text-center text-sm text-dash-muted">
        Didn&apos;t receive a code?{" "}
        <button
          type="button"
          disabled={isResending || count > 0}
          onClick={handleResend}
          className="font-medium text-dash-foreground hover:underline disabled:cursor-not-allowed disabled:text-dash-muted disabled:no-underline"
        >
          {isResending ? (
            <Loader2 size={13} className="inline animate-spin" />
          ) : count > 0 ? (
            `Resend in ${count}s`
          ) : (
            "Resend code"
          )}
        </button>
      </p>

      <p className="mt-4 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-dash-muted hover:text-dash-foreground transition-colors"
        >
          Return to sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailForm /></Suspense>;
}
