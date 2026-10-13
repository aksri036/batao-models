export type PaymentStatus = "pending" | "partial" | "overdue" | "paid";

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending",
  partial: "Partial",
  overdue: "Overdue",
  paid: "Paid",
};

export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, "default" | "info" | "warning" | "error" | "success"> = {
  pending: "info",
  partial: "warning",
  overdue: "error",
  paid: "success",
};

// admin/ops-center/payments/{id} — kept flat (not nested per customer) so a
// cross-customer "what's overdue" query is a plain query, matching OpsTicket.
export interface OpsPayment {
  id: string;
  customerId: string;
  storeName: string; // denormalized, for the cross-customer Payments page
  ownerRM: string; // denormalized, for owner filtering
  amountDue: number;
  amountReceived: number; // cumulative — incremented by each recorded payment against this cycle
  dueDate: Date; // never silently moved by a partial payment
  followUpDate?: Date | null; // separate, RM-settable "check back on" date
  paidDate?: Date | null; // set once amountReceived >= amountDue
  notes?: string; // latest note — full history lives in the Activity log
  createdTime: Date;
}

// Status is computed, not stored — same convention as isStale/isReviewOverdue/dueDateColor.
export function paymentStatus(p: Pick<OpsPayment, "amountDue" | "amountReceived" | "dueDate">): PaymentStatus {
  if (p.amountReceived >= p.amountDue) return "paid";
  if (p.dueDate.getTime() < Date.now()) return "overdue";
  if (p.amountReceived > 0) return "partial";
  return "pending";
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// The current/open payment is the earliest-due one that isn't fully paid yet —
// by design there's only ever one, since a new cycle only gets created once
// the previous one is fully settled (see OpsDbOps.createOpsCustomer/recordPayment).
export function findCurrentPayment(payments: OpsPayment[]): OpsPayment | undefined {
  const open = payments.filter((p) => paymentStatus(p) !== "paid");
  if (open.length === 0) return undefined;
  return [...open].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
}
