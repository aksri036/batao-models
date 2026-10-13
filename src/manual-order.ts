export interface ManualOrderDoc {
  id: string;
  storeId: string;
  guestPhone: string;
  guestName?: string;
  billAmount: number; // NET of any redemption applied this order — used for the earn-rate calculation
  grossBillAmount?: number; // the original bill BEFORE any redemption was applied; equals billAmount when nothing was redeemed
  enteredBy: "staff" | "guest";
  status: "approved" | "pending_approval" | "rejected";
  redeemedRewardId?: string; // staff-entered only — picked during Add Order
  selectedItemOption?: string; // which itemOption was chosen, if the reward had more than one
  staffId?: string; // who entered it, or who approved a guest self-report
  timestamp: Date;
  approvedAt?: Date;
}
