export interface RewardItemOption {
  name: string;
  imageUrl?: string;
  posItemId?: string; // Petpooja menu item id — lets /loyalty-redeem auto-comp this item; blank for non-Petpooja stores
}

export interface Reward {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pointsCost: number; // not meaningful for valueType "maxCashback" — computed live at redemption time
  valueType: "cashback" | "item" | "maxCashback";
  cashback?: { amount: number };
  itemOptions?: RewardItemOption[];
  itemReferenceValue?: number; // ₹ — seller's own reference for "what this item is normally worth"; used only to suggest a parity points cost, never shown to guests
  active: boolean;
}
