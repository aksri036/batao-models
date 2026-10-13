import { Timestamp } from "./timestamp";
import { DeliveryAddress, OrderStatus, StatusHistoryEntry } from "./order";

export type CartItem = {
  id: string;
  name: string;
  price?: number;
  type: "item" | "combo";
  quantity: number;
};

export type BtCart = {
  storeId: string;
  buyerId: string;
  items: CartItem[];
  updatedAt: Date;
};

export type BtOrder = {
  id: string;
  storeId: string;
  buyerId: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  couponId?: string;
  couponCode?: string;
  couponLabel?: string;
  orderCode: string;
  placedAt: Date;
  // delivery & status fields — optional so existing orders without them still type-check
  orderNumber?: number;
  orderType?: 'delivery' | 'takeaway';
  deliveryAddress?: DeliveryAddress;
  deliveryCharge?: number;
  gstRate?: number | null;
  gstIncluded?: boolean;
  gstAmount?: number;
  totalAmount?: number;
  deliveryStatus?: OrderStatus;
  statusHistory?: StatusHistoryEntry[];
  updatedAt?: Timestamp;
  buyerName?: string;
  buyerPhone?: string;
};
