"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { authApi } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import {
  AuthAlert, AuthCard, AuthField, AuthInput,
  PasswordInput, PasswordStrength, AuthButton,
} from "@/components/ui/auth";

const BUSINESS_TYPES = ["E-commerce", "Freelance / Agency", "SaaS", "Fintech", "Gaming", "Travel", "Other"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", business_name: "",
    business_type: "", phone: "", password: "",
  });

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    },
  });

  const errorMessage = error ? (error as ApiError).message : null;

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      reset();
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate({
      email: form.email,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      business_name: form.business_name,
      ...(form.business_type ? { business_type: form.business_type } : {}),
      ...(form.phone ? { phone: form.phone } : {}),
    });
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight mb-2">Create your account</h1>
        <p className="text-sm text-[#71717A]">Accept crypto. Receive Naira. Start in minutes.</p>
      </div>

      <AuthCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && <AuthAlert message={errorMessage} variant="error" />}

          <div className="grid grid-cols-2 gap-3">
            <AuthField label="First name">
              <AuthInput type="text" required autoComplete="given-name" placeholder="Ada"
                value={form.first_name} onChange={set("first_name")} />
            </AuthField>
            <AuthField label="Last name">
              <AuthInput type="text" required autoComplete="family-name" placeholder="Okonkwo"
                value={form.last_name} onChange={set("last_name")} />
            </AuthField>
          </div>

          <AuthField label="Work email">
            <AuthInput type="email" required autoComplete="email" placeholder="ada@yourcompany.com"
              value={form.email} onChange={set("email")} />
          </AuthField>

          <AuthField label="Business name">
            <AuthInput type="text" required placeholder="Your company or brand name"
              value={form.business_name} onChange={set("business_name")} />
          </AuthField>

          <div className="grid grid-cols-2 gap-3">
            <AuthField label="Business type" optional>
              <select
                value={form.business_type}
                onChange={set("business_type")}
                className="w-full h-10 px-3 bg-[#0D0D0F] border border-[#1C1C1F] rounded-lg text-sm text-[#FAFAFA] focus:outline-none focus:border-[#2563EB] transition-colors appearance-none"
              >
                <option value="">Select type</option>
                {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </AuthField>
            <AuthField label="Phone" optional>
              <AuthInput type="tel" autoComplete="tel" placeholder="+234 800 000 0000"
                value={form.phone} onChange={set("phone")} />
            </AuthField>
          </div>

          <AuthField label="Password">
            <PasswordInput
              value={form.password}
              onChange={set("password") as React.ChangeEventHandler<HTMLInputElement>}
              required minLength={8} autoComplete="new-password" placeholder="Min. 8 characters"
            />
            <PasswordStrength password={form.password} />
          </AuthField>

          <p className="text-xs text-[#71717A] leading-relaxed">
            By creating an account you agree to our{" "}
            <a href="#" className="text-[#2563EB] hover:underline">Terms of Service</a>{" "}and{" "}
            <a href="#" className="text-[#2563EB] hover:underline">Privacy Policy</a>.
          </p>

          <AuthButton loading={isPending}>
            Create account <ArrowRight size={14} />
          </AuthButton>
        </form>
      </AuthCard>

      <p className="text-center text-sm text-[#71717A] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2563EB] hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
