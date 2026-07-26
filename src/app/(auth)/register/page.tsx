"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import {
  AuthAlert, AuthCard, AuthField, AuthInput,
  PasswordInput, PasswordStrength, AuthButton,
} from "@/components/ui/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", password: "",
  });

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Account created! Check your email for a verification code.");
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    },
    onError: (err) => {
      toast.error((err as ApiError).message ?? "Registration failed. Please try again.");
    },
  });

  const errorMessage = error ? (error as ApiError).message : null;

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
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

          <AuthField label="Phone" optional>
            <AuthInput type="tel" autoComplete="tel" placeholder="+234 800 000 0000"
              value={form.phone} onChange={set("phone")} />
          </AuthField>

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
