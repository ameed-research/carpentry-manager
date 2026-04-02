import api from './api';

export interface Job {
  id?: string;
  date: string;
  itemName: string;
  price: number;
}

export interface Payment {
  id?: string;
  date: string;
  amount: number;
  method: 'CASH' | 'CHEQUE' | 'MONEY_TRANSFER';
  remarks?: string;
  sourceDocumentId?: string;
  bank?: string;
  branch?: string;
  account?: string;
  chequeNumber?: string;
  dueDate?: string;
  referenceNumber?: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  debt: number;
  closed: boolean;
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
  getAll: () => api.get<CustomerSummary[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  close: (id: string) => api.post<Customer>(`/customers/${id}/close`),
  addJob: (id: string, job: Job) => api.post<Customer>(`/customers/${id}/jobs`, job),
  updateJob: (id: string, jobId: string, job: Job) => api.put<Customer>(`/customers/${id}/jobs/${jobId}`, job),
  deleteJob: (id: string, jobId: string) => api.delete<Customer>(`/customers/${id}/jobs/${jobId}`),
  addPayment: (id: string, payment: Payment) => api.post<Customer>(`/customers/${id}/payments`, payment),
  updatePayment: (id: string, paymentId: string, payment: Payment) => api.put<Customer>(`/customers/${id}/payments/${paymentId}`, payment),
  deletePayment: (id: string, paymentId: string) => api.delete<Customer>(`/customers/${id}/payments/${paymentId}`),
  extractPaymentData: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any>('/ai/extract-payment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
