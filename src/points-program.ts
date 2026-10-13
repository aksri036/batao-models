export interface PointsProgram {
  enabled: boolean;
  label: { singular: string; plural: string; emoji?: string }; // "Coin" / "Coins" 🪙

  earn: {
    enabled?: boolean;        // when false, no points credited on purchases (default: true)
    mode?: "spend" | "visit"; // default "spend" when absent
    ratePerRupee: number;     // used when mode === "spend" (or absent)
    pointsPerVisit?: number;  // used when mode === "visit"
    signupBonus?: number;     // points credited when a guest is first created
  };

  valuePerPoint: number; // ₹ per point — universal "worth ₹X" framing + cashback redemptions

  redeem: {
    minPointsToEncash: number; // wallet must hold >= this to redeem at all
    maxEncashPercentOfOrder: number; // 0-100, caps cashback portion per transaction
  };

  expiry: {
    enabled: boolean;
    validityDays: number; // points expire N days after being earned
    reminderDaysBefore: number[]; // e.g. [7, 1]
  };

  activation?: {
    enabled: boolean;
    lockDays: number; // points become redeemable N days after being earned
  };

  staffAddOrderEnabled?: boolean; // when false (default), Add Order page is inaccessible to staff

  redemptionOtp?: {
    enabled: boolean; // when true, staff must collect OTP from guest before redeeming points
  };
}
