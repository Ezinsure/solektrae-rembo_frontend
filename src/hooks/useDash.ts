"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashService";

// Always returns a complete object, whatever shape the API/axios gives back
const normalizeDashboard = (res: any) => {
  // Unwrap: axios response → { success, data } → dashboard
  const d = res?.data?.data ?? res?.data ?? res ?? {};

  return {
    from: d.from ?? null,
    to: d.to ?? null,
    total: Number(d.total ?? 0),
    previousTotal: Number(d.previousTotal ?? 0),
    statusCounts: { pending: 0, completed: 0, cancelled: 0, ...(d.statusCounts ?? {}) },
    services: Array.isArray(d.services) ? d.services : [],
    trend: Array.isArray(d.trend) ? d.trend : [],
    staff: Array.isArray(d.staff)
      ? d.staff.map((s: any) => ({
          ...s,
          name: s.name ?? "Unknown",
          total: Number(s.total ?? 0),
          counts: s.counts ?? {},
        }))
      : [],
  };
};

export const useDashboard = (params: { from: string; to: string }) =>
  useQuery({
    queryKey: ["customers", "dashboard", params],
    queryFn: () => DashboardService.get(params),
    select: normalizeDashboard,
    placeholderData: keepPreviousData,
  });