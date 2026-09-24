"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { CustomerService } from "@/services/customers";

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

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => CustomerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CUSTOMERS_KEY],
      });
      toast.success("Customer created successfully.", {
        description: "The customer has been added to the system.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      CustomerService.update(id, data),
    onSuccess: (_data, variables) => {
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
