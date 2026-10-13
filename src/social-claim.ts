export interface SocialClaim {
  id: string;
  storeId: string;
  guestId: string;
  type: "google_review" | "instagram_tag";
  proofUrl: string; // Storage download URL of the uploaded screenshot
  points: number; // snapshot of SocialRewardAction.points at claim time
  status: "pending_approval" | "approved" | "rejected";
  createdAt: Date;
  resolvedBy?: string; // staffId
  resolvedAt?: Date;
}
