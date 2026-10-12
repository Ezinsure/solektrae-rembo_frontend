// services/dashboardService.ts
import HttpRequest from "@/lib/httpRequest"; // your path

export const DashboardService = {
  get: (params: { from: string; to: string }) =>
    HttpRequest.get("/dashboard", { params }),
};
