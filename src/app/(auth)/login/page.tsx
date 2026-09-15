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
  AuthField,
  AuthInput,
  PasswordInput,
  AuthButton,
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
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-dash-foreground">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-dash-muted">
        Sign in to your Dexxify account
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

          <AuthField label="Password">
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
          </AuthField>
          <Link
            href="/forgot-password"
            className="-mt-2 inline-block text-sm text-dash-muted underline decoration-dotted underline-offset-4 hover:text-dash-foreground transition-colors"
          >
            Forgot password?
          </Link>

          <div className="pt-2">
            <AuthButton loading={isPending}>
              Sign in <ArrowRight size={14} />
            </AuthButton>
          </div>
      </form>

      <p className="mt-6 text-center text-sm text-dash-muted">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-dash-foreground hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
