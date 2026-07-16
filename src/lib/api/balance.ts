import { get, post, ApiError } from "@/lib/api-client";
import type {
  AccountBalance,
  BalanceOverview,
  BalanceHistoryResponse,
  BalanceHistoryItem,
  BalanceTxType,
  SwapItem,
  PayoutItem,
  BalanceHistoryFilters,
} from "@/lib/types/balance";
import type {
  CryptoCurrency,
  PaginatedResponse,
  TxStatus,
} from "@/lib/types/common";
import type { LedgerTransaction } from "@/lib/types/ledger";

/**
 * The backend does not expose dedicated /balance/* endpoints. This file is an
 * adapter layer that powers the existing Balance page by mapping the UI's
 * expected shapes (BalanceOverview / BalanceHistory / Swaps / Payouts) onto
 * the real backend endpoints under /wallets, /transactions and /payouts.
 *
 * UI hook names and types are preserved deliberately — no UI change is needed.
 *
 * When the backend ships a real wallet/balance summary endpoint with the
 * expected shape, swap the implementation here and leave hooks/UI untouched.
 */

// ── Safe wrappers ──────────────────────────────────────────────────────────

async function safeGet<T>(
  url: string,
  params?: Record<string, unknown>,
): Promise<T | null> {
  try {
    return await get<T>(url, params);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

async function safePost<T>(url: string, body?: unknown): Promise<T | null> {
  try {
    return await post<T>(url, body);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ── Ledger → UI mappers ────────────────────────────────────────────────────

const STATUS_FALLBACK: TxStatus = "pending";

function mapLedgerToHistory(tx: LedgerTransaction): BalanceHistoryItem {
  const isCredit = ["deposit", "credit", "onramp"].includes(tx.tx_type);
  const isDebit = ["withdrawal", "debit", "offramp"].includes(tx.tx_type);
  const uiType: BalanceTxType = isCredit
    ? "credit"
    : isDebit
      ? "debit"
      : (tx.tx_type as BalanceTxType);

  const amount = Number(tx.amount_usd ?? tx.credit_usd ?? tx.debit_usd ?? tx.credit_ngn ?? tx.debit_ngn) || 0;
  return {
    id: tx.id,
    reference: tx.reference_id,
    type: uiType,
    amount,
    currency: (tx.asset ?? "USD") as CryptoCurrency,
    status: "pending" as TxStatus,
    description: tx.description ?? "",
    created_at: tx.created_at,
  };
}

function mapLedgerToSwap(tx: LedgerTransaction): SwapItem {
  const meta = (tx.metadata ?? {}) as Record<string, unknown>;
  const asset = tx.asset ?? "USDT";
  const amount = Number(tx.amount_usd ?? tx.amount_crypto ?? tx.debit_usd ?? tx.credit_usd) || 0;
  return {
    id: tx.id,
    from_currency: (meta.from_currency ?? asset) as CryptoCurrency,
    to_currency: (meta.to_currency ?? asset) as CryptoCurrency,
    from_amount: Number(meta.from_amount ?? amount) || 0,
    to_amount: Number(meta.to_amount ?? amount) || 0,
    rate: Number(meta.rate ?? 1) || 1,
    status: tx.status as unknown as TxStatus,
    created_at: tx.created_at,
  };
}

function mapLedgerToPayout(tx: LedgerTransaction): PayoutItem {
  const meta = (tx.metadata ?? {}) as Record<string, unknown>;
  const amount = Number(tx.amount_usd ?? tx.debit_usd ?? tx.debit_ngn ?? 0);
  return {
    id: tx.id,
    reference: tx.reference_id,
    amount,
    currency: (tx.asset ?? "USDT") as CryptoCurrency,
    destination: String(
      meta.destination ?? meta.account_number ?? tx.description ?? "—",
    ),
    status: tx.status as unknown as TxStatus,
    created_at: tx.created_at,
  };
}

function emptyPage<T>(): PaginatedResponse<T> {
  return {
    data: [],
    meta: { total: 0, page: 1, limit: 20, total_pages: 0, has_next: false, has_prev: false },
  };
}

// ── Public API ─────────────────────────────────────────────────────────────

export const balanceApi = {
  /**
   * GET /balance — raw account-level balance (api-key realm). Returned as-is
   * (permissive shape); use getOverview() for the UI-shaped BalanceOverview.
   */
  getAccountBalance: () => get<AccountBalance>("/balance"),

  /**
   * Maps to POST /wallets/balance. Backend response shape is unknown — we
   * coerce whatever comes back into the UI's BalanceOverview shape. Adjust
   * field reads here once the real shape is verified.
   */
  getOverview: async (
    currency: CryptoCurrency = "USDT",
  ): Promise<BalanceOverview> => {
    const raw = await safePost<Record<string, unknown>>("/wallets/balance");
    if (!raw) {
      return { total_paid_out: 0, processing: 0, available: 0, currency };
    }
    const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);
    return {
      total_paid_out: num(
        (raw as { total_paid_out?: unknown }).total_paid_out ??
          (raw as { totalPaidOut?: unknown }).totalPaidOut ??
          (raw as { paid_out?: unknown }).paid_out,
      ),
      processing: num(
        (raw as { processing?: unknown }).processing ??
          (raw as { pending?: unknown }).pending,
      ),
      available: num(
        (raw as { available?: unknown }).available ??
          (raw as { available_balance?: unknown }).available_balance ??
          (raw as { balance?: unknown }).balance,
      ),
      currency,
    };
  },

  /**
   * Maps to GET /transactions (Ledger) with optional filters. Currency / type /
   * status filters from the UI are forwarded; "all" sentinels are dropped.
   */
  getHistory: async (
    filters: BalanceHistoryFilters = {},
  ): Promise<BalanceHistoryResponse> => {
    const params: Record<string, unknown> = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    };
    if (filters.type && filters.type !== "all") params.tx_type = filters.type;
    if (filters.currency && filters.currency !== "all")
      params.currency = filters.currency;
    // status + search aren't supported by /transactions yet — kept client-side
    // until backend exposes them.

    const res = await safeGet<PaginatedResponse<LedgerTransaction>>(
      "/transactions",
      params,
    );
    if (!res) return emptyPage<BalanceHistoryItem>();
    let items = res.data.map(mapLedgerToHistory);

    if (filters.status && filters.status !== "all") {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.reference.toLowerCase().includes(q) ||
          (i.tx_hash ?? "").toLowerCase().includes(q),
      );
    }

    return { ...res, data: items };
  },

  /**
   * No dedicated swaps endpoint — derived from /transactions?tx_type=swap.
   */
  getSwaps: async (
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<SwapItem>> => {
    const res = await safeGet<PaginatedResponse<LedgerTransaction>>(
      "/transactions",
      { tx_type: "swap", page, limit },
    );
    if (!res) return emptyPage<SwapItem>();
    return { ...res, data: res.data.map(mapLedgerToSwap) };
  },

  /**
   * No dedicated payout LIST endpoint — derived from /transactions?tx_type=payout.
   */
  getPayouts: async (
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<PayoutItem>> => {
    const res = await safeGet<PaginatedResponse<LedgerTransaction>>(
      "/transactions",
      { tx_type: "payout", page, limit },
    );
    if (!res) return emptyPage<PayoutItem>();
    return { ...res, data: res.data.map(mapLedgerToPayout) };
  },
};
