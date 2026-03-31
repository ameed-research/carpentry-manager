import type { Item } from '../services/inventoryService';

export interface InventoryHistory {
  id: string;
  itemId: string;
  snapshot: Item;
  changeDate: string;
  changedBy: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR';
  timestamp: string;
  read: boolean;
}
