import {
  Benefit,
  getBenefitMessageString,
  getBenefitString,
} from "./offers/benefits";

export interface Discount {
  code?: string;
  perc?: number | null;
  limit?: number | null;
  redeemInPoints?: boolean | null; //if true, perc and limit are points, else they are ₹
  expiry?: number | null; // expires after so many days after creation
  expiryDate?: Date | null; // expires on this date
  counts?: number | null; // number of times this discount can be taken
  offerDiscount?: string | null; // could be amount, gift item
  benefit?: Benefit | null;
  minBillAmount?: number | null;
}

export function getDiscountString(disc: Discount | null): string {
  if (!disc) return "";
  if (disc.benefit) {
    return getBenefitString(disc.benefit);
  }

  if (disc.perc)
    return `${disc.perc}% ${disc.redeemInPoints ? "points" : "off"}`;
  

  if (disc.offerDiscount) return disc.offerDiscount;
  return "";
}

// Plain-text wording for WhatsApp templates and link previews (no emoji).
export function getDiscountMessageString(disc: Discount | null): string {
  if (!disc) return "";
  if (disc.benefit) return getBenefitMessageString(disc.benefit);
  if (disc.perc)
    return `${disc.perc}% ${disc.redeemInPoints ? "points" : "off"}`;
  if (disc.offerDiscount) return disc.offerDiscount;
  return "";
}
