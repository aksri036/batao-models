// Per-store WhatsApp templates used by auto campaigns. Each key is the
// configName (and doc id) under stores/{id}/wa-automsg-templates.
export const AUTO_CAMPAIGN_TEMPLATE_KEYS = [
  "auto-festival-greeting",
  "auto-festival-offer",
] as const;

export type AutoCampaignTemplateKey =
  (typeof AUTO_CAMPAIGN_TEMPLATE_KEYS)[number];
