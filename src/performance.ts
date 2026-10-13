/* ============================================================
   PERFORMANCE SYSTEM - Batao.ai 
============================================================ */

import { StoreMonthlyTargets } from "./seller-reports";

/* ============================================================
   RANGE + CLASSIFICATIONS
============================================================ */

export type PerformanceRangeType = "weekly" | "monthly";

export type PerformanceVerdict = "poor" | "average" | "good" | "excellent";

export type SellerHealth = "at-risk" | "stable" | "growing" | "star";

export type MilestoneType =
  | "referral-spike"
  | "revenue-milestone"
  | "review-spike"
  | "member-milestone"
  | "performance-drop";

/* ============================================================
   CORE METRICS
============================================================ */

export interface SellerMetrics {
  visits: number;
  members: number;
  leads: number;
  reviews: number;
  referrals: number;
  revenue: number;
}

/* ============================================================
   NORMALIZED METRICS
============================================================ */

export interface NormalizedMetrics {
  visits: number;
  members: number;
  leads: number;
  reviews: number;
  referrals: number;
  revenue: number;
}

/* ============================================================
   PERFORMANCE DOCUMENT (UPGRADED)
============================================================ */

export interface SellerPerformanceDocument {
  storeId: string;

  range: {
    type: PerformanceRangeType;
    start: Date;
    end: Date;
    label: string;
  };

  /* ================= PERIOD ================= */

  metrics: SellerMetrics;
  normalized: NormalizedMetrics;

  score: number;
  verdict: PerformanceVerdict;
  deltaFromPrevious: number;

  /* ================= PREVIOUS SNAPSHOT ================= */

  previous?: {
    score: number;
    metrics: SellerMetrics;
    start: Date;
    end: Date;
  };

  /* ================= LIFETIME ================= */

  lifetime?: SellerMetrics;

  /* ================= TARGET CONTEXT ================= */

  targetsUsed: StoreMonthlyTargets;

  /* ================= EXPORT META ================= */

  exportMeta?: {
    generatedBy: "scheduler" | "admin-recalc" | "backfill";
    version: number;
  };

  createdAt: Date;
}

/* ============================================================
   SNAPSHOT
============================================================ */

export interface SellerPerformanceSnapshot {
  storeId: string;

  currentWeeklyScore: number;
  weeklyDelta: number;

  currentMonthlyScore: number;
  monthlyDelta: number;

  lastUpdatedAt: Date;
}

/* ============================================================
   ADMIN AGGREGATE
============================================================ */

export interface AdminSellerPerformance {
  storeId: string;
  storeName: string;
  subdomain?: string;

  weeklyScore: number;
  weeklyDelta: number;

  monthlyScore: number;
  monthlyDelta: number;

  health: SellerHealth;

  updatedAt: Date;
  targets: StoreMonthlyTargets;
}

/* ============================================================
   PERFORMANCE WEIGHTS
============================================================ */

export const PERFORMANCE_WEIGHTS = {
  referrals: 0.3,
  revenue: 0.25,
  members: 0.15,
  leads: 0.1,
  visits: 0.1,
  reviews: 0.1,
};

/* ============================================================
   NORMALIZATION
============================================================ */

export function buildNormalizedMetrics(
  metrics: SellerMetrics,
  targets: StoreMonthlyTargets,
  rangeType: PerformanceRangeType,
): NormalizedMetrics {
  const multiplier = rangeType === "weekly" ? 7 / 30 : 1;

  const normalize = (value: number, target: number) => {
    if (!target) return 0;
    return Math.min(value / (target * multiplier), 1);
  };

  return {
    visits: normalize(metrics.visits, targets.visits),
    members: normalize(metrics.members, targets.members),
    leads: normalize(metrics.leads, targets.leads),
    reviews: normalize(metrics.reviews, targets.reviews),
    referrals: normalize(metrics.referrals, targets.referrals),
    revenue: normalize(metrics.revenue, targets.revenue),
  };
}

/* ============================================================
   SCORE
============================================================ */

export function calculatePerformanceScore(
  normalized: NormalizedMetrics,
): number {
  const score =
    normalized.referrals * PERFORMANCE_WEIGHTS.referrals +
    normalized.revenue * PERFORMANCE_WEIGHTS.revenue +
    normalized.members * PERFORMANCE_WEIGHTS.members +
    normalized.leads * PERFORMANCE_WEIGHTS.leads +
    normalized.visits * PERFORMANCE_WEIGHTS.visits +
    normalized.reviews * PERFORMANCE_WEIGHTS.reviews;

  return Math.round(score * 100);
}

/* ============================================================
   VERDICT
============================================================ */

export function getVerdict(score: number): PerformanceVerdict {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "average";
  return "poor";
}

/* ============================================================
   HEALTH
============================================================ */

export function classifyHealth(score: number, delta: number): SellerHealth {
  if (score > 80 && delta > 0) return "star";
  if (score >= 60) return "growing";
  if (score >= 40) return "stable";
  return "at-risk";
}
