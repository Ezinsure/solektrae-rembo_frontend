import HttpRequest from "@/lib/httpRequest";

const BASE = "/companies";

export const CompanyService = {
  getCurrent: () => HttpRequest.get(`${BASE}/current`),

  updateCurrent: (data: any) => HttpRequest.patch(`${BASE}/current`, data),

  getMine: () => HttpRequest.get(`${BASE}/mine`),

  create: (data: any) => HttpRequest.post(BASE, data),

  switchTo: (companyId: string) =>
    HttpRequest.post("/auth/switch-company", { companyId }),

  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return HttpRequest.post(`${BASE}/current/logo`, fd, { timeout: 60000 });
  },
  removeLogo: () => HttpRequest.delete(`${BASE}/current/logo`),
};
