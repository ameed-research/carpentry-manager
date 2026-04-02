import api from './api';

export interface CarpentryDocument {
  id: string;
  originalName: string;
  fileSize: number;
  uploadDate: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  type: 'INVOICE' | 'RECEIPT' | 'DELIVERY_NOTE' | 'PAYMENT_CHECK' | 'BANK_TRANSFER';
  extractedData?: string;
}

export const documentService = {
  getAll: () => api.get<CarpentryDocument[]>('/documents'),
  upload: (file: File, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post<CarpentryDocument>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyzeInventoryDocument: (file: File, force: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any>(`/documents/analyze-inventory?force=${force}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  analyzeSupplierDocument: (file: File, force: boolean = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<any>(`/documents/analyze-supplier?force=${force}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  approveInventoryDocument: (id: string, data: any) => {
    return api.post(`/documents/${id}/approve-inventory`, data);
  },
  getDownloadUrl: (id: string) => {
    return `${api.defaults.baseURL}/documents/${id}/download`;
  }
};
