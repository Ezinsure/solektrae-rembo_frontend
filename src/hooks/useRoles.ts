"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RoleService } from "@/services/roleService";
import { handleApiError } from "@/lib/apiError"; 

export const ROLES_KEY = "roles";

export const useRoles = () =>
  useQuery({
    queryKey: [ROLES_KEY],
    queryFn: () => RoleService.getAll(),
    select: (res: any) => res?.data ?? [],
  });

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => RoleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
      toast.success("Role created");
    },
    onError: (err: any) => handleApiError(err),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: any) => RoleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
      toast.success("Role updated");
    },
    onError: (err: any) => handleApiError(err),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => RoleService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] });
      toast.success("Role deleted");
    },
    onError: (err: any) => handleApiError(err),
  });
};

// For the users page later: change a user's role
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: any) => RoleService.assignToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_KEY] }); // user counts change
      queryClient.invalidateQueries({ queryKey: ["users"] });   // your users query key
      toast.success("Role updated");
    },
    onError: (err: any) => handleApiError(err),
  });
};