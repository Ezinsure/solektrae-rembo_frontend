import HttpRequest from "@/lib/httpRequest";

const BASE = "/users";

export const UserService = {
  getAll: (params?: Record<string, string | number | boolean>) =>
    HttpRequest.get(BASE, {
      params,
    }),

  getOne: (id: string) => HttpRequest.get(`${BASE}/${id}`),

  create: (data: Record<string, unknown>) => HttpRequest.post(BASE, data),

  update: (id: string, data: Record<string, unknown>) =>
    HttpRequest.patch(`${BASE}/${id}`, data),

  remove: (id: string) => HttpRequest.delete(`${BASE}/${id}`),

  restore: (id: string) => HttpRequest.patch(`${BASE}/${id}/restore`),
};
