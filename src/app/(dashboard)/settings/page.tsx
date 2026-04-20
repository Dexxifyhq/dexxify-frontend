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
  AlertTriangle,
  Send,
  Users,
  Receipt,
  FileSpreadsheet,
  ExternalLink,
  Lock,
  ShieldCheck,
  Key,
  IdCard,
  Building2,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/dashboard/shared/PageHeader";
import Toggle from "@/components/dashboard/shared/Toggle";

const TABS = [
  { key: "general", label: "General", icon: SettingsIcon },
  { key: "settlements", label: "Settlements", icon: FileText },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "verification", label: "Verification", icon: BadgeCheck },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("general");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Settings"
        description="Manage your business profile, preferences, and security."
      />

      {/* Tabs */}
      <div className="mx-auto flex flex-wrap items-center justify-center gap-1 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2563EB] text-white"
                  : "text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-[#FAFAFA]"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "general" && <GeneralTab />}
      {tab === "settlements" && <SettlementsTab />}
      {tab === "notifications" && <NotificationsTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "verification" && <VerificationTab />}
    </div>
  );
}

// ── General ──────────────────────────────────────────────────────────────────

function GeneralTab() {
  const [firstName, setFirstName] = useState("Samuel");
  const [lastName, setLastName] = useState("Uzor");
  const [email] = useState("samueluzor80@gmail.com");
  const [phone, setPhone] = useState("+2348135492141");
  const [businessName, setBusinessName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [showBranding, setShowBranding] = useState(false);
  const [theme, setTheme] = useState("system");

  return (
    <div className="flex flex-col gap-8 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-8">
      {/* Personal Information */}
      <section>
        <h3 className="text-sm font-semibold text-[#FAFAFA]">
          Personal Information
        </h3>
        <p className="mb-4 text-xs text-[#71717A]">
          Your personal identification details.
        </p>

        <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#1C1C1F] bg-[#09090B] p-5 sm:grid-cols-2">
          <Field label="First Name">
            <Input value={firstName} onChange={setFirstName} />
          </Field>
          <Field label="Last Name">
            <Input value={lastName} onChange={setLastName} />
          </Field>
          <Field label="Email Address">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-3 text-sm">
              <span className="flex-1 truncate text-[#A1A1AA]">{email}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#052E16] px-2 py-0.5 text-[11px] font-medium text-[#22C55E]">
                <CheckCircle2 size={10} /> Verified
              </span>
            </div>
          </Field>
          <Field label="Phone Number">
            <div className="flex items-center gap-2">
              <Input value={phone} onChange={setPhone} />
              <button
                type="button"
                className="h-10 rounded-lg bg-[#2563EB]/15 px-3 text-xs font-semibold text-[#2563EB] hover:bg-[#2563EB]/25 transition-colors"
              >
                Verify
              </button>
            </div>
          </Field>
        </div>
      </section>

      {/* Business Profile */}
      <section>
        <h3 className="text-sm font-semibold text-[#FAFAFA]">
          Business Profile
        </h3>
        <p className="mb-4 text-xs text-[#71717A]">
          Manage how your business appears to customers.
        </p>

        <div className="flex flex-col gap-5 rounded-xl border border-[#1C1C1F] bg-[#09090B] p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business Name">
              <Input value={businessName} onChange={setBusinessName} />
            </Field>
            <Field
              label={
                <>
                  Support Email
                  <HelpCircle size={11} className="text-[#52525B]" />
                </>
              }
            >
              <Input
                value={supportEmail}
                onChange={setSupportEmail}
                placeholder="support@yourbusiness.com"
                type="email"
              />
            </Field>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-[#A1A1AA]">
              Brand Logo
            </p>
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#1C1C1F] bg-[#0D0D0F] p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1C1C1F] text-[#52525B]">
                <ImageIcon size={18} />
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1C1C1F] px-3 text-xs font-medium text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
              >
                <Upload size={12} /> Upload Logo
              </button>
              <p className="text-xs text-[#52525B]">
                Max 2MB · PNG, JPEG, WEBP
              </p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-[#1C1C1F] pt-4">
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">
                Show Branding on Checkout
              </p>
              <p className="text-xs text-[#71717A]">
                Display your business name and logo on the checkout page header.
              </p>
            </div>
            <Toggle
              checked={showBranding}
              onChange={setShowBranding}
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section>
        <h3 className="mb-4 text-sm font-semibold text-[#FAFAFA]">
          Preferences
        </h3>

        <div className="rounded-xl border border-[#1C1C1F] bg-[#09090B] p-5">
          <Field label="Interface Theme">
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
          <p className="mt-2 text-xs text-[#71717A]">
            System (Dark) · Follows your device settings
          </p>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Save size={14} /> Save Changes
        </button>
      </div>
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
  const [gasFees, setGasFees] = useState("customer");
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
    <div className="flex flex-col gap-8 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-8">
      <section>
        <h3 className="text-sm font-semibold text-[#FAFAFA]">
          Settlement Configuration
        </h3>
        <p className="mb-4 text-xs text-[#71717A]">
          Define how you receive funds and how customer payments are processed.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label={
              <>
                Settlement Currency <HelpCircle size={11} className="text-[#52525B]" />
              </>
            }
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
          <Field
            label={
              <>
                Default Payout Method <HelpCircle size={11} className="text-[#52525B]" />
              </>
            }
          >
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

        <div className="mt-4">
          <Field
            label={
              <>
                Gas Fee Responsibility <HelpCircle size={11} className="text-[#52525B]" />
              </>
            }
          >
            <Select
              value={gasFees}
              onChange={setGasFees}
              options={[
                { label: "Customer Pays Fees", value: "customer" },
                { label: "Merchant Pays Fees", value: "merchant" },
              ]}
            />
          </Field>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-sm font-semibold text-[#FAFAFA]">
          Payment Logic
        </h3>

        <div className="flex flex-col gap-3">
          <Row
            icon={<FileSpreadsheet size={14} className="text-[#A1A1AA]" />}
            title="Instant Payouts"
            description="Automatically initiate payouts immediately after successful payments."
            control={
              <Toggle
                checked={instantPayouts}
                onChange={setInstantPayouts}
                size="sm"
              />
            }
          />
          <Row
            icon={<Info size={14} className="text-[#A1A1AA]" />}
            title="Enable Partial Payments"
            description="Allow customers to make multiple payments to complete a single session."
            control={
              <Toggle
                checked={partialPayments}
                onChange={setPartialPayments}
                size="sm"
              />
            }
          />
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">
                Underpayment Tolerance
              </p>
              <p className="text-xs text-[#71717A]">
                Auto-complete sessions if paid at least 100%
              </p>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={underpayment}
                onChange={(e) => setUnderpayment(e.target.value)}
                className="h-9 w-16 rounded-lg border border-[#1C1C1F] bg-[#0D0D0F] px-2 text-center text-sm text-[#FAFAFA] focus:border-[#2563EB] focus:outline-none"
              />
              <span className="text-sm text-[#71717A]">%</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#FAFAFA]">Accepted Assets</h3>
        <p className="mb-4 text-xs text-[#71717A]">
          Tap to toggle. When none are selected, all options are accepted.
        </p>

        <div className="mb-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
            Cryptocurrencies
          </p>
          <div className="flex flex-wrap gap-2">
            {CRYPTOS.map((c) => {
              const on = assets.includes(c.label);
              return (
                <Chip
                  key={c.label}
                  label={c.label}
                  color={c.color}
                  active={on}
                  onClick={() => toggle(assets, setAssets, c.label)}
                />
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
            Networks
          </p>
          <div className="flex flex-wrap gap-2">
            {NETWORKS.map((n) => {
              const on = networks.includes(n.label);
              return (
                <Chip
                  key={n.label}
                  label={n.label}
                  color={n.color}
                  active={on}
                  onClick={() => toggle(networks, setNetworks, n.label)}
                />
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
        >
          <Save size={14} /> Save Preferences
        </button>
      </div>
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────

function NotificationsTab() {
  const [accountEmails, setAccountEmails] = useState(true);
  const [telegramAlerts, setTelegramAlerts] = useState(false);
  const [telegramGroup, setTelegramGroup] = useState(false);
  const [balanceAlerts, setBalanceAlerts] = useState(false);
  const [customerReceipts, setCustomerReceipts] = useState(true);
  const [invoiceNotifs, setInvoiceNotifs] = useState(true);

  return (
    <div className="flex flex-col gap-8 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-8">
      <section>
        <h3 className="text-sm font-semibold text-[#FAFAFA]">Notifications</h3>
        <p className="mb-4 text-xs text-[#71717A]">
          Control what emails and messages you receive.
        </p>

        <p className="mb-3 text-xs font-semibold text-[#FAFAFA]">
          Merchant Alerts
        </p>
        <div className="flex flex-col gap-3">
          <Row
            icon={
              <AlertTriangle size={14} className="text-[#F59E0B]" />
            }
            iconBg="rgba(245,158,11,0.12)"
            title="Account Emails"
            description="Receive notifications via email"
            control={
              <Toggle
                checked={accountEmails}
                onChange={setAccountEmails}
                size="sm"
              />
            }
          />
          <Row
            icon={<Send size={14} className="text-[#2563EB]" />}
            iconBg="rgba(37,99,235,0.12)"
            title="Telegram Alerts"
            description="Receive notifications through Telegram"
            control={
              <Toggle
                checked={telegramAlerts}
                onChange={setTelegramAlerts}
                size="sm"
              />
            }
          />
          <Row
            icon={<Users size={14} className="text-[#A78BFA]" />}
            iconBg="rgba(167,139,250,0.12)"
            title="Telegram Group Alerts"
            description="Send notifications to your Telegram group"
            control={
              <Toggle
                checked={telegramGroup}
                onChange={setTelegramGroup}
                size="sm"
              />
            }
          />
          <Row
            icon={<Bell size={14} className="text-[#2563EB]" />}
            iconBg="rgba(37,99,235,0.12)"
            title="Balance Notifications"
            description="Email me when my balance drops below a certain threshold."
            control={
              <Toggle
                checked={balanceAlerts}
                onChange={setBalanceAlerts}
                size="sm"
              />
            }
          />
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold text-[#FAFAFA]">
          Telegram Group
        </p>
        <div className="rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-4 text-center text-xs text-[#71717A]">
          Add the bot to a group for team collaboration and group notifications.
          <br />
          <Send
            size={10}
            className="mx-1 inline -translate-y-px text-[#2563EB]"
          />
          Message the bot{" "}
          <code className="rounded bg-[#1C1C1F] px-1.5 py-0.5 font-mono text-[11px] text-[#FAFAFA]">
            /setup
          </code>{" "}
          to link a group to your account.
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold text-[#FAFAFA]">Customer</p>
        <div className="flex flex-col gap-3">
          <Row
            icon={<Receipt size={14} className="text-[#2563EB]" />}
            iconBg="rgba(37,99,235,0.12)"
            title="Customer Receipts"
            description="Send payment receipts to customers"
            control={
              <Toggle
                checked={customerReceipts}
                onChange={setCustomerReceipts}
                size="sm"
              />
            }
          />
          <Row
            icon={<FileText size={14} className="text-[#A1A1AA]" />}
            title="Invoice Notifications"
            description="Send invoice details and payment links to customers"
            control={
              <Toggle
                checked={invoiceNotifs}
                onChange={setInvoiceNotifs}
                size="sm"
              />
            }
          />
        </div>
      </section>
    </div>
  );
}

// ── Security ─────────────────────────────────────────────────────────────────

function SecurityTab() {
  return (
    <div className="flex flex-col gap-8 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-8">
      <h3 className="text-base font-semibold text-[#FAFAFA]">
        Security &amp; Integrations
      </h3>

      {/* Telegram */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send size={14} className="text-[#2563EB]" />
            <p className="text-sm font-semibold text-[#FAFAFA]">Telegram</p>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
          >
            <ExternalLink size={11} /> Open Bot
          </a>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#1C1C1F] bg-[#09090B] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/15 text-[#2563EB]">
              <Send size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#FAFAFA]">
                Not connected
              </p>
              <p className="text-xs text-[#71717A]">
                Link your account to receive notifications and use the bot.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors"
          >
            <Send size={13} /> Connect
          </button>
        </div>
      </section>

      <div className="border-t border-[#1C1C1F]" />

      {/* Password */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#2563EB]" />
          <p className="text-sm font-semibold text-[#FAFAFA]">Password</p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3.5 text-sm font-medium text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
        >
          <Key size={13} /> Change password
        </button>
      </section>

      {/* 2FA */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#2563EB]" />
            <p className="text-sm font-semibold text-[#FAFAFA]">
              Two-Factor Authentication
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3.5 text-sm font-medium text-[#FAFAFA] hover:bg-[#1C1C1F] transition-colors"
          >
            <Key size={13} /> Enable
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#1C1C1F] bg-[#09090B] px-4 py-3">
          <p className="text-xs text-[#71717A]">
            Use an Authenticator app instead of email OTP for login and
            withdrawals.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#71717A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#71717A]" />
            Inactive
          </span>
        </div>
      </section>
    </div>
  );
}

// ── Verification ─────────────────────────────────────────────────────────────

function VerificationTab() {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[#1C1C1F] bg-[#0D0D0F] p-8">
      <div>
        <h3 className="text-lg font-semibold text-[#2563EB]">
          Account Verification
        </h3>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Complete verification to unlock all features and start accepting
          payments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Identity */}
        <article className="rounded-xl border border-[#1C1C1F] bg-[#09090B] p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/15 text-[#2563EB]">
            <IdCard size={18} />
          </div>
          <h4 className="text-sm font-semibold text-[#FAFAFA]">
            Identity Verification
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-[#71717A]">
            Verify your personal identity with a government-issued ID. Required
            for all accounts.
          </p>
          <a
            href="#"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            Start Verification <ArrowRight size={13} />
          </a>
        </article>

        {/* Business */}
        <article className="relative rounded-xl border border-[#1C1C1F] bg-[#09090B] p-5">
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#1C1C1F] px-2 py-0.5 text-[10px] font-medium text-[#A1A1AA]">
            <Lock size={9} /> KYC required
          </span>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/15 text-[#2563EB]">
            <Building2 size={18} />
          </div>
          <h4 className="text-sm font-semibold text-[#FAFAFA]">
            Business Verification
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-[#71717A]">
            Verify your registered business to unlock higher transaction limits
            and business features.
          </p>
          <p className="mt-3 text-xs italic text-[#52525B]">
            Complete Identity Verification first to unlock this step.
          </p>
          <a
            href="#"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            Verify Business <ArrowRight size={13} />
          </a>
        </article>
      </div>
    </div>
  );
}

// ── Primitives ───────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 text-sm text-[#FAFAFA] placeholder:text-[#3F3F46] focus:border-[#2563EB] focus:outline-none transition-colors"
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
        className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#1C1C1F] bg-[#09090B] px-3 pr-9 text-sm text-[#FAFAFA] focus:border-[#2563EB] focus:outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A]"
      />
    </div>
  );
}

function Row({
  icon,
  iconBg,
  title,
  description,
  control,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#1C1C1F] bg-[#09090B] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: iconBg ?? "rgba(161,161,170,0.08)" }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#FAFAFA]">{title}</p>
          <p className="text-xs text-[#71717A]">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{control}</div>
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
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
        active
          ? "border-[#2563EB] bg-[#2563EB]/15 text-[#FAFAFA]"
          : "border-[#1C1C1F] bg-[#09090B] text-[#A1A1AA] hover:border-[#2563EB]/40"
      }`}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </button>
  );
}
