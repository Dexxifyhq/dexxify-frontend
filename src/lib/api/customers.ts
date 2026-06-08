import { get, post, put, del } from "@/lib/api-client";

export const customersApi = {
  // GET /customers
  list: () => get<any>("/customers"),

  // POST /customers
  create: (payload: any) => post<any>("/customers", payload),

  // GET /customers/{customer_id}
  getById: (customerId: string) => get<any>(`/customers/${customerId}`),

  // PUT /customers/{customer_id}
  update: (customerId: string, payload: any) =>
    put<any>(`/customers/${customerId}`, payload),

  // DELETE /customers/{customer_id}
  delete: (customerId: string) => del<any>(`/customers/${customerId}`),
};
