"use client";
import { useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { authApi } from "@/lib/auth-api";

const BUSINESS_TYPES = [
  "E-commerce",
  "Freelance / Agency",
  "SaaS",
  "Fintech",
  "Gaming",
  "Travel",
  "Other",
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 pt-1">
      {checks.map(c => (
        <div key={c.label} className="flex items-center gap-1">
          <div
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
              c.pass ? "bg-[#22C55E]/10 border border-[#22C55E]/30" : "bg-[#1C1C1F] border border-[#1C1C1F]"
            }`}
          >
            {c.pass && <Check size={8} className="text-[#22C55E]" strokeWidth={3} />}
          </div>
          <span className={`text-[10px] ${c.pass ? "text-[#22C55E]" : "text-[#71717A]"}`}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    business_name: "",
    business_type: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    gsap.from(cardRef.current, {
      opacity: 0, y: 20, duration: 0.5, ease: "power2.out", delay: 0.1,
    });
  }, []);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setError(null);
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authApi.register({
      email: form.email,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      business_name: form.business_name,
      ...(form.business_type ? { business_type: form.business_type } : {}),
      ...(form.phone ? { phone: form.phone } : {}),
    });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
  }

  const inputClass =
    "w-full h-10 px-3 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#2563EB] transition-colors";

  return (
    <div ref={cardRef} className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">
          Create your account
        </h1>
        <p className="text-sm text-[#71717A]">
          Accept crypto. Receive Naira. Start in minutes.
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

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#71717A]">First name</label>
              <input
                type="text"
                required
                autoComplete="given-name"
                placeholder="Ada"
                value={form.first_name}
                onChange={set("first_name")}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#71717A]">Last name</label>
              <input
                type="text"
                required
                autoComplete="family-name"
                placeholder="Okonkwo"
                value={form.last_name}
                onChange={set("last_name")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#71717A]">Work email</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="ada@yourcompany.com"
              value={form.email}
              onChange={set("email")}
              className={inputClass}
            />
          </div>

          {/* Business name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#71717A]">Business name</label>
            <input
              type="text"
              required
              placeholder="Your company or brand name"
              value={form.business_name}
              onChange={set("business_name")}
              className={inputClass}
            />
          </div>

          {/* Business type + Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#71717A]">
                Business type{" "}
                <span className="text-[#3F3F46]">(optional)</span>
              </label>
              <select
                value={form.business_type}
                onChange={set("business_type")}
                className="w-full h-10 px-3 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#2563EB] transition-colors appearance-none"
              >
                <option value="" className="text-[#3F3F46]">Select type</option>
                {BUSINESS_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#71717A]">
                Phone{" "}
                <span className="text-[#3F3F46]">(optional)</span>
              </label>
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+234 800 000 0000"
                value={form.phone}
                onChange={set("phone")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#71717A]">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set("password")}
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
            <PasswordStrength password={form.password} />
          </div>

          {/* Terms note */}
          <p className="text-xs text-[#71717A] leading-relaxed">
            By creating an account you agree to our{" "}
            <a href="#" className="text-[#2563EB] hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="text-[#2563EB] hover:underline">Privacy Policy</a>.
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-[#71717A] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2563EB] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
