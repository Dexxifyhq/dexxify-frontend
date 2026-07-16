import { get, getPaginated } from "@/lib/api-client";
import type {
  LedgerTransaction,
  LedgerBalance,
  SettlementReport,
  LedgerFilters,
  SettlementReportFilters,
} from "@/lib/types/ledger";

export const ledgerApi = {
  // GET /transactions
  getTransactions: (filters: LedgerFilters = {}) =>
    getPaginated<LedgerTransaction>("/transactions", {
      ...(filters.tx_type ? { tx_type: filters.tx_type } : {}),
      ...(filters.reference_type ? { reference_type: filters.reference_type } : {}),
      ...(filters.from_date ? { from_date: filters.from_date } : {}),
      ...(filters.to_date ? { to_date: filters.to_date } : {}),
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    }),

  // GET /transactions/:tx_id
  getTransaction: (txId: string) =>
    get<LedgerTransaction>(`/transactions/${txId}`),

  // GET /balance
  getBalance: () => get<LedgerBalance>("/balance"),

  // GET /reports/settlement
  getSettlementReport: (filters: SettlementReportFilters = {}) =>
    get<SettlementReport>("/reports/settlement", {
      ...(filters.date ? { date: filters.date } : {}),
    }),
};
