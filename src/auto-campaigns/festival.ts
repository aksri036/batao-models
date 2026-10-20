import { Timestamp } from "../timestamp";

// Batao-wide festival superset for festival auto campaigns, configured by ops
// in batao-admin. Doc id is a stable slug, e.g. "diwali", "eid-al-fitr".
// Pan-India: no region variations for now.
export interface AutoFestival {
  name: string; // "Diwali"
  dates: Record<string, string>; // year -> "YYYY-MM-DD" (IST), e.g. { "2026": "2026-11-08" }
  popular: boolean; // pre-ticked for sellers in the festival picker
  religious: boolean; // AI keeps the copy neutral
  defaultGreeting: string; // "Wishing you a bright and joyful Diwali"
  defaultImageId?: string | null; // AutoCampaignImage doc id
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Date of the festival in the given year, or null if ops haven't set one.
export function getFestivalDate(
  festival: AutoFestival,
  year: number,
): string | null {
  return festival.dates?.[String(year)] ?? null;
}
