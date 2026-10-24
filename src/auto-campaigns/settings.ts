import { Timestamp } from "../timestamp";

// Store-level auto campaign settings, on the store doc as `autoCampaignSettings`
// (not in waSettings: only auto campaigns read them). Written by the seller app.
export interface AutoCampaignSettings {
  enabled: boolean; // master switch
  approvalMode: "review" | "autopilot"; // review: seller approves each month's plan before anything is sent
  monthlyBudget: number; // in paise, like waSettings.balance; hard cap on WhatsApp cost per month
  updatedAt?: Timestamp | Date | null;
  updatedBy?: string | null; // uid of the seller user who last changed it
}

export const DEFAULT_AUTO_CAMPAIGN_MONTHLY_BUDGET = 1000 * 100; // ₹1,000

export const createDefaultAutoCampaignSettings = (): AutoCampaignSettings => ({
  enabled: false,
  approvalMode: "review",
  monthlyBudget: DEFAULT_AUTO_CAMPAIGN_MONTHLY_BUDGET,
});
