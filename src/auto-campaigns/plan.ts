import { Timestamp } from "../timestamp";
import { AutoCampaignTemplateKey } from "./templates";

// Campaign types an auto campaign plan can hold. Festivals only for now;
// later "dish", "event", "winback", "occasion", "review", "referral".
export type AutoCampaignType = "festival";

// planned: will be sent (step 3 adds approval and send states)
// dropped: picked by the seller but left out (e.g. over budget, no capacity)
// blocked: can't be sent until something is fixed (e.g. template not approved, no image)
export type AutoCampaignPlanEntryStatus = "planned" | "dropped" | "blocked";

// Fields every campaign type shares. Planner budget/capacity, audience
// selection, sending and the calendar use only these.
export interface AutoCampaignPlanEntryBase {
  id: string; // `${type}_${sourceId}_${firstSendDate}`, e.g. "festival_diwali_2026-11-01"
  type: AutoCampaignType;
  title: string; // what the seller sees, e.g. "Diwali"
  sendDates: string[]; // "YYYY-MM-DD" (IST) days the sends are spread over, 1 to 3
  sendHour: number; // IST hour the first send starts, e.g. 11
  templateKey: AutoCampaignTemplateKey;
  offer?: {
    offerId: string; // CampaignOffer id
    text: string; // snapshot of the offer wording when planned
    validityDays: number;
  } | null; // null = without offer
  image?: {
    url: string;
    imageId?: string | null; // AutoCampaignImage id for library images; seller photos have only a url
  } | null;
  audienceCount: number; // estimated at planning time; the final list is picked at send time
  estimatedCost: number; // in paise
  status: AutoCampaignPlanEntryStatus;
  reason?: string | null; // why dropped or blocked
}

// One interface per campaign type, carrying where the campaign comes from.
export interface FestivalPlanEntry extends AutoCampaignPlanEntryBase {
  type: "festival";
  festival: {
    festivalId: string;
    name: string;
    date: string; // "YYYY-MM-DD" (IST)
  };
}

// Discriminated on `type`; add new entry types to this union.
export type AutoCampaignPlanEntry = FestivalPlanEntry;

// A store's plan for one month, at stores/{id}/auto-campaigns/data/plans/{yyyy-mm}.
// Built on the 20th for the next month, or right away when the seller turns
// auto campaigns on. Never rebuilt over an existing plan.
export interface AutoCampaignPlan {
  month: string; // "YYYY-MM"
  storeType: "points" | "legacy";
  budget: number; // in paise, snapshot of autoCampaignSettings.monthlyBudget
  estimatedCost: number; // in paise, planned entries only
  poolSize: number; // reachable guests when planned
  dailyCapacity: number; // messages per day auto campaigns may use
  entries: AutoCampaignPlanEntry[]; // ordered by first send date
  builtAt: Timestamp | Date;
  builtBy: "cron" | "enabled" | "manual";
}
