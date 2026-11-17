import { AutoCampaignTemplateKey } from "./auto-campaigns/templates";

export interface WASettings {
  whitelisted?: boolean;
  phoneNumber?: string;
  balance: number; //in paise
  wabaId?: string;
  autoMsgConfig?: WAAutoMsgConfig;
  token?: string; //asisensy api token
  perDayLimit: number; //from aisensy dashboard
  qualityRating?: string; // e.g. "FLAGGED" | "UNFLAGGED" — from phone_number_quality_update webhook
  messagingLimit?: string; // e.g. "TIER_250" | "TIER_1K" | "TIER_10K" | "TIER_100K" | "UNLIMITED"
  qualityUpdatedAt?: Date;
  // Set (with one alert) when Meta reports the number/token unusable
  // (codes 190, 10, 200, 131031, or 100 + subcode 33). Removed on the next
  // successful send.
  connectionBroken?: {
    at: Date;
    code: number | null;
    subcode: number | null;
    message: string;
  };
  // Set (with one alert) when sends pause because balance < 100 paise;
  // removed once a send finds the balance above it again.
  lowBalanceAt?: Date;
}

export interface WinBackMilestone {
  days: number;
  bonusPoints: number;
  expiryDays?: number;
  enabled: boolean;
}

export interface WAFollowupSettings {
  sendAfterDays: number; // When to send the 1st follow-up
  numberOfReminders: number; // Total reminders to send
  gapBetweenReminders: number; // Days between follow-ups
  enabled?: boolean; // Allow disabling per patient or per rule
}

export interface WAAutoMsgConfig {
  pointsAddedNotification?: boolean;
  pointsRedeemedNotification?: boolean;
  leadNotification?: boolean;
  loyaltyReminder2Weeks?: boolean;
  loyaltyReminder4Weeks?: boolean;
  loyaltyReminder6Weeks?: boolean;
  loyaltyReminder12Weeks?: boolean;
  couponGrantedNotification?: boolean;
  couponExpiryNotification?: boolean;
  birthdayReminders?: boolean | null;
  anniversaryReminders?: boolean | null;
  followupNotifications?: WAFollowupSettings;
  feedbackThankYou?: boolean;
  googleReviewRequest?: boolean;
  // pointsV2Active stores only
  v2EarnedNotification?: boolean;
  v2RedeemedNotification?: boolean;
  v2ExpiryNotification?: boolean;
  v2BonusNotification?: boolean;
  v2OccasionNotification?: boolean;
  winBackEnabled?: boolean;
  winBackMilestones?: WinBackMilestone[];
  dailyReportDisabled?: boolean;
}

export interface WAAutoMsgTemplate {
  configName: //this is doc id also
    | "points-added"
    | "points-redeemed"
    | "referral-message"
    | "loyalty-reminder-2-weeks"
    | "loyalty-reminder-4-weeks"
    | "loyalty-reminder-6-weeks"
    | "loyalty-reminder-12-weeks"
    | "referral-instant-coupon-granted"
    | "referral-reward-coupon-granted"
    | "referral-coupon-granted"
    | "membership-coupon-granted"
    | "survey-coupon-granted"
    | "offer-coupon-granted"
    | "coupon-expiry-message"
    | "feedback-promoter"
    | "feedback-neutral"
    | "feedback-recovery"
    | "review-request"
    | "points-v2-earned"
    | "points-v2-redeemed"
    | "points-v2-expired"
    | "points-v2-expiring-soon"
    | "points-v2-referral-bonus"
    | "points-v2-welcome-bonus"
    | "points-v2-redemption-otp"
    | "send-bill"
    | "win-back-redeem"
    | "win-back-soon"
    | AutoCampaignTemplateKey;

  templateName: string; // WhatsApp template name
  templateId: string; // From AiSensy/Meta
  waTemplateStatus: string; //"PROCESSING" | "APPROVED" | "REJECTED" | "DISABLED";
  components: string; // JSON.string of WAComponent[]
  waTemplateType: string; //"utility" | "marketing "
  storeId: string;
  createdAt: Date;
  templateVersion?: number; // auto campaign templates: version of the copy it was submitted with
}

export interface WAComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  text?: string;
  format?: string; // For header: IMAGE | TEXT etc.
  buttons?: { type: string; text: string; url?: string; phone_number?: string; example?: any }[];
  example?: any;
}

export interface WACampaign {
  id: string;
  name: string;
  createdAt: Date;
  message: string;
  photos: string[];
  targetList: string[];
  deliveredList: string[];
  const: number;
}

export interface WALedgerLine {
  id: string;
  amount: number; // in paise, +ve means credit and -ve means debit
  type: string; //"Topup" | "Campaign" | "Auto-campaign" | "Reminder" | "Alert";
  subType: string; //campaignId, birthday, anniversary, loyalty, etc
  timestamp: Date;

  // v1 (legacy): one accumulated doc per campaign with all recipients
  messages?: { to: string; waMsgId: string; status: string }[];

  // v2: one doc per billing event — to/waMsgId/status replace messages[]
  version?: 2;
  to?: string;
  waMsgId?: string;
  status?: string;
}

export interface WAMessage {
  waMsgId: string;
  to: string;
  wabaId: string;
  storeId: string;
  status: "sent" | "delivered" | "failed";
  timestamp: Date;
  type: string; //"Topup" | "Campaign" | "Auto-campaign" | "Reminder" | "Alert";
  subType: string; //campaignId, birthday, anniversary, loyalty, etc
  processedAt?: Date;
  error?: string;
}

export interface WATemplate {
  templateId: string;
  templateName: string;
  category: string;
  storeId: string;
  createdAt: Date;
  status: string;
  storeTemplatePath: string;
}

export interface AISensyConfig {
  prices: { type: string; price: number }[];
}

export interface WALoyaltyReminder {
  couponId: string; //this is doc id
  ownerId: string;
  storeId: string;
  pendingForDays: number; //14, 28,
  createdAt: Date;
}

export const defaultFollowupConfig: WAFollowupSettings = {
  enabled: false,
  sendAfterDays: 10,
  numberOfReminders: 3,
  gapBetweenReminders: 5,
};

export function createEmptyAutoMsgConfig(): WAAutoMsgConfig {
  return {
    pointsAddedNotification: true,
    pointsRedeemedNotification: false,
    loyaltyReminder2Weeks: false,
    loyaltyReminder4Weeks: true,
    loyaltyReminder6Weeks: true,
    loyaltyReminder12Weeks: true,
    couponGrantedNotification: true,
    couponExpiryNotification: true,
    followupNotifications: defaultFollowupConfig,
    feedbackThankYou: true,
    googleReviewRequest: false,
    v2EarnedNotification: true,
    v2RedeemedNotification: true,
    v2ExpiryNotification: true,
    v2BonusNotification: true,
    v2OccasionNotification: true,
  };
}
