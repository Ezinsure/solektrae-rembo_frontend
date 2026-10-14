"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DashboardService, DashboardParams } from "@/services/dashService";

const ZERO_COUNTS = { pending: 0, completed: 0, cancelled: 0 };

const normalizeDashboard = (res: any) => {
  const d = res?.data?.data ?? res?.data ?? res ?? {};

  return {
    previousFrom: d.previousFrom ?? null,
    previousTo: d.previousTo ?? null,
    from: d.from ?? null,
    to: d.to ?? null,
    trendFrom: d.trendFrom ?? d.from ?? null,
    total: Number(d.total ?? 0),
    previousTotal: Number(d.previousTotal ?? 0),
    statusCounts: { ...ZERO_COUNTS, ...(d.statusCounts ?? {}) },
    previousStatusCounts: { ...ZERO_COUNTS, ...(d.previousStatusCounts ?? {}) },
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

export const useDashboard = (params: DashboardParams) =>
  useQuery({
    queryKey: ["customers", "dashboard", params],
    queryFn: () => DashboardService.get(params),
    select: normalizeDashboard,
    placeholderData: keepPreviousData,
  });
