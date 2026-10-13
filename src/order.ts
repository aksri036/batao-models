import { Timestamp } from "./timestamp";

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'ready'
  | 'outForDelivery'
  | 'delivered'
  | 'cancelled';

export const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'rejected', 'cancelled'];

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending:        ['accepted', 'rejected', 'cancelled'],
  accepted:       ['outForDelivery', 'ready', 'cancelled'],
  ready:          ['delivered'],
  outForDelivery: ['delivered'],
  delivered:      [],
  rejected:       [],
  cancelled:      [],
};

export type StatusHistoryEntry = {
  status: OrderStatus;
  timestamp: Timestamp;
  note?: string;
};

export type DeliveryAddress = {
  doorNumber: string;
  addressLine: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
};

export type OrderSettings = {
  orderingEnabled: boolean;
  orderType: 'delivery' | 'takeaway' | 'both';
  gstIncluded: boolean;
  gstRate: 5 | 12 | 18 | null;
  deliveryMaxDistance: number;
  deliveryCharge: number;
};
