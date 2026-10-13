export interface GuestOccasion {
  id: string;
  ruleId: string;
  label?: string;
  date: string; // "MM-DD"
}

export interface Guest {
  id: string; // normalized phone, e.g. 91XXXXXXXXXX — the guestId
  storeId: string;
  name?: string;
  createdAt: Date; // earliest known contact, across lead/membership/points history
  via?: string; // how the guest was added: 'pos' | 'app' | 'admin'
  email?: string;
  userId?: string; // linked global users/{uid} doc, if this guest has ever logged into batao.ai for this store
  tags?: string[];
  occasions?: GuestOccasion[]; // personal occasion dates, capped at 5 per guest (enforced via addGuestOccasion callable)
  pointsBalance: number; // spendable points only — locked points are NOT included here
  lockedBalance?: number; // points locked behind activeFrom, not yet in pointsBalance; decremented by activation cron
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  referredBy?: string; // guestId of referrer
  referralCode: string;
  referralInstantGrantsMonth?: string; // "YYYY-MM" — calendar month referralInstantGrantsCount is tracking
  referralInstantGrantsCount?: number; // resets when the month rolls over
  firstOrderAt?: Date | null; // set on this guest's first real (non-bonus) earn entry
}
