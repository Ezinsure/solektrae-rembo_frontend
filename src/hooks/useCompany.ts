import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setAccessToken } from "@/lib/httpRequest";
import { handleApiError } from "@/lib/apiError";
import { CompanyService } from "@/services/companyService";

export const COMPANY_KEY = "company";
export const MY_COMPANIES_KEY = "my-companies";


export const useCurrentCompany = () =>
  useQuery({
    queryKey: [COMPANY_KEY],
    queryFn: () => CompanyService.getCurrent(),
    select: (res: any) => res?.data,
    staleTime: 5 * 60 * 1000, 
  });

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => CompanyService.updateCurrent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_COMPANIES_KEY] }); 
      toast.success("Company profile saved");
    },
    onError: (error) => handleApiError(error),
  });
};


export const useMyCompanies = () =>
  useQuery({
    queryKey: [MY_COMPANIES_KEY],
    queryFn: () => CompanyService.getMine(),
    select: (res: any) => res?.data ?? [],
  });

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => CompanyService.create(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: [MY_COMPANIES_KEY] });
      toast.success("Company created", {
        description: `You're the admin of ${res?.data?.name}. Switch to it to set it up.`,
      });
    },
    onError: (error) => handleApiError(error),
  });
};

export const useSwitchCompany = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (companyId: string) => CompanyService.switchTo(companyId),
    onSuccess: (res: any) => {
      // New token = new company; every request from now on uses it
      setAccessToken(res?.data?.accessToken);

      // Drop all cached data from the previous company
      queryClient.clear();

      toast.success(`Switched to ${res?.data?.company?.name}`);
      router.replace("/admin/dashboard");
      router.refresh();
    },
    onError: (error) => handleApiError(error),
  });
};

export const useUploadCompanyLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => CompanyService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_COMPANIES_KEY] }); 
      toast.success("Logo updated");
    },
    onError: (err: any) => handleApiError(err),
  });
};

export const useRemoveCompanyLogo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => CompanyService.removeLogo(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_COMPANIES_KEY] });
      toast.success("Logo removed");
    },
    onError: (err: any) => handleApiError(err),
  });
};