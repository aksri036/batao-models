import { Discount } from "./discount";

export interface CouponRedemption {
  timestamp: Date;
  amount: number; //copuon discount amount
  orderAmount: number;
  offerDiscount?: string; //offer discount (amount / gift item)
  staffId?: string | null;
}

export enum CouponStatus {
  created = "created",
  redeemed = "redeemed",
  expired = "expired",
}

export interface Coupon {
  couponId: string;
  couponNumber: number;
  storeId: string;
  subdomain: string;
  createdAt: Date;
  programId: string; //offerId, surveyId
  type: string; //membership, referral, referral-reward, referral-instant, offer, survey
  value: Discount;
  validityPeriod: { begins: Date; ends?: Date };
  ownerId: string;
  status: string;
  redemption?: CouponRedemption;
  referralId?: string; //in case it is referral coupon
  beneficiaryId?: string; // this is for referral reward coupon. contains which buyer has claimed referral
  visitNum?: number; //this is for visit number of membership
  chainId?: string; //if this is not null, coupon will be shared across all stores of the chain
  couponCode?: string; // e.g. "A9F3KQ"
}
export interface CouponGroup {
  ownerId: string;
  name: string;
  mobile: string;
  coupons: Coupon[];
}
export enum CouponType {
  membership = "membership",
  referral = "referral",
  referralReward = "referral-reward",
  referralInstant = "referral-instant",
  offer = "offer",
  survey = "survey",
}
