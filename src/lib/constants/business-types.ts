/**
 * Business types, matching the backend BusinessType enum
 * (dexxify-backend/src/database/entities/business.entity.ts). Labels follow
 * the wording already used in Settings.
 */
export const BUSINESS_TYPES = [
  { value: "ecommerce", label: "E-commerce" },
  { value: "saas", label: "SaaS" },
  { value: "marketplace", label: "Marketplace" },
  { value: "fintech", label: "Fintech" },
  { value: "freelance", label: "Freelance / Agency" },
  { value: "retail", label: "Retail" },
  { value: "logistics", label: "Logistics" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "gaming", label: "Gaming" },
  { value: "travel", label: "Travel" },
  { value: "food_and_beverage", label: "Food & Beverage" },
  { value: "media_and_entertainment", label: "Media & Entertainment" },
  { value: "real_estate", label: "Real Estate" },
  { value: "professional_services", label: "Professional Services" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "other", label: "Other" },
] as const;

export function businessTypeLabel(value: string | null | undefined) {
  return BUSINESS_TYPES.find((t) => t.value === value)?.label ?? null;
}
