export type PointsRFMSegment =
  | "champion"
  | "loyal"
  | "promising"
  | "new"
  | "atRisk"
  | "churning"
  | "lost"
  | "enrolled";

export interface PointsGuestDoc {
  guestId: string;
  storeId: string;
  name?: string;
  nameLower?: string;

  lastVisitAt?: string | null; // ISO string (Timestamp serialised by CF callable)
  visitCount: number;
  totalSpend: number;
  avgOrderValue: number;

  pointsBalance: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  hasRedeemed: boolean;

  hasRegisteredOccasion: boolean;
  nextOccasionAt?: string | null;

  rfmSegment: PointsRFMSegment;

  createdAt: string;
  updatedAt: string;
}

export interface PointsGuestSummaryDoc {
  storeId: string;
  totalMembers: number;
  activeThisMonth: number;
  newThisMonth: number;
  atRiskCount: number;
  upcomingOccasions: number;
  segmentCounts: Record<PointsRFMSegment, number>;
  updatedAt: string;
}

export interface QueryPointsGuestsFilters {
  rfmSegment?: PointsRFMSegment;
  lastVisitFrom?: string;
  lastVisitTo?: string;
  joinedFrom?: string;
  joinedTo?: string;
  minVisits?: number;
  minBalance?: number;
  minSpend?: number;
  hasRedeemed?: boolean;
  hasRegisteredOccasion?: boolean;
  upcomingOccasionDays?: number;
  search?: string;
}

export interface QueryPointsGuestsResult {
  mode: "normal";
  results: PointsGuestDoc[];
  hasMore: boolean;
  lastDocId: string | null;
}

export interface CampaignPhonesResult {
  mode: "campaign";
  phones: string[];
  total: number;
}
