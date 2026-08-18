"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Users, Check, AlertTriangle } from "lucide-react";
import {
  AuthCard,
  AuthField,
  AuthAlert,
  AuthButton,
  AuthLogo,
  PasswordInput,
  PasswordStrength,
  AuthInput,
} from "@/components/ui/auth";
import { teamsApi } from "@/lib/api/teams";

// ── Inner form (uses useSearchParams, must be inside Suspense) ──────────────

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [done, setDone] = useState(false);

  const accept = useMutation({
    mutationFn: () =>
      teamsApi.acceptInvite({
        token: token!,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
      }),
    onSuccess: () => {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    accept.mutate();
  }

  // ── No token ────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="w-full max-w-md flex flex-col items-center">
        <AuthLogo />
        <AuthCard className="w-full">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dash-warning-border bg-dash-warning-bg">
              <AlertTriangle size={22} className="text-dash-warning" />
            </div>
            <div>
              <p className="text-base font-semibold text-dash-foreground">
                Invalid invitation link
              </p>
              <p className="mt-1 text-sm text-dash-muted">
                The link you followed is missing a token. Please use the
                original link from your invitation email.
              </p>
            </div>
            <a
              href="/login"
              className="text-sm font-medium text-dash-muted transition-colors hover:text-dash-foreground"
            >
              Back to login
            </a>
          </div>
        </AuthCard>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="w-full max-w-md flex flex-col items-center">
        <AuthLogo />
        <AuthCard className="w-full">
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dash-success-border bg-dash-success-bg">
              <Check size={24} className="text-dash-success" />
            </div>
            <div>
              <p className="text-base font-semibold text-dash-foreground">
                You&apos;re in!
              </p>
              <p className="mt-1 text-sm text-dash-muted">
                Your account is ready. Redirecting to login&hellip;
              </p>
            </div>
          </div>
        </AuthCard>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    password.length >= 8 &&
    confirmPassword !== "";

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <AuthLogo />
      <AuthCard className="w-full">
      {/* Header */}
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-dash-accent-soft">
          <Users size={22} className="text-dash-accent" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-dash-foreground">
          Accept Your Invitation
        </h1>
        <p className="mt-1.5 text-sm text-dash-muted">
          Set up your account to join your team workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <AuthField label="First name">
            <AuthInput
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              required
              autoFocus
            />
          </AuthField>
          <AuthField label="Last name">
            <AuthInput
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              required
            />
          </AuthField>
        </div>

        {/* Password */}
        <AuthField label="Password">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            minLength={8}
          />
          <PasswordStrength password={password} />
        </AuthField>

        {/* Confirm password */}
        <AuthField label="Confirm password">
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setMismatch(false);
            }}
            placeholder="Repeat your password"
            required
          />
          {mismatch && (
            <p className="mt-1.5 text-xs text-dash-error">
              Passwords do not match.
            </p>
          )}
        </AuthField>

        {/* Backend error */}
        {accept.isError && (
          <AuthAlert
            message={
              (accept.error as any)?.message ??
              "Failed to accept invitation. The link may have expired."
            }
            variant="error"
          />
        )}

        <AuthButton loading={accept.isPending} disabled={!canSubmit}>
          Accept &amp; Join Workspace
        </AuthButton>
      </form>

      <p className="mt-5 text-center text-xs text-dash-faint">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-dash-muted transition-colors hover:text-dash-foreground"
        >
          Log in
        </a>
      </p>
      </AuthCard>
    </div>
  );
}

// ── Page (wraps form in Suspense as required by useSearchParams) ────────────

export default function AcceptInvitePage() {
  return (
    <Suspense>
      <AcceptInviteForm />
    </Suspense>
  );
}
