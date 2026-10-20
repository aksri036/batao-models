import { Timestamp } from "../timestamp";

// "festive-generic" is the fallback for a festival with no active image.
export type AutoCampaignImageTheme =
  | "festival"
  | "festive-generic"
  | "winback"
  | "birthday"
  | "anniversary";

export type AutoCampaignImageSource = "upload" | "pexels" | "pixabay";

// Image library for auto campaigns, curated by ops in batao-admin.
// Stock images are copied into our bucket, never hotlinked.
export interface AutoCampaignImage {
  url: string; // public URL of our copy
  storagePath: string; // e.g. "auto-campaigns/images/diwali/1760000000000.jpg"
  theme: AutoCampaignImageTheme;
  festivalId?: string | null; // set when theme is "festival"
  verticals?: string[]; // store categories it suits; empty or missing = all
  source: AutoCampaignImageSource;
  sourceId?: string | null; // Pexels / Pixabay photo id
  sourceUrl?: string | null; // photo page on Pexels / Pixabay
  licence?: string | null; // "Pexels License", "Pixabay Content License"
  width?: number;
  height?: number;
  status: "active" | "retired";
  addedBy: string; // admin uid or email
  addedAt: Timestamp;
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
