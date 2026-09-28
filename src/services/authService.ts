import HttpRequest from "@/lib/httpRequest";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  names: string;
  role: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export const AuthService = {
  login: (data: LoginPayload) =>
    HttpRequest.post<ApiEnvelope<LoginResponse>>("/auth/login", data),

  refresh: () =>
    HttpRequest.post<ApiEnvelope<{ accessToken: string }>>("/auth/refresh"),

  logout: () => HttpRequest.post<void>("/auth/logout"),

  getMe: async (): Promise<AuthUser> => {
    const res = await HttpRequest.get<ApiEnvelope<AuthUser>>("/auth/me");
    return res.data;
  },
};
