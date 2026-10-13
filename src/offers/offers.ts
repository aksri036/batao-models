import {
  AmountValue,
  Benefit,
  BenefitType,
  GiftValue,
  OtherValue,
  PercentageValue,
  PointsValue,
} from "./benefits";
import {
  Condition,
  ConditionType,
  DaysOfWeekCondition,
  DaysOfWeekConditionValue,
  HappyHoursCondition,
  HappyHoursConditionValue,
} from "./conditions";

export type Offer = {
  id: string;
  storeId: string;
  subdomain: string;
  name: string;
  description?: string | null;
  benefit?: Benefit | null;
  conditions: Condition[]; // Offer can have multiple conditions
  photos: string[];
  validFrom?: Date | null;
  validTo?: Date | null;
  createdAt: Date;
  isActive: boolean;
  exclusive?: boolean;
  type?: string | null; //birthday, anniversary, general
};

export type OfferScreenshot = {
  id: string;
  buyerId: string;
  offerId: string;
  storeId: string;
  timestamp: Date;
  url?: string | null;
};

export function checkIfOfferIsValidForToday(offer: Offer): boolean {
  const res = true;
  for (const c of offer.conditions) {
    if (c.type === ConditionType.HAPPYHOUR) {
      const errMsg = new HappyHoursCondition(
        c.value as HappyHoursConditionValue,
      ).conditionCheckErrMsg(0);
      if (errMsg) return false;
    } else if (c.type === ConditionType.DAYS_OF_WEEK) {
      const errMsg = new DaysOfWeekCondition(
        c.value as DaysOfWeekConditionValue,
      ).conditionCheckErrMsg(0);
      if (errMsg) return false;
    }
  }
  if (offer.validTo && offer.validTo < new Date()) {
    return false;
  }
  return res;
}

export function getOfferBenefitString(offer: Offer): string {
  const res = "";
  if (offer.benefit) {
    if (offer.benefit.type === BenefitType.AMOUNT) {
      return `₹${(offer.benefit.value as AmountValue).amount} off`;
    } else if (offer.benefit.type === BenefitType.PERC) {
      return `${(offer.benefit.value as PercentageValue).perc}% off`;
    } else if (offer.benefit.type === BenefitType.GIFT) {
      const value = offer.benefit.value as GiftValue;
      return `${value.quantity} ${value.name} free`;
    } else if (offer.benefit.type === BenefitType.POINTS) {
      const value = offer.benefit.value as PointsValue;
      return `${value.points} points`;
    } else if (offer.benefit.type === BenefitType.OTHER) {
      const value = offer.benefit.value as OtherValue;
      return value.value;
    }
  }
  return res;
}
