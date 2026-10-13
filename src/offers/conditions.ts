export enum ConditionType {
  HAPPYHOUR = "happyhour",
  DAYS_OF_WEEK = "days_of_week",
  MIN_PURCHASE = "min_amount",
  MIN_NUM_GUESTS = "min_num_guests", //for group offers like family, corporate etc
  INSTAGRAM_SCREENSHOT = "instagram_screenshot",
  GOOGLE_REVIEW = "google_review",
}

export enum DayOfWeek {
  SUNDAY = "Sunday",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
}

export type ConditionValue =
  | HappyHoursConditionValue
  | DaysOfWeekConditionValue
  | MinPurchaseAmountConditionValue
  | MinGuestsConditionValue
  | InstagramScreenshotConditionValue
  | GoogleReviewConditionValue;

export type ConditionTime = {
  hour: number;
  min: number;
};

export type HappyHoursConditionValue = {
  start?: ConditionTime;
  end?: ConditionTime;
};

export function formatConditionTime(time?: ConditionTime) {
  if (!time) return "";
  const hours12 = time.hour % 12 || 12; // Convert to 12-hour format
  const minutes = time.min.toString().padStart(2, "0"); // Ensure 2 digits for minutes
  const ampm = time.hour >= 12 ? "PM" : "AM"; // Determine AM/PM
  return `${hours12}:${minutes} ${ampm}`; // Return formatted string
}

export const conditionTimeToMins = (t: ConditionTime) => t.hour * 60 + t.min;

export const compareConditionTime = (t1: ConditionTime, t2: ConditionTime) =>
  conditionTimeToMins(t1) - conditionTimeToMins(t2);

export type DaysOfWeekConditionValue = {
  validDays: DayOfWeek[];
};

export type MinPurchaseAmountConditionValue = {
  amount: number;
};

export type MinGuestsConditionValue = {
  numGuests: number;
};

export type InstagramScreenshotConditionValue = {};
export type GoogleReviewConditionValue = {};

export type Condition = {
  type: ConditionType;
  value: ConditionValue;
};

export class HappyHoursCondition implements Condition {
  type: ConditionType;
  value: HappyHoursConditionValue;
  constructor(validHours: HappyHoursConditionValue) {
    this.type = ConditionType.HAPPYHOUR;
    this.value = validHours;
  }

  conditionCheckErrMsg(amount: number): string | undefined {
    const now = new Date();
    const inputTime: ConditionTime = {
      hour: now.getHours(),
      min: now.getMinutes(),
    };
    const inputTimeInMins = conditionTimeToMins(inputTime);
    let res = true;
    if (this.value.start) {
      const startInMins = conditionTimeToMins(this.value.start);
      if (inputTimeInMins < startInMins) res = false;
    }
    if (this.value.end) {
      const endInMins = conditionTimeToMins(this.value.end);
      if (inputTimeInMins > endInMins) res = false;
    }

    if (!res) {
      return `This offer is valid only between ${formatConditionTime(
        this.value.start,
      )} - ${formatConditionTime(this.value.end)}`;
    }
    return undefined;
  }
}

export class DaysOfWeekCondition implements Condition {
  type: ConditionType;
  value: DaysOfWeekConditionValue;
  constructor(validDays: DaysOfWeekConditionValue) {
    this.type = ConditionType.DAYS_OF_WEEK;
    this.value = validDays;
  }

  conditionCheckErrMsg(amount: number): string | undefined {
    const todayDay = new Date().getDay();
    if (!this.value.validDays.includes(Object.values(DayOfWeek)[todayDay])) {
      return `This offer is valid only on ${this.value.validDays}`;
    }
    return undefined;
  }
}

export class MinPurchaseCondition implements Condition {
  type: ConditionType;
  value: MinPurchaseAmountConditionValue;
  constructor(minAmount: MinPurchaseAmountConditionValue) {
    this.type = ConditionType.MIN_PURCHASE;
    this.value = minAmount;
  }

  conditionCheckErrMsg(purchaseAmount: number): string | undefined {
    if (purchaseAmount < this.value.amount)
      return `This offer requires min purchase of ₹${this.value.amount}`;
    return undefined;
  }
}

export class MinGuestsCondition implements Condition {
  type: ConditionType;
  value: MinGuestsConditionValue;
  constructor(minNum: MinGuestsConditionValue) {
    this.type = ConditionType.MIN_NUM_GUESTS;
    this.value = minNum;
  }

  conditionCheckErrMsg(numPeople: number): string | undefined {
    if (numPeople < this.value.numGuests)
      return `This offer requires min number of ${this.value.numGuests} persons`;
    return undefined;
  }
}

export class InstagramScreenshotCondition implements Condition {
  type: ConditionType;
  value: InstagramScreenshotConditionValue;
  constructor(sc: InstagramScreenshotConditionValue) {
    this.type = ConditionType.INSTAGRAM_SCREENSHOT;
    this.value = sc;
  }
  conditionCheckErrMsg(amount: number): string | undefined {
    return undefined;
  }
}

export class GoogleReviewCondition implements Condition {
  type: ConditionType;
  value: GoogleReviewConditionValue;
  constructor(sc: GoogleReviewConditionValue) {
    this.type = ConditionType.GOOGLE_REVIEW;
    this.value = sc;
  }
  conditionCheckErrMsg(amount: number): string | undefined {
    return undefined;
  }
}

interface CCondition {
  conditionCheckErrMsg(amount: number): string | undefined;
}

export class ConditionFactory {
  static createCondition(
    type: string,
    value: ConditionValue,
  ): CCondition & Condition {
    switch (type) {
      case ConditionType.HAPPYHOUR:
        return new HappyHoursCondition(value as HappyHoursConditionValue);
      case ConditionType.DAYS_OF_WEEK:
        return new DaysOfWeekCondition(value as DaysOfWeekConditionValue);
      case ConditionType.MIN_PURCHASE:
        return new MinPurchaseCondition(
          value as MinPurchaseAmountConditionValue,
        );
      case ConditionType.MIN_NUM_GUESTS:
        return new MinGuestsCondition(value as MinGuestsConditionValue);
      case ConditionType.INSTAGRAM_SCREENSHOT:
        return new InstagramScreenshotCondition(
          value as InstagramScreenshotConditionValue,
        );
      case ConditionType.GOOGLE_REVIEW:
        return new GoogleReviewCondition(value as GoogleReviewConditionValue);
      default:
        throw new Error("Unsupported condition type");
    }
  }

  /** 🧩 Render readable condition string */
  static renderCondition(condition: Condition): string {
    switch (condition.type) {
      case ConditionType.HAPPYHOUR:
        const val = condition.value as any;
        return `Valid between ${val.start?.hour}:${val.start?.min
          .toString()
          .padStart(2, "0")} – ${val.end?.hour}:${val.end?.min
          .toString()
          .padStart(2, "0")}`;
      case ConditionType.DAYS_OF_WEEK:
        return `Valid on ${(condition.value as any).validDays.join(", ")}`;
      case ConditionType.MIN_PURCHASE:
        return `Minimum purchase of ₹${(condition.value as any).amount}`;
      case ConditionType.MIN_NUM_GUESTS:
        return `Minimum ${(condition.value as any).numGuests} guests required`;
      case ConditionType.INSTAGRAM_SCREENSHOT:
        return `Customer must share an Instagram screenshot`;
      case ConditionType.GOOGLE_REVIEW:
        return `Customer must give Google review`;
      default:
        return "";
    }
  }

  /** 🎯 UX-friendly condition label for buyers */
  static getConditionLabel(condition: Condition): string {
    switch (condition.type) {
      case ConditionType.HAPPYHOUR: {
        const { start, end } = condition.value as HappyHoursConditionValue;

        if (start && end) {
          return `Valid between ${formatConditionTime(start)} – ${formatConditionTime(end)}`;
        }

        if (start) {
          return `Valid after ${formatConditionTime(start)}`;
        }

        if (end) {
          return `Valid before ${formatConditionTime(end)}`;
        }

        return "Valid during happy hours";
      }

      case ConditionType.DAYS_OF_WEEK: {
        const { validDays } = condition.value as DaysOfWeekConditionValue;

        if (!validDays || validDays.length === 0) {
          return "Valid on selected days";
        }

        if (validDays.length === 7) {
          return "Valid every day";
        }

        // Shorten days for UI
        const shortDays = validDays.map((d) => d.slice(0, 3));
        return `Valid on ${shortDays.join(", ")}`;
      }

      case ConditionType.MIN_PURCHASE: {
        const { amount } = condition.value as MinPurchaseAmountConditionValue;
        return `Minimum bill ₹${amount}`;
      }

      case ConditionType.MIN_NUM_GUESTS: {
        const { numGuests } = condition.value as MinGuestsConditionValue;
        return `Minimum ${numGuests} ${numGuests === 1 ? "guest" : "guests"}`;
      }

      case ConditionType.INSTAGRAM_SCREENSHOT:
        return "Post on Instagram & upload screenshot";

      case ConditionType.GOOGLE_REVIEW:
        return "Leave a Google review";

      default:
        return "Complete required steps";
    }
  }
}
