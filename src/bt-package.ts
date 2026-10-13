export interface BtPackage {
  id: string;
  storeId: string;
  subdomain: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  items: PackageItem[];
  photos: string[];
  active: boolean;
  createdAt: Date;
  oneItemRedemptionOnly: boolean; //at a time buyer can redeem one line item from package
  expiryInDays?: number;
}

export type PackageItem = {
  id: string; // in case item exists on Batao else it will be empty
  name: string;
  quantity: number;
  photos: string[];
};

export type PackageRedemption = {
  id: string; //redemption id
  itemId: string;
  redeemedQty: number;
  timestamp: Date;
  staffId: string; //redeemed by
};

export type PackageGrant = {
  id: string;
  pkgId: string;
  buyerId: string;
  buyerName: string;
  buyerMobile?: string | null;
  storeId: string;
  subdomain: string;
  validity: { begins: Date; ends?: Date };
  status: "created" | "running" | "finished" | "expired";
  pkgSnapshot: BtPackage; //snapshot of the package when it was granted
  redemptions: PackageRedemption[];
  createdAt: Date;
  staffId?: string | null;
};

export const checkIfGrantIsActive = (grant: PackageGrant) => {
  if (grant.validity.ends && grant.validity.ends < new Date()) return false;
  if (grant.status === "finished" || grant.status === "expired") return false;
  return true;
};

export const createEmptyPackage = (): BtPackage => ({
  id: "",
  storeId: "",
  subdomain: "",
  name: "",
  description: "",
  price: 0,
  items: [],
  photos: [],
  active: true,
  createdAt: new Date(),
  oneItemRedemptionOnly: false,
});
