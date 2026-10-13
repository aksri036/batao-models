export interface Redemption {
  id: string;
  couponId: string;
  couponNumber: number;
  programType: string;
  programId: string;
  storeId: string; // coupon was redeemed at this store
  buyerId: string;
  amount: number; //copuon discount amount
  timestamp: Date;
  orderAmount: number;
  offerDiscount?: string; //offer discount (amount / gift item)
  staffId?: string | null;
  chainStoreId?: string | null; //coupon was created at this store
}
