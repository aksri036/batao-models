import { DayMonth } from "./day-month";
import { DeliveryAddress } from "./order";
import { BtWallet } from "./wallet";

export interface Membership {
  id: string; //buyerid
  storeId: string;
  subdomain: string;
  createdAt: Date;
  channel: string; //self, referral
  referralId?: string; //in case became member via referral
  tags?: string[];
  wallet?: BtWallet | null;
  savedAddresses?: DeliveryAddress[];
  defaultAddressIndex?: number;
}

export interface Customer {
  id: string; //membershipId or leadId if it is lead
  createdAt: Date;
  name?: string;
  mobile?: string;
  dob?: DayMonth;
  isLead: boolean;
  tags?: string[];
  wallet?: BtWallet | null;
}
