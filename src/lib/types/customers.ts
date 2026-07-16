export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  developer_id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  status: CustomerStatus;
  cc_customer_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  /** Populated by findAll via a correlated subquery — true if customer has ≥1 completed payment */
  has_paid?: boolean;
}

export interface CreateCustomerDto {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCustomerDto {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  status?: CustomerStatus;
  metadata?: Record<string, any>;
}
