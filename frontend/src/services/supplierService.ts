import api from './api';
import type { PaymentData } from '../components/common/PaymentDialog';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  taxId?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  payments: PaymentData[];
  totalPaid: number;
  debt: number;
}

export const supplierService = {
  getAll: () => api.get<Supplier[]>('/suppliers'),
  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data),
  update: (id: string, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
  addPayment: (id: string, payment: PaymentData) => api.post<Supplier>(`/suppliers/${id}/payments`, payment),
  updatePayment: (id: string, paymentId: string, payment: PaymentData) => api.put<Supplier>(`/suppliers/${id}/payments/${paymentId}`, payment),
  deletePayment: (id: string, paymentId: string) => api.delete<Supplier>(`/suppliers/${id}/payments/${paymentId}`),
};
