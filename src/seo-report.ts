// Search & AI Visibility Audit reports: sales research a prospect restaurant
// (its Google rank for "best …" keywords in its own and nearby areas) and
// generate a 2-page PDF to share. One doc per report at
// admin-data/seo-reports/reports/{reportId}; everyone in admin sees all.

export interface ReportLatLng {
  lat: number;
  lng: number;
}

// The prospect, as picked from Google.
export interface SeoReportPlace {
  placeId: string;
  name: string;
  address: string;
  location: ReportLatLng;
  rating?: number;
  reviews?: number;
  category?: string; // Google's primary type, e.g. "South Indian restaurant"
  priceLevel?: number; // 1 (inexpensive) – 4 (very expensive), when Google has it
}

// A neighbourhood the report checks. areas[0] is always the restaurant's own.
export interface SeoReportArea {
  name: string;
  center: ReportLatLng;
  distanceKm: number; // from the restaurant; 0 for its own area
  direction?: string; // "NW", from the restaurant
}

export interface SeoReportKeyword {
  text: string;
  included: boolean; // ticked to appear in the report
}

export interface SeoReportResult {
  placeId: string;
  name: string;
  location?: ReportLatLng;
  rating?: number;
  reviews?: number;
}

// One Google search: a keyword around one area's centre.
export interface SeoReportCell {
  keyword: string;
  area: string;
  rank: number | null; // the restaurant's position, null = not in the top 20
  results: SeoReportResult[]; // Google's top 10, in order
  searchedAt: Date;
}

export const SEO_REPORT_DEPTH = 20;
export const SEO_REPORT_MAX_ADJACENT_AREAS = 2;
export const SEO_REPORT_AREA_RADIUS_METERS = 1500;

export const SEO_REPORT_KEYWORD_SUGGESTIONS = [
  "best restaurant",
  "best cafe",
  "best biryani",
  "best south indian restaurant",
  "best north indian restaurant",
  "family restaurant",
  "best pizza",
  "best dessert",
];

export function seoReportCellKey(keyword: string, area: string): string {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  return `${norm(keyword)}|${norm(area)}`;
}

export interface SeoReport {
  id: string;
  restaurant: SeoReportPlace | null;
  landmark: string; // building or landmark shown in the report ("Sandy's Tower")
  city: string;
  areas: SeoReportArea[];
  keywords: SeoReportKeyword[];
  cells: Record<string, SeoReportCell>; // by seoReportCellKey
  researchedAt?: Date;
  status: "draft" | "ready";
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  createdBy: string; // admin phone
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Callables ──────────────────────────────────────────────────────────────

export interface SearchReportPlacesRequest {
  query: string;
}

export interface SearchReportPlacesResult {
  places: (SeoReportPlace & { city?: string; landmark?: string })[];
}

export interface FindReportAreasRequest {
  location: ReportLatLng;
}

export interface FindReportAreasResult {
  own: SeoReportArea | null;
  nearby: SeoReportArea[]; // 1–6 km away, nearest first
}

export interface RunReportResearchRequest {
  reportId: string;
}

export interface RunReportResearchResult {
  searched: number; // new Google searches made (already-researched cells are kept)
}
