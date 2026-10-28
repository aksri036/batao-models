import { Timestamp } from "../timestamp";
import {
  Benefit,
  BenefitType,
  PercentageValue,
  PointsValue,
  getBenefitMessageString,
} from "../offers/benefits";

// Benefit types a campaign offer can carry, by store type.
// Points stores (featureFlags.pointsV2Active): bonus points, credited at send
// and redeemed through the rewards catalog.
// Legacy stores: a discount or free item, claimed as a coupon through the
// existing claim-offer page and redeemed in Manage coupon.
export const POINTS_STORE_OFFER_TYPES = [BenefitType.POINTS] as const;
export const LEGACY_STORE_OFFER_TYPES = [
  BenefitType.PERC,
  BenefitType.AMOUNT,
  BenefitType.GIFT,
] as const;

// Value used for Offer.type on the plain Offer created behind a legacy
// store's campaign offer, so the existing claim and redeem flows work.
// One is created per plan entry (AutoCampaignPlanEntry.offer.hiddenOfferId).
// Such offers are hidden from the seller's "My Offers" list.
export const AUTO_CAMPAIGN_OFFER_TYPE = "auto-campaign";

// A simple offer the seller attaches to auto campaigns (festivals for now).
// Stored at stores/{id}/auto-campaigns/data/offers/{offerId}.
export interface CampaignOffer {
  title: string; // seller's label, e.g. "Festive 20% off"
  benefit: Benefit; // POINTS for points stores; PERC (with optional max), AMOUNT or GIFT for legacy stores
  minBillAmount?: number | null; // ₹, legacy stores only
  validityDays: number; // points expire / coupon valid this many days after the campaign is sent
  offerId?: string | null; // unused: hidden Offers are made per plan entry (AutoCampaignPlanEntry.offer.hiddenOfferId)
  active: boolean;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date | null;
}

// Plain wording for WhatsApp messages, e.g. "20% off (up to ₹150) on a bill
// of ₹500 or more", "100 bonus points". Builds on getBenefitMessageString
// without changing it: other approved templates depend on its exact wording.
export function getCampaignOfferMessageString(offer: CampaignOffer): string {
  if (offer.benefit.type === BenefitType.POINTS) {
    return `${(offer.benefit.value as PointsValue).points} bonus points`;
  }
  let text = getBenefitMessageString(offer.benefit);
  const max = (offer.benefit.value as PercentageValue).max;
  if (offer.benefit.type === BenefitType.PERC && max) {
    text += ` (up to ₹${max})`;
  }
  return offer.minBillAmount
    ? `${text} on a bill of ₹${offer.minBillAmount} or more`
    : text;
}
