import { get, post, put, del } from "@/lib/api-client";

export const paymentPagesApi = {
  // GET /payment-pages
  list: () => get<any>("/payment-pages"),

  // POST /payment-pages
  create: (payload: any) => post<any>("/payment-pages", payload),

  // GET /payment-pages/:id
  getById: (id: string) => get<any>(`/payment-pages/${id}`),

  // PUT /payment-pages/:id
  update: (id: string, payload: any) => put<any>(`/payment-pages/${id}`, payload),

  // DELETE /payment-pages/:id
  delete: (id: string) => del<any>(`/payment-pages/${id}`),

  // GET /payment-pages/:id/sessions
  getSessions: (id: string) => get<any>(`/payment-pages/${id}/sessions`),
};
