import { get, post } from "@/lib/api-client";
import { publicGet, publicPost } from "@/lib/api-public";
import type {
  Invoice,
  CreateInvoiceDto,
  InvoicePaymentDto,
  InvoiceFilters,
} from "@/lib/types/invoices";

export const invoicesApi = {
  // ── Dashboard (authenticated) ─────────────────────────────────────────────

  // GET /invoices
  list: (filters: InvoiceFilters = {}) =>
    get<Invoice[]>("/invoices", {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.customer_id ? { customer_id: filters.customer_id } : {}),
      page: filters.page ?? 1,
      limit: filters.limit ?? 100,
    }),

  // POST /invoices
  create: (dto: CreateInvoiceDto) => post<Invoice>("/invoices", dto),

  // GET /invoices/:invoice_id
  getById: (invoiceId: string) => get<Invoice>(`/invoices/${invoiceId}`),

  // POST /invoices/:invoice_id/mark-paid
  markPaid: (invoiceId: string) =>
    post<Invoice>(`/invoices/${invoiceId}/mark-paid`),

  // POST /invoices/:invoice_id/cancel
  cancel: (invoiceId: string) =>
    post<Invoice>(`/invoices/${invoiceId}/cancel`),

  // POST /invoices/:invoice_id/void
  void: (invoiceId: string) => post<Invoice>(`/invoices/${invoiceId}/void`),

  // ── Public (no auth) ──────────────────────────────────────────────────────

  // GET /invoices/pay/:invoice_number
  getByNumber: (invoiceNumber: string) =>
    publicGet<Invoice>(`/invoices/pay/${invoiceNumber}`),

  // POST /invoices/pay/:invoice_number/session
  createPaymentSession: (invoiceNumber: string, dto: InvoicePaymentDto) =>
    publicPost<any>(`/invoices/pay/${invoiceNumber}/session`, dto),
};
