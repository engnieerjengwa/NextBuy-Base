export interface OrderStatusHistory {
  id: number;
  orderId: number;
  status: string;
  note: string;
  createdAt: Date;
}

export const ORDER_STATUS_FLOW: string[] = [
  'PLACED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];
