export interface BtBanner {
  id: string;
  storeId: string;
  subdomain: string;
  name: string;
  description: string;
  photos: string[];
  createdAt: Date;
}

export interface BannerLike {
  id: string;
  timestamp: Date;
}
