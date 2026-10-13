// Mirrors VisibilityReportResult in
// cf-backend/functions/src/gmb/visibility-report.ts and the frontend's
// domain/repo/visibility_report_operations.ts — no shared types package
// across these repos, every cross-boundary type is mirrored the same way.

export interface RankBucketStat {
  count: number;
  total: number;
}

export interface VisibilityReportCompetitor {
  rank: number;
  name: string;
  rating: number | null;
  reviewCount: number;
  reason: "Higher rating" | "More reviews" | "Higher rating and more reviews" | "Ranks higher";
}

export interface VisibilityReport {
  id: string; // enquiryId, the doc's own id
  enquiryId: string;
  businessName: string;
  leadRating: number | null;
  leadReviewCount: number;
  leadQuery: string | null;
  leadRank: number | null;
  leadRadiusMeters: number | null;
  bestSpecialtyNote: string | null;
  rankStats: {
    top3: RankBucketStat;
    top10: RankBucketStat;
    top20: RankBucketStat;
    invisible: RankBucketStat;
  };
  profileChecks: { hasPhone: boolean; hasWebsite: boolean; hasHours: boolean };
  competitors: VisibilityReportCompetitor[];
  findings: string[];
  generatedAt?: Date;
  flagged?: boolean;
  flagNote?: string;
}
