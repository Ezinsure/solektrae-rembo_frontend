"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/lib/apiError";
import { toast } from "sonner";
import { UserService } from "@/services/users";

export const USER_KEY = "users";

export const useGetAllUsers = (
  filters?: Record<string, string | number | boolean>,
) => {
  return useQuery({
    queryKey: [USER_KEY, filters],
    queryFn: () => UserService.getAll(filters),
  });
};

export const useGetUser = (id: string) => {
  return useQuery({
    queryKey: [USER_KEY, id],
    queryFn: () => UserService.getOne(id),
    enabled: !!id,
  });
};

export const useCreateUser= () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => UserService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_KEY],
      });
      toast.success("User created successfully.", {
        description: "The User has been added to the system.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      UserService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [USER_KEY] });
      toast.success("User updated successfully.", {
        description: "The user information has been updated.",
      });
    },
    onError: handleApiError,
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UserService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_KEY],
      });

      toast.success("User deleted successfully.", {
        description: "The user has been removed from the system.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => UserService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [USER_KEY],
      });
      toast.success("User restored successfully.", {
        description: "The User is active again.",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};
