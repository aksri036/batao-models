import { BtAddress } from "./address";
import { OrderSettings } from "./order";
import { BtSubscription } from "./billing/billing";
import { StoreStaffRewardsSettings } from "./staff";
import { WASettings } from "./wa-settings";

export interface Store {
  createdTime: Date;
  address?: BtAddress;
  description?: string;
  id: string;
  logo?: string;
  name: string;
  nextCouponNumber: number;
  ownerId: string;
  photos: string[];
  subdomain: string;
  coverPhoto?: string;
  thumbnail?: string;
  specialities?: string;
  gReviewLink?: string;
  placeId?: string;
  actions?: StoreAction[];
  gstNumber?: string;

  isKARegd?: boolean; //is store registered in KARNATAKA
  subscription?: BtSubscription | null;
  bannerPhotos?: string[] | null;
  instagramHandle?: string | null;
  pointsSettings?: StorePointsSettings | null;
  chainId?: string; // is store part of a chain
  waSettings?: WASettings;
  category?: string | null; //High-level industry category e.g. "healthcare", "foodbeverages", "retailstores"
  subcategory?: string | null; //Specific subcategory within the industry e.g. "dentist", "casualdiningrestaurantscdr"
  staffRewardsSettings?: StoreStaffRewardsSettings | null;
  featureFlags?: StoreFeatureFlags;
  orderSettings?: OrderSettings | null;
  lastOrderNumber?: number;
}

export interface StoreStats {
  members?: number;
  totalDiscount?: number;
  totalOrderAmount?: number;
  invites?: number;
  inviteAccepted?: number;
  leads?: number;
}
export enum StoreActionType {
  "bookTable",
  "homeDelivery",
  "onlineMenu",
  "tableOrdering",
  "petpoojaTableOrdering",
}

export interface StoreActionUrl {
  type: string; //could be url (https://....), phone:(tel://), whatsapp (wa://...), Batao route(https://batao.ai/someroute), map (table id:order url map)
  value?: string | null; // plain URL
  tableValueMap?: Record<string, string> | null; //table → order URL map
  // Petpooja table ordering
  tableIds?: string[] | null;
}
export interface StoreAction {
  id: string;
  type: string; //StoreActionType
  name: string;
  url: StoreActionUrl;
}

export interface StoreRating {
  id: string;
  rating: number;
  feedback: string;
  timestamp: Date;
  userId?: string | null; //null means
  staffId: string; //staff which got this review done
}
export interface StorePosSettings {
  id?: string;
  petPoojaMenu?: boolean;
  storeStatus?: string;
}

export type StoreWithTable = Store & {
  tableNo?: string | null;
  "pos-settings"?: StorePosSettings;
};

export enum VisitFilterType {
  all,
  last3Months,
  lastMonth,
  repeat,
  norepeat,
}

export interface StoreVisit {
  id: string;
  userId: string; //userId or leadId
  storeId: string;
  timestamp: Date; //a new visit for a user will be added only if new visit timestamp is 6hrs greater than previous
  type?: string; //"lead" | "customer" | undefined
}

export interface StorePointsSettings {
  minEncashPoints?: number | null;
  maxEncashPoints?: number | null;
  walletTopupEnabled?: boolean;
  //1. conversionRate ( 1 point = ₹5) ? 2. can seller give gift item as redeem?
}

export const STORE_CATEGORIES = {
  foodbeverages: {
    label: "🍽️ Food & Beverages",
    sub: {
      qsr: "Quick Service Restaurants (QSRs)",
      fcr: "Fast Casual Restaurants (FCRs)",
      cdr: "Casual Dining Restaurants (CDRs)",
      fdr: "Fine Dining Restaurants (FDRs)",
      cafes: "Restaurants & Cafes",
      desserts: "Bakeries & Desserts",
      pubs: "Pubs & Restobars",
      cloudkitchen: "Cloud Kitchens",
      beverages: "Beverages & Juice Bars",
    },
  },
  healthcare: {
    label: "🏥 Healthcare",
    sub: {
      cardiologist: "Cardiologist",
      dermatologist: "Dermatologist",
      endocrinologist: "Endocrinologist",
      gastroenterologist: "Gastroenterologist",
      generalpractioner: "General Practitioner",
      neurologist: "Neurologist",
      oncologist: "Oncologist",
      orthopedician: "Orthopedician",
      paediatrician: "Paediatrician",
      urologist: "Urologist",
      dentist: "Dentist",
      ent: "ENT Specialist",
      ophthalmologist: "Ophthalmologist",
      physiotherapist: "Physiotherapist",
      psychologist: "Psychologist",
      ayurveda: "Ayurveda",
      homeopathy: "Homeopathy",
      nutritiondiet: "Nutrition & Diet",
    },
  },

  retail: {
    label: "🛍️ Retail Stores",
    sub: {
      clothing: "Clothing & Accessories",
      electronics: "Electronics & Gadgets",
      homelifestyle: "Home & Lifestyle",
      pharmacy: "Pharmacy",
      footwear: "Footwear",
      cosmetics: "Cosmetics & Beauty Products",
      bags: "Bags & Luggage",
    },
  },

  beauty_wellness: {
    label: "💆 Beauty & Wellness",
    sub: {
      salon: "Salon",
      spa: "Spa",
      ayurveda_center: "Ayurveda Center",
      tattoo: "Tattoo Studio",
      dermat_clinic: "Dermatology Clinic",
      nailstudio: "Nail Studio",
      gym: "Gym & Fitness",
      yoga: "Yoga Center",
    },
  },

  education: {
    label: "📚 Education & Coaching",
    sub: {
      school: "School",
      coaching: "Coaching Center",
      tuitions: "Tuitions",
      language: "Language Classes",
      music: "Music Academy",
      dance: "Dance Academy",
      skilltraining: "Skill Training",
    },
  },

  professionalservices: {
    label: "🧑‍💼 Professional Services",
    sub: {
      ca: "Chartered Accountant",
      lawyer: "Lawyer",
      architect: "Architect",
      consultant: "Consultant",
      interior_designer: "Interior Designer",
      photographer: "Photographer",
      event_planner: "Event Planner",
    },
  },
  automotive: {
    label: "🚗 Automotive",
    sub: {
      car_repair: "Car Repair & Service",
      bike_repair: "Bike Repair & Service",
      carwash: "Car Wash & Detailing",
      tyre: "Tyre & Wheel Care",
      accessories: "Auto Accessories",
    },
  },
} as const;

export interface StoreFeatureFlags {
  instaMenu?: boolean;
  staffBuzzer?: boolean;
  pointsV2Active?: boolean;
}
