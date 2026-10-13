import { Discount, getDiscountString } from "./discount";

export enum ProgramType {
  membership = "membership",
  referral = "referral",
}

export interface Program {
  id: string;
  storeId: string;
  created: Date;
  active: boolean;
  type: string;
  description?: string | null; //description of the program for example terms and conditions
  redeemInPoints?: boolean; //when true, it means discount is in terms of points. if null, treat it as false
}

export interface MembershipProgram extends Program {
  joiningDiscount?: Discount | null; //discount at the time of becoming member
  nextVisitDiscount?: Discount | null; //discount for next time visit
  leadDiscount?: Discount | null; //discount for a number added as lead
}

export interface ReferralProgram extends Program {
  friendDiscount?: Discount | null; //friend who is accepting invite (referee)
  promoterDiscount?: Discount | null; //person who is sending invite (referer)
  promoterInstantDiscount?: Discount | null; //referer discount at the time he is sending referral
}

export function getMembershipDiscountString(mp: MembershipProgram): string {
  let res = "";
  let joining = "";
  let next = "";
  if (mp.joiningDiscount && getDiscountString(mp.joiningDiscount)) {
    joining = `${getDiscountString(mp.joiningDiscount)} off on first bill`;
  }
  if (mp.nextVisitDiscount && getDiscountString(mp.nextVisitDiscount)) {
    next = `${getDiscountString(mp.nextVisitDiscount)} off on every visit`;
  }
  if (joining) {
    if (next) return joining + "  \n  " + next;
    else return joining;
  } else if (next) {
    return next;
  }
  return res;
}

export function getReferralDiscountString(rp: ReferralProgram): string {
  /**
   * You get 5% OFF today + 6% more when they visit!
Your friend gets 7% OFF instantly.
   */
  let res = "You get ";
  let instant = "";
  let conversion = "";
  let friend = "";
  if (
    rp.promoterInstantDiscount &&
    getDiscountString(rp.promoterInstantDiscount)
  ) {
    instant = `${getDiscountString(rp.promoterInstantDiscount)} today`;
  }
  if (rp.promoterDiscount && getDiscountString(rp.promoterDiscount)) {
    conversion = `${getDiscountString(
      rp.promoterDiscount
    )} more when they visit!`;
  }
  if (rp.friendDiscount && getDiscountString(rp.friendDiscount)) {
    friend = `Your friend gets ${getDiscountString(
      rp.friendDiscount
    )} instantly.`;
  }
  if (instant) {
    if (conversion) res += instant + " + " + conversion;
    else res += instant;
  } else if (conversion) {
    res += conversion;
  }
  if (friend) {
    res += "  \n " + friend;
  }
  return res;
}
