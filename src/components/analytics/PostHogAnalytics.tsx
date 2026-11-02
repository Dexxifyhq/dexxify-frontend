"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * PostHog: traffic, product analytics and session replay.
 *
 * Mounted in the marketing, auth and dashboard layouts — so it covers the
 * landing page, the sign-up/login funnel and signed-in merchant usage. The
 * hosted pay pages (/pay, /p, /invoices/pay) never mount it, and any event
 * whose URL is one of them is dropped in before_send as a backstop: their
 * URLs carry session IDs and invoice numbers, and the pages show customer
 * wallet addresses.
 *
 * Session replay masks every input and all text, so balances, bank details
 * and customer data never leave the browser in a recording.
 *
 * Off until NEXT_PUBLIC_POSTHOG_KEY is set (local dev and previews without it
 * don't report). NEXT_PUBLIC_POSTHOG_HOST picks the region —
 * https://us.i.posthog.com (default) or https://eu.i.posthog.com.
 */
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

const PRIVATE_PATHS = /^\/(pay|p|invoices\/pay)(\/|$)/;

function isPrivateUrl(url: unknown) {
  if (typeof url !== "string") return false;
  try {
    return PRIVATE_PATHS.test(new URL(url).pathname);
  } catch {
    return false;
  }
}

export interface MerchantIdentity {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  businessId?: string | null;
  businessName?: string | null;
}

/**
 * Pass `identity` where a merchant is signed in (the dashboard) to tie the
 * session to their account; leave it off on public pages.
 */
export default function PostHogAnalytics({
  identity,
}: {
  identity?: MerchantIdentity | null;
}) {
  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Current recommended defaults: page views and page leaves are
      // captured on client-side route changes too, which the App Router needs.
      defaults: "2025-05-24",
      // Anonymous visitors don't create person profiles until they sign in.
      person_profiles: "identified_only",
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "*",
      },
      before_send: (event) =>
        event && isPrivateUrl(event.properties?.$current_url) ? null : event,
    });
  }, []);

  // Runs after the init effect above (same component, declared later), and
  // again when the merchant or their selected business changes.
  const { id, email, name, role, businessId, businessName } = identity ?? {};
  useEffect(() => {
    if (!POSTHOG_KEY || !id) return;
    posthog.identify(id, {
      email: email ?? undefined,
      name: name ?? undefined,
      role: role ?? undefined,
      business_id: businessId ?? undefined,
      business_name: businessName ?? undefined,
    });
  }, [id, email, name, role, businessId, businessName]);

  return null;
}

/** Forget the signed-in merchant (call on logout). */
export function resetAnalytics() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

/** Record a named product event, e.g. "checkout_created". */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
