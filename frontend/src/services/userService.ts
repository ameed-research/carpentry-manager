import api from './api';

export interface User {
  id?: string;
  username: string;
  password?: string;
  roles: string[];
  enabled: boolean;
  accountNonLocked: boolean;
}

export const userService = {
  getAll: () => api.get<User[]>('/users'),
  create: (user: User) => api.post<User>('/users', user),
  delete: (id: string) => api.delete(`/users/${id}`),
  updateStatus: (id: string, enabled: boolean, accountNonLocked: boolean) =>
    api.patch<User>(`/users/${id}/status`, null, {
      params: { enabled, accountNonLocked },
    }),
};
