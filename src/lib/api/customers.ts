import { get, post, put, del } from "@/lib/api-client";
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from "@/lib/types/customers";

export const customersApi = {
  // GET /customers
  list: () => get<Customer[]>("/customers"),

  // POST /customers
  create: (payload: CreateCustomerDto) => post<Customer>("/customers", payload),

  // GET /customers/{customer_id}
  getById: (customerId: string) => get<Customer>(`/customers/${customerId}`),

  // PUT /customers/{customer_id}
  update: (customerId: string, payload: UpdateCustomerDto) =>
    put<Customer>(`/customers/${customerId}`, payload),

  // DELETE /customers/{customer_id}
  delete: (customerId: string) =>
    del<{ message: string }>(`/customers/${customerId}`),
};
