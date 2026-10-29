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
  lastFailureAt?: Timestamp | Date | null; // last failed delivery; starts the failure cooling period
  countedCampaignIds?: string[]; // campaigns already recorded here, newest first (last 10), so reruns don't double count

  // Spam protection (step 5). Written by the backend's WhatsApp webhooks for
  // every message from the store, not only auto campaigns.
  optOut?: AutoCampaignOptOut | null; // set while the guest has opted out of offers
  lastMarketingAt?: Timestamp | Date | null; // last delivered marketing message from the store, any sender
  recentMarketing?: (Timestamp | Date)[]; // delivered marketing messages in the last 30 days, newest first
  updatedAt?: Timestamp | Date | null;
}

// How a guest opted out of a store's offers.
// button / text: the guest tapped "Stop offers" or typed STOP. Lasts until the
//   guest replies START (WhatsApp policy: opt-out requests must be honoured).
// meta: WhatsApp refused delivery because the guest turned off this business's
//   marketing messages in WhatsApp (Meta error 131050). Lasts until `until`,
//   then one message is tried again.
export interface AutoCampaignOptOut {
  source: "button" | "text" | "meta";
  at: Timestamp | Date;
  until?: Timestamp | Date | null; // meta only; null = until START
  campaignId?: string | null; // campaign whose message the guest replied to, when known
}
