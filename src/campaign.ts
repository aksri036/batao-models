export interface BtCampaign {
  id: string;
  recipients: string[]; //StoreVisit Ids
  custIds?: string[]; // member id or lead id (use recipients if this is null)
  directNumbers?: string[]; //in case user is giving list of mobile numbers directly in the UI
  storeId: string;
  createdAt: Date;
  sentAt?: Date;
  lastUpdatedAt?: Date;
  name: string;
  photos: string[];
  msg: string;
  channel: string[]; //["whatsapp", 'sms', 'email']
  status:
    | "created"
    | "scheduled"
    | "queued"
    | "completed"
    | "failed"
    | "approved"
    | "rejected"
    | "processing"
    | "deleted"
    | "sent"
    | (string & {});
  waTemplateName?: string;
  waTemplateId?: string;
  waTemplateType?: "utility" | "marketing " | (string & {});
  waTemplateStatus:
    | "PENDING"
    | "REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "DISABLED"
    | "IN_APPEAL"
    | (string & {});
  runAt: Date; //set now() for sending immediately
  previouslyRanCampaigns?: string[]; //parent campaigns list, in case it was created by retargeting existing campaign
  offerId?: string; //campaign was created by an offer. Template will get view offer button url.

  campaignType?: "gift" | "ask";
  templateId?: string;
  pointsGrant?: { points: number; expiryDays?: number };
  askAction?: "google_review" | "instagram_tag" | "referral";
  cta?: { type: "url" | "phone"; label: string; value: string };

  // Send-path counters (set during fan-out)
  total?: number;
  limitedCount?: number;
  scheduledCount?: number;
  sentCount?: number;
  sendFailedCount?: number;

  // Delivery counters (updated from webhook)
  deliveredCount?: number;
  deliveryFailedCount?: number;
  totalBilledAmount?: number; // in paise

  // Effectiveness — recipients who ordered within the attribution window
  visitsAttributed?: number;
  revenueAttributed?: number;
}

export const createEmptyCampaign = (): BtCampaign => ({
  id: "",
  recipients: [],
  storeId: "",
  createdAt: new Date(),
  name: "",
  photos: [],
  msg: "",
  channel: ["whatsapp"],
  status: "created",
  runAt: new Date(),
  waTemplateStatus: "PENDING",
});

export interface CampaignTargetStatus {
  to: string;
  msgId?: string | null;
  sendStatus: "sent" | "failed" | "error" | (string & {});
  sentAt?: Date;
  sendError?: string;
  deliveryStatus?: "delivered" | "failed" | "read" | "sent" | (string & {});
  deliveredAt?: Date;
  lastUpdatedAt?: Date;
  deliveryError?: string;
  deliveryErrorCode?: number;
  billedAt?: Date;
}

export enum CampaignStepNames {
  addMessage = 0,
  target = 1,
  approval = 2,
  preview = 3,
  schedule = 4,
  success = 5,
}
