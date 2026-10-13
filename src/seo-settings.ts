// Lightweight, frontend-only heuristic for labeling purposes — mirrors the
// restaurant substrings the backend's detectCategory() uses (profile-audit.ts)
// closely enough for a UI label, without duplicating its full category logic.
const FOOD_CATEGORY_SUBSTRINGS = [
  "restaurant", "café", "cafe", "food", "bakery", "pizza", "burger",
  "caterer", "dining", "biryani", "dhaba", "kitchen", "sweets", "juice",
];
export function isFoodCategory(primaryCategory: string): boolean {
  const lower = primaryCategory.toLowerCase();
  return FOOD_CATEGORY_SUBSTRINGS.some((sub) => lower.includes(sub));
}

// UI label for SeoSettings.signatureDishes — "dishes" only makes sense for F&B.
export function signatureItemsLabel(isFoodBusiness: boolean): string {
  return isFoodBusiness ? "Signature Dishes" : "Signature Offerings";
}

export interface ActualKeyword {
  keyword: string;
  impressions: number;
}

export interface SuggestedKeyword {
  keyword: string;
  type: "gap" | "benchmark";
  rationale: string;
}

export interface KeywordResearch {
  actualKeywords: ActualKeyword[];
  suggestedKeywords: SuggestedKeyword[];
  researchedAt: any; // Firestore Timestamp
}

export interface SeoSettings {
  locationId: string;
  accountId: string;
  bataoStoreId?: string;
  replyTone: string;
  keywords: string[];
  // Named for restaurants, but vertical-agnostic: signature dishes for F&B,
  // signature offerings (standout services/products/programs) for every other
  // category. Name kept to avoid a data migration — label it via
  // signatureItemsLabel() rather than assuming "dishes".
  signatureDishes: string[];
  nearbyLocations: string[];
  contactInfo: { email: string; phone: string };
  signature: string;
  name: string;
  // Specific neighborhood/area, admin-entered — preferred over GMB's often
  // city-broad profile.address.locality in AI-generated content.
  locationName?: string;
  // Static default CTA for new posts — auto-fills the URL when a generated
  // post's AI-suggested action type matches; admin can still override per post.
  defaultCta?: { actionType: string; url?: string };
  // Automated posts rotate least-recently-used among these instead of always
  // using defaultCta. Falls back to [defaultCta] as a single-item pool when
  // unset, so existing locations see no behavior change.
  postCtaOptions?: Array<{ actionType: string; url?: string }>;
  keywordResearch?: KeywordResearch;
  targetKeywords?: string[];
  sellerSuggestedKeywords?: string[];
  usage?: Record<string, number>;
  // Google Maps Place ID (ChIJ...) — used to pull rank scans from Local Falcon
  localFalconPlaceId?: string;
  // Batao management start date — reviews before this are excluded from SLA and seller view
  bataoStartDate?: string; // ISO date "YYYY-MM-DD"
  // Summary fields — maintained by backend cron + write hooks
  unrepliedReviewCount?: number;
  lastPostAt?: any;   // Firestore Timestamp
  lastReplyAt?: any;
  summaryUpdatedAt?: any;
  // Star rating at/below which a review is treated as negative for
  // classification + templated-response purposes. Default 3.
  negativeStarThreshold?: number;

  // ── Response Style ──────────────────────────────────────────────────────────
  greetingStyle?: "Hi" | "Hello" | "Dear" | "Custom";
  customGreetings?: string[];
  responseLength?: "Short" | "Medium" | "Long";
  // Separate length control for negative replies — defaults to "Short".
  negativeResponseLength?: "Short" | "Medium" | "Long";
  // How the reviewer is addressed in the greeting — "name" runs the
  // extracted-name logic, "custom" uses customAddressTemplate verbatim.
  addressReviewerMode?: "name" | "custom";
  customAddressTemplate?: string;
  phraseBanks?: {
    opening: string[];
    closing: string[];
    apology: string[];
    contact: string[];
  };

  // ── SEO content dosage — how many rotated items to use per response ─────────
  seoDosage?: {
    keywordsCount: number;
    dishesCount: number;
    nearbyLocationsCount: number;
  };

  // ── Automation ────────────────────────────────────────────────────────────
  autoPublishEnabled?: boolean;
  // Minimum minutes after a review posts before the automated poll will
  // auto-publish a reply to it. Default 5. Only applies when autoPublishEnabled
  // is true.
  autoReplyDelayMinutes?: number;
  exclusionRules?: {
    excludeNegative: boolean;
    excludeRatingOnly: boolean;
    excludeDuplicate: boolean;
    excludeEmpty: boolean;
    excludeAlreadyResponded: boolean;
  };
  spamBurstThreshold?: {
    count: number;
    windowMinutes: number;
  };

  // ── Post Automation ────────────────────────────────────────────────────────
  // When true, a scheduled cron generates AND publishes GBP posts on its own
  // (no manual instruction) at the cadence below. Default false.
  postAutomationEnabled?: boolean;
  // Weekly posting cadence. Default 2, minimum 2.
  postsPerWeek?: number;
}

export const REPLY_TONE_OPTIONS = [
  "Warm",
  "Friendly",
  "Professional",
  "Formal",
  "Empathetic",
  "Casual",
] as const;

const DEFAULT_PHRASE_BANKS = { opening: [], closing: [], apology: [], contact: [] };
const DEFAULT_SEO_DOSAGE = { keywordsCount: 4, dishesCount: 5, nearbyLocationsCount: 6 };
const DEFAULT_EXCLUSION_RULES = {
  excludeNegative: false,
  excludeRatingOnly: false,
  excludeDuplicate: false,
  excludeEmpty: false,
  excludeAlreadyResponded: false,
};
// 8+ negative reviews inside 15 minutes is a genuine anomaly (review-bombing,
// a bad batch, etc.) — a handful across an hour is just normal traffic for an
// active location and shouldn't trip this.
const DEFAULT_SPAM_BURST_THRESHOLD = { count: 8, windowMinutes: 15 };
const DEFAULT_AUTO_REPLY_DELAY_MINUTES = 5;
const DEFAULT_POSTS_PER_WEEK = 2;

export function defaultSeoSettings(locationId: string, accountId: string): SeoSettings {
  return {
    locationId,
    accountId,
    bataoStoreId: "",
    replyTone: "Warm",
    keywords: [],
    signatureDishes: [],
    nearbyLocations: [],
    contactInfo: { email: "", phone: "" },
    signature: "Warm regards,",
    name: "",
    bataoStartDate: "2026-01-01",
    negativeStarThreshold: 3,
    greetingStyle: "Hi",
    customGreetings: [],
    responseLength: "Medium",
    negativeResponseLength: "Short",
    addressReviewerMode: "name",
    customAddressTemplate: "",
    phraseBanks: DEFAULT_PHRASE_BANKS,
    seoDosage: DEFAULT_SEO_DOSAGE,
    autoPublishEnabled: false,
    autoReplyDelayMinutes: DEFAULT_AUTO_REPLY_DELAY_MINUTES,
    exclusionRules: DEFAULT_EXCLUSION_RULES,
    spamBurstThreshold: DEFAULT_SPAM_BURST_THRESHOLD,
    postAutomationEnabled: false,
    postsPerWeek: DEFAULT_POSTS_PER_WEEK,
  };
}

// Spreads `raw` through first so fields this file doesn't know about yet
// (written by the backend or a newer deploy) survive a read→save round-trip
// instead of being silently dropped — only fields that need a default or
// normalized shape are overridden below.
export function normalizeSeoSettings(raw: Partial<SeoSettings>, docId?: string): SeoSettings {
  return {
    ...raw,
    locationId:   raw.locationId   ?? docId ?? "",
    accountId:    raw.accountId    ?? "",
    replyTone:    raw.replyTone    ?? "Warm",
    keywords:     raw.keywords     ?? [],
    signatureDishes:  raw.signatureDishes  ?? [],
    nearbyLocations:  raw.nearbyLocations  ?? [],
    contactInfo: {
      email: raw.contactInfo?.email ?? "",
      phone: raw.contactInfo?.phone ?? "",
    },
    signature:           raw.signature           ?? "Warm regards,",
    name:                raw.name                ?? "",
    bataoStartDate:      raw.bataoStartDate ?? "2026-01-01",
    negativeStarThreshold: raw.negativeStarThreshold ?? 3,
    greetingStyle:       raw.greetingStyle ?? "Hi",
    customGreetings:     raw.customGreetings ?? [],
    responseLength:      raw.responseLength ?? "Medium",
    negativeResponseLength: raw.negativeResponseLength ?? "Short",
    addressReviewerMode: raw.addressReviewerMode ?? "name",
    customAddressTemplate: raw.customAddressTemplate ?? "",
    phraseBanks:         raw.phraseBanks ?? DEFAULT_PHRASE_BANKS,
    seoDosage:           raw.seoDosage ?? DEFAULT_SEO_DOSAGE,
    autoPublishEnabled:  raw.autoPublishEnabled ?? false,
    autoReplyDelayMinutes: raw.autoReplyDelayMinutes ?? DEFAULT_AUTO_REPLY_DELAY_MINUTES,
    exclusionRules:      raw.exclusionRules ?? DEFAULT_EXCLUSION_RULES,
    spamBurstThreshold:  raw.spamBurstThreshold ?? DEFAULT_SPAM_BURST_THRESHOLD,
    postAutomationEnabled: raw.postAutomationEnabled ?? false,
    postsPerWeek:        raw.postsPerWeek ?? DEFAULT_POSTS_PER_WEEK,
  };
}
