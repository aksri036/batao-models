export interface ReferralSettings {
  enabled: boolean;
  referrerInstantPoints: number;
  referrerConversionPoints: number;
  refereePoints: number;
  maxInstantInvitesPerMonth: number; // anti-farming cap — instant points stop paying out past this many invites per referrer per calendar month
}
