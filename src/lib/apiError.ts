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

export const formatDateTime = (date?: string | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-RW", {
    timeZone: "Africa/Kigali",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
