// SEO Growth hack: outbound WhatsApp outreach to restaurants that rank 4–20
// for a keyword in a cluster (city area). Everything lives under the single
// top-level `seo-growth` collection:
//
//   seo-growth/config                                        GrowthConfig
//   seo-growth/data/clusters/{clusterId}                     GrowthCluster
//   seo-growth/data/campaigns/{campaignId}                   GrowthCampaign
//   seo-growth/data/campaigns/{campaignId}/targets/{placeId} GrowthTarget
//   …/targets/{placeId}/events/{eventId}                     GrowthTargetEvent
//   seo-growth/data/contacts/{placeId}                       GrowthContact (global de-dup)
//   seo-growth/data/opt-outs/{phoneE164}                     GrowthOptOut
//   seo-growth/data/links/{token}                            GrowthLink
//   seo-growth/data/conversations/{phoneE164}                GrowthConversation
//   …/conversations/{phoneE164}/messages/{msgId}             GrowthMessage

export interface GrowthConfig {
  storeId: string; // internal store whose waSettings send the messages
  wabaId: string; // routes inbound messages / statuses to the growth module
  templates: { initial: string; reminder: string; reminderClicked: string };
  dailyCap: number;
  sendWindowIST: { startHour: number; endHour: number };
  reminderDays: number[]; // days after first send, e.g. [5, 12, 21]
  coldAfterDays: number;
  linkBaseUrl: string; // tracked link prefix, token appended
}

export const DEFAULT_GROWTH_CONFIG: Omit<GrowthConfig, "wabaId" | "templates"> = {
  storeId: "rFrSFQ8l1J1drIQvZs20",
  dailyCap: 50,
  sendWindowIST: { startHour: 11, endHour: 19 },
  reminderDays: [5, 12, 21],
  coldAfterDays: 30,
  linkBaseUrl: "https://batao.ai/g/",
};

export interface LatLng {
  lat: number;
  lng: number;
}

// A market is what a cluster's `city` refers to: one restaurant market that
// can span several municipal cities (Delhi NCR = Delhi + Gurugram + Noida).
export interface GrowthMarket {
  id: string;
  name: string;
  // Bounding box the cluster grid is laid over.
  bounds: { south: number; west: number; north: number; east: number };
  // Reverse-geocoded `locality` values a cell must fall in to be kept, so the
  // box's corners don't pull in neighbouring cities (Faridabad, Ghaziabad…).
  localities: string[];
}

export const GROWTH_MARKETS: GrowthMarket[] = [
  {
    id: "bangalore",
    name: "Bangalore",
    bounds: { south: 12.82, west: 77.45, north: 13.15, east: 77.8 },
    localities: ["Bengaluru", "Bangalore"],
  },
  {
    id: "delhi-ncr",
    name: "Delhi NCR",
    bounds: { south: 28.38, west: 76.95, north: 28.88, east: 77.48 },
    localities: ["New Delhi", "Delhi", "Gurugram", "Gurgaon", "Noida"],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    bounds: { south: 17.28, west: 78.28, north: 17.56, east: 78.62 },
    localities: ["Hyderabad", "Secunderabad"],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    bounds: { south: 18.89, west: 72.77, north: 19.3, east: 73.13 },
    localities: ["Mumbai", "Thane", "Navi Mumbai"],
  },
  {
    id: "chennai",
    name: "Chennai",
    bounds: { south: 12.88, west: 80.13, north: 13.18, east: 80.32 },
    localities: ["Chennai"],
  },
  {
    id: "kolkata",
    name: "Kolkata",
    bounds: { south: 22.45, west: 88.25, north: 22.66, east: 88.5 },
    localities: ["Kolkata", "Bidhannagar", "New Town"],
  },
];

// Dense cores get small clusters so the restaurants in one really compete for
// the same "near me" search; suburbs need a wider circle to find enough.
export type GrowthClusterTier = "dense" | "suburban";

export const GROWTH_CLUSTER_RADIUS_METERS: Record<GrowthClusterTier, number> = {
  dense: 1500,
  suburban: 3000,
};

// A cell needs at least this many restaurants to be worth a campaign
// (3 competitors + targets). Places returns at most 20 per search, so for
// dense cells this is "the search came back full".
export const GROWTH_MIN_RESTAURANTS_PER_CLUSTER = 20;

export interface GrowthCluster {
  id: string;
  city: string; // market name, e.g. "Delhi NCR"
  marketId?: string;
  area: string; // neighbourhood, from reverse geocoding; admin can rename
  locality?: string; // municipal city, e.g. "Gurugram"
  center: LatLng;
  radiusMeters: number;
  tier?: GrowthClusterTier;
  restaurantCount?: number; // distinct restaurants found when generated (capped at 20 for dense)
  source: "grid" | "manual";
  categories?: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_CLUSTER_RADIUS_METERS = GROWTH_CLUSTER_RADIUS_METERS.suburban;

const slug = (s: string) =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Manually added clusters: one per city + area.
export function growthClusterId(city: string, area: string): string {
  return `${slug(city)}-${slug(area)}`;
}

// Grid clusters: keyed by grid position, so re-running the generator for a
// market finds the same ids and skips them instead of duplicating.
export function growthGridClusterId(
  marketId: string,
  tier: GrowthClusterTier,
  row: number,
  col: number,
): string {
  return `${marketId}-${tier === "dense" ? "d" : "s"}-${row}-${col}`;
}

export interface GenerateClusterGridRequest {
  marketId: string;
  dryRun?: boolean;
}

export interface GenerateClusterGridResult {
  marketId: string;
  probes: number; // Places Nearby + Geocoding calls made
  dense: number;
  suburban: number;
  droppedSparse: number; // suburban cells with too few restaurants
  droppedOutside: number; // cells outside the market's localities
  created: number; // on a dry run: how many would be created
  skippedExisting: number;
  dryRun: boolean;
}

export type GrowthCampaignStatus =
  | "generating"
  | "draft"
  | "approved"
  | "running"
  | "done"
  | "failed";

export interface GrowthSearchSnapshot {
  query: string;
  center: LatLng;
  radiusMeters: number;
  provider: "places_v1_searchtext"; // Places API (New), locationRestriction = hard limit
  ranAt: Date;
}

export interface GrowthCompetitor {
  rank: number; // 1–3
  placeId: string;
  name: string;
  rating?: number;
  reviews?: number;
}

export interface GrowthCampaignCounts {
  targets: number;
  excluded: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  notOnWhatsapp: number;
  clicked: number;
  enquired: number;
  replied: number;
  optedOut: number;
  cold: number;
}

export function createEmptyGrowthCounts(): GrowthCampaignCounts {
  return {
    targets: 0,
    excluded: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
    notOnWhatsapp: 0,
    clicked: 0,
    enquired: 0,
    replied: 0,
    optedOut: 0,
    cold: 0,
  };
}

export interface GrowthCampaign {
  id: string;
  clusterId: string;
  clusterLabel: string; // "Koramangala, Bangalore", copied at creation
  keyword: string;
  search: GrowthSearchSnapshot; // frozen at generate time
  competitors: GrowthCompetitor[];
  status: GrowthCampaignStatus;
  counts: GrowthCampaignCounts; // backend-only increments
  error?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  approvedAt?: Date;
}

export type PhoneSource = "places" | "website_wa" | "website" | "vendor" | "manual";
export type PhoneType = "mobile" | "fixed_line" | "unknown";

export interface PhoneCandidate {
  phone: string; // E.164
  source: PhoneSource;
  type: PhoneType;
}

// Furthest funnel point reached; only ever moves forward.
export type GrowthTargetStage =
  | "pending"
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "clicked"
  | "enquired";

export const GROWTH_STAGE_ORDER: GrowthTargetStage[] = [
  "pending",
  "queued",
  "sent",
  "delivered",
  "read",
  "clicked",
  "enquired",
];

export function isLaterGrowthStage(next: GrowthTargetStage, current: GrowthTargetStage): boolean {
  return GROWTH_STAGE_ORDER.indexOf(next) > GROWTH_STAGE_ORDER.indexOf(current);
}

export type GrowthTargetOutcome =
  | "active"
  | "excluded"
  | "already_contacted"
  | "no_phone"
  | "not_on_whatsapp"
  | "failed"
  | "opted_out"
  | "cold"
  | "converted";

export interface GrowthTarget {
  placeId: string;
  campaignId: string;
  rank: number; // 4–20
  name: string;
  address?: string;
  rating?: number;
  reviews?: number;
  website?: string;
  phone?: string; // E.164, the number we message
  phoneSource?: PhoneSource;
  phoneType?: PhoneType;
  phoneCandidates?: PhoneCandidate[];
  existingClientStoreId?: string;
  stage: GrowthTargetStage;
  outcome: GrowthTargetOutcome;
  active: boolean; // true while reminders may still fire
  linkToken: string;
  firstSentAt?: Date;
  lastSentAt?: Date;
  remindersSent: number;
  nextReminderAt?: Date | null;
  coldAt?: Date;
  firstClickAt?: Date;
  clickCount: number;
  enquiryId?: string;
  lastReplyAt?: Date;
  lastMsgId?: string;
}

export type GrowthEventType =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "not_on_whatsapp"
  | "reminder_sent"
  | "clicked"
  | "enquired"
  | "replied"
  | "admin_replied"
  | "opted_out"
  | "cold";

export interface GrowthTargetEvent {
  type: GrowthEventType;
  at: Date;
  msgId?: string;
  meta?: Record<string, unknown>;
}

export interface GrowthContact {
  placeId: string;
  phone?: string;
  campaignId: string;
  firstContactAt: Date;
}

export interface GrowthOptOut {
  phone: string;
  placeId?: string;
  campaignId?: string;
  at: Date;
  source: "button" | "text" | "admin";
}

export interface GrowthLink {
  token: string;
  campaignId: string;
  placeId: string;
  createdAt: Date;
}

export interface GrowthConversation {
  phone: string;
  placeId: string;
  campaignId: string;
  restaurantName: string;
  lastMessageAt: Date;
  lastInboundAt?: Date; // free-text replies allowed until lastInboundAt + 24h
  lastMessagePreview: string;
  unreadCount: number;
  status: "open" | "closed";
}

export const GROWTH_SESSION_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface GrowthMessage {
  msgId: string;
  direction: "in" | "out";
  kind: "template" | "text" | "button";
  body: string;
  templateName?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  sentBy?: string; // admin phone, or "system"
  at: Date;
}

export type EnquiryRole = "owner" | "manager" | "staff";

// Optional fields added to the existing `enquiries` doc for growth enquiries.
export interface EnquiryGrowthFields {
  role?: EnquiryRole;
  growthCampaignId?: string;
  growthPlaceId?: string;
}
