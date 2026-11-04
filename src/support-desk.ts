// Support Desk: the task scheduler for Batao's support / customer-success
// team, plus the customer master that sales creates and support works on.
// It replaces the Ops Center data model (migrated later).
//
//   admin-data/customers/accounts/{id}            CustomerAccount
//   admin-data/customers/payments/{id}            CustomerPayment (sales-owned)
//   admin-data/customers/activities/{id}          CustomerActivity, the append-only account timeline
//   admin-data/support-desk/tasks/{id}            SupportTask, all support work
//   admin-data/support-desk/ticket-series/{id}    SupportTicketSeries (recurring tickets)
//   admin-data/support-desk/config/scheduler      SupportDeskConfig (managers edit)
//   admin-data/support-desk/config-history/{id}   every saved config
import { SalesPerson } from "./sales-desk";

// ------------------------------------------------------------- accounts

// Ops Center names: engage = loyalty, discover = seo, engage_discover = combined.
export type CustomerPlan = "loyalty" | "seo" | "combined";

export const CUSTOMER_PLAN_LABEL: Record<CustomerPlan, string> = {
  loyalty: "Loyalty",
  seo: "SEO",
  combined: "Combined",
};

export type CustomerBillingCycle = "monthly" | "quarterly" | "half_yearly" | "annual";

export const CUSTOMER_BILLING_LABEL: Record<CustomerBillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-yearly",
  annual: "Annual",
};

export type CustomerStatus = "onboarding" | "live" | "ended";

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  onboarding: "Onboarding",
  live: "Live",
  ended: "Ended",
};

export interface CustomerAccount {
  id: string;
  name: string;
  contactName?: string;
  contactRole?: string;
  phone: string; // E.164
  city?: string;
  area?: string;
  waGroupLink?: string; // https://chat.whatsapp.com/…
  storeId?: string | null; // linked Batao store (set at Store setup if it didn't exist yet)
  subdomain?: string | null;

  plan: CustomerPlan;
  websiteAddOn: boolean;
  hasPetpooja: boolean;
  blogsOn: boolean;
  priority: boolean; // Priority customer: its tasks get a scheduler boost
  billingCycle: CustomerBillingCycle;
  setupFee?: number;
  recurringAmount?: number;

  status: CustomerStatus;
  onboardingStartedAt: Date;
  liveAt?: Date | null;
  endedAt?: Date | null;
  churnReason?: string;

  ownerId: string | null; // support account owner; null = in the support pool
  ownerName?: string | null;
  soldById: string; // the sales rep, read-only after creation
  soldByName?: string;
  leadId?: string | null; // Sales Desk lead it was created from

  notes?: string;
  lastContactAt?: Date | null; // last WhatsApp/call either way
  lastActivityAt?: Date;
  createdAt: Date;
  createdById: string;
  createdByName?: string;
}

// ---------------------------------------------------------------- tasks

export type SupportTaskKind = "onboarding" | "recurring" | "renewal" | "ticket";

export type SupportTaskStatus = "todo" | "waiting" | "blocked" | "done" | "skipped" | "no_response";

export const SUPPORT_TASK_STATUS_LABEL: Record<SupportTaskStatus, string> = {
  todo: "To do",
  waiting: "Waiting on customer",
  blocked: "Blocked",
  done: "Done",
  skipped: "Not needed",
  no_response: "No response",
};

export function isOpenTaskStatus(s: SupportTaskStatus): boolean {
  return s === "todo" || s === "waiting" || s === "blocked";
}

export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";

export const SUPPORT_TICKET_PRIORITY_LABEL: Record<SupportTicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export type SupportTicketCategory = "login" | "training" | "bug" | "content" | "billing" | "other";

export const SUPPORT_TICKET_CATEGORY_LABEL: Record<SupportTicketCategory, string> = {
  login: "Login / access",
  training: "Training",
  bug: "Bug",
  content: "Content change",
  billing: "Billing",
  other: "Other",
};

export interface SupportTask {
  id: string;
  accountId: string | null; // null = internal ticket
  accountName?: string;
  kind: SupportTaskKind;
  templateKey: string; // e.g. "logo", "keyword_research", "ticket"
  title: string;
  workflowId?: string; // one onboarding run / campaign cycle / renewal
  dependsOn: string[]; // task ids that must be done (or not needed) first

  status: SupportTaskStatus;
  open: boolean; // denormalized: status is todo / waiting / blocked
  ownerId: string | null; // null = pool
  ownerName?: string | null;

  startAt?: Date | null; // not shown in Now before this
  dueAt?: Date | null;
  fixedTime?: boolean; // a meeting at dueAt
  expectedMin?: number;
  readyAt?: Date | null; // became actionable (unblocked / created)

  // Steps that wait on the customer (logo, access, approvals…)
  customerStep?: boolean;
  chaseCount: number; // asks sent, including the first request
  lastChaseAt?: Date | null;
  escalatedAt?: Date | null;

  // Tickets
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  description?: string;
  raisedById?: string;
  raisedByName?: string;
  reportedByCustomer?: boolean;
  resolutionNote?: string;
  seriesId?: string | null;
  occurrenceNo?: number;
  missedCount?: number;

  lastNote?: string;
  createdAt: Date;
  createdById: string;
  createdByName?: string;
  completedAt?: Date | null;
  completedById?: string | null;
}

// ------------------------------------------------------- recurring tickets

export type SupportRepeatUnit = "days" | "weeks" | "months";

export interface SupportTicketSeries {
  id: string;
  accountId: string | null;
  accountName?: string;
  title: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
  description?: string;
  ownerId: string | null;
  ownerName?: string | null;

  every: number;
  unit: SupportRepeatUnit;
  weekdays?: number[]; // unit = weeks; 0 = Sunday
  monthDay?: number; // unit = months; 31 = last day of the month
  countFrom: "schedule" | "last_closed";
  endsAfter?: number | null;
  endsOn?: Date | null;
  dueAfterWorkingDays: number;

  startsOn: Date;
  nextStartAt: Date | null; // null once ended
  occurrences: number;
  missedCount: number;
  paused: boolean;
  stopped: boolean;
  createdAt: Date;
  createdById: string;
  createdByName?: string;
}

// ------------------------------------------------------------- payments

export type CustomerPaymentKind = "setup" | "recurring" | "renewal";

export interface CustomerPayment {
  id: string;
  accountId: string;
  accountName: string;
  kind: CustomerPaymentKind;
  amountDue: number;
  amountReceived: number; // part payments add up
  dueDate: Date;
  followUpDate?: Date | null;
  paidDate?: Date | null;
  ownerId: string; // the account's "Sold by" rep
  ownerName?: string;
  notes?: string;
  createdAt: Date;
}

// ------------------------------------------------------------- timeline

export type CustomerActivityType =
  | "account_created"
  | "account_updated"
  | "account_owner"
  | "account_status"
  | "task_created"
  | "task_status"
  | "task_owner"
  | "task_due"
  | "chase"
  | "escalated"
  | "note"
  | "whatsapp"
  | "call"
  | "customer_reply"
  | "payment"
  | "series";

export type CustomerChannel = "whatsapp" | "call" | "reply";

export type SupportCallOutcome = "connected" | "no_answer" | "busy" | "callback";

export const SUPPORT_CALL_OUTCOME_LABEL: Record<SupportCallOutcome, string> = {
  connected: "Connected",
  no_answer: "No answer",
  busy: "Busy / switched off",
  callback: "Asked to call back",
};

export interface CustomerActivity {
  id: string;
  accountId: string | null;
  accountName?: string;
  taskId?: string;
  taskTitle?: string;
  type: CustomerActivityType;
  channel?: CustomerChannel; // set for communication (the Messages & calls filter)
  at: Date;
  byId: string;
  byName?: string;
  groupId: string; // written together

  text?: string; // note / message / reply
  fields?: string[]; // account_updated
  statusFrom?: string;
  statusTo?: string;
  ownerFrom?: SalesPerson | null;
  ownerTo?: SalesPerson | null;
  dueFrom?: Date | null;
  dueTo?: Date | null;
  waTarget?: "group" | "contact";
  callOutcome?: SupportCallOutcome;
  durationMin?: number;
}

// --------------------------------------------------------------- config

export interface SupportDeskConfig {
  workStartHour: number;
  workEndHour: number;
  workDays: number[]; // 0 = Sunday

  typeWeight: {
    urgentTicket: number;
    renewal: number;
    onboarding: number;
    recurring: number;
    highTicket: number;
    ticket: number;
    lowTicket: number;
  };
  overduePerHour: number; // points per hour past the due date, capped at 72h
  readyAgePerHour: number; // points per hour a task without a due date has been ready, capped at 72h
  priorityBoost: number;
  behindTargetBoost: number;
  chaseDueBoost: number;

  onboardingTargetDays: number;
  chaseEveryWorkingDays: number;
  escalateAfterChases: number; // chases after the first request

  approvalReminders: number;
  approvalWaitDays: number;
  recurringEveryDays: { campaign: number; gbpReport: number; blog: number };
  renewalLeadDays: Record<CustomerBillingCycle, number>;
  renewalReminderGapDays: Record<CustomerBillingCycle, number>;

  expectedMin: Record<string, number>; // by templateKey; "ticket" for tickets
  messageTemplates: Record<string, string>; // by key; {contact} {account} {item}

  updatedAt?: Date;
  updatedById?: string;
  updatedByName?: string;
}

// ----------------------------------------------------- onboarding steps

export interface OnboardingStepDef {
  key: string;
  title: string;
  customerStep: boolean; // waits on the customer
  dependsOn: string[]; // step keys
}

type StepRule = {
  key: string;
  title: string;
  customerStep?: boolean;
  plans: CustomerPlan[];
  when?: (a: OnboardingInput) => boolean;
  dependsOn: (a: OnboardingInput) => string[];
};

export type OnboardingInput = Pick<CustomerAccount, "plan" | "websiteAddOn" | "hasPetpooja">;

const ALL: CustomerPlan[] = ["loyalty", "seo", "combined"];
const LOYALTY: CustomerPlan[] = ["loyalty", "combined"];
const SEO: CustomerPlan[] = ["seo", "combined"];

const STEP_RULES: StepRule[] = [
  { key: "logo", title: "Logo", customerStep: true, plans: ALL, dependsOn: () => [] },
  { key: "photos", title: "Photos", customerStep: true, plans: ALL, dependsOn: () => [] },
  { key: "data_form", title: "Data form (Google sheet)", customerStep: true, plans: ALL, dependsOn: () => [] },
  { key: "store_setup", title: "Store setup", plans: ALL, dependsOn: () => ["logo", "photos", "data_form"] },
  { key: "offer_setup", title: "Offer setup", plans: LOYALTY, dependsOn: () => ["store_setup"] },
  { key: "qr_design", title: "QR design", plans: LOYALTY, dependsOn: () => ["store_setup"] },
  { key: "website_design", title: "Website design", plans: ALL, when: (a) => a.websiteAddOn, dependsOn: () => ["store_setup"] },
  { key: "website_approval", title: "Website approval", customerStep: true, plans: ALL, when: (a) => a.websiteAddOn, dependsOn: () => ["website_design"] },
  { key: "website_publish", title: "Website publish", plans: ALL, when: (a) => a.websiteAddOn, dependsOn: () => ["website_approval"] },
  { key: "gbp_access", title: "Google Business access", customerStep: true, plans: SEO, dependsOn: () => [] },
  { key: "keyword_research", title: "Keyword research", plans: SEO, dependsOn: () => ["gbp_access"] },
  { key: "seo_settings", title: "SEO settings", plans: SEO, dependsOn: () => ["keyword_research", "store_setup"] },
  { key: "meta_access", title: "Meta Business access", customerStep: true, plans: LOYALTY, dependsOn: () => [] },
  {
    key: "wa_setup",
    title: "WhatsApp setup",
    plans: LOYALTY,
    dependsOn: (a) => ["meta_access", "qr_design", ...(a.websiteAddOn ? ["website_design"] : [])],
  },
  { key: "petpooja", title: "Petpooja integration", plans: LOYALTY, when: (a) => a.hasPetpooja, dependsOn: () => ["store_setup"] },
];

// Training waits for every other step.
const TRAINING_KEY = "training";

export function onboardingSteps(a: OnboardingInput): OnboardingStepDef[] {
  const steps: OnboardingStepDef[] = STEP_RULES.filter((r) => r.plans.includes(a.plan) && (!r.when || r.when(a))).map(
    (r) => ({ key: r.key, title: r.title, customerStep: !!r.customerStep, dependsOn: r.dependsOn(a) }),
  );
  if (a.plan !== "seo") {
    steps.push({ key: TRAINING_KEY, title: "Training", customerStep: false, dependsOn: steps.map((s) => s.key) });
  }
  return steps;
}

// The step whose completion makes the account Live.
export function liveStepKey(plan: CustomerPlan): string {
  return plan === "seo" ? "seo_settings" : TRAINING_KEY;
}

// Steps an upgraded / changed account still needs (by key).
export function missingOnboardingSteps(a: OnboardingInput, existingKeys: string[]): OnboardingStepDef[] {
  const have = new Set(existingKeys);
  return onboardingSteps(a).filter((s) => !have.has(s.key));
}

// ---------------------------------------------------------------- defaults

export const DEFAULT_SUPPORT_DESK_CONFIG: SupportDeskConfig = {
  workStartHour: 10,
  workEndHour: 19,
  workDays: [1, 2, 3, 4, 5, 6],
  typeWeight: { urgentTicket: 100, renewal: 60, onboarding: 40, recurring: 25, highTicket: 30, ticket: 15, lowTicket: 5 },
  overduePerHour: 2,
  readyAgePerHour: 0.5,
  priorityBoost: 15,
  behindTargetBoost: 20,
  chaseDueBoost: 10,
  onboardingTargetDays: 7,
  chaseEveryWorkingDays: 2,
  escalateAfterChases: 3,
  approvalReminders: 3,
  approvalWaitDays: 7,
  recurringEveryDays: { campaign: 30, gbpReport: 60, blog: 14 },
  renewalLeadDays: { annual: 30, half_yearly: 21, quarterly: 15, monthly: 7 },
  renewalReminderGapDays: { annual: 7, half_yearly: 7, quarterly: 7, monthly: 2 },
  expectedMin: {
    store_setup: 40,
    offer_setup: 20,
    qr_design: 30,
    website_design: 60,
    website_publish: 20,
    keyword_research: 60,
    seo_settings: 30,
    wa_setup: 30,
    petpooja: 30,
    training: 45,
    chase: 5,
    ticket: 20,
  },
  messageTemplates: {
    request: "Hi {contact}, to set up {account} on Batao we need your {item}. Could you please share it here?",
    chase: "Hi {contact}, a gentle reminder to share the {item} for {account} so we can continue your setup.",
    general: "Hi {contact}, ",
  },
};
