"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ServiceService } from "@/services/services";
import { handleApiError } from "@/lib/apiError";

export const SERVICES_KEY = "services";
export const SERVICE_FIELDS_KEY = "service-fields";

// List (settings page passes { includeInactive: true } to also see hidden ones)
export const useServices = (params?: any) =>
  useQuery({
    queryKey: [SERVICES_KEY, params],
    queryFn: () => ServiceService.getAll(params),
    select: (res: any) => res?.data ?? [],
  });

// Field catalog: groups + fields with labels (rarely changes)
export const useServiceFields = () =>
  useQuery({
    queryKey: [SERVICE_FIELDS_KEY],
    queryFn: () => ServiceService.getFields(),
    select: (res: any) => res?.data ?? { groups: [], fields: [] },
    staleTime: Infinity,
  });

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => ServiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success("Service created");
    },
    onError: (err: any) => handleApiError(err),
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: any) => ServiceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success("Service updated");
    },
    onError: (err: any) => handleApiError(err),
  });
};

// Show / hide on the customer form
export const useToggleService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: any) => ServiceService.update(id, { active }),
    onSuccess: (_res, { active }: any) => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success(active ? "Shown on the customer form" : "Hidden from the customer form");
    },
    onError: (err: any) => handleApiError(err),
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ServiceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success("Service deleted");
    },
    onError: (err: any) => handleApiError(err),
  });
};

export const useReorderServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => ServiceService.reorder(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success("Order saved");
    },
    onError: (err: any) => handleApiError(err),
  });
};