export type ReviewStatus = "scheduled" | "completed" | "skipped";

export interface OpsReview {
  id: string;
  scheduledDate: Date;
  completedDate?: Date | null;
  status: ReviewStatus;
  reviewer?: string; // phone
  summary?: string;
}
