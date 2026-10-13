export type OpsStage = "onboarding" | "live" | "live_no_whatsapp" | "churned";

export const STAGE_LABEL: Record<OpsStage, string> = {
  onboarding: "Onboarding",
  live: "Live",
  live_no_whatsapp: "Live w/o whatsapp",
  churned: "Churned",
};

export type BillingCycle = "monthly" | "quarterly" | "half_yearly" | "annual";
export type OpsPlan = "discover" | "engage" | "engage_discover";
export type AddOn = "website" | "feedback_engine" | "immersive_menu";

export const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-Yearly",
  annual: "Annual",
};

export const PLAN_LABEL: Record<OpsPlan, string> = {
  discover: "Discover",
  engage: "Engage",
  engage_discover: "Engage + Discover",
};

export const ADD_ON_LABEL: Record<AddOn, string> = {
  website: "Website",
  feedback_engine: "Feedback Engine",
  immersive_menu: "Immersive Menu",
};

export const DEFAULT_SETUP_FEE = 5000;

const BILLING_CYCLE_MONTHS: Record<BillingCycle, number> = {
  monthly: 1,
  quarterly: 3,
  half_yearly: 6,
  annual: 12,
};

export function addBillingCycle(date: Date, cycle: BillingCycle): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + BILLING_CYCLE_MONTHS[cycle]);
  return result;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86400000);
}

// A customer is "stale" if nothing has moved on it in a while — independent of
// whether anyone remembered to set a due date. Catches the "nobody followed up
// in weeks" failure mode even when no explicit date was missed.
export const STALE_THRESHOLD_DAYS = 14;

export function isStale(customer: Pick<OpsCustomer, "stage" | "lastActivityTime">): boolean {
  if (customer.stage === "churned") return false;
  const diffDays = (Date.now() - customer.lastActivityTime.getTime()) / 86400000;
  return diffDays > STALE_THRESHOLD_DAYS;
}

// A store stuck in "onboarding" for too long after signup is a red flag — flagged in
// the UI and surfaced in the admin digest email so it doesn't sit unnoticed.
export const ONBOARDING_OVERDUE_DAYS = 3;

export function isOnboardingOverdue(customer: Pick<OpsCustomer, "stage" | "createdTime">): boolean {
  if (customer.stage !== "onboarding") return false;
  const diffDays = (Date.now() - customer.createdTime.getTime()) / 86400000;
  return diffDays > ONBOARDING_OVERDUE_DAYS;
}

export interface OpsCustomer {
  id: string;
  storeId?: string | null; // linked later once the store exists in the main `stores` collection
  storeName: string;
  subdomain?: string | null;
  contactName?: string;
  contactPhone?: string;
  firstPaymentDate: Date;
  stage: OpsStage;
  ownerRM: string; // phone of assigned Sales/RM
  csOwner?: string; // phone of assigned CS
  nextAction: string;
  nextActionDueDate: Date;
  lastActivityTime: Date; // bumped on any change; drives "stale" detection
  seoEnabled: boolean;
  hasPetpooja: boolean;
  isStrategic: boolean;
  strategicNotes?: string;
  expansionStrategy?: string;
  nextReviewDate?: Date | null;
  reviewCadenceDays: number;

  // Billing
  plan: OpsPlan;
  addOns: AddOn[];
  billingCycle: BillingCycle;
  setupFee: number;
  recurringAmount: number; // amount due each billing cycle
  // Denormalized from the current open OpsPayment record (admin/ops-center/payments) —
  // read-only in the UI, kept in sync by OpsDbOps.recordPayment/createOpsCustomer.
  nextPaymentDate?: Date | null;
  nextPaymentAmount?: number | null;

  notes?: string;

  createdTime: Date;
  createdBy: string; // phone
  archived?: boolean;
}

export interface NewOpsCustomerInput {
  storeName: string;
  contactName?: string;
  contactPhone?: string;
  firstPaymentDate: Date;
  ownerRM: string;
  nextAction: string;
  nextActionDueDate: Date;
  seoEnabled: boolean;
  hasPetpooja: boolean;
  plan: OpsPlan;
  addOns: AddOn[];
  billingCycle: BillingCycle;
  setupFee: number;
  recurringAmount: number; // also seeds the first OpsPayment record, due on firstPaymentDate
  // Amount already collected as of firstPaymentDate — most of the time Sales adds the
  // customer AFTER collecting it, so this defaults to recurringAmount in the UI. If it
  // fully covers recurringAmount, the first payment is created already-paid and the
  // *next* cycle becomes the tracked "current" payment; a partial/₹0 value here leaves
  // the first payment itself open, for the rare case it hasn't been collected yet.
  firstPaymentAmountReceived: number;
  notes?: string;
}
