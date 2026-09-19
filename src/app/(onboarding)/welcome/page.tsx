"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Building2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import { businessesApi, type Business } from "@/lib/api/businesses";
import {
  businessKeys,
  useMyBusiness,
} from "@/lib/hooks/businesses/useBusinesses";
import { useProfile } from "@/lib/hooks/auth/useProfile";
import {
  BUSINESS_TYPES,
  businessTypeLabel,
} from "@/lib/constants/business-types";
import { AuthButton, inputClass } from "@/components/ui/auth";
import { AuthBands } from "@/components/ui/auth-bands";

/**
 * First-run setup for a new account, as a three-step carousel.
 *
 * Signing up creates a placeholder business ("<first name>'s Business") with no
 * type. These steps let the owner name it, choose a receiving currency and
 * pick its type, then write them through the existing endpoints:
 *   PATCH /businesses/me             — name, type, website_url
 *   PATCH /businesses/me/settlements — settlement_currency
 *
 * `type === null` on a business the user owns is what marks setup as not done;
 * verify-email and the dashboard layout both send those users here. Nothing new
 * is stored.
 */

type Currency = "USDT" | "USDC" | "NGN";

const CURRENCIES: { value: Currency; title: string; desc: string }[] = [
  { value: "USDT", title: "USDT", desc: "Receive settlements in Tether (USDT)." },
  { value: "USDC", title: "USDC", desc: "Receive settlements in USD Coin (USDC)." },
  { value: "NGN", title: "Naira (NGN)", desc: "Receive settlements in Nigerian Naira." },
];

const STEPS = ["Your business", "Settlement currency", "Business type"] as const;
const LAST_STEP = STEPS.length - 1;

function currencyLabel(value: Currency) {
  return CURRENCIES.find((c) => c.value === value)?.title ?? value;
}

function FullScreenSpinner() {
  return (
    <div className="theme-auth-light flex min-h-screen items-center justify-center bg-dash-bg">
      <Loader2 size={22} className="animate-spin text-dash-muted" />
    </div>
  );
}

export default function WelcomePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: profile, isLoading: profileLoading, isError: profileError } = useProfile();
  const { data: business, isLoading: businessLoading } = useMyBusiness();

  // Unedited fields fall back to what the business already has, so nothing
  // needs to be copied into state from an effect.
  const [name, setName] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  // Which way the user moved, so the incoming step slides from that side.
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [signingOut, setSigningOut] = useState(false);

  // After Back/Continue, move focus to the new step's heading so keyboard and
  // screen reader users land on it. Not on first render. preventScroll keeps
  // the browser from scrolling anything to reveal the heading.
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const userNavigated = useRef(false);
  useEffect(() => {
    if (userNavigated.current) headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const nameValue = name ?? business?.name ?? "";
  const websiteValue = website ?? business?.website_url ?? "";
  const currencyValue: Currency = currency ?? business?.settlement_currency ?? "USDT";
  const typeValue = type ?? business?.type ?? null;

  const needsSetup =
    !!business &&
    !!profile &&
    business.type === null &&
    business.owner_user_id === profile.id;

  useEffect(() => {
    if (profileError) router.replace("/login");
  }, [profileError, router]);

  // Already set up, or not the owner (staff shouldn't define the business).
  useEffect(() => {
    if (business && profile && !needsSetup) router.replace("/dashboard");
  }, [business, profile, needsSetup, router]);

  const save = useMutation({
    mutationFn: async () => {
      const updated = await businessesApi.updateProfile({
        name: nameValue.trim(),
        type: typeValue ?? undefined,
        ...(websiteValue.trim() ? { website_url: websiteValue.trim() } : {}),
      });
      const settled = await businessesApi.updateSettlements({
        settlement_currency: currencyValue,
      });
      return { ...updated, ...settled } as Business;
    },
    onSuccess: (biz) => {
      // Seed the cache with the saved type before navigating, so the dashboard
      // layout doesn't read the old null type and bounce straight back here.
      qc.setQueryData(businessKeys.me(), (old: Business | undefined) => ({
        ...(old ?? {}),
        ...biz,
        type: biz.type ?? typeValue,
      }));
      qc.invalidateQueries({ queryKey: businessKeys.list() });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Your business is set up.");
      router.replace("/dashboard");
    },
    onError: (err) => {
      toast.error(
        (err as ApiError).message ?? "Couldn't save your details. Please try again.",
      );
    },
  });

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await authApi.logout();
    } finally {
      // Full reload so the proxy sees the cleared cookies.
      window.location.href = "/login";
    }
  }

  if (profileLoading || businessLoading || !needsSetup) {
    return <FullScreenSpinner />;
  }

  const stepValid = [nameValue.trim().length > 0, true, !!typeValue];
  const canAdvance = stepValid[step] && !save.isPending;
  const typeLabel = businessTypeLabel(typeValue);

  function goTo(next: number) {
    const target = Math.max(0, Math.min(LAST_STEP, next));
    if (target === step) return;
    userNavigated.current = true;
    setDirection(target > step ? "next" : "prev");
    setStep(target);
  }

  const headingClass = "text-3xl font-bold tracking-tight outline-none";

  return (
    <div className="theme-auth-light relative grid min-h-screen bg-dash-bg text-dash-foreground lg:grid-cols-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="absolute right-5 top-6 z-20 rounded-md px-2 py-1 text-xs text-dash-muted hover:text-dash-foreground disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-muted"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>

      {/* Left — the stepper */}
      <div className="flex min-h-screen flex-col px-6 sm:px-10">
        <header className="py-8">
          {/* Same black lockup as the auth pages; see the note there. */}
          <Link href="/" aria-label="Dexxify home" className="inline-flex">
            <Image
              src="/logo-set/dexxify.png"
              alt="Dexxify"
              width={2103}
              height={748}
              priority
              className="h-12 w-auto"
            />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Enter advances through the steps; only the last one saves.
              if (!canAdvance) return;
              if (step < LAST_STEP) goTo(step + 1);
              else save.mutate();
            }}
            className="w-full max-w-md"
          >
            {/* Progress */}
            <p className="text-xs font-medium text-dash-muted">
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className={`h-1 rounded-full transition-colors ${
                    i <= step ? "bg-dash-foreground" : "bg-dash-border"
                  }`}
                />
              ))}
            </div>

            {/* Only the active step is rendered. Keying on the step remounts
                it, which replays the slide-in; the direction class decides
                which side it enters from. */}
            <section
              key={step}
              className={`mt-8 ${direction === "next" ? "step-in-next" : "step-in-prev"}`}
            >
              {step === 0 && (
                <>
                  <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
                    Tell us about your business
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-dash-muted">
                    We created a business for you when you signed up. Give it a
                    name and tell us a little about it so your account is set up
                    the way you work. You can change any of this later in
                    Settings.
                  </p>
                  <div className="mt-8 space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="biz-name" className="text-sm font-medium">
                        Business name
                      </label>
                      <input
                        id="biz-name"
                        type="text"
                        value={nameValue}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your business name"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="biz-website" className="text-sm font-medium">
                        Website <span className="font-normal text-dash-muted">(optional)</span>
                      </label>
                      <input
                        id="biz-website"
                        type="url"
                        inputMode="url"
                        value={websiteValue}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourbusiness.com"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
                    How do you want to get paid?
                  </h1>
                  <fieldset className="mt-3">
                    <legend className="text-sm leading-relaxed text-dash-muted">
                      Choose the currency you want to receive settlements in.
                    </legend>
                    <div className="mt-6 divide-y divide-dash-border overflow-hidden rounded-lg border border-dash-border">
                      {CURRENCIES.map((c) => {
                        const selected = currencyValue === c.value;
                        return (
                          <label
                            key={c.value}
                            className={`flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors ${
                              selected ? "bg-dash-hover" : "hover:bg-dash-hover/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="settlement-currency"
                              value={c.value}
                              checked={selected}
                              onChange={() => setCurrency(c.value)}
                              className="peer sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border peer-focus-visible:ring-2 peer-focus-visible:ring-dash-muted ${
                                selected ? "border-dash-foreground" : "border-dash-faint"
                              }`}
                            >
                              {selected && <span className="h-2 w-2 rounded-full bg-dash-foreground" />}
                            </span>
                            <span>
                              <span className="block text-sm font-medium">{c.title}</span>
                              <span className="mt-0.5 block text-sm text-dash-muted">{c.desc}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </>
              )}

              {step === 2 && (
                <>
                  <h1 ref={headingRef} tabIndex={-1} className={headingClass}>
                    What kind of business is it?
                  </h1>
                  <fieldset className="mt-3">
                    <legend className="text-sm leading-relaxed text-dash-muted">
                      Pick the one that fits best.
                    </legend>
                    <div className="mt-6 grid overflow-hidden rounded-lg border border-dash-border sm:grid-cols-2">
                      {BUSINESS_TYPES.map((t) => {
                        const selected = typeValue === t.value;
                        return (
                          <label
                            key={t.value}
                            className={`flex cursor-pointer items-center gap-3 border-b border-dash-border px-4 py-2.5 transition-colors sm:odd:border-r ${
                              selected ? "bg-dash-hover" : "hover:bg-dash-hover/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="business-type"
                              value={t.value}
                              checked={selected}
                              onChange={() => setType(t.value)}
                              className="peer sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border peer-focus-visible:ring-2 peer-focus-visible:ring-dash-muted ${
                                selected
                                  ? "border-dash-foreground bg-dash-foreground"
                                  : "border-dash-faint"
                              }`}
                            >
                              {selected && <Check size={11} strokeWidth={3} className="text-dash-bg" />}
                            </span>
                            <span className="text-sm font-medium">{t.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </>
              )}
            </section>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => goTo(step - 1)}
                  disabled={save.isPending}
                  className="flex h-11 items-center gap-2 rounded-lg border border-dash-border px-4 text-sm font-medium text-dash-muted hover:text-dash-foreground disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-muted"
                >
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <div className="flex-1">
                <AuthButton loading={save.isPending} disabled={!canAdvance}>
                  {step < LAST_STEP ? (
                    <>
                      Continue <ArrowRight size={15} />
                    </>
                  ) : (
                    <>
                      <ArrowRight size={15} /> Continue to dashboard
                    </>
                  )}
                </AuthButton>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* Right — live summary over the bands. It restates the form, so it's
          hidden from assistive tech. */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden border-l border-dash-border bg-dash-hover bg-dots-light lg:flex lg:items-center lg:justify-center lg:px-12"
      >
        <AuthBands />
        <div className="relative z-10 w-full max-w-md">
          <h2 className="text-lg font-semibold">Your account will be set up with</h2>

          <div className="mt-4 rounded-xl border border-dash-border bg-dash-bg p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dash-hover">
                <Building2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">
                    {nameValue.trim() || "Your business"}
                  </p>
                  {typeLabel && (
                    <span className="shrink-0 rounded-full border border-dash-border px-2 py-0.5 text-[10px] text-dash-muted">
                      {typeLabel}
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-dash-muted">
                  {websiteValue.trim() || "No website added"}
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-2.5 border-t border-dash-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-dash-muted">Settlement currency</dt>
                <dd className="font-medium">{currencyLabel(currencyValue)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-dash-muted">Business type</dt>
                <dd className="font-medium">{typeLabel ?? "Not selected"}</dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 text-xs text-dash-muted">
            You can change these anytime in Settings.
          </p>
        </div>
      </aside>
    </div>
  );
}
