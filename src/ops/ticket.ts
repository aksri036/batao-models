export type TicketStatus = "open" | "in_progress" | "blocked" | "resolved";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  blocked: "Blocked",
  resolved: "Resolved",
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export interface OpsTicket {
  id: string;
  customerId: string;
  storeName: string; // denormalized for cross-customer ticket lists
  title: string;
  description?: string;
  raisedBy: string; // phone
  assignedTo: string; // phone
  status: TicketStatus;
  priority: TicketPriority;
  dueDate?: Date | null;
  createdTime: Date;
  resolvedTime?: Date | null;
}

export interface NewTicketInput {
  customerId: string;
  storeName: string;
  title: string;
  description?: string;
  assignedTo: string;
  priority: TicketPriority;
  dueDate?: Date | null;
}
