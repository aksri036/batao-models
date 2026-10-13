import { DayMonth } from "./day-month";

export interface BtLead {
  id: string;
  name?: string;
  email?: string;
  mobile: string;
  dob?: DayMonth;
  timestamp: Date;
  tags?: string[];
  via?: string; // added via 'pos', 'app', 'admin', 'referral', 'followup'
}

export const createEmptyLead = (): BtLead => ({
  id: "",
  timestamp: new Date(),
  mobile: "",
  via: "app",
});
