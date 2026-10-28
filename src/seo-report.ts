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

// What the salesperson edits on top of the research. Anything left unset is
// filled from the data when the report is built (see the backend builder).
export interface SeoReportContent {
  headline?: string;
  observationTitle?: string;
  observationBody?: string;
  checkItYourself?: { keyword: string; area: string };
  avgBill?: number; // ₹ per guest; drives the cost tiles
  benefits?: { lead: string; text: string }[];
}

// The cost tiles: Google doesn't publish search volumes, so these are an
// estimate from fixed assumptions plus the restaurant's average bill.
export const SEO_REPORT_COST_ASSUMPTIONS = {
  searchesPerKeywordAreaPerMonth: 1250,
  shareWhoWouldChoose: 0.05, // of people searching, share who'd pick a #1-ranked place nearby
};

// Default average bill per guest from Google's price level.
export function seoReportDefaultAvgBill(priceLevel?: number): number {
  return ({ 1: 250, 2: 500, 3: 900, 4: 1500 } as Record<number, number>)[priceLevel ?? 0] ?? 500;
}

// Max ticked keywords: the search table must fit on page 1 of the PDF.
export const SEO_REPORT_MAX_INCLUDED_KEYWORDS = 8;

export interface SeoReport {
  id: string;
  restaurant: SeoReportPlace | null;
  landmark: string; // building or landmark shown in the report ("Sandy's Tower")
  city: string;
  areas: SeoReportArea[];
  keywords: SeoReportKeyword[];
  cells: Record<string, SeoReportCell>; // by seoReportCellKey
  researchedAt?: Date;
  content?: SeoReportContent;
  status: "draft" | "ready";
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
  createdBy: string; // admin phone
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── The rendered report ────────────────────────────────────────────────────
// Exactly what goes into the PDF, block by block. Built by the backend from a
// SeoReport; the admin app shows it as a preview.

export type AuditSeverity = "critical" | "strength";

export interface AuditStatTile {
  severity: AuditSeverity;
  value: string; // "1 of 12", "2.7 km", "₹50 lakh+"
  caption: string;
}

export interface AuditSearchResult {
  rank: number | null; // null = not in the top 20
  topResult: string; // who Google shows first
}

export interface AuditSearchRow {
  query: string;
  results: AuditSearchResult[]; // same order as VisibilityAuditReport.areas
}

export interface AuditCompetitor {
  name: string;
  distance: string; // "400 m", "2.7 km"
  winsFor: string;
}

export interface VisibilityAuditReport {
  restaurant: { name: string; landmark: string; city: string };
  areas: string[];
  capturedOn: Date;
  headline: string;
  scorecard: AuditStatTile[];
  searches: AuditSearchRow[];
  observation: { title: string; body: string };
  checkItYourself: { query: string; area: string; shownInstead: string };
  competitors: AuditCompetitor[];
  costs: AuditStatTile[];
  clientBrands: string[];
  benefits: { lead: string; text: string }[];
  closingLine: string;
  contact: { phone: string; email: string; website: string };
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

export interface SeoReportIdRequest {
  reportId: string;
}

// Over the wire (callable JSON), dates arrive as ISO strings.
export interface PreviewSeoReportResult {
  report: Omit<VisibilityAuditReport, "capturedOn"> & { capturedOn: string };
  avgBill: number; // the one used (edited or the price-level default)
  warnings: string[]; // e.g. keywords not researched yet; generation still possible
  blockers: string[]; // must be fixed before generating the PDF
}

export interface DraftReportNarrativeResult {
  headline: string;
  observationTitle: string;
  observationBody: string;
}

export interface GenerateReportPdfResult {
  url: string;
}
