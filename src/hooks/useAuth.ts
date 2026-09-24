"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apiError";
import { clearAccessToken, setAccessToken } from "@/lib/httpRequest";
import { AuthService } from "@/services/authService";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => AuthService.login(data),
    onSuccess: (response) => {
      const { accessToken, user } = response.data;
      setAccessToken(accessToken);
      queryClient.setQueryData(["me"], user);
      toast.success("Welcome back!", {
        description: "You're all set. Have a great day!",
      });
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => {
      return AuthService.getMe();
    },
    retry: false,
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      clearAccessToken();
      queryClient.removeQueries({
        queryKey: ["me"],
      });
      router.replace("/login");
      toast.success("Logged out successfully");
    },
    onError: (error) => {
      clearAccessToken();
      queryClient.removeQueries({
        queryKey: ["me"],
      });
      router.replace("/login");
      handleApiError(error);
    },
  });
};
