"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { authApi, saveTokens } from "@/lib/auth-api";
import { AuthAlert, AuthCard, AuthField, AuthInput, PasswordInput, AuthButton } from "@/components/ui/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await authApi.login({ email, password });
    if (error || !data) { setError(error ?? "Login failed"); setLoading(false); return; }
    saveTokens(data);
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">Welcome back</h1>
        <p className="text-sm text-[#71717A]">Sign in to your Dexxify account</p>
      </div>

      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <AuthAlert message={error} variant="error" />}

          <AuthField label="Email address">
            <AuthInput type="email" required autoComplete="email" placeholder="you@company.com"
              value={email} onChange={e => { setEmail(e.target.value); setError(null); }} />
          </AuthField>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#71717A]">Password</span>
              <Link href="/forgot-password" className="text-xs text-[#2563EB] hover:underline">Forgot password?</Link>
            </div>
            <PasswordInput value={password} onChange={e => { setPassword(e.target.value); setError(null); }}
              required autoComplete="current-password" placeholder="••••••••" />
          </div>

          <AuthButton loading={loading}>
            Sign in <ArrowRight size={14} />
          </AuthButton>
        </form>
      </AuthCard>

      <p className="text-center text-sm text-[#71717A] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#2563EB] hover:underline font-medium">Create account</Link>
      </p>
    </div>
  );
}
