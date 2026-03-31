import api from './api';

export interface Expense {
  id: string;
  date: string;
  category: string;
  amountExcludingVAT: number;
  amountIncludingVAT: number;
  sourceDocumentId?: string;
}

export const expenseService = {
  getAll: () => api.get<Expense[]>('/expenses'),
  getByMonth: (year: number, month: number) => api.get<Expense[]>(`/expenses/filter?year=${year}&month=${month}`),
  create: (data: Partial<Expense>) => api.post<Expense>('/expenses', data),
  update: (id: string, data: Partial<Expense>) => api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};
