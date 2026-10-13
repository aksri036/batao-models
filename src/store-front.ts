// --------------------------------------
// 🧱 Store Core Model
// --------------------------------------

/**
 * Represents the website data for a batao.ai store.
 * Created automatically when a new Store is created.
 */
export interface StoreFront {
  id: string; // same as Store.id
  storeId: string; // reference to the Store document
  subdomain: string; // e.g. "somestore"
  customDomain?: string; // e.g. "abc.com" — top-level for Firestore querying
  published: boolean; // is the storefront live?
  settings: StoreSettings; // website theme + customization
  content: StoreContent; // content for each page
  seo?: SeoSettings; // optional global SEO overrides
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface StoreContact {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export interface StoreTiming {
  day: string; // "Mon"
  open: string; // "09:00"
  close: string; // "22:00"
}

// --------------------------------------
// 🎨 StoreSettings (Customization + Theme)
// --------------------------------------

export interface StoreSettings {
  theme: ThemeSettings;
  branding: BrandingSettings;
  navigation: NavigationSettings;
  seo?: SeoSettings;
  social?: SocialLinks;
  domain?: DomainSettings;
  settings?: SettingsMeta;
  externalOrderLinks?: {
    app: string;
    link: string;
    logo: string;
    label: string;
    color: string;
  }[];
}

export interface BackgroundSettings {
  // If both color and image are provided, the image will be shown
  // and the color can be used as a fallback or an overlay.
  color?: string; // CSS color (e.g. "#fff" or "rgba(0,0,0,0.5)")
  imageUrl?: string; // absolute or relative URL to image
  repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  position?: string; // e.g. "center center", "top left"
  size?: "cover" | "contain" | string; // e.g. "cover", "contain", "50% 50%"
  attachment?: "scroll" | "fixed" | "local";
  overlayColor?: string; // an optional overlay (RGBA) applied above image for contrast
  overlayOpacity?: number; // 0..1 (used if overlayColor omitted and overlayOpacity provided)
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  // background is now an object so sellers can choose color, image or both
  background: BackgroundSettings;
  textColor: string;
  variant: "light" | "dark";
  fontFamily: string;
  fontSize?: "small" | "medium" | "large";
  borderRadius?: number;
  buttonStyle?: "contained" | "outlined" | "text";
  layoutStyle?: "classic" | "modern" | "minimal";
}

export interface BrandingSettings {
  storeName?: string;
  legalName?: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  heroBanner?: {
    imageUrl: string;
    text?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

export interface NavigationSettings {
  enabledPages: string[]; // ["home", "menu", "about"]
  order: string[];
  menuStyle?: "top" | "drawer" | "side";
  showSocialIcons?: boolean;
  footerCTA?: {
    enabled: boolean;
    text?: string;
    link?: string;
  };
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string[];
  sitemapEnabled?: boolean;
  googleAnalyticsId?: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string | null;
  whatsapp?: string | null;
  zomato?: string;
  swiggy?: string;
  website?: string;
}

export interface DomainSettings {
  subdomain: string; // e.g. "somestore"
  customDomain?: string; // optional custom domain mapping
}

export interface SettingsMeta {
  version?: string;
  lastUpdated?: string | Date;
}

// --------------------------------------
// 🏡 StoreContent (Website Data)
// --------------------------------------

export interface StoreContent {
  storeId: string;
  home?: HomeContent;
  about?: AboutContent;
  menu?: MenuItem[];
  menuFiles?: MenuFile[];
  gallery?: GalleryItem[];
  blogs?: BlogPost[];
  services?: ServiceItem[];
  contact?: ContactPageContent;
  customPages?: CustomPage[];
  seo?: SeoSettings;
}

// ---------- Home Page ----------
export interface HomeContent {
  hero: {
    title?: string;
    subtitle?: string;
    bannerImage?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  features?: FeatureBlock[];
  featuredItems?: string[]; // references to MenuItem IDs
  featuredServices?: string[]; // ServiceItem IDs

  testimonials?: TestimonialBlock[];
  customSections?: HomeHtmlSection[]; // freeform HTML, rendered in array order after all fixed sections
}

export interface TestimonialBlock {
  name: string;
  company?: string;
  quote: string;
  avatarUrl?: string; // optional image
}
export interface FeatureBlock {
  icon: string; // MUI icon name or key
  title: string;
  desc: string;
}
export interface HomeHtmlSection {
  id: string; // stable id, e.g. `hs-${Date.now()}`
  label: string; // admin-only reference label, never rendered on the storefront
  html: string; // raw HTML; sanitized at render time on the storefront
}

// ---------- About Page ----------
export interface AboutContent {
  headline?: string;
  content?: string; // HTML or Markdown
  image?: string;
}

// ---------- Menu Page ----------
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  description?: string;
  image?: string;
  available?: boolean;
}

export interface MenuFile {
  id: string;
  url: string; // uploaded file URL
  fileName: string;
  fileType: "image" | "pdf";
  uploadedAt: number;
}

// ---------- Services ----------
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  content?: string; // HTML — full detail page body
  image?: string;
}

// ---------- Gallery ----------
export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
}

// ---------- Blogs ----------
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML or Markdown
  coverImage?: string;
  publishedAt?: string | Date;
  seo?: SeoSettings;
}

// ---------- Contact ----------
export interface ContactPageContent {
  phone?: string;
  email?: string;
  address?: string;
  mapLink?: string;
  whatsappLink?: string | null;
  location?: GeoLocation;
  placeId?: string;
}

// ---------- Custom Pages ----------
export interface CustomPage {
  slug: string; // used as /[slug]
  title: string;
  content: string;
  seo?: SeoSettings;
}

// --------------------------------------
// 🧾 Composite Type for API responses
// --------------------------------------

export interface FullStoreData {
  store: StoreFront;
  settings: StoreSettings;
  content: StoreContent;
}
