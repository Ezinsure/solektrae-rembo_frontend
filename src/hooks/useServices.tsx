"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { ServiceService } from "@/services/services";

export const SERVICES_KEY = "services";

export const useGetServices = (
  filters?: Record<string, string | number | boolean>,
) => {
  return useQuery({
    queryKey: [SERVICES_KEY, filters],
    queryFn: () => ServiceService.getAll(filters),
  });
};

export const useGetService = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, id],
    queryFn: () => ServiceService.getOne(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => ServiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SERVICES_KEY],
      });
      toast.success("Service created successfully.", {
        description: "The Service has been added to the system.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      ServiceService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success("Service updated successfully.", {
        description: "The Service information has been updated.",
      });
    },
    onError: handleApiError,
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ServiceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SERVICES_KEY],
      });

      toast.success("Service deleted successfully.", {
        description: "The Service has been removed from the system.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};

export const useRestoreService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ServiceService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SERVICES_KEY],
      });
      toast.success("Service restored successfully.", {
        description: "The Service is active again.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};
