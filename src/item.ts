/**
 * ============================================================
 * BATAO MENU DOMAIN MODELS
 * ============================================================
 *
 * These models represent the menu structure used by Batao
 * across multiple verticals such as:
 * - Restaurants
 * - Salons
 * - Clinics
 * - Retail stores
 *
 * Firestore Structure (Recommended)
 *
 * /stores/{storeId}
 *    ├ categories/{categoryId}
 *    ├ items/{itemId}
 *    ├ combos/{comboId}
 *    ├ upsells/{upsellId}
 *    ├ menu-pages/{menuPageId}
 *
 * ============================================================
 */

/**
 * ============================================================
 * CATEGORY
 * ============================================================
 *
 * Represents a hierarchical menu category.
 *
 * Examples:
 *
 * Restaurants
 *  Starters
 *  Main Course
 *    └ North Indian
 *
 * Salons
 *  Hair
 *  Skin
 *
 */

export interface BtCategory {
  id: string;
  storeId: string;

  /** Display name of category */
  name: string;

  /** Optional category images */
  photos: string[];

  /** Ordering index for UI display */
  displayIndex: number;

  /** Parent category reference (for hierarchy) */
  parentCategoryId?: string;

  /** Cached children references (optional optimization) */
  childCategories?: string[];
}

/**
 * ============================================================
 * ITEM
 * ============================================================
 *
 * Canonical item/service definition.
 *
 * This represents:
 * - Food dish
 * - Salon service
 * - Medical procedure
 * - Retail product
 *
 * Combos, upsells, and feed ranking are handled separately.
 */

export interface BtItem {
  id: string;
  storeId: string;

  /** Category this item belongs to */
  categoryId: string;

  subcategoryId?: string;

  /** Vertical type (restaurant, salon, clinic, etc.) */
  type: string;

  /** Display name */
  name: string;

  /** Optional description */
  description?: string | null;

  /** Base price */
  price?: number | null;

  /** Optional manual item-level discount */
  discount?: number | null;

  /** Availability toggle */
  available: boolean;

  /** Images associated with the item */
  photos: string[];

  /** Creation timestamp */
  createdAt: Date;

  /**
   * OBSOLETE
   * Old restaurant-specific field.
   * Replaced by `classification`.
   */
  veg?: string;

  /**
   * Generic classification across verticals
   *
   * Examples:
   * restaurant → veg / nonveg / vegan
   * salon → hair / skin / massage
   * clinic → consultation / treatment
   */
  classification?: string;

  /**
   * Merchandising tags used by feed ranking.
   *
   * Examples:
   *  ["chef_special"]
   *  ["bestseller"]
   *  ["new"]
   */
  tags?: string[];

  /**
   * Seller override for feed ordering.
   * Lower value = higher priority.
   */
  displayPriority?: number;

  /**
   * Soft delete / archive support
   */
  isActive?: boolean;

  /**
   * Bunny.net Stream video guid.
   * When set, the video takes priority over photos in the feed.
   */
  videoId?: string;

  /**
   * Photo bank dish ID for Batao-generated images.
   *
   * When set, the display image is resolved from
   * /photo-bank/{photoBankId} at render time:
   *   - Full-page feed view → PhotoBankEntry.photoFeed
   *   - Thumbnail / menu list → PhotoBankEntry.photoThumb
   *
   * Null for user-uploaded images — those are stored in `photos[]`.
   * If the admin replaces the image in the photo bank, all items
   * referencing this dishId automatically serve the updated image
   * without any write to the item document.
   */
  photoBankId?: string | null;
}

/**
 * ============================================================
 * MENU PAGE
 * ============================================================
 *
 * Used when a store uploads image-based menus instead of
 * structured items.
 *
 * Example:
 *  Restaurant uploads scanned PDF menu pages.
 *
 * These images are displayed to buyers as menu pages.
 */

export interface MenuPage {
  id: string;
  storeId: string;

  /** Image URL of the menu page */
  url: string;

  /** Optional title */
  title: string;

  /** Ordering index */
  displayIndex: number;

  /** Controls whether the backend replaces or appends to the existing menu */
  menuMode?: "replace" | "append";

  /** Shared across all pages split from one uploaded PDF; absent for standalone single-image pages */
  groupId?: string;
}

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

export const createEmptyCategory = (): BtCategory => ({
  id: "",
  name: "",
  displayIndex: 0,
  storeId: "",
  photos: [],
});
