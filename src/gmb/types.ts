import { Timestamp } from "../timestamp";

export interface StorefrontAddress {
  languageCode: string;
  locality: string;
  regionCode: string;
  administrativeArea: string;
  addressLines: string[];
  postalCode: string;
}

export interface GmbCategory {
  displayName: string;
  name: string; // e.g. "categories/gcid:vegetarian_restaurant"
}

export interface GmbCategories {
  primaryCategory: GmbCategory;
  additionalCategories?: GmbCategory[];
}

// Raw response from Google API (has verbose moreHoursTypes etc)
export interface RawGmbLocation {
  name: string; // "locations/3412905380578233117"
  title: string; // "Maverick Jodhpur"
  storefrontAddress: StorefrontAddress;
  categories: GmbCategories;
}

// Clean version we store and use in our app
export interface GmbLocation {
  locationId: string; // "3412905380578233117"
  locationName: string; // "locations/3412905380578233117" (needed for API calls)
  accountId: string; // "104419111256970197924" (numeric part of accounts/...)
  title: string; // "Maverick Jodhpur"
  primaryCategory: string; // "Vegetarian restaurant"
  additionalCategories: string[]; // ["Restaurant", "Bar & grill", ...]
  address: {
    line: string; // "Hotel Residency Palace, near Senapati Bhawan, Ratanada"
    locality: string; // "Jodhpur"
    state: string; // "Rajasthan"
    postalCode: string;
  };
}

export interface ListLocationsResponse {
  locations: GmbLocation[];
  nextPageToken?: string;
}

export interface GmbAccount {
  name: string; // "accounts/104419111256970197924"
  accountName: string; // "Batao SEO"
  type: string;
}

export interface GmbHoursTimePeriod {
  openDay: string;  // "MONDAY", "TUESDAY", etc.
  openTime: { hours: number; minutes: number };
  closeDay: string;
  closeTime: { hours: number; minutes: number };
}

export interface GbpAttributeMetadata {
  parent: string;           // "attributes/serves_lunch" — the attribute ID with prefix
  displayName: string;
  groupDisplayName: string;
  valueType: "BOOL" | "URL" | "ENUM" | "REPEATED_ENUM";
  deprecated?: boolean;
}

export interface GbpAttribute {
  name: string;
  valueType?: "BOOL" | "URL" | "ENUM" | "REPEATED_ENUM";
  values?: any[];
  uriValues?: Array<{ uri: string }>;
  repeatedEnumValue?: {
    setValues: string[];    // enum values the user set to "Yes"
    unsetValues: string[];  // enum values the user set to "No"
  };
}

export interface GmbLocationProfile {
  title: string;
  primaryCategory: string;
  primaryCategoryGcid?: string;  // e.g. "categories/gcid:vegetarian_restaurant"
  description?: string;
  address: { line: string; locality: string; state: string; postalCode: string };
  websiteUri?: string;
  primaryPhone?: string;
  regularHours?: GmbHoursTimePeriod[];
  latlng?: { latitude: number; longitude: number };
  attributes?: GbpAttribute[];
  openingDate?: string; // ISO "YYYY-MM-DD" parsed from GBP's { year, month, day } object
  menuUrl?: string;     // from attributes/url_menu uriValues[0].uri
  photoCount?: number;  // total media items from v4 /media endpoint
}


export interface ActualKeyword {
  keyword: string;
  impressions: number;  // may be a threshold lower-bound when Google withholds exact count
}

export interface SuggestedKeyword {
  keyword: string;
  type: "gap" | "benchmark";
  rationale: string;
}

export interface KeywordResearch {
  actualKeywords: ActualKeyword[];
  suggestedKeywords: SuggestedKeyword[];
  researchedAt: Timestamp;
}

export interface SeoSettings {
  locationId: string;
  accountId: string;
  bataoStoreId?: string;
  replyTone: string;
  keywords: string[];
  // Named for restaurants, but vertical-agnostic: signature dishes for F&B
  // (detectCategory id "restaurant"), signature offerings — standout
  // services/products/programs — for every other category (salons, clinics,
  // education, finance…). Name kept to avoid a data migration; UI labels and
  // prompts must branch on category rather than assume "dishes".
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
  defaultCta?: { actionType: GmbPostActionType; url?: string };
  // Automated posts rotate least-recently-used among these instead of always
  // using defaultCta. Falls back to [defaultCta] as a single-item pool when
  // unset, so existing locations see no behavior change.
  postCtaOptions?: Array<{ actionType: GmbPostActionType; url?: string }>;
  // Keyword research — populated by admin via runKeywordResearch callable
  keywordResearch?: KeywordResearch;
  // Target keywords — set by admin, used by all AI generation
  targetKeywords?: string[];
  // Keyword suggestions submitted by seller — admin reads these during manual research
  sellerSuggestedKeywords?: string[];
  // Usage counters for rate limiting — keys like "descOpt_2026-05-28", "descOpt_2026-05"
  usage?: Record<string, number>;
  // Google Maps Place ID (ChIJ...) used to pull rank scan data from Local Falcon
  localFalconPlaceId?: string;
  // Batao management start date — reviews before this date are excluded from SLA and seller view
  bataoStartDate?: string; // ISO date "YYYY-MM-DD", default "2026-01-01"
  // Summary fields — maintained by dailyCacheRefresh cron + write hooks
  unrepliedReviewCount?: number;
  lastPostAt?: Timestamp | null;
  lastReplyAt?: Timestamp | null;
  summaryUpdatedAt?: Timestamp;
  // Performance insights cache — refreshed at most once per 24 hours
  insightsCache?: {
    data: Record<string, any>;
    fetchedAt: Timestamp;
  };
  // Star rating at/below which a review is treated as negative for
  // classification + templated-response purposes. Default 3 (mirrors the
  // legacy hardcoded `stars < 4` split in buildRichPrompt).
  negativeStarThreshold?: number;

  // ── Response Style ──────────────────────────────────────────────────────────
  greetingStyle?: "Hi" | "Hello" | "Dear" | "Custom";
  // Rotation pool used when greetingStyle === "Custom"
  customGreetings?: string[];
  // Short = 1 phrase, Medium = 2, Long = 3 — controls reply length target
  responseLength?: "Short" | "Medium" | "Long";
  // Separate length control for negative replies — defaults to "Short"
  // (unlike the general responseLength's "Medium" default), since a longer
  // negative reply reads as over-explaining rather than resolving.
  negativeResponseLength?: "Short" | "Medium" | "Long";
  // How the reviewer is addressed in the greeting. "name" runs the extracted-
  // name logic (extractFirstName); "custom" uses customAddressTemplate
  // verbatim instead (e.g. "valued guest") — different restaurants prefer
  // different defaults here rather than a single hardcoded "Dear Guest".
  addressReviewerMode?: "name" | "custom";
  customAddressTemplate?: string;
  phraseBanks?: {
    opening: string[];
    closing: string[];
    apology: string[];
    contact: string[];
  };

  // ── SEO content dosage — how many rotated items to use per response ─────────
  // Defaults mirror the legacy hardcoded slice sizes so existing locations see
  // no behavior change until an admin adjusts them.
  seoDosage?: {
    keywordsCount: number; // legacy default: 4
    dishesCount: number; // legacy default: 5
    nearbyLocationsCount: number; // legacy default: unbounded (all)
  };

  // ── Automation ────────────────────────────────────────────────────────────
  // When true, the automated poll generates AND publishes replies without
  // human approval (subject to exclusionRules below). Default false — every
  // location stays on the manual generate→review→approve flow until an admin
  // explicitly opts it in.
  autoPublishEnabled?: boolean;
  // Minimum time (in minutes) after a review is posted before the automated
  // poll will auto-publish a reply to it — an instant reply reads as
  // obviously automated. Default 5. Only applies when autoPublishEnabled is
  // true; manual generate→review→approve is unaffected since a human is
  // already in the loop before anything goes out.
  autoReplyDelayMinutes?: number;
  exclusionRules?: {
    excludeNegative: boolean;
    excludeRatingOnly: boolean;
    excludeDuplicate: boolean;
    excludeEmpty: boolean;
    excludeAlreadyResponded: boolean;
  };
  // If this many (or more) negative reviews arrive within windowMinutes,
  // auto-publish holds that batch instead of publishing it automatically.
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

  // ── Automation health (written by the backend) ────────────────────────────
  // Set when Google answers 404/403 for this location (our account lost
  // manager access, or the listing was moved/deleted). Polling continues and
  // the field is removed once a call succeeds again.
  accessLost?: { at: Timestamp; status?: number };
  // Set when Google rejects OFFER posts for this location ("Creating Offer and
  // Product posts is not enabled"). Automated posts then use STANDARD.
  offerPostsUnsupported?: boolean;
}

// ── Post automation (automated GBP posting pipeline) ──────────────────────────

// The topic the decision engine picked for a given auto-generated post.
// "question" is kept only so old post-history rows still render a proper
// label — the decision engine no longer produces it (dropped in the
// from-scratch content-source redesign in favor of a richer, flat type list).
export type PostMode =
  | "offer"
  | "membership"
  | "referral"
  | "rewards-catalog"
  | "social-offers"
  | "occasion-offers"
  | "question"
  | "keywords"
  | "keywords-locations"
  | "keywords-locations-dish"
  | "photo-dish"
  | "photo-offer"
  | "photo-festival"
  | "photo-other"
  | "photo-ambiance";

// The tone the decision engine picked, rotated so it never repeats the
// immediately-previous post's style.
export type PostStyle = "warm" | "witty" | "informative" | "question" | "curiosity";

// One doc per auto-generated+published post — the decision engine's memory.
// Google's Local Posts API has no concept of "why" a post was written, so
// this is what every freshness/rotation/repetition check reads from.
export interface PostHistoryEntry {
  mode: PostMode;
  style: PostStyle;
  itemUsed?: string; // dish name, or the offer/loyalty source's id
  summary: string; // the published text — shown in the admin activity view
  postedAt: Timestamp;
  gmbPostName: string; // Google's post resource name
  slotId: string;
  truncated?: boolean; // set if gracefulTruncate had to trim an over-limit regen
  deleted?: boolean; // set by deletePost when the underlying Google post is removed
  edited?: boolean; // set by editPost when the text has changed since publish
  ctaActionType?: string; // which CTA (if any) was attached — lets rotation avoid immediate repeats
  flagged?: boolean; // set when still too similar to a recent post after one regenerate attempt
  mediaUrl?: string; // media bank image attached, if any
  mediaId?: string; // media bank item id — older entries only have mediaUrl
}

// ── Media bank ─────────────────────────────────────────────────────────────────

export type MediaCategory = "dish" | "offer" | "ambience" | "festival" | "other";

export interface MediaBankItem {
  id: string;
  url: string;
  storagePath: string; // lets deletion also reclaim the actual Storage object
  category: MediaCategory;
  uploadedAt: Timestamp;
  uploadedBy?: string;
  // One-time Claude vision extraction at upload, cached forever — never
  // re-extracted at generation/simulation time. This is the sole content
  // source for photo-bank posts (see decidePostTopic's photo-* modes) —
  // admin-editable via updateMediaBankItemBlurb since the AI's first read
  // may need a correction.
  visualDescription?: string;
  // Saved SEO keywords this photo suits — lets keyword-mode posts attach it.
  // Only dish/ambience/other (offer/festival posters are time-bound).
  keywords?: string[];
  // Set when the photo's URL returns 404/410. Post generation skips it; an
  // admin deletes and re-uploads it.
  brokenAt?: Timestamp;
  brokenReason?: string;
}

// One doc per ISO week (e.g. "2026-W39") so a week's slots are read/written
// atomically rather than as N separate docs.
export interface PostScheduleSlot {
  slotId: string;
  scheduledFor: Timestamp;
  fired: boolean;
}

export interface PostScheduleDoc {
  slots: PostScheduleSlot[];
}

// One doc per skipped/problem slot — the automated pipeline has plenty of
// "silently fall back to something else" edge cases (Step 6 of the CS spec)
// that are fine to self-heal from, but still worth an admin being able to
// see rather than only a Cloud Logging line nobody's watching.
export type PostAutomationIssueReason = "nothing-configured" | "incomplete-offer" | "publish-failed";

export interface PostAutomationIssue {
  slotId: string;
  occurredAt: Timestamp;
  reason: PostAutomationIssueReason;
  detail?: string;
  // Extra diagnostic context, populated when a draft was successfully
  // decided before the issue happened (i.e. not for "nothing-configured",
  // where nothing was drafted yet) — otherwise a failure like "Internal
  // error encountered." is undiagnosable without a Cloud Logging dig.
  mode?: PostMode;
  topicType?: GmbPostTopicType;
  mediaUrl?: string;
  summary?: string;
  // Raw error payload from the GMB API (e.g. { code, message, status }),
  // stringified — only set for "publish-failed", where the flattened
  // `detail` message alone (often just "Internal error encountered.") gives
  // no actionable detail.
  rawError?: string;

  // ── Resolution (admin Failures view: retry / dismiss) ─────────────────────
  // Set once the issue is closed. "retry-failed" means the retry recorded a
  // new issue for the same slot.
  resolvedAt?: Timestamp;
  resolution?: PostIssueResolution;
  resolvedBy?: string | null; // admin phone
  // Lock against a double-clicked retry posting twice (cleared if skipped)
  retryStartedAt?: Timestamp;
  retryError?: string;
  retryPostName?: string; // GMB post name created by a successful retry
}

export type PostIssueResolution = "retried" | "retry-failed" | "dismissed" | "already-posted";

// ── Review classification (automated response pipeline) ──────────────────────

export type ReviewCategory =
  | "positive"
  | "price_expensive"
  | "food_quality_taste"
  | "service"
  | "staff_behaviour"
  | "ambience"
  | "wait_time"
  | "billing_payment"
  | "rating_only"
  | "other";

// Which of the 4 negative-response templates a negative review routes to.
// Only set when the review's star rating is at/below negativeStarThreshold.
export type NegativeSubType =
  | "price-expensive"
  | "food-quality"
  | "other-negative"
  | "rating-only-negative";

export interface GmbReviewReply {
  comment: string;
  updateTime: string;
}

export interface GmbReviewer {
  profilePhotoUrl: string;
  displayName: string;
  isAnonymous?: boolean;
}

export type GmbStarRating = "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";

export interface GmbReview {
  name: string; // "accounts/.../locations/.../reviews/..."
  reviewId: string;
  reviewer: GmbReviewer;
  starRating: GmbStarRating;
  comment?: string;
  createTime: string; // ISO 8601
  updateTime: string;
  reviewReply?: GmbReviewReply;
}

export type GmbPostTopicType = "STANDARD" | "EVENT" | "OFFER" | "ALERT";
export type GmbPostState = "LIVE" | "REJECTED" | "PROCESSING" | "DELETED";
export type GmbPostActionType =
  | "ACTION_TYPE_UNSPECIFIED"
  | "BOOK"
  | "ORDER"
  | "SHOP"
  | "LEARN_MORE"
  | "SIGN_UP"
  | "CALL";

export interface GmbSimpleDate {
  year: number;
  month: number;
  day: number;
}

export interface GmbPostEventSchedule {
  startDate: GmbSimpleDate;
  endDate: GmbSimpleDate;
}

export interface CreatePostRequest {
  accountId: string;
  locationId: string;
  summary: string;
  topicType: GmbPostTopicType;
  callToAction?: {
    actionType: GmbPostActionType;
    url?: string;
  };
  event?: {
    title: string;
    schedule: GmbPostEventSchedule;
  };
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
  };
  mediaUrls?: string[];
}

export interface GmbLocalPost {
  name: string; // "accounts/.../locations/.../localPosts/..."
  postId: string;
  topicType: GmbPostTopicType;
  summary?: string;
  state: GmbPostState;
  createTime: string;
  updateTime: string;
  callToAction?: {
    actionType: GmbPostActionType;
    url?: string;
  };
  media?: Array<{
    mediaFormat: "PHOTO" | "VIDEO";
    sourceUrl?: string;
    googleUrl?: string;
  }>;
  event?: {
    title: string;
    schedule?: {
      startDate?: { year: number; month: number; day: number };
      endDate?: { year: number; month: number; day: number };
    };
  };
  offer?: {
    couponCode?: string;
    redeemOnlineUrl?: string;
    termsConditions?: string;
  };
}

// ── Activity log types ────────────────────────────────────────────────────────
// Stored under seo-settings/{locationId}/activities/{autoId}

export type ReplyQueueStatus = "generating" | "draft" | "published" | "failed" | "excluded" | "held";

// Which SeoSettings.exclusionRules toggle caused a review to be excluded from
// the automated flow — surfaced in the Reply Queue UI so an admin can see why.
export type ExclusionReason =
  | "negative"
  | "rating-only"
  | "duplicate"
  | "empty"
  | "already-responded"
  | "spam-burst-discarded";

export interface ReplyQueueItem {
  reviewId: string;
  accountId: string;
  reviewer: GmbReviewer;
  starRating: GmbStarRating;
  comment?: string;
  createTime: string;
  generatedReply?: string;
  status: ReplyQueueStatus;
  generatedAt?: Timestamp;
  publishedAt?: Timestamp;
  error?: string;
  // Set by the AI generation step alongside generatedReply.
  reviewCategory?: ReviewCategory;
  // Only set when reviewCategory implies a negative review (star rating at/below
  // SeoSettings.negativeStarThreshold) — selects which of the 4 negative templates was used.
  negativeSubType?: NegativeSubType;
  // Only set when status === "excluded"
  excludedReason?: ExclusionReason;
  // Only set when status === "held" — groups a spam-burst batch so the whole
  // group can be released or discarded together.
  heldBatchId?: string;
  // Computed once at first publish: (publishedAt - createTime) in minutes.
  // Not recomputed on later edits.
  responseTimeMinutes?: number;
  // A "failed" item an admin dismissed in the Failures view. Status stays
  // "failed"; only the cross-location Failures list hides it.
  dismissedAt?: Timestamp;
  dismissedBy?: string | null; // admin phone
}

// Who/what performed an activity — admin (by phone, since admin login is
// phone-based and carries no email claim), seller (by storeId), or
// unattended automation (e.g. cron jobs).
export type ActivityAuthor =
  | { type: "admin"; phone: string }
  | { type: "seller"; storeId: string }
  | { type: "automation"; source: string };

export interface GmbReviewReplyActivity {
  type: "review_reply";
  accountId: string;
  reviewId: string;
  replyText: string;
  mode: "manual" | "auto";
  author: ActivityAuthor;
  // Optional review context — populated when available
  reviewerName?: string;
  reviewerIsAnonymous?: boolean;
  starRating?: GmbStarRating;
  reviewComment?: string;
}

export interface GmbPostActivity {
  type: "post_published";
  accountId: string;
  summary: string;
  topicType: GmbPostTopicType;
  ctaActionType?: string | null;
  eventTitle?: string | null;
  mediaCount: number;
  author: ActivityAuthor;
}

export interface GmbProfileChange {
  field: string; // stable key, e.g. "description", "cuisines", "wi_fi"
  label: string; // human-readable, e.g. "Description", "Cuisines", "Wi-Fi"
  oldValue: any;
  newValue: any;
}

export interface GmbProfileUpdateActivity {
  type: "profile_update";
  changes: GmbProfileChange[];
  author: ActivityAuthor;
}

export interface GmbReviewReplyEditedActivity {
  type: "review_reply_edited";
  accountId: string;
  reviewId: string;
  oldText: string;
  newText: string;
  author: ActivityAuthor;
}

export type GmbActivity =
  | GmbReviewReplyActivity
  | GmbPostActivity
  | GmbProfileUpdateActivity
  | GmbReviewReplyEditedActivity;

// ── Daily snapshot type ───────────────────────────────────────────────────────
// Stored under seo-settings/{locationId}/snapshots/{YYYY-MM-DD}

export interface GmbDailySnapshot {
  locationId: string;
  accountId: string;
  date: string; // YYYY-MM-DD
  totalReviewCount: number;
  averageRating: number;
  newReviewsSincePrevious?: number;
  newReviewsBreakdown?: { ONE: number; TWO: number; THREE: number; FOUR: number; FIVE: number };
  // ── Reply-queue status counts as of this snapshot (for the analytics dashboard) ──
  respondedCount?: number; // status === "published" — "Responded"/"Published" are the same metric
  pendingCount?: number; // status in draft/generating/held
  excludedCount?: number;
  failedCount?: number;
  avgResponseTimeMinutes?: number | null;
  // Full-period star rating breakdown of published replies (distinct from
  // newReviewsBreakdown, which is only "new since yesterday").
  ratingBreakdown?: { ONE: number; TWO: number; THREE: number; FOUR: number; FIVE: number };
}

export interface LfGridPoint {
  lat: number;
  lng: number;
  rank: number | null;
  found: boolean;
}

export interface LfScanDoc {
  reportKey: string;
  keyword: string;
  gridSize: number;
  scanDate: string; // "YYYY-MM-DD"
  platform: string;
  solv: number;
  arp: number;
  atrp: number | null;
  solvMove: number | null;
  arpMove: number | null;
  gridPoints: LfGridPoint[];
  syncedAt?: Timestamp;
}

export type GmbActivityRecord = GmbActivity & {
  timestamp?: Timestamp;
};
