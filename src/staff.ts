export enum StoreUserRole {
  OWNER = "owner",
  STAFF = "staff",
  CHAINOWNER = "chain-owner",
  MANAGER = "manager",
  BATAOADMIN = "batao-admin",
  NONE = "none", //user is not part of subdomain he is accessing
}

export interface Staff {
  number: string;
  name: string;
  storeId: string;
  subdomain: string;
  createdAt: Date;
  lastAccessedAt?: Date | null;
  removed?: boolean | null;
  role?: string | null; //if it is null, the role is assumed to be StoreUseRole.STAFF
  rewardBalance?: number; // cached balance
  rewardUpdatedAt?: Date | null; // last balance update
}

//Staff reward event types
export enum StaffRewardEventType {
  QR_SCAN = "qr_scan",
  ORDER_ADDED = "order_added",
  FEEDBACK_COLLECTED = "feedback_collected",
  COUPON_REDEEM = "coupon_redeem",
  INSTANT_REFERRAL_CREATED = "instant_referral_created",
  GOOGLE_REVIEW = "google_review",
  INSTAGRAM_REVIEW = "instagram_review",
  PACKAGE_GRANT = "package_grant",
  REWARD_REDEEM = "reward_redeem",
}

//How staff earns points (rules)
export interface StaffRewardRule {
  event: StaffRewardEventType;
  points: number; // default = 1
  enabled: boolean;
}

//Reward milestones (core of motivation)
export interface StaffRewardMilestone {
  id: string;
  pointsRequired: number; // e.g. 100
  rewardTitle: string; // "Smart Watch"
  rewardDescription?: string | null;
  active: boolean;
}

//Top-level staff rewards settings
export interface StoreStaffRewardsSettings {
  enabled: boolean;

  // how staff earns points
  rules: StaffRewardRule[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface StaffRewardLedgerEntry {
  id: string;
  storeId: string;
  staffId: string;
  event: StaffRewardEventType;
  points: number; // +ve earn, -ve redeem
  sourceId: string; // couponId / visitId / redemptionId
  timestamp: Date;
}

export const REWARD_EVENT_LABELS: Record<StaffRewardEventType, string> = {
  qr_scan: "QR code scan",
  order_added: "Order added",
  feedback_collected: "Feedback collected",
  coupon_redeem: "Coupon redeemed",
  instant_referral_created: "Instant referrals",
  google_review: "Google review",
  instagram_review: "Instagram review",
  package_grant: "Package granted",
  reward_redeem: "Reward redeemed",
};
