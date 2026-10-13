export interface DailyReportRollup {
  date: string; // "YYYY-MM-DD"
  storeId: string;
  newGuests: number;
  guestVisits: number; // count of "earn" ledger entries that day
  guestRevenue: number; // sum of orderAmount on those "earn" entries
  pointsIssued: number; // earn + signup_bonus + referral_bonus combined (broken down by source in a later story)
  pointsRedeemed: number;
  pointsExpired: number;
  redemptionValueGiven: number; // pointsRedeemed × the store's current valuePerPoint
  referralInvitesSent?: number;
  referralConversions?: number;
  referralFirstPurchases?: number;
  socialClaims?: { googleReview: number; instagramTag: number };
  campaignsSent?: number;
  campaignRecipients?: number;
  campaignPointsGranted?: number;
  winBackGrantsSent?: number;
  winBackVisitsAttributed?: number;
  winBackRevenueAttributed?: number;
  campaignVisitsAttributed?: number;
  campaignRevenueAttributed?: number;
}
