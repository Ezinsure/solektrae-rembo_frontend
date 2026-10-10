import HttpRequest from "@/lib/httpRequest"; 

const BASE = "/roles";

export const RoleService = {
  getAll: () => HttpRequest.get(BASE),
  getOne: (id: string) => HttpRequest.get(`${BASE}/${id}`),
  create: (data: any) => HttpRequest.post(BASE, data),
  update: (id: string, data: any) => HttpRequest.patch(`${BASE}/${id}`, data),
  remove: (id: string) => HttpRequest.delete(`${BASE}/${id}`),
  assignToUser: (userId: string, roleId: string) => HttpRequest.patch(`/users/${userId}/role`, { roleId }),
};