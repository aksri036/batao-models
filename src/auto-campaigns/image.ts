import { Timestamp } from "../timestamp";

// "festive-generic" is the fallback for a festival with no active image.
export type AutoCampaignImageTheme =
  | "festival"
  | "festive-generic"
  | "winback"
  | "birthday"
  | "anniversary";

export type AutoCampaignImageSource = "upload" | "pexels" | "pixabay";

// "candidate": a stock image suggested by a script, waiting for ops review.
// Only "active" images are ever used in campaigns.
export type AutoCampaignImageStatus = "candidate" | "active" | "retired";

// Image library for auto campaigns, curated by ops in batao-admin.
// Stock images are copied into our bucket when approved, never hotlinked in campaigns.
export interface AutoCampaignImage {
  url: string; // public URL of our copy; for a candidate, the stock preview URL
  storagePath?: string | null; // e.g. "auto-campaigns/images/diwali/1760000000000.jpg"; null until copied (candidates)
  sourceImageUrl?: string | null; // stock image file the backend copies from on approval
  theme: AutoCampaignImageTheme;
  festivalId?: string | null; // set when theme is "festival"
  verticals?: string[]; // store categories it suits; empty or missing = all
  source: AutoCampaignImageSource;
  sourceId?: string | null; // Pexels / Pixabay photo id
  sourceUrl?: string | null; // photo page on Pexels / Pixabay
  licence?: string | null; // "Pexels License", "Pixabay Content License"
  width?: number;
  height?: number;
  status: AutoCampaignImageStatus;
  addedBy: string; // admin uid, or "candidate-script"
  addedAt: Timestamp;
  reviewedBy?: string | null; // admin uid who approved or rejected a candidate
  reviewedAt?: Timestamp | null;
  retiredAt?: Timestamp | null;
}

// One result of the admin stock-image search (backend proxies Pexels / Pixabay).
export interface StockImageResult {
  source: "pexels" | "pixabay";
  sourceId: string;
  previewUrl: string; // small image for the picker grid
  fullUrl: string; // large image the backend copies into our bucket
  width: number;
  height: number;
  sourceUrl: string;
}
