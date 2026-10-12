import HttpRequest from "@/lib/httpRequest";

const BASE = "/services";

export const ServiceService = {
  getAll: (params?: any) => HttpRequest.get(BASE, { params }),
  getOne: (id: string) => HttpRequest.get(`${BASE}/${id}`),
  getFields: () => HttpRequest.get(`${BASE}/fields`),
  create: (data: any) => HttpRequest.post(BASE, data),
  update: (id: string, data: any) => HttpRequest.patch(`${BASE}/${id}`, data),
  reorder: (ids: string[]) => HttpRequest.patch(`${BASE}/reorder`, { ids }),
  remove: (id: string) => HttpRequest.delete(`${BASE}/${id}`),
};
