import api from './api';

export interface Job {
  date: string;
  itemName: string;
  price: number;
}

export interface Payment {
  date: string;
  amount: number;
  method: string;
  details?: string;
  sourceDocumentId?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  jobs: Job[];
  payments: Payment[];
  totalAmount: number;
  totalPaid: number;
  discount: number;
  debt: number;
  closed: boolean;
}

export const customerService = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  close: (id: string) => api.post<Customer>(`/customers/${id}/close`),
  addJob: (id: string, job: Job) => api.post<Customer>(`/customers/${id}/jobs`, job),
  addPayment: (id: string, payment: Payment) => api.post<Customer>(`/customers/${id}/payments`, payment),
};
