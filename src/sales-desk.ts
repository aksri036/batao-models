// Sales Desk: Batao's own sales funnel (selling Batao to restaurants).
// Marketing imports leads into a common pool; the first real action by a
// salesperson claims a lead and they own it through pitch → demo →
// negotiation → won/lost unless a manager reassigns it.
//
//   admin-data/sales-desk/leads/{phoneDigits}   one doc per lead (id = 91XXXXXXXXXX)
//   admin-data/sales-desk/activities/{id}       append-only timeline + learning data
//   admin-data/sales-desk/imports/{id}          one summary per import
//   admin-data/sales-desk/config/scheduler      SalesDeskConfig (managers edit)
//   admin-data/sales-desk/config-history/{id}   every saved config, who and when
//
// Stage (lead.stage), outcome (activity.outcome) and next action
// (lead.nextAction) are deliberately separate fields.

export type SalesStage = "new" | "pitch" | "demo" | "negotiation" | "won" | "lost";

export const SALES_STAGES: SalesStage[] = ["new", "pitch", "demo", "negotiation", "won", "lost"];
export const SALES_OPEN_STAGES: SalesStage[] = ["new", "pitch", "demo", "negotiation"];

export const SALES_STAGE_LABEL: Record<SalesStage, string> = {
  new: "New",
  pitch: "Pitch",
  demo: "Demo",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export function isOpenStage(stage: SalesStage): boolean {
  return stage !== "won" && stage !== "lost";
}

export type SalesLostReason =
  | "price"
  | "competitor"
  | "not_decision_maker"
  | "not_interested"
  | "unreachable"
  | "wrong_number"
  | "other";

export const SALES_LOST_REASON_LABEL: Record<SalesLostReason, string> = {
  price: "Price",
  competitor: "Uses a competitor",
  not_decision_maker: "Not the decision maker",
  not_interested: "Not interested",
  unreachable: "Unreachable",
  wrong_number: "Wrong number",
  other: "Other",
};

export type SalesCallOutcome =
  | "no_answer"
  | "busy"
  | "callback"
  | "pitched"
  | "demo_booked"
  | "negotiating"
  | "won"
  | "not_interested"
  | "wrong_number";

export const SALES_CALL_OUTCOME_LABEL: Record<SalesCallOutcome, string> = {
  no_answer: "No answer",
  busy: "Busy / switched off",
  callback: "Asked for callback",
  pitched: "Connected: pitched",
  demo_booked: "Connected: demo booked",
  negotiating: "Connected: negotiating",
  won: "Connected: won",
  not_interested: "Not interested",
  wrong_number: "Wrong number",
};

// The lead picked up and spoke to us (wrong number doesn't count).
export const SALES_CONNECTED_OUTCOMES: SalesCallOutcome[] = [
  "callback",
  "pitched",
  "demo_booked",
  "negotiating",
  "won",
  "not_interested",
];

export type SalesDemoOutcome = "done" | "no_show" | "rescheduled";

export const SALES_DEMO_OUTCOME_LABEL: Record<SalesDemoOutcome, string> = {
  done: "Done",
  no_show: "No-show",
  rescheduled: "Rescheduled",
};

export type SalesDemoMode = "gmeet" | "zoom" | "phone";

export const SALES_DEMO_MODE_LABEL: Record<SalesDemoMode, string> = {
  gmeet: "Google Meet",
  zoom: "Zoom",
  phone: "Phone",
};

export type SalesNextActionType = "call" | "followup" | "demo";

export const SALES_NEXT_ACTION_LABEL: Record<SalesNextActionType, string> = {
  call: "Call",
  followup: "Follow-up",
  demo: "Demo",
};

export interface SalesNextAction {
  type: SalesNextActionType;
  // null = imported without a date: shown as to-do now, never overdue, and
  // given a real date the next time the salesperson logs the lead.
  dueAt: Date | null;
  // Fixed time (a demo, "call me at 4") vs flexible (any time after dueAt).
  fixedTime: boolean;
  note?: string;
  demoMode?: SalesDemoMode;
  meetLink?: string;
  setById: string;
  setByName?: string;
  setAt: Date;
}

export type SalesDealPlan = "loyalty" | "seo" | "combined";

export const SALES_DEAL_PLAN_LABEL: Record<SalesDealPlan, string> = {
  loyalty: "Loyalty",
  seo: "SEO",
  combined: "Combined",
};

export type SalesBillingCycle = "monthly" | "quarterly" | "half_yearly" | "annual";

export const SALES_BILLING_LABEL: Record<SalesBillingCycle, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half-yearly",
  annual: "Annual",
};

const CYCLES_PER_YEAR: Record<SalesBillingCycle, number> = { monthly: 12, quarterly: 4, half_yearly: 2, annual: 1 };

export interface SalesDeal {
  plan: SalesDealPlan;
  billingCycle: SalesBillingCycle;
  amount: number; // ₹ per billing cycle
  expected: boolean; // true = expected (negotiation), false = won
  setAt: Date;
  setById: string;
  setByName?: string;
}

// ₹ per year for a deal.
export function dealAnnualValue(d: Pick<SalesDeal, "amount" | "billingCycle">): number {
  return d.amount * CYCLES_PER_YEAR[d.billingCycle];
}

export interface SalesPerson {
  id: string; // admin phone, E.164
  name?: string;
}

export interface SalesLead {
  id: string; // phone digits, e.g. 919876543210
  restaurant: string;
  phone: string; // E.164, +91XXXXXXXXXX
  contactName?: string;
  contactRole?: string;
  city?: string;
  area?: string;
  source?: string;
  email?: string;
  pos?: string;
  // Seats as a range, the way leads give it: "25-50" → 25..50, "100+" → 100..null,
  // "40" → 40..40. Older leads may only have `seats` (an exact number).
  seatsMin?: number;
  seatsMax?: number | null;
  seats?: number;

  stage: SalesStage;
  open: boolean; // stage is not won/lost; denormalized for queries
  stageChangedAt: Date;
  lostReason?: SalesLostReason;
  closedAt?: Date;

  ownerId: string | null; // null = in the common pool
  ownerName?: string | null;
  assignedAt?: Date;

  nextAction: SalesNextAction | null;

  // Expected deal (set at Negotiation, optional) / actual deal (required at Won).
  deal?: SalesDeal;

  unansweredStreak: number; // no answer / busy calls in a row
  totalCalls: number;
  lastActivityAt?: Date;
  lastActivityById?: string;
  lastOutcome?: SalesCallOutcome | SalesDemoOutcome;
  lastNote?: string;

  importBatchId?: string;
  // Set when the lead was migrated with pipeline data (stage/owner) rather
  // than imported fresh into the pool. Imported stages are not stage moves:
  // they are left out of activity metrics, the funnel and learning stats.
  importedAs?: { stage: SalesStage; owner: SalesPerson | null };
  createdAt: Date;
  createdById: string;
  createdByName?: string;
}

export type SalesActivityType = "call" | "demo" | "note" | "stage_change" | "next_action" | "assigned" | "details_changed";

export type SalesAssignReason = "claimed" | "reassigned" | "returned_to_pool";

// Where a call/demo was started from, so we can later compare picks the
// scheduler recommended with ones the salesperson chose themselves.
export type SalesActionOrigin = "next_up" | "desk_list" | "lead_page";

// Recorded on call and demo activities; v1 only reports on it (no auto-tuning).
export interface SalesLearningContext {
  hourIST: number; // 0–23
  weekdayIST: number; // 0 = Sunday
  attemptNo: number; // this lead's call number, 1-based (calls only)
  unansweredBefore: number;
  stageAtTime: SalesStage;
  leadAgeDays: number;
  pos?: string;
  seats?: number; // legacy exact seats
  seatsMin?: number;
  seatsMax?: number | null;
  wasScheduled: boolean; // the lead had a next action due at or before now
  dueLagMin?: number; // minutes after (positive) the next action's due time
  dueFixed?: boolean; // that next action was fixed-time (callback / demo)
  origin?: SalesActionOrigin;
  recommendedRank?: number; // 1 = the Next up card
  score?: number;
  advancedStage: boolean; // this action moved the stage forward
}

export interface SalesActivity {
  id: string;
  leadId: string;
  restaurant: string;
  leadSource?: string;
  type: SalesActivityType;
  at: Date;
  byId: string;
  byName?: string;
  ownerId: string | null; // lead owner after this event
  groupId: string; // activities written together (call + stage change + next action)

  outcome?: SalesCallOutcome | SalesDemoOutcome;
  durationMin?: number;
  demoMode?: SalesDemoMode;
  note?: string;

  stageFrom?: SalesStage;
  stageTo?: SalesStage;
  lostReason?: SalesLostReason;

  nextActionFrom?: SalesNextAction | null;
  nextActionTo?: SalesNextAction | null;

  fields?: string[]; // details_changed: which lead fields were edited
  deal?: SalesDeal; // set when this action recorded or changed the deal

  assignFrom?: SalesPerson | null;
  assignTo?: SalesPerson | null;
  assignReason?: SalesAssignReason;

  ctx?: SalesLearningContext;
}

export interface SalesImportBatch {
  id: string;
  fileName: string;
  sourceTag: string;
  at: Date;
  byId: string;
  byName?: string;
  rows: number;
  inserted: number;
  duplicates: number;
  invalid: number;
  assigned?: number; // leads imported with an owner (migration)
}

// ------------------------------------------------------------- seats

export interface SeatRange {
  min: number;
  max: number | null; // null = open-ended ("100+")
}

export function leadSeatRange(lead: Pick<SalesLead, "seatsMin" | "seatsMax" | "seats">): SeatRange | null {
  if (lead.seatsMin !== undefined && lead.seatsMin !== null) return { min: lead.seatsMin, max: lead.seatsMax ?? null };
  if (lead.seats) return { min: lead.seats, max: lead.seats };
  return null;
}

// "25–50 seats", "100+ seats", "40 seats".
export function formatSeatRange(r: SeatRange | null): string | null {
  if (!r) return null;
  if (r.max === null) return `${r.min}+ seats`;
  if (r.max === r.min) return `${r.min} seats`;
  return `${r.min}–${r.max} seats`;
}

// The range reaches the threshold (a "25–50" lead counts for a 40-seat rule).
export function seatsReach(r: SeatRange | null, threshold: number): boolean {
  if (!r) return false;
  return r.max === null || r.max >= threshold;
}

// ---------------------------------------------------------------- POS

// One name per POS however it's typed: every "Pet Pooja" / "petpuja" /
// "Petpoja" / "PetPooja" variant is "Petpooja". Others are kept as typed
// (trimmed); empty → undefined.
export function normalizePos(raw: string | undefined | null): string | undefined {
  const t = (raw ?? "").trim();
  if (!t) return undefined;
  const squashed = t.toLowerCase().replace(/[^a-z]/g, "");
  // Any spelling that's clearly Petpooja: "pooj…" anywhere, or pet/per/prt + puja/poja.
  if (squashed.includes("pooj") || /p[a-z]?t*p[ou]j/.test(squashed)) return "Petpooja";
  return t;
}

// Sales working hours, India time.
export const SALES_WORK_START_HOUR = 11;
export const SALES_WORK_END_HOUR = 19;
export const SALES_WORK_DAYS = [1, 2, 3, 4, 5, 6]; // Mon–Sat

export interface SalesDeskConfig {
  stageWeight: Record<"new" | "pitch" | "demo" | "negotiation", number>;
  overduePerHour: number; // points per hour overdue, capped at 48h
  freshBonus: number; // pool lead younger than freshHours
  freshHours: number;
  noNextActionBonus: number; // owned lead with nothing scheduled
  fitBonus: number;
  preferredPos: string[]; // case-insensitive match on lead.pos
  seatThreshold: number; // seats ≥ this earns the fit bonus
  attemptPenalty: number; // per unanswered call in a row
  maxUnanswered: number; // after this many, suggest Lost: unreachable for review
  // Manager targets (Performance view), team-wide with optional per-rep overrides.
  targets?: SalesTargets;
  targetsByRep?: Record<string, Partial<SalesTargets>>;
  // Days allowed in a stage before an open deal counts as stuck.
  stuckDays?: { pitch: number; demo: number; negotiation: number };
  durationsMin: { pitch: number; demo: number; negotiation: number; close: number; wrapUp: number };
  cadence: {
    retryHours: number; // no answer / busy
    callbackHours: number; // default for "asked for callback" when no time given
    pitchedFollowupDays: number;
    demoDoneFollowupDays: number;
    negotiatingFollowupDays: number;
  };
  updatedAt?: Date;
  updatedById?: string;
  updatedByName?: string;
}

export interface SalesTargets {
  callsPerDay: number;
  demosPerWeek: number;
  winsPerMonth: number;
}

export const DEFAULT_SALES_TARGETS: SalesTargets = { callsPerDay: 40, demosPerWeek: 5, winsPerMonth: 4 };
export const DEFAULT_STUCK_DAYS = { pitch: 14, demo: 10, negotiation: 14 };

export const DEFAULT_SALES_DESK_CONFIG: SalesDeskConfig = {
  stageWeight: { new: 10, pitch: 20, demo: 40, negotiation: 60 },
  overduePerHour: 2,
  freshBonus: 25,
  freshHours: 24,
  noNextActionBonus: 15,
  fitBonus: 10,
  preferredPos: ["Petpooja"],
  seatThreshold: 40,
  attemptPenalty: 4,
  maxUnanswered: 6,
  targets: DEFAULT_SALES_TARGETS,
  targetsByRep: {},
  stuckDays: DEFAULT_STUCK_DAYS,
  durationsMin: { pitch: 7, demo: 30, negotiation: 10, close: 2, wrapUp: 3 },
  cadence: {
    retryHours: 3,
    callbackHours: 2,
    pitchedFollowupDays: 2,
    demoDoneFollowupDays: 1,
    negotiatingFollowupDays: 1,
  },
};
