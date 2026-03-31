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
};
