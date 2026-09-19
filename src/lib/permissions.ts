import type { BusinessRole } from "@/lib/auth-api";

export interface PermissionDef {
  key: string;
  title: string;
  description: string;
}

export const PERMISSIONS = {
  MANAGE_BALANCE: "manage_balance",
  MANAGE_BANK_ACCOUNTS: "manage_bank_accounts",
  MANAGE_CRYPTO_ADDRESSES: "manage_crypto_addresses",
  MANAGE_PAYMENT_PAGES: "manage_payment_pages",
  WITHDRAW_BANK: "withdraw_bank",
  WITHDRAW_CRYPTO: "withdraw_crypto",
  SWAP_BALANCE: "swap_balance",
  INITIATE_REFUNDS: "initiate_refunds",
  MANAGE_INVOICES: "manage_invoices",
  MANAGE_CHECKOUTS: "manage_checkouts",
  MANAGE_CUSTOMERS: "manage_customers",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const OWNER_PERMISSIONS: PermissionDef[] = [
  {
    key: PERMISSIONS.MANAGE_BALANCE,
    title: "Manage Balance",
    description: "View the entire balance",
  },
  {
    key: PERMISSIONS.MANAGE_BANK_ACCOUNTS,
    title: "Manage Bank Accounts",
    description: "Create, update, and delete bank accounts",
  },
  {
    key: PERMISSIONS.MANAGE_CRYPTO_ADDRESSES,
    title: "Manage Crypto Addresses",
    description: "Create, update, and delete crypto addresses",
  },
  {
    key: PERMISSIONS.MANAGE_PAYMENT_PAGES,
    title: "Manage Payment Pages",
    description: "Create and manage payment pages",
  },
  {
    key: PERMISSIONS.WITHDRAW_BANK,
    title: "Withdraw to Bank",
    description: "Initiate fiat withdrawals to bank accounts",
  },
  {
    key: PERMISSIONS.WITHDRAW_CRYPTO,
    title: "Withdraw Crypto",
    description: "Initiate crypto withdrawals",
  },
  {
    key: PERMISSIONS.SWAP_BALANCE,
    title: "Swap Balance",
    description: "Swap between currencies",
  },
  {
    key: PERMISSIONS.INITIATE_REFUNDS,
    title: "Initiate Refunds",
    description: "Process refunds payments",
  },
  {
    key: PERMISSIONS.MANAGE_INVOICES,
    title: "Manage Invoices",
    description: "Create and manage invoices",
  },
  {
    key: PERMISSIONS.MANAGE_CHECKOUTS,
    title: "Manage Checkouts",
    description: "Create and manage checkouts",
  },
  {
    key: PERMISSIONS.MANAGE_CUSTOMERS,
    title: "Manage Customers",
    description: "Create and manage customers",
  },
];

export const ADMIN_PERMISSIONS: PermissionDef[] = [...OWNER_PERMISSIONS];

export const STAFF_PERMISSIONS: PermissionDef[] = [
  {
    key: PERMISSIONS.MANAGE_PAYMENT_PAGES,
    title: "Manage Payment Pages",
    description: "Create and manage payment pages",
  },
  {
    key: PERMISSIONS.MANAGE_INVOICES,
    title: "Manage Invoices",
    description: "Create and manage invoices",
  },
  {
    key: PERMISSIONS.MANAGE_CHECKOUTS,
    title: "Manage Checkouts",
    description: "Create and manage checkouts",
  },
  {
    key: PERMISSIONS.MANAGE_CUSTOMERS,
    title: "Manage Customers",
    description: "Create and manage customers",
  },
  {
    key: PERMISSIONS.INITIATE_REFUNDS,
    title: "Initiate Refunds",
    description: "Process refunds payments",
  },
];

export const ROLE_PERMISSIONS: Record<BusinessRole, PermissionDef[]> = {
  owner: OWNER_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  staff: STAFF_PERMISSIONS,
};

const ROLE_PERMISSION_KEYS: Record<BusinessRole, Set<string>> = {
  owner: new Set(OWNER_PERMISSIONS.map((p) => p.key)),
  admin: new Set(ADMIN_PERMISSIONS.map((p) => p.key)),
  staff: new Set(STAFF_PERMISSIONS.map((p) => p.key)),
};

export function hasPermission(
  role: BusinessRole | null | undefined,
  key: PermissionKey,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSION_KEYS[role]?.has(key) ?? false;
}
