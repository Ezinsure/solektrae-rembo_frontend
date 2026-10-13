"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { CustomerService } from "@/services/customers";
import { keepPreviousData } from "@tanstack/react-query";

export const CUSTOMERS_KEY = "customers";

export const useGetAllCustomers = (
  filters?: Record<string, string | number | boolean>,
) => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, filters],
    queryFn: () => CustomerService.getAll(filters),
  });
};

export const useGetCustomer = (id: string) => {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, id],
    queryFn: () => CustomerService.getOne(id),
    enabled: !!id,
  });
};

export const useCustomerStats = (params?: any) =>
  useQuery({
    queryKey: [CUSTOMERS_KEY, "stats", params],
    queryFn: () => CustomerService.getStats(params),
    select: (res: any) => res?.data ?? { total: 0, byStatus: {} },
    placeholderData: keepPreviousData,
  });

export const usePublicServices = (slug?: string) =>
  useQuery({
    queryKey: ["public-services", slug],
    queryFn: () => CustomerService.publicServices(slug!),
    select: (res: any) => res?.data ?? { company: null, services: [] },
    enabled: !!slug,
  });

// Create = apply through the public endpoint (also used inside the admin)
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }: any) => CustomerService.submit(slug, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });
};
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: any) => CustomerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      toast.success("Customer updated successfully.", {
        description: "The customer information has been updated.",
      });
    },
    onError: handleApiError,
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CustomerService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_KEY],
      });

      toast.success("Customer deleted successfully.", {
        description: "The customer has been removed from the system.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: any) =>
      CustomerService.updateStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      toast.success("Status updated");
    },
    onError: (err: any) => handleApiError(err),
  });
};

export const useExportCustomers = () =>
  useMutation({
    mutationFn: async (params?: any) => {
      const res: any = await CustomerService.export(params);
      const blob = res instanceof Blob ? res : res?.data;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => toast.success("Download started"),
    onError: (err: any) => handleApiError(err),
  });

export const useRestoreCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => CustomerService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_KEY],
      });
      toast.success("Customer restored successfully.", {
        description: "The customer is active again.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};
