"use client";

import { handleApiError } from "@/lib/apiError";
import { LogService } from "@/services/logs";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const LOGS_KEY = "activity-logs";

export const useGetAllLogs = (params: any ) =>
  useQuery({
    queryKey: [LOGS_KEY, params],
    queryFn: () => LogService.getAll(params),
    placeholderData: keepPreviousData,
  });

export const useExportLogs = () =>
  useMutation({
    mutationFn: (filters: any) => LogService.exportCsv(filters),
    onSuccess: (blob) => {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Africa/Kigali",
      });
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: `activity-logs-${today}.csv`,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export ready", {
        description: "The CSV file has been downloaded.",
      });
    },
    onError: (error) => handleApiError(error),
  });
