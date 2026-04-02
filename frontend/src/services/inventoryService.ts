import api from './api';
import type { InventoryHistory } from '../types';

export interface Item {
  id: string;
  name: string;
  quantity: number;
  priceExcludingVAT: number;
  supplierId: string;
  supplierName?: string;
  sku?: string;
  documentNumber?: string;
  updatedDate?: string;
  updatedBy?: string;
  version: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const inventoryService = {
  getAll: (page: number = 0, size: number = 10) => 
    api.get<Page<Item>>(`/inventory?page=${page}&size=${size}`),
  create: (data: Partial<Item>) => api.post<Item>('/inventory', data),
  update: (id: string, data: Partial<Item>) => api.put<Item>(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  getHistory: (id: string) => api.get<InventoryHistory[]>(`/inventory/${id}/history`),
};
