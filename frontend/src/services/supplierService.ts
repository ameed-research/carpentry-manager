import api from './api';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  taxId?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
}

export const supplierService = {
  getAll: () => api.get<Supplier[]>('/suppliers'),
  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data),
  update: (id: string, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
};
