export interface PointReferral {
  id: string;
  storeId: string;
  referrerGuestId: string; // referrer's guest phone
  refereePhone: string;
  status: "invited" | "joined" | "first_order";
  instantGranted: boolean;
  refereeGranted: boolean;
  conversionGranted: boolean;
  createdAt: Date;
  joinedAt?: Date | null;
  firstOrderAt?: Date | null;
}
