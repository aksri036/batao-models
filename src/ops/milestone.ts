export type MilestoneStatus = "not_started" | "in_progress" | "done" | "blocked" | "na";
export type MilestoneCategory = "onboarding" | "seo" | "petpooja";

export interface OpsMilestone {
  id: string;
  key: string;
  label: string;
  category: MilestoneCategory;
  status: MilestoneStatus;
  owner?: string; // phone
  dueDate?: Date | null;
  completedDate?: Date | null;
  notes?: string;
  order: number;
}

interface MilestoneTemplate {
  key: string;
  label: string;
  category: MilestoneCategory;
  order: number;
}

export const ONBOARDING_MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  { key: "training", label: "Training", category: "onboarding", order: 1 },
  { key: "qr_setup", label: "QR Setup", category: "onboarding", order: 2 },
  { key: "whatsapp_setup", label: "WhatsApp Setup", category: "onboarding", order: 3 },
  { key: "store_id_creation", label: "Store ID Creation", category: "onboarding", order: 4 },
  { key: "menu_catalog_upload", label: "Menu / Catalog Upload", category: "onboarding", order: 5 },
  { key: "go_live", label: "Go-Live", category: "onboarding", order: 6 },
];

export const SEO_MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  { key: "gbp_claim", label: "Google Business Profile Claim", category: "seo", order: 7 },
  { key: "keyword_research", label: "Keyword Research", category: "seo", order: 8 },
  { key: "seo_settings_configured", label: "SEO Settings Configured", category: "seo", order: 9 },
];

export const PETPOOJA_MILESTONE_TEMPLATES: MilestoneTemplate[] = [
  { key: "petpooja_integration", label: "Petpooja Integration", category: "petpooja", order: 10 },
];

export function defaultMilestone(template: MilestoneTemplate): Omit<OpsMilestone, "id"> {
  return {
    key: template.key,
    label: template.label,
    category: template.category,
    status: "not_started",
    order: template.order,
  };
}
