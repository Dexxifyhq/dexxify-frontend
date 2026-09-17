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
  AuthAlert,
  AuthField,
  AuthInput,
  PasswordInput,
  PasswordStrength,
  AuthButton,
  PhoneField,
} from "@/components/ui/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    website: "", // honeypot — real users never see or fill this
  });

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success(
        "Account created! Check your email for a verification code.",
      );
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    },
    onError: (err) => {
      toast.error(
        (err as ApiError).message ?? "Registration failed. Please try again.",
      );
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
      website: form.website,
      ...(form.phone ? { phone: form.phone } : {}),
    });
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-bold tracking-tight text-dash-foreground">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-dash-muted">
        Accept crypto. Receive Naira. Start in minutes.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {errorMessage && <AuthAlert message={errorMessage} variant="error" />}

          {/* Honeypot — off-screen (not display:none, some bots skip that). 
              Real users never see or reach it; bots that blindly
              fill every field trip the backend's silent-reject check. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              top: "-9999px",
              height: 0,
              width: 0,
              overflow: "hidden",
            }}
          >
            <label htmlFor="hp-confirm">Leave this field empty</label>
            <input
              id="hp-confirm"
              name="hp-confirm"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={set("website")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AuthField label="First name">
              <AuthInput
                type="text"
                required
                autoComplete="given-name"
                placeholder="Steve"
                value={form.first_name}
                onChange={set("first_name")}
              />
            </AuthField>
            <AuthField label="Last name">
              <AuthInput
                type="text"
                required
                autoComplete="family-name"
                placeholder="Rogers"
                value={form.last_name}
                onChange={set("last_name")}
              />
            </AuthField>
          </div>

          <AuthField label="Email">
            <AuthInput
              type="email"
              required
              autoComplete="email"
              placeholder="ada@yourcompany.com"
              value={form.email}
              onChange={set("email")}
            />
          </AuthField>

          <AuthField label="Phone" optional>
            <PhoneField
              value={form.phone}
              onChange={(phone) => {
                setForm((f) => ({ ...f, phone }));
                reset();
              }}
            />
          </AuthField>

          <AuthField label="Password">
            <PasswordInput
              value={form.password}
              onChange={
                set("password") as React.ChangeEventHandler<HTMLInputElement>
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
            />
            <PasswordStrength password={form.password} />
          </AuthField>

          <p className="text-xs text-dash-muted leading-relaxed">
            By creating an account you agree to our{" "}
            <a
              href="#"
              className="text-dash-foreground underline decoration-dotted underline-offset-4"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-dash-foreground underline decoration-dotted underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>

          <AuthButton loading={isPending}>
            Create account <ArrowRight size={14} />
          </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-dash-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-dash-foreground hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
