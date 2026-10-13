export interface DurationPrice {
  days: number; //1 week = 7 days, 1 month = 30 days, 1 year = 365 days
  price: number;
}
export interface BtPlan {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
  features: BtFeature[];
  prices: DurationPrice[];
  offerId?: string | null;
  isTrial: boolean;
}

export interface BtOffer {
  id: string;
  name: string;
  description: string;
  prices: DurationPrice[];
}

export interface BtFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  index: number;
}

export enum SubscriptionStatus {
  active = "active",
  renewReqd = "subs-renewal-reqd", //subscription is finishing. we will remind customer to renew
  paymentOverdue = "payment-overdue", //payment due date has passed. grace is on
  conked = "conked", //subscription was cancelled due to non-payment
}

export interface BtSubscription {
  id: string;
  storeId: string;
  planId: string;
  purchasedFor: DurationPrice;
  offerId?: string | null;
  status: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  lastUpdatedAt: Date;
  paymentId: string;
  invoiceUrl?: string;
  isTrial: boolean;
}
