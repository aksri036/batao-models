export interface PointsLedgerEntry {
  id: string;
  storeId: string; // lets computeDailyReportRollup collection-group query across all guests' ledgers, filtered to one store
  type:
    | "earn"
    | "redeem"
    | "expire"
    | "activate"
    | "adjustment"
    | "referral_bonus"
    | "signup_bonus"
    | "google_review"
    | "instagram_tag"
    | "occasion_offer"
    | "campaign_grant"
    | "win_back_grant"
    | "win_back_attribution"
    | "campaign_attribution";
  points: number; // +ve credit, -ve debit; 0 for win_back_attribution
  balanceAfter: number;
  sourceType?:
    | "pos_order"
    | "manual_order"
    | "buyer_order"
    | "referral"
    | "social"
    | "signup"
    | "expiry"
    | "activation"
    | "manual_adjustment"
    | "petpooja_redeem"
    | "occasion"
    | "campaign"
    | "win_back";
  sourceId?: string; // invoiceKey, referralId, social-claims id, ruleId, campaignId...
  orderAmount?: number; // for "earn" entries — NET of any redemption applied this same order, used for the earn-rate calculation
  grossOrderAmount?: number; // for "earn" entries — the original bill BEFORE any redemption was applied this order; equals orderAmount when nothing was redeemed
  redeemedRewardId?: string; // for "redeem" entries — which catalog reward was fulfilled
  framingRewardId?: string; // for "earn"/bonus entries — which reward to show in messaging
  occasionRuleId?: string; // for "occasion_offer" entries — which OccasionOfferRule triggered this
  occasionLabel?: string; // for "occasion_offer" entries — guest's personalized label, e.g. "Riya's Birthday"
  activeFrom?: Date; // when set, points are NOT yet in pointsBalance — cron moves them to balance once this date passes
  lockedFromBalance?: boolean; // true while activeFrom is still in the future; cleared by activatePointsLots cron
  expiresAt?: Date | null; // only for "earn" entries; for "occasion_offer" set to occasion_date + offerValidityDays
  remainingPoints?: number; // only for "earn" entries — FIFO tracking
  remindersSent?: number[]; // only for "earn" entries — which reminderDaysBefore thresholds have already fired, so a daily cron re-run never double-sends
  staffId?: string | null;
  wonBackRevenue?: number; // for "win_back_attribution" entries — order amount that triggered attribution
  campaignId?: string; // for "campaign_attribution" entries — which campaign sent within the window is credited
  revenueAttributed?: number; // for "campaign_attribution" entries — order amount credited to that campaign
  note?: string;
  createdAt: Date;
  claimedAt?: Date | null; // cosmetic "unopened gift" reveal for bonus-type entries — doesn't affect balance
}
