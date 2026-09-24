import { toast } from "sonner";
import axios from "axios";

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong";

    toast.error("Failed", {
      description: message,
    });
    return;
  }
  toast.error("Failed", {
    description: "An unexpected error occurred.",
  });
};
