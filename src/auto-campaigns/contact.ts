import { Timestamp } from "../timestamp";

// Auto campaign contact history for one guest of a store, used for audience
// selection (frequency limits, rotation, fatigue, responsiveness).
// Stored at stores/{id}/auto-campaigns/data/contacts/{phone}; written by the
// backend when an auto campaign is sent and on its delivery and read webhooks.
export interface AutoCampaignContact {
  phone: string; // normalised, e.g. "919876543210"
  lastSentAt?: Timestamp | Date | null;
  recentSends?: (Timestamp | Date)[]; // sends in the last 30 days, newest first
  monthKey?: string | null; // "YYYY-MM" that monthCount belongs to
  monthCount?: number; // auto campaigns sent in monthKey
  delivered?: number; // lifetime auto campaign deliveries
  read?: number; // lifetime auto campaign reads
  consecutiveFailures?: number; // failed deliveries in a row; reset on delivery
  updatedAt?: Timestamp | Date | null;
}
