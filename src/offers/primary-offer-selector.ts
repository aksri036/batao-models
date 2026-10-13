/* ============================================================
   STEP 1: Validity filtering (hard gate)
   ============================================================ */

import {
  Benefit,
  BenefitType,
  AmountValue,
  PercentageValue,
  PointsValue,
  PercPointsValue,
} from "./benefits";
import { Condition, ConditionType } from "./conditions";
import { Offer } from "./offers";

function isOfferValid(offer: Offer, now: Date): boolean {
  if (!offer.isActive) return false;
  if (offer.validFrom && offer.validFrom > now) return false;
  if (offer.validTo && offer.validTo < now) return false;
  if (offer.conditions.find((c) => c.type === ConditionType.GOOGLE_REVIEW))
    return false;
  return true;
}

/* ============================================================
   STEP 2: Benefit scoring (ONLY when quantifiable)
   ============================================================ */

/**
 * Returns:
 *   number → comparable numeric value
 *   null   → cannot be reliably compared
 */
function scoreBenefit(benefit?: Benefit | null): number | null {
  if (!benefit) return 0;

  switch (benefit.type) {
    case BenefitType.AMOUNT:
      return (benefit.value as AmountValue).amount;

    case BenefitType.PERC: {
      const { perc, max } = benefit.value as PercentageValue;
      const assumedBill = 1000; // normalization heuristic
      const computed = (assumedBill * perc) / 100;
      return max ? Math.min(computed, max) : computed;
    }

    case BenefitType.POINTS:
      return (benefit.value as PointsValue).points * 0.5;

    case BenefitType.PERCPOINTS: {
      const { perc, max } = benefit.value as PercPointsValue;
      const assumed = (1000 * perc) / 100;
      const capped = max ? Math.min(assumed, max) : assumed;
      return capped * 0.5;
    }

    // ❌ Not safely comparable
    case BenefitType.GIFT:
    case BenefitType.OTHER:
      return null;
  }

  return null;
}

/* ============================================================
   STEP 3: Ease / friction scoring (always computable)
   ============================================================ */

function scoreEase(conditions?: Condition[] | null): number {
  if (!conditions || conditions.length === 0) return 100;

  let score = 100;

  for (const c of conditions) {
    switch (c.type) {
      case ConditionType.MIN_PURCHASE:
        score -= 20;
        break;

      case ConditionType.MIN_NUM_GUESTS:
        score -= 30;
        break;

      case ConditionType.HAPPYHOUR:
        score -= 15;
        break;

      case ConditionType.DAYS_OF_WEEK:
        score -= 10;
        break;

      case ConditionType.INSTAGRAM_SCREENSHOT:
        score -= 25;
        break;

      case ConditionType.GOOGLE_REVIEW:
        score -= 25;
        break;
    }
  }

  return Math.max(score, 0);
}

/* ============================================================
   STEP 4: Composite scoring structure
   ============================================================ */

type ScoredOffer = {
  offer: Offer;
  benefitScore: number | null;
  easeScore: number;
};

function scoreOffer(offer: Offer): ScoredOffer {
  return {
    offer,
    benefitScore: scoreBenefit(offer.benefit),
    easeScore: scoreEase(offer.conditions),
  };
}

/* ============================================================
   STEP 5: Primary offer selection
   ============================================================ */

/**
 * Selection rules:
 * 1. Filter only valid offers
 * 2. Prefer offers with numeric benefits
 * 3. Highest benefit wins
 * 4. Tie → easier offer wins
 * 5. If no numeric benefits → easiest offer wins
 */
export function selectPrimaryOffer(offers: Offer[]): Offer | null {
  const now = new Date();

  const validOffers = offers.filter((o) => isOfferValid(o, now));
  if (validOffers.length === 0) return null;
  const instagramOffer = validOffers.find((offer) =>
    offer.conditions?.some(
      (c) => c.type === ConditionType.INSTAGRAM_SCREENSHOT,
    ),
  );

  if (instagramOffer) {
    return instagramOffer;
  }

  const scored = validOffers.map(scoreOffer);

  const numeric = scored.filter((s) => s.benefitScore !== null);
  const pool = numeric.length > 0 ? numeric : scored;

  return pool.sort((a, b) => {
    if (a.benefitScore !== null && b.benefitScore !== null) {
      if (b.benefitScore !== a.benefitScore) {
        return b.benefitScore - a.benefitScore;
      }
    }
    return b.easeScore - a.easeScore;
  })[0].offer;
}
