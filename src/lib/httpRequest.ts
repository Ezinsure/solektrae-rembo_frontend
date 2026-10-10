import axios, { AxiosError, AxiosRequestConfig } from "axios";

let accessToken: string | null = null;

const SESSION_FLAG = "logged_in";

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof document !== "undefined" && token) {
    document.cookie = `${SESSION_FLAG}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
};

export const getAccessToken = () => {
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
  if (typeof document !== "undefined") {
    document.cookie = `${SESSION_FLAG}=; path=/; max-age=0; SameSite=Lax`;
  }
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_SERVER_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Attach access token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        const newToken = res.data?.data?.accessToken;
        if (!newToken) throw new Error("Refresh response missing accessToken");
        setAccessToken(newToken);
        return newToken;
      })
      .finally(() => {
        refreshPromise = null; // release the lock whether it succeeded or failed
      });
  }
  return refreshPromise;
}

// Unwrap response.data + handle auth errors with auto-refresh-and-retry
// Requests where a 401 means "wrong credentials", not "session expired"
const AUTH_URLS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isUnauthorized = error.response?.status === 401;
    const isAuthCall = AUTH_URLS.some((url) =>
      originalRequest?.url?.includes(url),
    );
    const alreadyRetried = originalRequest?._retry;

    if (isUnauthorized && !isAuthCall && !alreadyRetried && originalRequest) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        // Only redirect if we're not already on the login page
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      }
    }

    if (isUnauthorized && !isAuthCall) clearAccessToken();
    return Promise.reject(error);
  },
);

interface TypedHttpRequest {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  patch<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = any>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}
const HttpRequest: TypedHttpRequest =
  axiosInstance as unknown as TypedHttpRequest;
export default HttpRequest;
