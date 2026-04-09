"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { authApi, saveTokens } from "@/lib/auth-api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await authApi.login({ email, password });

    if (error || !data) {
      setError(error ?? "Login failed");
      setLoading(false);
      return;
    }

    saveTokens(data);
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-[#71717A]">
          Sign in to your Dexxify account
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#111113] border border-[#1C1C1F] rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-[#EF4444]/8 border border-[#EF4444]/20 rounded-lg px-3 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#71717A]">Email address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-10 px-3 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#71717A]">Password</label>
              <Link href="/forgot-password" className="text-xs text-[#2563EB] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 pr-10 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#2563EB] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#FAFAFA] transition-colors"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-2"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#71717A] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#2563EB] hover:underline font-medium">
          Create account
        </Link>
      </p>
    </div>
  );
}
