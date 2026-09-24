import HttpRequest from "@/lib/httpRequest";

export const AuthService = {
  login: (data: any) => HttpRequest.post("/auth/login", data),

  //   refresh: () => HttpRequest.post("/auth/refresh"),

  logout: () => HttpRequest.post<void>("/auth/logout"),

  getMe: () => HttpRequest.get("/auth/me"),
};
