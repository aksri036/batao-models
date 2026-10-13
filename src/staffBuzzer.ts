export interface StaffBuzzer {
  id: string;

  buyerMobile: string;
  tableNo: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: Date;
}
