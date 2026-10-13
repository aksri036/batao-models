export enum BenefitType {
  AMOUNT = "amount",
  PERC = "percentage",
  POINTS = "points",
  PERCPOINTS = "percPoints",
  GIFT = "gift",
  OTHER = "other",
  // Extendable for other types like cashback, free items, etc.
}

export type BenefitValue =
  | AmountValue
  | PercentageValue
  | PointsValue
  | PercPointsValue
  | GiftValue
  | OtherValue;

export type AmountValue = {
  amount: number;
};

export type PercentageValue = {
  perc: number;
  max?: number | null;
};

export type PointsValue = {
  points: number;
};

export type PercPointsValue = {
  perc: number;
  max?: number | null;
};

export type GiftValue = {
  id: string; // in case item exists on Batao else it will be empty
  name: string;
  quantity: number;
};

export type OtherValue = {
  value: string;
};

export type Benefit = {
  type: string;
  value: BenefitValue;
};

export class AmountBenefit implements Benefit {
  type: BenefitType;
  value: AmountValue;
  constructor(discount: AmountValue) {
    this.type = BenefitType.AMOUNT;
    this.value = discount;
  }

  getDiscount() {
    return `₹${this.value.amount}`;
  }
}

export class PercentageBenefit implements Benefit {
  type: BenefitType;
  value: PercentageValue;
  constructor(percDisc: PercentageValue) {
    this.type = BenefitType.PERC;
    this.value = percDisc;
  }

  getDiscount(total: number): string {
    let disc = (total * this.value.perc) / 100;
    if (this.value.max && disc > this.value.max) {
      disc = this.value.max;
    }
    return `₹${disc}`;
  }
}

export class PointsBenefit implements Benefit {
  type: BenefitType;
  value: PointsValue;
  constructor(points: PointsValue) {
    this.type = BenefitType.POINTS;
    this.value = points;
  }

  getDiscount(total: number): string {
    return `${this.value.points} points`;
  }
}

export class PercPointsBenefit implements Benefit {
  type: BenefitType;
  value: PercPointsValue;
  constructor(percVal: PercPointsValue) {
    this.type = BenefitType.PERCPOINTS;
    this.value = percVal;
  }

  getDiscount(total: number): string {
    let disc = (total * this.value.perc) / 100;
    if (this.value.max && disc > this.value.max) {
      disc = this.value.max;
    }
    return `${disc} points`;
  }
}

export class GiftItemBenefit implements Benefit {
  type: BenefitType;
  value: GiftValue;
  constructor(giftItem: GiftValue) {
    this.type = BenefitType.GIFT;
    this.value = giftItem;
  }

  getDiscount(total: number): string {
    return `Item: ${this.value.name} Qty: ${this.value.quantity}`;
  }
}

export class OtherBenefit implements Benefit {
  type: BenefitType;
  value: OtherValue;
  constructor(o: OtherValue) {
    this.type = BenefitType.OTHER;
    this.value = o;
  }

  getDiscount(total: number): string {
    return this.value.value;
  }
}

interface CBenefit {
  getDiscount(total: number): string;
}
export class BenefitFactory {
  static createBenefit(type: string, value: BenefitValue): CBenefit & Benefit {
    switch (type) {
      case BenefitType.AMOUNT:
        return new AmountBenefit(value as AmountValue);
      case BenefitType.PERC:
        return new PercentageBenefit(value as PercentageValue);
      case BenefitType.POINTS:
        return new PointsBenefit(value as PointsValue);
      case BenefitType.PERCPOINTS:
        return new PercPointsBenefit(value as PercPointsValue);
      case BenefitType.GIFT:
        return new GiftItemBenefit(value as GiftValue);
      case BenefitType.OTHER:
        return new OtherBenefit(value as OtherValue);
      default:
        throw new Error("Unsupported benefit type");
    }
  }
  /** ✨ Helper to render benefit summary */
  static renderBenefit(benefit?: Benefit | null): string {
    if (!benefit) return "";
    switch (benefit.type) {
      case BenefitType.AMOUNT:
        return `Flat ₹${(benefit.value as any).amount} off`;
      case BenefitType.PERC:
        return `${(benefit.value as any).perc}% off up to ₹${
          (benefit.value as any).max || ""
        }`;
      case BenefitType.POINTS:
        return `Earn ${(benefit.value as any).points} points`;
      case BenefitType.PERCPOINTS:
        return `Earn ${(benefit.value as any).perc}% points`;
      case BenefitType.GIFT:
        const gift = benefit.value as any;
        return `Free ${gift.quantity} × ${gift.name}`;
      case BenefitType.OTHER:
        const other = benefit.value as any;
        return `${other.value}`;
      default:
        return "Special Offer";
    }
  }
}

export function getBenefitString(benefit: Benefit): string {
  const res = "";

  if (benefit.type === BenefitType.AMOUNT) {
    return `₹${(benefit.value as AmountValue).amount} off`;
  } else if (benefit.type === BenefitType.PERC) {
    return `${(benefit.value as PercentageValue).perc}% off`;
  } else if (benefit.type === BenefitType.GIFT) {
    const value = benefit.value as GiftValue;
    if (value.quantity > 1) return `🎁 ${value.quantity} ${value.name}`;
    else return `🎁 ${value.name}`;
  } else if (benefit.type === BenefitType.OTHER) {
    const value = benefit.value as OtherValue;
    return value.value;
  } else if (benefit.type === BenefitType.POINTS) {
    const value = benefit.value as PointsValue;
    return `💎 ${value.points} pts`;
  } else if (benefit.type === BenefitType.PERCPOINTS) {
    const value = benefit.value as PercPointsValue;
    return `💎 ${value.perc}% pts`;
  }

  return res;
}

// Plain-text wording for WhatsApp templates and link previews (no emoji).
export function getBenefitMessageString(benefit: Benefit): string {
  if (benefit.type === BenefitType.AMOUNT) {
    return `₹${(benefit.value as AmountValue).amount} off`;
  } else if (benefit.type === BenefitType.PERC) {
    return `${(benefit.value as PercentageValue).perc}% off`;
  } else if (benefit.type === BenefitType.GIFT) {
    const value = benefit.value as GiftValue;
    return `${value.quantity} ${value.name} free`;
  } else if (benefit.type === BenefitType.OTHER) {
    return (benefit.value as OtherValue).value;
  } else if (benefit.type === BenefitType.POINTS) {
    return `${(benefit.value as PointsValue).points} points`;
  } else if (benefit.type === BenefitType.PERCPOINTS) {
    return `${(benefit.value as PercPointsValue).perc}% points`;
  }
  return "";
}
