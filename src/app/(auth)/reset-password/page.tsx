'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/lib/auth-api';
import { ApiError } from '@/lib/api-client';
import { useCountdown } from '@/lib/hooks/useCountdown';
import {
  AuthAlert,
  AuthField,
  AuthButton,
  PasswordInput,
  PasswordStrength,
  inputClass,
} from '@/components/ui/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') ?? '';

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { count, start } = useCountdown();

  const resetMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully! Redirecting to login…');
      setTimeout(() => router.push('/login'), 1500);
    },
    onError: (err) => {
      toast.error(
        (err as ApiError).message ??
          'Reset failed. Please check your code and try again.',
      );
    },
  });

  const resendMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('A new code was sent to your email.');
      start(60);
      setCode('');
    },
    onError: (err) => {
      toast.error(
        (err as ApiError).message ?? 'Could not resend code. Please try again.',
      );
    },
  });

  const errorMessage =
    (resetMutation.error ? (resetMutation.error as ApiError).message : null) ??
    (resendMutation.error ? (resendMutation.error as ApiError).message : null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // setSuccessMsg(null);
    resetMutation.mutate({ email, code, new_password: newPassword });
  }

  function handleResend() {
    if (count > 0) return;
    // setSuccessMsg(null);
    resetMutation.reset();
    resendMutation.mutate({ email });
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-dash-foreground">
        Reset your password
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-dash-muted">
        We emailed a reset code to{' '}
        {email ? (
          <span className="text-dash-foreground">{email}</span>
        ) : (
          'your email address'
        )}
        . Enter it below and choose a new password.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {errorMessage && <AuthAlert message={errorMessage} variant="error" />}

        <AuthField label="Reset code">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoFocus
            autoComplete="one-time-code"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              resetMutation.reset();
            }}
            className={inputClass}
          />
        </AuthField>

        <AuthField label="New password">
          <PasswordInput
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              resetMutation.reset();
            }}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Min. 8 characters"
          />
          <PasswordStrength password={newPassword} />
        </AuthField>

        <div className="pt-1">
          <AuthButton
            loading={resetMutation.isPending}
            disabled={code.length < 6}
          >
            Reset password <ArrowRight size={14} />
          </AuthButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-dash-muted">
        Didn&apos;t receive a code?{' '}
        <button
          type="button"
          disabled={resendMutation.isPending || count > 0}
          onClick={handleResend}
          className="font-medium text-dash-foreground hover:underline disabled:cursor-not-allowed disabled:text-dash-muted disabled:no-underline"
        >
          {resendMutation.isPending ? (
            <Loader2 size={13} className="inline animate-spin" />
          ) : count > 0 ? (
            `Resend in ${count}s`
          ) : (
            'Resend code'
          )}
        </button>
      </p>

      {/* The old "Back" link went to /forgot-password; that's where a
          mistyped email gets fixed, so it stays reachable here. */}
      <p className="mt-4 flex items-center justify-center gap-4 text-sm font-medium">
        <Link
          href="/forgot-password"
          className="text-dash-muted hover:text-dash-foreground transition-colors"
        >
          Use a different email
        </Link>
        <span aria-hidden="true" className="text-dash-border">
          ·
        </span>
        <Link
          href="/login"
          className="text-dash-muted hover:text-dash-foreground transition-colors"
        >
          Return to sign in
        </Link>
      </p>
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
