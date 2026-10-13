export interface SellerReportData {
  members: number;
  referrals: number;
  visits: number;
  reviews: number;
  totalOrderAmount: number;
  leads?: number;
}

export interface SellerReport {
  biWeekly: SellerReportData;
  overall: SellerReportData;
  date: Date;
}

export interface SellerDateReport {
  report: SellerReport;
  status: string;
  storeId: string;
  dateStr: string;
}

export interface StoreMonthlyTargets {
  visits: number;
  members: number;
  leads: number;
  reviews: number;
  referrals: number;
  revenue: number;

  updatedAt: Date;
  source: "store" | "default";
}

export const defaultMonthlyPerformanceTarget: StoreMonthlyTargets = {
  visits: 100,
  members: 50,
  leads: 100,
  reviews: 30,
  referrals: 150,
  revenue: 200000,
  updatedAt: new Date(),
  source: "default",
};

export function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function formatWindow(from: Date, to: Date): string {
  return `${from.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })} – ${to.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })}`;
}

//Converts monthly intent → report window expectation
export function scaleMonthlyTarget(
  monthlyTarget: number,
  period: "biweekly" | "weekly" | "monthly" = "biweekly",
): number {
  if (!monthlyTarget || monthlyTarget <= 0) return 0;

  const factor = period === "weekly" ? 0.25 : period === "biweekly" ? 0.5 : 1;

  return Math.round(monthlyTarget * factor);
}

export function achievementPct(actual: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.round((actual / target) * 100);
}

export interface NormalizedMetric {
  actual: number;
  target: number;
  achievementPct: number;
}

export function buildNormalizedMetrics(
  report: SellerReportData,
  targets: StoreMonthlyTargets,
  from: Date,
  to: Date,
): Record<
  "visits" | "members" | "leads" | "reviews" | "referrals" | "revenue",
  NormalizedMetric
> {
  return {
    visits: normalize(report.visits, targets.visits, from, to),
    members: normalize(report.members, targets.members, from, to),
    leads: normalize(report.leads ?? 0, targets.leads, from, to),
    reviews: normalize(report.reviews, targets.reviews, from, to),
    referrals: normalize(report.referrals, targets.referrals, from, to),
    revenue: normalize(report.totalOrderAmount, targets.revenue, from, to),
  };
}

function normalize(
  actual: number,
  monthlyTarget: number,
  from: Date,
  to: Date,
): NormalizedMetric {
  const target = scaleMonthlyTarget(monthlyTarget, "biweekly");
  return {
    actual,
    target,
    achievementPct: achievementPct(actual, target),
  };
}

export function calculatePerformanceScore(
  metrics: Record<string, NormalizedMetric>,
): number {
  const weights: Record<string, number> = {
    visits: 1,
    members: 2,
    leads: 3,
    reviews: 4,
    referrals: 4,
    revenue: 5,
  };

  let total = 0;
  let weightSum = 0;

  for (const key in weights) {
    const m = metrics[key];
    if (!m || m.target === 0) continue;
    const pct = Number(m.achievementPct);
    if (!Number.isFinite(pct)) continue;
    // Cap overachievement so one metric doesn't dominate
    const capped = Math.min(pct, 120);

    total += capped * weights[key];
    weightSum += weights[key];
  }

  if (!weightSum) return 0;

  return Math.min(100, Math.round(total / weightSum));
}

export type PerformanceVerdict =
  | "excellent"
  | "good"
  | "average"
  | "needs_attention";

export function getVerdict(score: number): {
  verdict: PerformanceVerdict;
  text: string;
  color: string;
} {
  if (score >= 80)
    return {
      verdict: "excellent",
      text: "🔥 Your store is thriving!",
      color: "#2E7D32",
    };

  if (score >= 60)
    return {
      verdict: "good",
      text: "👍 Strong growth momentum",
      color: "#1565C0",
    };

  if (score >= 40)
    return {
      verdict: "average",
      text: "🙂 Stable, but room to grow",
      color: "#EF6C00",
    };

  return {
    verdict: "needs_attention",
    text: "⚠️ Growth slowed — time to focus",
    color: "#C62828",
  };
}

export function scoreDelta(
  current: number,
  previous?: number,
): number | undefined {
  if (previous === undefined) return undefined;
  return current - previous;
}

export interface PerformanceInsight {
  label: string;
  actual: number;
  target: number;
  achievementPct: number;
  icon: string;
  highlight?: boolean;
}

export function buildInsightsFromMetrics(
  metrics: Record<string, NormalizedMetric>,
): PerformanceInsight[] {
  const map: Record<string, { label: string; icon: string }> = {
    members: { label: "New Members", icon: "👥" },
    visits: { label: "Visits", icon: "🏪" },
    leads: { label: "Leads", icon: "🧲" },
    reviews: { label: "Reviews", icon: "⭐" },
    referrals: { label: "Referrals", icon: "🤝" },
    revenue: { label: "Revenue", icon: "💰" },
  };

  return Object.entries(metrics)
    .map(([key, m]) => ({
      label: map[key].label,
      icon: map[key].icon,
      actual: m.actual,
      target: m.target,
      achievementPct: m.achievementPct,
      highlight: m.achievementPct >= 80,
    }))
    .sort((a, b) => b.achievementPct - a.achievementPct);
}

export function suggestedSteps(metrics: Record<string, NormalizedMetric>) {
  const steps: { icon: string; title: string; reason: string }[] = [];

  if (metrics.members.achievementPct < 50)
    steps.push({
      icon: "👥",
      title: "Grow your member base",
      reason: "Members are your long-term customer asset",
    });

  if (metrics.visits.achievementPct < 50)
    steps.push({
      icon: "📲",
      title: "Increase QR scans",
      reason: "More scans lead to more visits & repeat customers",
    });

  if (metrics.leads.achievementPct < 50)
    steps.push({
      icon: "🧲",
      title: "Capture more leads",
      reason: "Leads fuel future visits and revenue",
    });

  if (metrics.reviews.achievementPct < 50)
    steps.push({
      icon: "⭐",
      title: "Collect Google reviews",
      reason: "Reviews boost trust and conversion",
    });

  if (metrics.referrals.achievementPct < 50)
    steps.push({
      icon: "🤝",
      title: "Encourage referrals",
      reason: "Referrals bring high-quality customers",
    });

  return steps;
}
