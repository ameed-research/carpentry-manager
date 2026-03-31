import api from './api';

export interface Category {
  id: string;
  name: string;
}

export const categoryService = {
  getAll: () => api.get<Category[]>('/categories'),
  create: (name: string) => api.post<Category>('/categories', { name }),
  update: (id: string, name: string) => api.put<Category>(`/categories/${id}`, { name }),
  delete: (id: string) => api.delete(`/categories/${id}`),
};
