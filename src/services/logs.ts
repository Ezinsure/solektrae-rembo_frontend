import HttpRequest from "@/lib/httpRequest";

const clean = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );

const BASE = "/logs";

export const LogService = {
  getAll: (params?: any) => HttpRequest.get(BASE, { params }),

  exportCsv: (filters: any) =>
    HttpRequest.get(`${BASE}/export`, {
      params: clean(filters),
      responseType: "blob",
    }),
};
