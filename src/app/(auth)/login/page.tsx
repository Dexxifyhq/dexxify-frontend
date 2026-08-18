'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/lib/auth-api';
import { ApiError } from '@/lib/api-client';
import {
  AuthCard,
  AuthField,
  AuthInput,
  PasswordInput,
  AuthButton,
  AuthLogo,
} from '@/components/ui/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending, reset } = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      toast.success('Welcome back!');
      router.replace('/dashboard');
    },
    onError: (err) => {
      toast.error(
        (err as ApiError).message ?? 'Sign in failed. Please try again.',
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate({ email, password });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <AuthLogo />
        <h1 className="text-2xl font-bold text-dash-foreground tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-dash-muted">
          Sign in to your Dexxify account
        </p>
      </div>

      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthField label="Email address">
            <AuthInput
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                reset();
              }}
            />
          </AuthField>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-dash-muted">
                Password
              </span>
            </div>
            <PasswordInput
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                reset();
              }}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
              <Link
                href="/forgot-password"
                className="text-xs text-dash-accent hover:underline"
              >
                Forgot password?
              </Link>
          </div>

          <AuthButton loading={isPending}>
            Sign in <ArrowRight size={14} />
          </AuthButton>
        </form>
      </AuthCard>

      <p className="text-center text-sm text-dash-muted mt-6">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="text-dash-accent hover:underline font-medium"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
