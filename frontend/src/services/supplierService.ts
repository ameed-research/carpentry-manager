import api from './api';
import type { PaymentData } from '../components/common/PaymentDialog';

export interface Invoice {
  id: string;
  invoiceId: string;
  totalAmount: number;
  sourceDocumentId: string;
  invoiceDate: string;
  uploadDate: string;
}

export interface DeliveryNote {
  id: string;
  deliveryNoteId: string;
  totalAmount?: number;
  sourceDocumentId: string;
  deliveryNoteDate: string;
  uploadDate: string;
}

export interface SupplierSummary {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  balance: number;
  taxId?: string;
  contactPerson?: string;
  contactPhone?: string;
  email?: string;
  payments?: PaymentData[];
  invoices?: Invoice[];
  deliveryNotes?: DeliveryNote[];
}

export const supplierService = {
  getAll: () => api.get<SupplierSummary[]>('/suppliers'),
  getById: (id: string) => api.get<Supplier>(`/suppliers/${id}`),
  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data),
  update: (id: string, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
  addPayment: (id: string, payment: PaymentData) => api.post<Supplier>(`/suppliers/${id}/payments`, payment),
  updatePayment: (id: string, paymentId: string, payment: PaymentData) => api.put<Supplier>(`/suppliers/${id}/payments/${paymentId}`, payment),
  deletePayment: (id: string, paymentId: string) => api.delete<Supplier>(`/suppliers/${id}/payments/${paymentId}`),
  addInvoice: (id: string, invoice: Invoice) => api.post<Supplier>(`/suppliers/${id}/invoices`, invoice),
  updateInvoice: (id: string, invoiceId: string, invoice: Invoice) => api.put<Supplier>(`/suppliers/${id}/invoices/${invoiceId}`, invoice),
  deleteInvoice: (id: string, invoiceId: string) => api.delete<Supplier>(`/suppliers/${id}/invoices/${invoiceId}`),
  addDeliveryNote: (id: string, dn: DeliveryNote) => api.post<Supplier>(`/suppliers/${id}/delivery-notes`, dn),
  updateDeliveryNote: (id: string, dnId: string, dn: DeliveryNote) => api.put<Supplier>(`/suppliers/${id}/delivery-notes/${dnId}`, dn),
  deleteDeliveryNote: (id: string, dnId: string) => api.delete<Supplier>(`/suppliers/${id}/delivery-notes/${dnId}`),
};
