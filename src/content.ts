/**
 * ============================================================
 * BATAO – REVENUE OS / FOODFEED DATA MODELS
 * ============================================================
 *
 * These models power the immersive buyer feed experience.
 *
 * Design Goals
 * ------------------------------------------------------------
 * - Reuse existing menu items, offers and packages
 * - Support additional content types (events, hygiene etc.)
 * - Generate a dynamic buyer feed automatically
 * - Track buyer engagement for analytics
 * - Enable seller insights dashboards
 * - Keep Firestore writes lightweight
 *
 * ------------------------------------------------------------
 * Firestore Root
 *
 * /stores/{storeId}
 *
 * ============================================================
 */

/**
 * ============================================================
 * CONTENT TYPE
 * ============================================================
 *
 * Every card shown in the buyer feed is represented
 * as a StoreContent.
 *
 * This allows mixing different sources such as:
 *
 * - menu items
 * - combos
 * - offers
 * - packages
 * - events
 * - hygiene proof
 * - announcements
 * - informational cards
 *
 */

export type StoreContentType =
  | "item"
  | "combo"
  | "offer"
  | "package"
  | "event"
  | "info"
  | "hygiene"
  | "announcement"
  | "founder_story";

export const STORE_CONTENT_TYPES: StoreContentType[] = [
  "item",
  "combo",
  "offer",
  "package",
  "event",
  "info",
  "hygiene",
  "announcement",
  "founder_story",
];

/**
 * ============================================================
 * STORE CONTENT (FEED CARD)
 * ============================================================
 *
 * Represents a card displayed in the buyer feed.
 *
 * This collection is automatically generated from
 * items, combos and seller-created content.
 *
 * Firestore
 *
 * /stores/{storeId}/feeds/{contentId}
 *
 */
export type ContentMedia = {
  type: "photo" | "video";
  url: string;
};

/**
 * Entry in the Batao photo bank ( /photo-bank/{id} ).
 * photoFeed  → full-size image for feed cards
 * photoThumb → small thumbnail for menu/list rows
 */
export interface PhotoBankEntry {
  id: string;
  photoFeed?: string | null;
  photoThumb?: string | null;
}
export const getMediaFromPhotos = (photos: string[]): ContentMedia[] =>
  photos.map((p) => ({ type: "photo", url: p }));

export interface StoreContent {
  id: string;

  storeId: string;

  /** Content type */
  type: StoreContentType;

  /** Feed title */
  title: string;

  /** Optional description */
  description?: string | null;

  /** Images or videos */
  media?: ContentMedia[] | null;

  /**
   * Optional pricing information
   * Used for items, combos or packages
   */
  price?: number | null;

  /**
   * Reference to existing entities
   */

  itemId?: string | null;
  comboId?: string | null;
  offerId?: string | null;
  packageId?: string | null;

  /**
   * Feed ranking tags
   *
   * Examples
   *  ["chef_special"]
   *  ["bestseller"]
   *  ["new"]
   */
  tags?: string[];

  /**
   * Veg / non-veg / vegan classification.
   * Copied from BtItem.classification at feed-generation time.
   * Used by the guest app to render the veg/nonveg badge
   * and to power the veg-only filter toggle.
   *
   * Values: "veg" | "nonveg" | "vegan" | null
   */
  classification?: string | null;

  /**
   * Denormalized category name.
   * Copied from BtCategory.name at feed-generation time.
   * Enables the guest app to offer a category-filter dropdown
   * without an extra Firestore fetch.
   */
  categoryName?: string | null;

  /**
   * Pre-computed search tokens for client-side text search.
   *
   * Generated from: item name + description + category name.
   * Lowercased, split on whitespace/punctuation, deduped,
   * noise words removed.
   *
   * Example for "Butter Chicken":
   *  ["butter", "chicken", "curry", "north", "indian", "main", "course"]
   *
   * Guest app usage:
   *  searchTerms.some(t => t.startsWith(query.toLowerCase()))
   */
  searchTerms?: string[];

  /**
   * Filter-oriented tags for multi-select filter chips.
   *
   * Distinct from `tags` (which are merchandising-only).
   * Populated at feed-generation time from classification
   * and relevant merchandising tags.
   *
   * Examples: ["veg"], ["nonveg", "bestseller"], ["vegan", "popular"]
   */
  filterTags?: string[];

  /**
   * Marks cards that occupy a video slot in the feed.
   *
   * When true, the guest app should render this card in cinematic mode:
   *   media[0].type === "video"  →  play Bunny embed player
   *   media[0].type === "photo"  →  Ken Burns zoom/pan animation
   *
   * When absent or false, render as a standard static photo card.
   */
  isVideoSlot?: boolean;

  /**
   * Set to true when a video slot card was generated but no matching
   * video existed in the video bank at that time (photo fallback used).
   *
   * The onVideoBankEntry trigger watches this flag — when admin uploads
   * a new video, it queries for all videoMissed=true cards, matches by
   * token overlap, and surgically updates only the media field without
   * regenerating the full feed.
   *
   * Cleared (set to false) once a video is backfilled.
   */
  videoMissed?: boolean;

  /**
   * Photo bank dish ID for the primary image of this card.
   *
   * Set for item and video cards whose image originates from the
   * Batao photo bank (Batao-generated via Pexels / admin-curated).
   *
   * Frontend image resolution:
   *   if photoBankId → fetch /photo-bank/{photoBankId}
   *                    full-page card  → PhotoBankEntry.photoFeed
   *                    thumbnail view  → PhotoBankEntry.photoThumb
   *   else           → use media[0].url (user-uploaded image)
   *
   * When admin replaces the image in the photo bank, this reference
   * ensures the card automatically serves the updated image on the
   * next render — no re-generation of feeds required.
   */
  photoBankId?: string | null;

  /**
   * Feed ordering override
   * Lower value = higher priority
   */
  priority?: number;

  /**
   * Visibility toggle
   */
  isActive: boolean;

  /**
   * Optional scheduling window
   */
  validFrom?: Date | null;
  validTill?: Date | null;

  createdAt: Date;

  updatedAt?: Date | null;
}

/**
 * ============================================================
 * GENERIC STORE CONTENT (SELLER CREATED)
 * ============================================================
 *
 * Used for non-menu informational cards such as:
 *
 * Event
 *   "Live Music Friday"
 *
 * Hygiene
 *   "Kitchen sanitized every 2 hours"
 *
 * Announcement
 *   "New summer menu launched"
 *
 * Firestore
 *
 * /stores/{storeId}/feed-contents/{contentId}
 *
 */

export type BtContentType =
  | "event"
  | "info"
  | "hygiene"
  | "announcement"
  | "founder_story";

export interface BtContent {
  id: string;

  storeId: string;

  /** Content type */
  type: BtContentType;

  /** Display title */
  title: string;

  /** Optional description */
  description?: string;

  /** Images or videos */
  media?: ContentMedia[];

  /**
   * Optional call-to-action
   *
   * Examples
   *  leave_review
   *  refer_friend
   *  view_menu
   */
  actionType?: string;

  actionUrl?: string;

  /**
   * Feed ordering priority
   */
  displayPriority?: number;

  /**
   * Visibility toggle
   */
  isActive: boolean;

  /**
   * Optional scheduling window
   */
  validFrom?: Date;

  validTill?: Date;

  createdAt: Date;

  updatedAt?: Date;
}

/**
 * ============================================================
 * FOUNDER STORY
 * ============================================================
 *
 * Structured storage for the founder story.
 *
 * Firestore
 *
 * /stores/{storeId}/feed-contents/founder_story
 *
 */

export interface FounderStory {
  id: string;
  founderName: string;
  founderPhoto: string | null;
  mediaPhoto: string | null;
  mediaVideoId: string | null;
  since: string;
  whyStarted: string;
  whatsUnique: string;
  guestsLoveUs: string;
  freeformStory: string;
  updatedAt: Date;
}

/**
 * ============================================================
 * COMBO
 * ============================================================
 *
 * Represents a bundle of items sold together.
 *
 * Example
 *  Butter Chicken + Garlic Naan
 *
 * Firestore
 *
 * /stores/{storeId}/itemCombos/{comboId}
 *
 */

export interface BtCombo {
  id: string;

  storeId: string;

  name: string;

  description?: string;

  /** Items included in combo */
  itemIds: string[];

  /** Combo price */
  price: number;

  /** Images */
  photos?: string[];

  /** Availability toggle */
  available: boolean;

  createdAt: Date;
}

/**
 * ============================================================
 * ITEM UPSELL
 * ============================================================
 *
 * Defines recommended items shown when a buyer selects
 * another item.
 *
 * Example
 *
 * Pizza
 *   → Garlic Bread
 *   → Coca Cola
 *
 * Firestore
 *
 * /stores/{storeId}/itemUpsells/{upsellId}
 *
 */

export interface BtUpsell {
  id: string;

  storeId: string;

  /** Item triggering the upsell */
  baseItemId: string;

  /** Suggested items */
  suggestedItemIds: string[];

  /**
   * Optional ordering priority
   */
  priority?: number;

  createdAt: Date;
}

/**
 * ============================================================
 * VISIT SESSION
 * ============================================================
 *
 * Represents a browsing session created when a
 * buyer scans the QR code.
 *
 * Firestore
 *
 * /stores/{storeId}
 *   /store-visits/{visitId}
 *      /sessions/{sessionId}
 *
 */

export interface VisitSession {
  id: string;

  storeId: string;

  /** Parent visit reference */
  storeVisitId: string;

  userId: string;

  startedAt: Date;

  /** Updated on every interaction */
  lastActivityAt: Date;

  endedAt?: Date | null;

  /** Table identifier */
  tableId?: string | null;

  /** Entry source */
  source: "qr" | "direct" | "referral";

  /** Session status */
  status: "active" | "completed" | "abandoned";

  /**
   * Simple shortlist system
   */
  shortlistedContentIds?: string[] | null;
}

/**
 * ============================================================
 * CONTENT ACTION
 * ============================================================
 *
 * Tracks user engagement with feed content.
 *
 * Firestore
 *
 * /stores/{storeId}
 *   /store-visits/{visitId}
 *      /sessions/{sessionId}
 *         /actions/{actionId}
 *
 */

export type ContentActionType =
  | "view"
  | "click"
  | "like"
  | "shortlist"
  | "share"
  | "redeem_offer";

export interface ContentAction {
  id: string;

  storeId: string;

  storeVisitId: string;

  sessionId: string;

  userId: string;

  contentId: string;

  action: ContentActionType;

  timestamp: Date;
}

/**
 * ============================================================
 * STORE CONTENT STATS
 * ============================================================
 *
 * Aggregated engagement metrics for feed cards.
 *
 * Computed via background Cloud Functions.
 *
 * Firestore
 *
 * /stores/{storeId}/content-stats/{contentId}
 *
 */

export interface StoreContentStats {
  id: string;

  storeId: string;

  contentId: string;

  /** Real engagement — incremented by actual user actions. Shown to sellers. */
  totalViews: number;
  totalLikes: number;
  totalShortlists: number;
  totalShares: number;
  totalRedemptions: number;

  /** Seeded social-proof — shown to buyers only, never to sellers. Set once on creation. */
  seededViews: number;
  seededLikes: number;
  seededShortlists: number;
  seededShares: number;
  seededRedemptions: number;

  updatedAt: Date;
}

/**
 * ============================================================
 * BUYER STATS
 * ============================================================
 *
 * Aggregated per buyer per store.
 *
 * Used for retention analytics.
 *
 * Firestore
 *
 * /stores/{storeId}/buyer-stats/{userId}
 *
 */

export interface BuyerStats {
  id: string;

  storeId: string;

  userId: string;

  totalVisits: number;

  totalSessions: number;

  totalSpend?: number;

  lastVisit?: Date | null;

  updatedAt: Date;
}

/**
 * ============================================================
 * STORE SESSION STATS
 * ============================================================
 *
 * Seller dashboard analytics.
 *
 * Firestore
 *
 * /stores/{storeId}/session-stats/main
 *
 */

export interface StoreSessionStats {
  storeId: string;

  totalSessions: number;

  sessionsToday: number;

  avgSessionDuration?: number;

  plateConversionRate?: number;

  couponConversionRate?: number;

  updatedAt: Date;
}

/**
 * ============================================================
 * FIRESTORE STRUCTURE SUMMARY
 * ============================================================
 *
 * /stores/{storeId}
 *
 *   itemCategories/{categoryId}
 *   items/{itemId}
 *   itemCombos/{comboId}
 *   itemUpsells/{upsellId}
 *
 *   contents/{contentId}
 *
 *   feeds/{contentId}
 *
 *   content-stats/{contentId}
 *   buyer-stats/{userId}
 *   session-stats/main
 *
 *   store-visits/{visitId}
 *        sessions/{sessionId}
 *            actions/{actionId}
 *
 */
