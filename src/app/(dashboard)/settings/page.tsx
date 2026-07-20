"use client";

import { useState } from "react";
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
  Send,
  Users,
  Receipt,
  ExternalLink,
  Lock,
  ShieldCheck,
  Key,
  IdCard,
  Building2,
  ArrowRight,
  User,
  UserPlus,
  Clock,
  Zap,
} from "lucide-react";
import Toggle from "@/components/dashboard/shared/Toggle";
import InviteStaffModal from "@/components/dashboard/teams/InviteStaffModal";
import { cn } from "@/utils/utils";

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
        {/* Title + sub-navigation — pinned while the content scrolls */}
        <div className="w-full shrink-0 self-start lg:sticky lg:top-0 lg:w-60">
          <h1 className="text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Settings
          </h1>

          <nav className="mt-8">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">
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
                          ? "bg-[#0F1626] text-[#FAFAFA]"
                          : "text-[#A1A1AA] hover:bg-[#101013] hover:text-[#FAFAFA]",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[#2563EB]" />
                      )}
                      <Icon
                        size={16}
                        className={active ? "text-[#2563EB]" : "text-[#71717A]"}
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

        {/* Content */}
        <div className="min-w-0 flex-1 pb-16 lg:pt-[68px]">
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
  const [firstName, setFirstName] = useState("Samuel");
  const [lastName, setLastName] = useState("Uzor");
  const [email] = useState("samueluzor80@gmail.com");
  const [phone, setPhone] = useState("2348110015132");
  const [businessName, setBusinessName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [showBranding, setShowBranding] = useState(false);
  const [theme, setTheme] = useState("system");

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
          <Input value={email} readOnly />
        </Field>
        <Field label="Phone number" badge={<VerifiedBadge />}>
          <Input value={phone} onChange={setPhone} />
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
          badge={<HelpCircle size={13} className="text-[#52525B]" />}
        >
          <Input
            value={supportEmail}
            onChange={setSupportEmail}
            placeholder="support@yourbusiness.com"
            type="email"
          />
        </Field>
      </div>

      <div className="mt-8">
        <p className="mb-2 text-sm font-semibold text-[#FAFAFA]">Brand logo</p>
        <div className="flex items-center gap-4 rounded-xl border border-dashed border-[#26262B] bg-[#0A0B0E] p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#15151A] text-[#52525B]">
            <ImageIcon size={20} />
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1C1C1F] px-4 text-sm font-medium text-[#FAFAFA] transition-colors hover:bg-[#27272A]"
          >
            <Upload size={14} /> Upload Logo
          </button>
          <p className="text-xs text-[#52525B]">Max 2MB · PNG, JPEG, WEBP</p>
        </div>
      </div>

      <div className="mt-8 flex items-start justify-between gap-6">
        <div>
          <p className="text-sm font-semibold text-[#FAFAFA]">
            Show Branding on Checkout
          </p>
          <p className="mt-1 text-sm text-[#71717A]">
            Display your business name and logo on the checkout page header.
          </p>
        </div>
        <Toggle checked={showBranding} onChange={setShowBranding} color="blue" />
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

      <SaveBar label="Save Changes" />
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
  const [currency, setCurrency] = useState("usdt");
  const [payout, setPayout] = useState("crypto");
  const [networkFees, setNetworkFees] = useState("customer");
  const [instantPayouts, setInstantPayouts] = useState(false);
  const [partialPayments, setPartialPayments] = useState(true);
  const [underpayment, setUnderpayment] = useState("0");
  const [assets, setAssets] = useState<string[]>([]);
  const [networks, setNetworks] = useState<string[]>([]);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    value: string,
  ) =>
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );

  return (
    <div>
      <SectionHeading
        title="Settlement Configuration"
        description="Define your receiving currency and default payout preferences."
      />

      <div className="mt-8 grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2">
        <Field
          label="Settlement Currency"
          badge={<HelpCircle size={13} className="text-[#52525B]" />}
          inlineBadge
        >
          <Select
            value={currency}
            onChange={setCurrency}
            options={[
              { label: "USDT (Tether)", value: "usdt" },
              { label: "USDC (Circle)", value: "usdc" },
              { label: "NGN (Nigerian Naira)", value: "ngn" },
              { label: "USD (US Dollar)", value: "usd" },
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
        <Field label="Network Fee Responsibility">
          <Select
            value={networkFees}
            onChange={setNetworkFees}
            options={[
              { label: "Customer Pays Fees", value: "customer" },
              { label: "Merchant Pays Fees", value: "merchant" },
            ]}
          />
        </Field>
      </div>

      <Divider />

      <SectionHeading title="Payment Logic" />

      <div className="mt-2 divide-y divide-[#17171A]">
        <ToggleRow
          title="Instant Payouts"
          description="Initiate payouts immediately once a payment is completed."
          checked={instantPayouts}
          onChange={setInstantPayouts}
        />
        <ToggleRow
          title="Enable Partial Payments"
          description="Allow customers to make multiple payments to complete a single session."
          checked={partialPayments}
          onChange={setPartialPayments}
        />
        <div className="flex items-center justify-between gap-6 py-6">
          <div>
            <p className="text-[15px] font-semibold text-[#FAFAFA]">
              Underpayment Tolerance
            </p>
            <p className="mt-1 text-sm text-[#71717A]">
              Auto-complete sessions if paid at least{" "}
              {100 - (Number(underpayment) || 0)}%
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <input
              type="number"
              value={underpayment}
              onChange={(e) => setUnderpayment(e.target.value)}
              className="h-11 w-20 rounded-lg border border-[#1C1C1F] bg-[#0A0B0E] px-2 text-center text-sm text-[#FAFAFA] transition-colors focus:border-[#2563EB] focus:outline-none"
            />
            <span className="text-sm text-[#71717A]">%</span>
          </div>
        </div>
      </div>

      <Divider />

      <SectionHeading
        title="Accepted Assets"
        description="Tap to toggle. When none are selected, all options are accepted."
      />

      <div className="mt-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">
          Cryptocurrencies
        </p>
        <div className="flex flex-wrap gap-2">
          {CRYPTOS.map((c) => (
            <Chip
              key={c.label}
              label={c.label}
              color={c.color}
              active={assets.includes(c.label)}
              onClick={() => toggle(assets, setAssets, c.label)}
            />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">
          Networks
        </p>
        <div className="flex flex-wrap gap-2">
          {NETWORKS.map((n) => (
            <Chip
              key={n.label}
              label={n.label}
              color={n.color}
              active={networks.includes(n.label)}
              onClick={() => toggle(networks, setNetworks, n.label)}
            />
          ))}
        </div>
      </div>

      <SaveBar label="Save Preferences" />
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────

function NotificationsTab() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(false);
  const [telegramGroup, setTelegramGroup] = useState(false);
  const [balanceAlerts, setBalanceAlerts] = useState(false);
  const [receipts, setReceipts] = useState(true);
  const [invoiceFollowups, setInvoiceFollowups] = useState(true);

  return (
    <div>
      <SectionHeading
        title="Notifications"
        description="Choose how and where you want to stay informed about your business activity."
      />

      <p className="mb-2 mt-10 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">
        Merchant Alerts
      </p>
      <div className="divide-y divide-[#17171A]">
        <ToggleRow
          icon={<Bell size={17} className="text-[#F59E0B]" />}
          iconBg="rgba(245,158,11,0.10)"
          title="Email Notifications"
          description="Receive summary reports and critical alerts via email."
          checked={emailNotifs}
          onChange={setEmailNotifs}
        />
        <ToggleRow
          icon={<Send size={17} className="text-[#2563EB]" />}
          iconBg="rgba(37,99,235,0.10)"
          title="Direct Telegram Alerts"
          info
          description="Instant transaction notifications via our Telegram bot."
          checked={telegramAlerts}
          onChange={setTelegramAlerts}
        />
        <ToggleRow
          icon={<Users size={17} className="text-[#60A5FA]" />}
          iconBg="rgba(96,165,250,0.10)"
          title="Telegram Group Alerts"
          info
          description="Keep your whole team informed in a shared group."
          checked={telegramGroup}
          onChange={setTelegramGroup}
        />
        <ToggleRow
          icon={<Bell size={17} className="text-[#2563EB]" />}
          iconBg="rgba(37,99,235,0.10)"
          title="Low Balance Alerts"
          description="Get notified when your operating balance reaches a limit."
          checked={balanceAlerts}
          onChange={setBalanceAlerts}
        />
      </div>

      <p className="mb-2 mt-12 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52525B]">
        Customer Experience
      </p>
      <div className="divide-y divide-[#17171A]">
        <ToggleRow
          icon={<Receipt size={17} className="text-[#2563EB]" />}
          iconBg="rgba(37,99,235,0.10)"
          title="Automated Receipts"
          description="Email a professional receipt after every successful payment."
          checked={receipts}
          onChange={setReceipts}
        />
        <ToggleRow
          icon={<FileText size={17} className="text-[#A1A1AA]" />}
          iconBg="rgba(161,161,170,0.08)"
          title="Invoice Follow-ups"
          description="Send invoice details and payment link reminders to customers."
          checked={invoiceFollowups}
          onChange={setInvoiceFollowups}
        />
      </div>
    </div>
  );
}

// ── Verification ─────────────────────────────────────────────────────────────

function VerificationTab() {
  return (
    <div>
      <SectionHeading
        title="Account Verification"
        description="Complete verification to unlock all features and start accepting payments."
      />

      <div className="mt-10 flex flex-col gap-10">
        {/* Identity */}
        <div className="flex items-start gap-5">
          <IconTile>
            <IdCard size={20} className="text-[#22C55E]" />
          </IconTile>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-[15px] font-semibold text-[#FAFAFA]">
                Identity Verification
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#052E16] px-2.5 py-0.5 text-xs font-medium text-[#22C55E]">
                <CheckCircle2 size={11} /> Verified
              </span>
            </div>
            <p className="mt-1.5 text-sm text-[#71717A]">
              Your identity has been verified. You can start processing live
              transactions.
            </p>
          </div>
        </div>

        {/* Business */}
        <div className="flex items-start gap-5">
          <IconTile>
            <Building2 size={20} className="text-[#2563EB]" />
          </IconTile>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[#FAFAFA]">
              Business Verification
            </h3>
            <p className="mt-1.5 text-sm text-[#71717A]">
              Verify your registered business to unlock higher transaction
              limits and business features.
            </p>
            <a
              href="#"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
            >
              Verify Business <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Security ─────────────────────────────────────────────────────────────────

function SecurityTab() {
  return (
    <div>
      <SectionHeading
        title="Security"
        description="Manage your password, two-factor authentication and connected integrations."
      />

      <div className="mt-6 divide-y divide-[#17171A]">
        {/* Telegram */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex min-w-0 items-start gap-5">
            <IconTile>
              <Send size={19} className="text-[#2563EB]" />
            </IconTile>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-[#FAFAFA]">
                  Telegram
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
                >
                  <ExternalLink size={11} /> Open Bot
                </a>
              </div>
              <p className="mt-1.5 text-sm text-[#71717A]">
                Not connected. Link your account to receive notifications and
                use the bot.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
          >
            <Send size={14} /> Connect
          </button>
        </div>

        {/* Password */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex min-w-0 items-start gap-5">
            <IconTile>
              <Lock size={19} className="text-[#A1A1AA]" />
            </IconTile>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-[#FAFAFA]">
                Password
              </p>
              <p className="mt-1.5 text-sm text-[#71717A]">
                Set a strong, unique password to keep your account secure.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#0A0B0E] px-4 text-sm font-medium text-[#FAFAFA] transition-colors hover:bg-[#15151A]"
          >
            <Key size={14} /> Change password
          </button>
        </div>

        {/* 2FA */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="flex min-w-0 items-start gap-5">
            <IconTile>
              <ShieldCheck size={19} className="text-[#2563EB]" />
            </IconTile>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <p className="text-[15px] font-semibold text-[#FAFAFA]">
                  Two-Factor Authentication
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#71717A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#71717A]" />
                  Inactive
                </span>
              </div>
              <p className="mt-1.5 text-sm text-[#71717A]">
                Use an Authenticator app instead of email OTP for login and
                withdrawals.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#0A0B0E] px-4 text-sm font-medium text-[#FAFAFA] transition-colors hover:bg-[#15151A]"
          >
            <Zap size={14} /> Enable
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────

function TeamTab() {
  const [view, setView] = useState<"members" | "pending">("members");
  const [inviteOpen, setInviteOpen] = useState(false);

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
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#FAFAFA] px-4 text-sm font-semibold text-[#09090B] transition-colors hover:bg-white"
        >
          <UserPlus size={15} /> Invite Member
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="mt-8 flex gap-8 border-b border-[#1C1C1F]">
        <TeamViewTab
          icon={<Users size={15} />}
          label="Members"
          active={view === "members"}
          onClick={() => setView("members")}
        />
        <TeamViewTab
          icon={<Clock size={15} />}
          label="Pending Invitations"
          active={view === "pending"}
          onClick={() => setView("pending")}
        />
      </div>

      {/* Empty states */}
      {view === "members" ? (
        <div className="flex flex-col items-center justify-center gap-5 py-24">
          <User size={44} strokeWidth={1.25} className="text-[#3F3F46]" />
          <p className="text-sm text-[#A1A1AA]">No team members yet.</p>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex h-11 items-center rounded-lg bg-[#FAFAFA] px-5 text-sm font-semibold text-[#09090B] transition-colors hover:bg-white"
          >
            Invite your first member
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-5 py-24">
          <Clock size={44} strokeWidth={1.25} className="text-[#3F3F46]" />
          <p className="text-sm text-[#A1A1AA]">No pending invitations.</p>
        </div>
      )}

      <InviteStaffModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSubmit={(payload) => {
          // TODO: POST /teams/invite
          console.log("invite staff", payload);
        }}
      />
    </div>
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
          ? "border-[#2563EB] text-[#2563EB]"
          : "border-transparent text-[#A1A1AA] hover:text-[#FAFAFA]",
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
      <h2 className="text-xl font-semibold text-[#FAFAFA]">{title}</h2>
      {description && (
        <p className="mt-2 text-[15px] text-[#71717A]">{description}</p>
      )}
    </div>
  );
}

function Divider() {
  return <div className="my-12 border-t border-[#17171A]" />;
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
        <label className="text-sm font-semibold text-[#FAFAFA]">{label}</label>
        {badge}
      </div>
      {children}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="rounded-md bg-[#052E16] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22C55E]">
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
        "h-12 w-full rounded-lg border border-[#1C1C1F] bg-[#0A0B0E] px-4 text-sm text-[#FAFAFA] transition-colors placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none",
        readOnly && "cursor-default text-[#A1A1AA]",
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
        className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-[#1C1C1F] bg-[#0A0B0E] px-4 pr-10 text-sm font-medium text-[#FAFAFA] transition-colors focus:border-[#2563EB] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A]"
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
            <p className="text-[15px] font-semibold text-[#FAFAFA]">{title}</p>
            {info && <Info size={12} className="text-[#52525B]" />}
          </div>
          <p className="mt-0.5 text-sm text-[#71717A]">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} color="blue" />
    </div>
  );
}

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#10151F]">
      {children}
    </div>
  );
}

function SaveBar({ label }: { label: string }) {
  return (
    <div className="mt-12 flex justify-end">
      <button
        type="button"
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8]"
      >
        <Save size={14} /> {label}
      </button>
    </div>
  );
}

function Chip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-xs font-medium transition-colors",
        active
          ? "border-[#2563EB] bg-[#2563EB]/15 text-[#FAFAFA]"
          : "border-[#1C1C1F] bg-[#0A0B0E] text-[#A1A1AA] hover:border-[#2563EB]/40",
      )}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </button>
  );
}
