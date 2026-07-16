import { get, post, del } from "@/lib/api-client";
import type {
  Bank,
  SavedBank,
  BankVerification,
  CryptoPrice,
  RateCalculation,
  AddBankDto,
  VerifyBankAccountDto,
  GetRateQueryDto,
  RateCalculatorDto,
} from "@/lib/types/misc";

export const miscApi = {
  // ── Banks ────────────────────────────────────────────────────────────────

  // GET /misc/banks — list of Nigerian banks (server-cached 24h)
  getBanks: () =>
    get<{ banks: { data: Bank[] }; cached: boolean }>("/misc/banks"),

  // POST /misc/banks/verify — resolve account name before saving
  verifyBank: (payload: VerifyBankAccountDto) =>
    post<BankVerification>("/misc/banks/verify", payload),

  // POST /misc/banks — save a verified bank account
  saveBank: (payload: AddBankDto) => post<SavedBank>("/misc/banks", payload),

  // GET /misc/banks/saved — saved bank accounts
  getSavedBanks: () => get<SavedBank[]>("/misc/banks/saved"),

  // GET /misc/banks/saved/{accountNumber}
  getSavedBankByAccount: (accountNumber: string) =>
    get<SavedBank>(`/misc/banks/saved/${accountNumber}`),

  // DELETE /misc/banks/{bankId}
  deleteBank: (bankId: string) =>
    del<{ message: string }>(`/misc/banks/${bankId}`),

  // ── Pricing ──────────────────────────────────────────────────────────────

  // POST /misc/crypto-prices
  getCryptoPrice: (payload: GetRateQueryDto) =>
    post<CryptoPrice>("/misc/crypto-prices", payload),

  // POST /misc/rate-calculator
  calculateRate: (payload: RateCalculatorDto) =>
    post<RateCalculation>("/misc/rate-calculator", payload),
};
