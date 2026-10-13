import { WAFollowupSettings } from "./wa-settings";

export interface FollowupRecord {
  id: string;
  mobile: string;
  name: string;
  purpose: string;
  visitHistory: Date[];
  lastVisitedAt?: Date | null;
  visitCount: number;
  followupSettings: WAFollowupSettings;
}
