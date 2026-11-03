import { GoogleAnalytics } from "@next/third-parties/google";
import PostHogAnalytics from "@/components/analytics/PostHogAnalytics";

/**
 * Analytics for the public site: Google Analytics 4 (traffic) and PostHog
 * (traffic, funnels, replay).
 *
 * Mounted only in the marketing and auth layouts, so it counts visitors to
 * the homepage and the register/login funnel. The dashboard mounts PostHog on
 * its own (with the merchant identified). Neither tool runs on the hosted pay
 * pages (/pay, /p, /invoices/pay), whose URLs carry session IDs and invoice
 * numbers that shouldn't be sent to third parties.
 *
 * Each tool renders nothing until its environment variable is set
 * (NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_POSTHOG_KEY).
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function SiteAnalytics() {
  return (
    <>
      {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      <PostHogAnalytics />
    </>
  );
}
