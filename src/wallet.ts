/** Points feature
- seller should be able to set loyalty, referral and offers using points
- seller should be able to set min and max encash amounts
- seller should be able to redeem coupons with points. 
- seller should also get an option to encash wallet when topping up
- seller should be able to encash wallet points
- seller should be able to view points of all customers


- customer should be able to access wallet, transaction history
- customer should be able to encash wallet at the time of order
- customer should be able to claim coupons for programs with points
- customer should be notified when he is not visiting rest with point details
 */
export interface BtWallet {
  points: number;
}

export interface LedgerLine {
  id: string;
  points: number; // +ve means credit and -ve means debit
  note: string;
  timestamp: Date;
}
