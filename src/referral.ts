export interface Referral {
  id: string;
  storeId: string;
  subdomain: string;
  referralProgramId: string;
  from: string; //userId of person referring
  note?: string;
  photoUrl?: string;
  createdAt: Date;
  expiryDate?: Date;
  itemPhotos?: (string | undefined)[];
  to?: string; //mobile number of friend in case of instant referral
}
