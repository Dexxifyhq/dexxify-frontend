"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  Settings as SettingsIcon,
  FileText,
  Bell,
  Shield,
  BadgeCheck,
  CheckCircle2,
  Save,
  Upload,
  ImageIcon,
  ChevronDown,
  HelpCircle,
  Info,
  Receipt,
  Users,
  ArrowRight,
  User,
  UserPlus,
  Clock,
  Zap,
  Lock,
  ShieldCheck,
  Key,
  IdCard,
  Building2,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import Toggle from "@/components/dashboard/shared/Toggle";
import InviteStaffModal from "@/components/dashboard/teams/InviteStaffModal";
import { cn } from "@/utils/utils";
import {
  useMyBusiness,
  useUpdateBusinessProfile,
  useUpdateSettlements,
  useUpdateNotifications,
  useCreateBusiness,
} from "@/lib/hooks/businesses/useBusinesses";
import {
  useMyDeveloperProfile,
  useUpdateDeveloperProfile,
  useChangePassword,
} from "@/lib/hooks/developers/useDevelopers";
import {
  useTeamMembers,
  useTeamInvitations,
  useInviteTeamMember,
  useRemoveTeamMember,
} from "@/lib/hooks/teams/useTeams";
import {
  useIndividualKycStatus,
  useBusinessKycStatus,
  useVerifyBvn,
  useVerifyNin,
  useVerifyVnin,
  useVerifyCac,
} from "@/lib/hooks/kyc/useKyc";
import { REGISTRATION_TYPES, type RegistrationType } from "@/lib/api/kyc";

// ── Navigation ───────────────────────────────────────────────────────────────

type TabKey =
  | "general"
  | "settlements"
  | "notifications"
  | "verification"
  | "security"
  | "team";

const NAV_GROUPS: {
  label: string;
  items: { key: TabKey; label: string; icon: React.ElementType }[];
}[] = [
  {
    label: "Business",
    items: [
      { key: "general", label: "General", icon: SettingsIcon },
      { key: "settlements", label: "Settlements", icon: FileText },
      { key: "notifications", label: "Notifications", icon: Bell },
      { key: "verification", label: "Verification", icon: BadgeCheck },
    ],
  },
  {
    label: "Workspace",
    items: [
      { key: "security", label: "Security", icon: Shield },
      { key: "team", label: "Team", icon: User },
    ],
  },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");

  return (
    <div className="mx-auto w-full max-w-6xl px-2 py-4 sm:px-4">
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="w-full shrink-0 self-start lg:sticky lg:top-0 lg:w-60">
          <h1 className="text-3xl font-bold tracking-tight text-dash-foreground">
            Settings
          </h1>

          <nav className="mt-8">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="mb-6">
                <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-dash-faint">
                  {group.label}
                </p>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = tab === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTab(item.key)}
                        className={cn(
                          "relative flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-dash-accent-soft text-dash-foreground"
                            : "text-dash-muted hover:bg-dash-hover hover:text-dash-foreground",
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-dash-accent" />
                        )}
                        <Icon
                          size={16}
                          className={
                            active ? "text-dash-accent" : "text-dash-muted"
                          }
                        />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="min-w-0 flex-1 pb-16 lg:pt-17">
          {tab === "general" && <GeneralTab />}
          {tab === "settlements" && <SettlementsTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "verification" && <VerificationTab />}
          {tab === "security" && <SecurityTab />}
          {tab === "team" && <TeamTab />}
        </div>
      </div>
    </div>
  );
}

// ── General ──────────────────────────────────────────────────────────────────

function GeneralTab() {
  const { data: dev } = useMyDeveloperProfile();
  const { data: biz } = useMyBusiness();
  const updateDev = useUpdateDeveloperProfile();
  const updateBiz = useUpdateBusinessProfile();
  const createBiz = useCreateBusiness();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [theme, setTheme] = useState("system");

  const [businessName, setBusinessName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [showBranding, setShowBranding] = useState(false);

  const [newBizName, setNewBizName] = useState("");
  const [newBizType, setNewBizType] = useState("");
  const [newBizEmail, setNewBizEmail] = useState("");

  useEffect(() => {
    if (dev) {
      setFirstName(dev.first_name ?? "");
      setLastName(dev.last_name ?? "");
      setPhone(dev.phone ?? "");
      setTheme(dev.theme_preference ?? "system");
    }
  }, [dev]);

  useEffect(() => {
    if (biz) {
      setBusinessName(biz.name ?? "");
      setSupportEmail(biz.support_email ?? "");
      setWebsiteUrl(biz.website_url ?? "");
      setShowBranding(biz.show_branding_on_checkout ?? false);
    }
  }, [biz]);

  async function handleSave() {
    await Promise.all([
      updateDev.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        phone: phone || undefined,
        theme_preference: theme,
      }),
      updateBiz.mutateAsync({
        name: businessName,
        support_email: supportEmail || undefined,
        website_url: websiteUrl || undefined,
        show_branding_on_checkout: showBranding,
      }),
    ]);
  }

  async function handleCreateBusiness(e: FormEvent) {
    e.preventDefault();
    if (!newBizName.trim()) return;
    await createBiz.mutateAsync({
      name: newBizName.trim(),
      type: newBizType,
      email: newBizEmail,
    });
    setNewBizName("");
    setNewBizType("");
    setNewBizEmail("");
  }

  const saving = updateDev.isPending || updateBiz.isPending;

  return (
    <div>
      <SectionHeading
        title="Personal Information"
        description="Manage your personal identification and contact details."
      />

      <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2">
        <Field label="First name">
          <Input value={firstName} onChange={setFirstName} />
        </Field>
        <Field label="Last name">
          <Input value={lastName} onChange={setLastName} />
        </Field>
        <Field label="Email address" badge={<VerifiedBadge />}>
          <Input value={dev?.email ?? ""} readOnly />
        </Field>
        <Field label="Phone number">
          <Input
            value={phone}
            onChange={setPhone}
            placeholder="+234 800 000 0000"
          />
        </Field>
      </div>

      <Divider />

      <SectionHeading
        title="Business Profile"
        description="Information used to identify your business on checkout and receipts."
      />

      <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2">
        <Field label="Business name">
          <Input value={businessName} onChange={setBusinessName} />
        </Field>
        <Field
          label="Support email"
          badge={<HelpCircle size={13} className="text-dash-faint" />}
        >
          <Input
            value={supportEmail}
            onChange={setSupportEmail}
            placeholder="support@yourbusiness.com"
            type="email"
          />
        </Field>
        <Field label="Website URL">
          <Input
            value={websiteUrl}
            onChange={setWebsiteUrl}
            placeholder="https://yourbusiness.com"
          />
        </Field>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-semibold text-dash-foreground">Brand logo</p>
        <div className="flex items-center gap-4 rounded-xl border border-dashed border-dash-border bg-dash-card p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-dash-hover text-dash-faint">
            <ImageIcon size={20} />
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-hover px-4 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-border-strong"
          >
            <Upload size={14} /> Upload Logo
          </button>
          <p className="text-xs text-dash-faint">Max 2MB · PNG, JPEG, WEBP</p>
        </div>
      </div>

      <div className="mt-8 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-dash-foreground">
            Show Branding on Checkout
          </p>
          <p className="mt-1 text-sm text-dash-muted">
            Display your business name and logo on the checkout page header.
          </p>
        </div>
        <Toggle
          checked={showBranding}
          onChange={setShowBranding}
          color="blue"
        />
      </div>

      <Divider />

      <SectionHeading
        title="Preferences"
        description="Customize how the dashboard looks for you."
      />

      <div className="mt-8 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        <Field label="Interface theme">
          <Select
            value={theme}
            onChange={setTheme}
            options={[
              { label: "System Preference", value: "system" },
              { label: "Dark", value: "dark" },
              { label: "Light", value: "light" },
            ]}
          />
        </Field>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <Divider />

      <SectionHeading
        title="Create New Business"
        description="Add another business workspace to your account."
      />

      <form onSubmit={handleCreateBusiness} className="mt-8 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={newBizName}
            onChange={(e) => setNewBizName(e.target.value)}
            placeholder="Business name"
            className="h-11 w-full rounded-lg border border-dash-border bg-dash-card px-4 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-dash-accent focus:outline-none"
          />
          <input
            type="email"
            value={newBizEmail}
            onChange={(e) => setNewBizEmail(e.target.value)}
            placeholder="Business Email"
            className="h-11 w-full rounded-lg border border-dash-border bg-dash-card px-4 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-dash-accent focus:outline-none"
          />
          <div className="relative">
            <select
              value={newBizType}
              onChange={(e) => setNewBizType(e.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-dash-border bg-dash-card px-4 pr-10 text-sm text-dash-foreground transition-colors focus:border-dash-accent focus:outline-none"
            >
              <option value="">Business type (optional)</option>
              <option value="ecommerce">E-commerce</option>
              <option value="saas">SaaS</option>
              <option value="marketplace">Marketplace</option>
              <option value="fintech">Fintech</option>
              <option value="freelance">Freelance / Agency</option>
              <option value="retail">Retail</option>
              <option value="logistics">Logistics</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
              <option value="gaming">Gaming</option>
              <option value="travel">Travel</option>
              <option value="food_and_beverage">Food & Beverage</option>
              <option value="media_and_entertainment">
                Media & Entertainment
              </option>
              <option value="real_estate">Real Estate</option>
              <option value="professional_services">
                Professional Services
              </option>
              <option value="nonprofit">Nonprofit</option>
              <option value="other">Other</option>
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-muted"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newBizName.trim() || createBiz.isPending}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {createBiz.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {createBiz.isPending ? "Creating…" : "Create Business"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Settlements ──────────────────────────────────────────────────────────────

const CRYPTOS = [
  { label: "USDT", color: "#26A17B" },
  { label: "USDC", color: "#2775CA" },
  { label: "BTC", color: "#F7931A" },
  { label: "ETH", color: "#627EEA" },
  { label: "BNB", color: "#F3BA2F" },
  { label: "SOL", color: "#9945FF" },
  { label: "TRX", color: "#EF4444" },
];

const NETWORKS = [
  { label: "BSC", color: "#F3BA2F" },
  { label: "Solana", color: "#9945FF" },
  { label: "Ethereum", color: "#627EEA" },
  { label: "Tron", color: "#EF4444" },
  { label: "Base", color: "#2563EB" },
  { label: "Arbitrum", color: "#28A0F0" },
  { label: "Bitcoin", color: "#F7931A" },
];

function SettlementsTab() {
  const { data: biz } = useMyBusiness();
  const updateSettlements = useUpdateSettlements();

  const [currency, setCurrency] = useState("USDT");
  const [payout, setPayout] = useState("crypto");
  const [instantPayouts, setInstantPayouts] = useState(false);

  useEffect(() => {
    if (biz) {
      setCurrency(biz.settlement_currency ?? "USDT");
      setPayout(biz.default_payout_method ?? "crypto");
      setInstantPayouts(biz.instant_payouts_enabled ?? false);
    }
  }, [biz]);

  async function handleSave() {
    await updateSettlements.mutateAsync({
      settlement_currency: currency as "NGN" | "USDT" | "USDC",
      default_payout_method: payout as "crypto" | "bank",
      instant_payouts_enabled: instantPayouts,
    });
  }

  return (
    <div>
      <SectionHeading
        title="Settlement Configuration"
        description="Define your receiving currency and default payout preferences."
      />

      <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2">
        <Field
          label="Settlement Currency"
          badge={<HelpCircle size={13} className="text-dash-faint" />}
          inlineBadge
        >
          <Select
            value={currency}
            onChange={setCurrency}
            options={[
              { label: "USDT (Tether)", value: "USDT" },
              { label: "USDC (Circle)", value: "USDC" },
              { label: "NGN (Nigerian Naira)", value: "NGN" },
            ]}
          />
        </Field>
        <Field label="Default Payout Method">
          <Select
            value={payout}
            onChange={setPayout}
            options={[
              { label: "Crypto Wallet", value: "crypto" },
              { label: "Bank Account", value: "bank" },
            ]}
          />
        </Field>
      </div>

      <Divider />

      <SectionHeading title="Payment Logic" />

      <div className="mt-2 divide-y divide-dash-border">
        <ToggleRow
          title="Instant Payouts"
          description="Initiate payouts immediately once a payment is completed."
          checked={instantPayouts}
          onChange={setInstantPayouts}
        />
      </div>

      <Divider />

      <SectionHeading title="Accepted Assets" />

      <div className="mt-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-dash-faint">
          Cryptocurrencies
        </p>
        <div className="flex flex-wrap gap-2">
          {CRYPTOS.map((c) => (
            <Chip key={c.label} label={c.label} color={c.color} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-dash-faint">
          Networks
        </p>
        <div className="flex flex-wrap gap-2">
          {NETWORKS.map((n) => (
            <Chip key={n.label} label={n.label} color={n.color} />
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateSettlements.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-60"
        >
          {updateSettlements.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {updateSettlements.isPending ? "Saving…" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────

function NotificationsTab() {
  const { data: biz } = useMyBusiness();
  const updateNotifications = useUpdateNotifications();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [balanceAlerts, setBalanceAlerts] = useState(false);
  const [receipts, setReceipts] = useState(true);
  const [invoiceFollowups, setInvoiceFollowups] = useState(true);

  useEffect(() => {
    if (biz?.notification_preferences) {
      const p = biz.notification_preferences;
      setEmailNotifs(p.email_notifications ?? true);
      setBalanceAlerts(p.low_balance_alerts ?? false);
      setReceipts(p.automated_receipts ?? true);
      setInvoiceFollowups(p.invoice_followups ?? true);
    }
  }, [biz]);

  async function handleSave() {
    await updateNotifications.mutateAsync({
      preferences: {
        email_notifications: emailNotifs,
        low_balance_alerts: balanceAlerts,
        automated_receipts: receipts,
        invoice_followups: invoiceFollowups,
      },
    });
  }

  return (
    <div>
      <SectionHeading
        title="Notifications"
        description="Choose how and where you want to stay informed about your business activity."
      />

      <p className="mb-2 mt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-dash-faint">
        Merchant Alerts
      </p>
      <div className="divide-y divide-dash-border">
        <ToggleRow
          icon={<Bell size={17} className="text-dash-warning" />}
          iconBg="rgba(245,158,11,0.10)"
          title="Email Notifications"
          description="Receive summary reports and critical alerts via email."
          checked={emailNotifs}
          onChange={setEmailNotifs}
        />
        <ToggleRow
          icon={<Bell size={17} className="text-dash-accent" />}
          iconBg="rgba(37,99,235,0.10)"
          title="Low Balance Alerts"
          description="Get notified when your operating balance reaches a limit."
          checked={balanceAlerts}
          onChange={setBalanceAlerts}
        />
      </div>

      <p className="mb-2 mt-12 text-[11px] font-semibold uppercase tracking-[0.14em] text-dash-faint">
        Customer Experience
      </p>
      <div className="divide-y divide-dash-border">
        <ToggleRow
          icon={<Receipt size={17} className="text-dash-accent" />}
          iconBg="rgba(37,99,235,0.10)"
          title="Automated Receipts"
          description="Email a professional receipt after every successful payment."
          checked={receipts}
          onChange={setReceipts}
        />
        <ToggleRow
          icon={<FileText size={17} className="text-dash-muted" />}
          iconBg="rgba(161,161,170,0.08)"
          title="Invoice Follow-ups"
          description="Send invoice details and payment link reminders to customers."
          checked={invoiceFollowups}
          onChange={setInvoiceFollowups}
        />
      </div>

      <div className="mt-12 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateNotifications.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-60"
        >
          {updateNotifications.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {updateNotifications.isPending ? "Saving…" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

// ── Verification ─────────────────────────────────────────────────────────────

type IdType = "bvn" | "nin" | "vnin";

const ID_TYPES: {
  value: IdType;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    value: "bvn",
    label: "BVN",
    description: "11-digit Bank Verification Number",
    placeholder: "12345678901",
  },
  {
    value: "nin",
    label: "NIN",
    description: "11-digit National Identification Number",
    placeholder: "12345678901",
  },
  {
    value: "vnin",
    label: "vNIN",
    description: "16-character Virtual NIN",
    placeholder: "AB1234567890CDEF",
  },
];

function KycStatusBadge({ status }: { status: string }) {
  const cfg: Record<
    string,
    { label: string; cls: string; icon: React.ElementType }
  > = {
    verified: {
      label: "Verified",
      cls: "bg-dash-success-bg text-dash-success",
      icon: CheckCircle2,
    },
    failed: { label: "Failed", cls: "bg-dash-error-bg text-dash-error", icon: X },
    pending: {
      label: "Pending",
      cls: "bg-dash-warning-bg text-dash-warning",
      icon: Clock,
    },
    incomplete: {
      label: "Not Started",
      cls: "bg-dash-hover text-dash-muted",
      icon: Info,
    },
  };
  const c = cfg[status] ?? cfg.incomplete;
  const Icon = c.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.cls,
      )}
    >
      <Icon size={11} />
      {c.label}
    </span>
  );
}

function VerificationTab() {
  const { data: individualStatus, isLoading: loadingIndividual } =
    useIndividualKycStatus();
  const { data: businessStatus, isLoading: loadingBusiness } =
    useBusinessKycStatus();

  const verifyBvn = useVerifyBvn();
  const verifyNin = useVerifyNin();
  const verifyVnin = useVerifyVnin();
  const verifyCac = useVerifyCac();

  const [idType, setIdType] = useState<IdType>("bvn");
  const [idNumber, setIdNumber] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [regType, setRegType] = useState<RegistrationType>("RC");
  const [regName, setRegName] = useState("");

  const overallStatus = individualStatus?.overall_status ?? "incomplete";
  const individualVerified = overallStatus === "verified";
  const businessVerified = businessStatus?.verified ?? false;

  const submittedTypes = new Set(
    individualStatus?.verifications.map((v) => v.type) ?? [],
  );

  const identityPending =
    verifyBvn.isPending || verifyNin.isPending || verifyVnin.isPending;

  async function handleIdentitySubmit(e: FormEvent) {
    e.preventDefault();
    if (!idNumber.trim() || submittedTypes.has(idType)) return;
    if (idType === "bvn") await verifyBvn.mutateAsync({ bvn: idNumber.trim() });
    else if (idType === "nin")
      await verifyNin.mutateAsync({ nin: idNumber.trim() });
    else await verifyVnin.mutateAsync({ vnin: idNumber.trim() });
    setIdNumber("");
  }

  async function handleCacSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rcNumber.trim()) return;
    await verifyCac.mutateAsync({
      rc_number: rcNumber.trim(),
      registration_type: regType,
      ...(regName.trim() ? { registration_name: regName.trim() } : {}),
    });
    setRcNumber("");
    setRegName("");
  }

  const selectedTypeId = ID_TYPES.find((t) => t.value === idType);

  const bizVerificationStatus = businessVerified
    ? "verified"
    : businessStatus?.verification
      ? businessStatus.verification.status
      : "incomplete";

  return (
    <div>
      <SectionHeading
        title="Account Verification"
        description="Complete verification to unlock all features and start accepting payments."
      />

      <div className="mt-8 flex flex-col gap-5">
        {/* ── Identity card ──────────────────────────────── */}
        <div className="rounded-xl border border-dash-border bg-dash-card">
          <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dash-accent-soft">
                <IdCard size={17} className="text-dash-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dash-foreground">
                  Identity Verification
                </p>
                <p className="text-xs text-dash-faint">
                  BVN · NIN · Virtual NIN
                </p>
              </div>
            </div>
            {loadingIndividual ? (
              <Loader2 size={14} className="animate-spin text-dash-faint" />
            ) : (
              <KycStatusBadge status={overallStatus} />
            )}
          </div>

          <div className="p-5">
            {individualVerified ? (
              <div className="flex items-center gap-2 text-sm text-dash-success">
                <CheckCircle2 size={15} />
                Your identity has been verified. You can process live
                transactions.
              </div>
            ) : (
              <>
                {/* Previous attempts */}
                {(individualStatus?.verifications.length ?? 0) > 0 && (
                  <div className="mb-5">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-dash-faint">
                      Previous attempts
                    </p>
                    <div className="flex flex-col gap-2">
                      {individualStatus!.verifications.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-lg border border-dash-border bg-dash-hover px-3 py-2.5"
                        >
                          <span className="text-sm font-medium uppercase text-dash-muted">
                            {v.type}
                          </span>
                          <KycStatusBadge status={v.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleIdentitySubmit}
                  className="flex flex-col gap-4"
                >
                  {loadingIndividual ? null : (
                    <p className="text-sm text-dash-muted">
                      Submit a government-issued ID to verify your identity.
                    </p>
                  )}

                  {/* Type selector */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-dash-muted">
                      Verification type
                    </label>
                    <div className="flex gap-2">
                      {ID_TYPES.map((t) => {
                        const used = submittedTypes.has(t.value);
                        return (
                          <button
                            key={t.value}
                            type="button"
                            disabled={used}
                            onClick={() => {
                              setIdType(t.value);
                              setIdNumber("");
                            }}
                            className={cn(
                              "flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors",
                              used
                                ? "cursor-not-allowed border-dash-border text-dash-faint"
                                : idType === t.value
                                  ? "border-dash-accent bg-dash-accent-soft text-dash-accent"
                                  : "border-dash-border bg-dash-card text-dash-muted hover:border-dash-accent hover:text-dash-muted",
                            )}
                          >
                            {t.label}
                            {used && (
                              <span className="ml-1 text-[10px]">(used)</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ID number input */}
                  {!submittedTypes.has(idType) && (
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-dash-muted">
                        {selectedTypeId?.description ?? "ID Number"}
                      </label>
                      <input
                        type="text"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder={selectedTypeId?.placeholder}
                        required
                        className="h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint transition-colors focus:border-dash-accent focus:outline-none"
                      />
                    </div>
                  )}

                  {submittedTypes.has(idType) ? (
                    <p className="text-xs text-dash-faint">
                      Select an unused verification type above.
                    </p>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!idNumber.trim() || identityPending}
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {identityPending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <ShieldCheck size={14} />
                        )}
                        {identityPending ? "Verifying…" : "Verify Identity"}
                      </button>
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>

        {/* ── Business / CAC card ────────────────────────── */}
        <div className="rounded-xl border border-dash-border bg-dash-card">
          <div className="flex items-center justify-between border-b border-dash-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-dash-accent-soft">
                <Building2 size={17} className="text-dash-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dash-foreground">
                  Business Verification
                </p>
                <p className="text-xs text-dash-faint">
                  CAC Registration Number
                </p>
              </div>
            </div>
            {loadingBusiness ? (
              <Loader2 size={14} className="animate-spin text-dash-faint" />
            ) : (
              <KycStatusBadge status={bizVerificationStatus} />
            )}
          </div>

          <div className="p-5">
            {businessVerified ? (
              <div className="flex flex-wrap items-center gap-2 text-sm text-dash-success">
                <CheckCircle2 size={15} />
                Your business is verified.
                {businessStatus?.verification?.validation_input
                  ?.registration_name && (
                  <span className="text-dash-faint">
                    (
                    {
                      businessStatus.verification.validation_input
                        .registration_name
                    }
                    )
                  </span>
                )}
              </div>
            ) : businessStatus?.verification ? (
              <div className="flex items-center gap-2 text-sm text-dash-muted">
                <Info size={15} className="shrink-0" />
                Your CAC verification is{" "}
                <span className="font-medium capitalize">
                  {businessStatus.verification.status}
                </span>
                . Contact support if you need assistance.
              </div>
            ) : (
              <form onSubmit={handleCacSubmit} className="flex flex-col gap-4">
                <p className="text-sm text-dash-muted">
                  Submit your CAC Registration Number to verify your business
                  and unlock higher transaction limits.
                </p>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-dash-muted">
                    Registration Type *
                  </label>
                  <div className="relative">
                    <select
                      value={regType}
                      onChange={(e) =>
                        setRegType(e.target.value as RegistrationType)
                      }
                      className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-dash-border bg-dash-card px-3 pr-9 text-sm text-dash-foreground transition-colors focus:border-dash-accent focus:outline-none"
                    >
                      {REGISTRATION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-dash-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-dash-muted">
                    CAC Registration Number *
                  </label>
                  <input
                    type="text"
                    value={rcNumber}
                    onChange={(e) => setRcNumber(e.target.value)}
                    placeholder="RC123456"
                    required
                    className="h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint transition-colors focus:border-dash-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-dash-muted">
                    Registered Business Name{" "}
                    <span className="text-dash-faint">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Acme Corp Ltd"
                    className="h-10 w-full rounded-lg border border-dash-border bg-dash-card px-3 text-sm text-dash-foreground placeholder:text-dash-faint transition-colors focus:border-dash-accent focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!rcNumber.trim() || verifyCac.isPending}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {verifyCac.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Building2 size={14} />
                    )}
                    {verifyCac.isPending ? "Verifying…" : "Verify Business"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Security ─────────────────────────────────────────────────────────────────

function SecurityTab() {
  const [pwModalOpen, setPwModalOpen] = useState(false);

  return (
    <div>
      <SectionHeading
        title="Security"
        description="Manage your password, two-factor authentication and connected integrations."
      />

      <div className="mt-6 divide-y divide-dash-border">
        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex min-w-0 items-start gap-5">
            <IconTile>
              <Lock size={19} className="text-dash-muted" />
            </IconTile>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-dash-foreground">
                Password
              </p>
              <p className="mt-1.5 text-sm text-dash-muted">
                Set a strong, unique password to keep your account secure.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPwModalOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-dash-border bg-dash-card px-4 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
          >
            <Key size={14} /> Change password
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex min-w-0 items-start gap-5">
            <IconTile>
              <ShieldCheck size={19} className="text-dash-accent" />
            </IconTile>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <p className="text-[15px] font-semibold text-dash-foreground">
                  Two-Factor Authentication
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-dash-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-dash-muted" />
                  Inactive
                </span>
              </div>
              <p className="mt-1.5 text-sm text-dash-muted">
                Use an Authenticator app instead of email OTP for login and
                withdrawals.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-dash-border bg-dash-card px-4 text-sm font-medium text-dash-foreground transition-colors hover:bg-dash-hover"
          >
            <Zap size={14} /> Enable
          </button>
        </div>
      </div>

      {pwModalOpen && (
        <ChangePasswordModal onClose={() => setPwModalOpen(false)} />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const changePassword = useChangePassword();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [mismatch, setMismatch] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    await changePassword.mutateAsync({
      current_password: currentPw,
      new_password: newPw,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-dash-border bg-dash-card shadow-2xl">
        <div className="flex items-center justify-between px-7 py-6">
          <div className="flex items-center gap-3">
            <Key size={17} className="text-dash-accent" />
            <h2 className="text-lg font-bold text-dash-foreground">
              Change Password
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 pb-7">
          <div className="space-y-4">
            <Field label="Current password">
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                className="h-12 w-full rounded-lg border border-dash-border bg-dash-card px-4 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-dash-accent focus:outline-none"
              />
            </Field>
            <Field label="New password">
              <input
                type="password"
                value={newPw}
                onChange={(e) => {
                  setNewPw(e.target.value);
                  setMismatch(false);
                }}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="h-12 w-full rounded-lg border border-dash-border bg-dash-card px-4 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-dash-accent focus:outline-none"
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => {
                  setConfirmPw(e.target.value);
                  setMismatch(false);
                }}
                required
                className={cn(
                  "h-12 w-full rounded-lg border bg-dash-card px-4 text-sm text-dash-foreground transition-colors focus:outline-none",
                  mismatch
                    ? "border-dash-error focus:border-dash-error"
                    : "border-dash-border focus:border-dash-accent",
                )}
              />
              {mismatch && (
                <p className="mt-1.5 text-xs text-dash-error">
                  Passwords do not match.
                </p>
              )}
            </Field>
          </div>

          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-dash-border px-5 text-sm font-medium text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-dash-accent px-5 text-sm font-medium text-white transition-colors hover:bg-dash-accent-hover disabled:opacity-60"
            >
              {changePassword.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Key size={14} />
              )}
              {changePassword.isPending ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────

function TeamTab() {
  const [view, setView] = useState<"members" | "pending">("members");
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data: members = [], isLoading: membersLoading } = useTeamMembers();
  const { data: invitations = [], isLoading: invitationsLoading } =
    useTeamInvitations();
  const invite = useInviteTeamMember();
  const remove = useRemoveTeamMember();

  async function handleInvite(payload: {
    email: string;
    role: string;
    permissions: string[];
  }) {
    await invite.mutateAsync({
      email: payload.email,
      role: payload.role as "admin" | "staff",
      permissions: payload.permissions,
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          title="Team"
          description="Manage access controls and permissions for your organization."
        />
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-dash-accent px-4 text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover"
        >
          <UserPlus size={15} /> Invite Member
        </button>
      </div>

      <div className="mt-8 flex gap-8 border-b border-dash-border">
        <TeamViewTab
          icon={<Users size={15} />}
          label="Members"
          active={view === "members"}
          onClick={() => setView("members")}
        />
        <TeamViewTab
          icon={<Clock size={15} />}
          label={`Pending Invitations${invitations.length > 0 ? ` (${invitations.length})` : ""}`}
          active={view === "pending"}
          onClick={() => setView("pending")}
        />
      </div>

      {view === "members" ? (
        membersLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={24} className="animate-spin text-dash-faint" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 py-24">
            <User size={44} strokeWidth={1.25} className="text-dash-faint" />
            <p className="text-sm text-dash-muted">No team members yet.</p>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-11 items-center rounded-lg bg-dash-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-dash-accent-hover"
            >
              Invite your first member
            </button>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-dash-border">
            {members.map((m) => {
              const name =
                [m.first_name, m.last_name].filter(Boolean).join(" ") ||
                m.email;
              const initials =
                [m.first_name?.at(0), m.last_name?.at(0)]
                  .filter(Boolean)
                  .join("")
                  .toUpperCase() ||
                m.email.at(0)?.toUpperCase() ||
                "?";
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dash-accent-soft text-xs font-semibold text-dash-accent">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-dash-foreground">
                        {name}
                      </p>
                      <p className="truncate text-xs text-dash-faint">
                        {m.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <RoleBadge role={m.role} />
                    {m.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => remove.mutate(m.id)}
                        disabled={remove.isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-dash-muted transition-colors hover:bg-dash-hover hover:text-dash-error disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : invitationsLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={24} className="animate-spin text-dash-faint" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-24">
          <Clock size={44} strokeWidth={1.25} className="text-dash-faint" />
          <p className="text-sm text-dash-muted">No pending invitations.</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-dash-border">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-dash-foreground">
                  {inv.email}
                </p>
                <p className="mt-0.5 text-xs text-dash-faint">
                  Invited ·{" "}
                  {inv.invite_expires_at
                    ? `Expires ${new Date(inv.invite_expires_at).toLocaleDateString()}`
                    : "No expiry"}
                </p>
              </div>
              <RoleBadge role={inv.role} />
            </div>
          ))}
        </div>
      )}

      <InviteStaffModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={handleInvite}
      />
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    owner: "bg-dash-purple-bg text-dash-purple",
    admin: "bg-dash-accent-soft text-dash-accent",
    staff: "bg-dash-hover text-dash-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        styles[role] ?? styles.staff,
      )}
    >
      {role}
    </span>
  );
}

function TeamViewTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors",
        active
          ? "border-dash-accent text-dash-accent"
          : "border-transparent text-dash-muted hover:text-dash-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────────

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-dash-foreground">{title}</h2>
      {description && (
        <p className="mt-2 text-[15px] text-dash-muted">{description}</p>
      )}
    </div>
  );
}

function Divider() {
  return <div className="my-12 border-t border-dash-border" />;
}

function Field({
  label,
  badge,
  inlineBadge,
  children,
}: {
  label: string;
  badge?: React.ReactNode;
  inlineBadge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-2.5 flex items-center gap-2",
          !inlineBadge && "justify-between",
        )}
      >
        <label className="text-sm font-semibold text-dash-foreground">{label}</label>
        {badge}
      </div>
      {children}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="rounded-md bg-dash-success-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-dash-success">
      Verified
    </span>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={cn(
        "h-12 w-full rounded-lg border border-dash-border bg-dash-card px-4 text-sm text-dash-foreground transition-colors placeholder:text-dash-faint focus:border-dash-accent focus:outline-none",
        readOnly && "cursor-default text-dash-muted",
      )}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-dash-border bg-dash-card px-4 pr-10 text-sm font-medium text-dash-foreground transition-colors focus:border-dash-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-dash-muted"
      />
    </div>
  );
}

function ToggleRow({
  icon,
  iconBg,
  title,
  info,
  description,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  info?: boolean;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-6">
      <div className="flex min-w-0 items-start gap-4">
        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: iconBg ?? "rgba(161,161,170,0.08)" }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[15px] font-semibold text-dash-foreground">{title}</p>
            {info && <Info size={12} className="text-dash-faint" />}
          </div>
          <p className="mt-0.5 text-sm text-dash-muted">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} color="blue" />
    </div>
  );
}

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-dash-hover">
      {children}
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 rounded-full border border-dash-border bg-dash-card px-3.5 text-xs font-medium text-dash-muted transition-colors hover:border-dash-accent"
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </button>
  );
}
