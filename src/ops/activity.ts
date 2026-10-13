// Audit trail for a customer's ops record — modeled on the existing
// GmbActivityRecord discriminated-union pattern (src/models/gmb/types.ts).
export type OpsActivity =
  | { type: "stage_changed"; from: string; to: string; author: string; timestamp: Date }
  | { type: "fields_changed"; fields: string[]; author: string; timestamp: Date }
  | {
      type: "milestone_updated";
      milestoneLabel: string;
      from: string;
      to: string;
      author: string;
      timestamp: Date;
    }
  | { type: "review_completed"; summary?: string; author: string; timestamp: Date }
  | { type: "ticket_raised"; ticketTitle: string; assignedTo: string; author: string; timestamp: Date }
  | {
      type: "ticket_status_changed";
      ticketTitle: string;
      from: string;
      to: string;
      author: string;
      timestamp: Date;
    }
  | { type: "payment_recorded"; amount: number; resultingStatus: string; author: string; timestamp: Date }
  | {
      type: "payment_followup";
      note: string;
      followUpDateLabel?: string;
      author: string;
      timestamp: Date;
    }
  | { type: "payment_edited"; changes: string[]; author: string; timestamp: Date }
  | { type: "payment_deleted"; amountDue: number; dueDateLabel: string; author: string; timestamp: Date }
  | { type: "ticket_edited"; ticketTitle: string; changes: string[]; author: string; timestamp: Date }
  | { type: "ticket_deleted"; ticketTitle: string; author: string; timestamp: Date }
  | { type: "review_edited"; changes: string[]; author: string; timestamp: Date }
  | { type: "review_deleted"; scheduledDateLabel: string; author: string; timestamp: Date }
  | { type: "milestone_added"; milestoneLabel: string; author: string; timestamp: Date }
  | { type: "milestone_deleted"; milestoneLabel: string; author: string; timestamp: Date }
  | { type: "customer_archived"; author: string; timestamp: Date }
  | { type: "customer_unarchived"; author: string; timestamp: Date };

export type OpsActivityRecord = OpsActivity & { id: string };

export const FIELD_LABELS: Record<string, string> = {
  storeName: "Store Name",
  subdomain: "Linked Store",
  storeId: "Linked Store",
  contactName: "Contact Name",
  contactPhone: "Contact Phone",
  ownerRM: "Owner (RM)",
  csOwner: "CS Owner",
  nextAction: "Next Action",
  nextActionDueDate: "Next Action Due Date",
  seoEnabled: "SEO Enabled",
  hasPetpooja: "Has Petpooja",
  isStrategic: "Strategic Flag",
  strategicNotes: "Strategic Notes",
  expansionStrategy: "Expansion Strategy",
  plan: "Plan",
  billingCycle: "Billing Cycle",
  addOns: "Add-ons",
  setupFee: "Setup Fee",
  recurringAmount: "Recurring Amount",
  nextPaymentDate: "Next Payment Date",
  notes: "Notes",
};
