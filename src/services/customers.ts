import HttpRequest from "@/lib/httpRequest";

const BASE = "/customers";

export const CustomerService = {
  getAll: (params?: any) =>
    HttpRequest.get(`${BASE}/all`, {
      params,
    }),

  getStats: (params?: any) => HttpRequest.get("/customers/stats", { params }),

  getOne: (id: string) => HttpRequest.get(`${BASE}/${id}`),

  update: (id: string, data: any) => HttpRequest.patch(`${BASE}/${id}`, data),

  updateStatus: (id: string, status: string) =>
    HttpRequest.patch(`${BASE}/${id}/status`, {
      status,
    }),

  remove: (id: string) => HttpRequest.delete(`${BASE}/${id}`),

  restore: (id: string) => HttpRequest.patch(`${BASE}/${id}/restore`),

  export: (params?: any) =>
    HttpRequest.get(`${BASE}/export`, { params, responseType: "blob" }),

  publicServices: (slug: string) => HttpRequest.get(`/public/${slug}/services`),
  submit: (slug: string, data: any) =>
    HttpRequest.post(`/public/${slug}/customers`, data),
};
