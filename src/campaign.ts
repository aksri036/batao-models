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

  // ---------------------------------------------------------------------------
  // Template values. A campaign may declare how its WhatsApp template's
  // variables are filled, so any template can be sent without changing the
  // sender. When these are absent the sender falls back to the older inferred
  // convention: body {{1}}=guest name, {{2}}=points, {{3}}=store name,
  // {{4}}=expiry days, and the URL button gets the claim-offer link only when
  // offerId is set. Existing campaigns don't set them, so they are unaffected.
  // ---------------------------------------------------------------------------
  // Values for the template body {{1}}..{{n}}, in order. CAMPAIGN_GUEST_NAME_TOKEN
  // anywhere in a value is replaced with each recipient's name.
  bodyParams?: string[] | null;
  // Values for the template's URL button(s) {{1}}, by button index. Each is the
  // part of the URL after the template's base (e.g. "spicegarden/dashboard").
  buttonParams?: string[] | null;

  // Set when the campaign was created by auto campaigns from a monthly plan
  // entry (it is created with status "approved" and the store's pre-approved
  // template, so no template is submitted). Used to link the campaign back to
  // its plan and to keep it out of the manual campaign lists.
  autoCampaign?: {
    month: string; // "YYYY-MM" plan the entry belongs to
    entryId: string; // AutoCampaignPlanEntry id
    type: string; // AutoCampaignType, e.g. "festival"
    sendDate: string; // "YYYY-MM-DD" (IST) send day this campaign covers
  } | null;
}

// Placeholder in BtCampaign.bodyParams replaced per recipient with the
// guest's name, or CAMPAIGN_GUEST_NAME_FALLBACK when the name is unknown.
export const CAMPAIGN_GUEST_NAME_TOKEN = "{{guestName}}";
export const CAMPAIGN_GUEST_NAME_FALLBACK = "Guest";

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
  // Send attempts so far. Sends run through a Cloud Tasks queue that retries
  // WhatsApp rate limits (Meta 130429); while retrying, sendStatus is
  // "rate_limited". The final attempt sets "sent" or "failed".
  attempts?: number;
  // Last provider error (Meta code + message), set on failed/rate-limited attempts
  lastError?: { code?: number; message: string };
  lastAttemptAt?: Date;
}

export enum CampaignStepNames {
  addMessage = 0,
  target = 1,
  approval = 2,
  preview = 3,
  schedule = 4,
  success = 5,
}
