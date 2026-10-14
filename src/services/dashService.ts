import HttpRequest from "@/lib/httpRequest";

export type DashboardParams = { from: string; to: string; trendFrom?: string };
export const DashboardService = {
  get: (params: DashboardParams) => HttpRequest.get("/dashboard", { params }),
};
