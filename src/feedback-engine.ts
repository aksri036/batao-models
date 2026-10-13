export interface FeedbackSubcategory {
  id: string;
  name: string;
}

export interface FeedbackCategory {
  id: string;
  name: string;
  subcategories: FeedbackSubcategory[];
}

export interface FeedbackFormExtraFields {
  collectBirthday: boolean;
  collectAnniversary: boolean;
  askNps: boolean;
  askSource: boolean;
  sourceOptions: string[];
}

export const DEFAULT_SOURCE_OPTIONS = [
  "Google Search",
  "Google Maps",
  "Instagram",
  "Friend / Family",
  "Walk-in",
  "Other",
];

export interface FeedbackForm {
  id: string;
  storeId: string;
  name: string;
  isActive: boolean;
  categories: FeedbackCategory[];
  extraFields: FeedbackFormExtraFields;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_EXTRA_FIELDS: FeedbackFormExtraFields = {
  collectBirthday: false,
  collectAnniversary: false,
  askNps: false,
  askSource: false,
  sourceOptions: DEFAULT_SOURCE_OPTIONS,
};

export type FeedbackRating = "wow" | "good" | "could_be_better";
export type NpsAnswer = "definitely" | "maybe" | "not_yet";
export type FeedbackClassification = "promoter" | "neutral" | "recovery_needed";

export interface CategoryRating {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  rating: FeedbackRating;
}

export interface FeedbackSubmission {
  id: string;
  storeId: string;
  formId: string;
  guestName: string;
  guestPhone: string;
  overallRating: 1 | 2 | 3 | 4 | 5;
  categoryRatings: CategoryRating[];
  textFeedback?: string;
  npsAnswer?: NpsAnswer;
  sourceAnswer?: string;
  birthday?: string;
  anniversary?: string;
  submittedAt: Date;
  classification?: FeedbackClassification;
  mealPeriod?: "lunch" | "dinner" | "other";
  tableNumber?: string;
  staffId?: string;
  waMessageSent?: boolean;
}

export const DEFAULT_FEEDBACK_FORM_CATEGORIES: FeedbackCategory[] = [
  {
    id: "food",
    name: "Food",
    subcategories: [
      { id: "starters", name: "Starters" },
      { id: "main_course", name: "Main Course" },
      { id: "desserts", name: "Desserts" },
      { id: "beverages", name: "Beverages" },
    ],
  },
  {
    id: "service",
    name: "Service",
    subcategories: [
      { id: "wait_time", name: "Wait Time" },
      { id: "staff_attitude", name: "Staff Attitude" },
      { id: "order_accuracy", name: "Order Accuracy" },
    ],
  },
  {
    id: "ambience",
    name: "Ambience",
    subcategories: [
      { id: "cleanliness", name: "Cleanliness" },
      { id: "music_noise", name: "Music & Noise" },
      { id: "seating_comfort", name: "Seating Comfort" },
    ],
  },
];
