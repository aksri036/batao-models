export interface SocialRewardAction {
  enabled: boolean;
  points: number;
  requiresApproval: boolean; // when true, guest must upload a screenshot and a staff member approves before crediting
  maxClaimsPerGuest: number; // seller's call, not a platform-enforced rule — they decide their own farming risk tolerance
  framingRewardId?: string;
}

export interface SocialRewardsConfig {
  googleReview: SocialRewardAction & {
    reviewLink?: string; // store's Google review URL, shown to guest as a deep link
  };
  instagramTag: SocialRewardAction & {
    instagramHandle?: string; // "@storehandle", shown to guest so they know who to tag
  };
}
