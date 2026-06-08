import { get, post, del } from "@/lib/api-client";
import type {
  // Bank,
  SavedBank,
  BankVerification,
  CryptoAsset,
  CryptoPrice,
  RateCalculation,
  ConversionResult,
  AddBankDto,
  VerifyBankAccountDto,
  GetRateQueryDto,
  RateCalculatorDto,
  ConvertUsdToFiatDto,
  ConvertFiatToUsdDto,
} from "@/lib/types/misc";

export const miscApi = {
  // ── Banks ────────────────────────────────────────────────────────────────

  // GET /misc/banks — list of Nigerian banks (cached 24h)
  getBanks: () => get<any>("/misc/banks"),

  // POST /misc/banks — save a bank account
  saveBank: (payload: AddBankDto) => post<SavedBank>("/misc/banks", payload),

  // GET /misc/banks/saved — saved bank accounts
  getSavedBanks: () => get<SavedBank[]>("/misc/banks/saved"),

  // GET /misc/banks/saved/{accountNumber}
  getSavedBankByAccount: (accountNumber: string) =>
    get<SavedBank>(`/misc/banks/saved/${accountNumber}`),

  // GET /misc/banks/breet — banks from Breet API
  getBreetBanks: () => get<any[]>("/misc/banks/breet"),

  // GET /misc/banks/{bankId}
  getBankById: (bankId: string) => get<any>(`/misc/banks/${bankId}`),

  // DELETE /misc/banks/{bankId}
  deleteBank: (bankId: string) =>
    del<{ message: string }>(`/misc/banks/${bankId}`),

  // POST /misc/banks/verify
  verifyBank: (payload: VerifyBankAccountDto) =>
    post<BankVerification>("/misc/banks/verify", payload),

  // ── Assets ───────────────────────────────────────────────────────────────

  // GET /misc/deposit-assets
  getDepositAssets: () => get<CryptoAsset[]>("/misc/deposit-assets"),

  // GET /misc/withdrawal-assets
  getWithdrawalAssets: () => get<CryptoAsset[]>("/misc/withdrawal-assets"),

  // ── Pricing ──────────────────────────────────────────────────────────────

  // POST /misc/crypto-prices
  getCryptoPrice: (payload: GetRateQueryDto) =>
    post<CryptoPrice>("/misc/crypto-prices", payload),

  // POST /misc/rate-calculator
  calculateRate: (payload: RateCalculatorDto) =>
    post<RateCalculation>("/misc/rate-calculator", payload),

  // ── Conversion ───────────────────────────────────────────────────────────

  // POST /misc/convert/usd-to-fiat
  convertUsdToFiat: (payload: ConvertUsdToFiatDto) =>
    post<ConversionResult>("/misc/convert/usd-to-fiat", payload),

  // POST /misc/convert/fiat-to-usd
  convertFiatToUsd: (payload: ConvertFiatToUsdDto) =>
    post<ConversionResult>("/misc/convert/fiat-to-usd", payload),
};
