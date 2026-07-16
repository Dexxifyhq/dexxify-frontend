export type InvoiceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "paid"
  | "overdue"
  | "cancelled"
  | "void";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  developer_id: string;
  customer_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  currency: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  provider_invoice_reference: string | null;
  cc_invoice_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  } | null;
}

export interface InvoiceLineItemDto {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface CreateInvoiceDto {
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  currency?: string;
  line_items: InvoiceLineItemDto[];
  tax_rate?: number;
  discount_amount?: number;
  due_date?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface InvoicePaymentDto {
  crypto_asset: string;
  network: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  customer_id?: string;
  page?: number;
  limit?: number;
}
