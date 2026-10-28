import { Timestamp } from "../timestamp";

// Auto campaign contact history for one guest of a store, used for audience
// selection (frequency limits, rotation, fatigue, responsiveness).
// Stored at stores/{id}/auto-campaigns/data/contacts/{phone}; written once a
// day by the backend from the target-status of the previous days' auto
// campaigns (the delivery webhook is not involved). Only messages that went
// out count as sends; failed sends and failed deliveries don't.
export interface AutoCampaignContact {
  phone: string; // normalised, e.g. "919876543210"
  lastSentAt?: Timestamp | Date | null;
  recentSends?: (Timestamp | Date)[]; // sends in the last 30 days, newest first
  monthKey?: string | null; // "YYYY-MM" that monthCount belongs to
  monthCount?: number; // auto campaigns sent in monthKey
  delivered?: number; // lifetime auto campaign deliveries
  read?: number; // lifetime auto campaign reads
  consecutiveFailures?: number; // failed deliveries in a row; reset on delivery
  countedCampaignIds?: string[]; // campaigns already recorded here, newest first (last 10), so reruns don't double count
  updatedAt?: Timestamp | Date | null;
}
