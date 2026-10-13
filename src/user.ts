import { DayMonth } from "./day-month";

export interface BtUser {
  id: string;
  name: string;
  photoUrl?: string | null;
  createdTime: Date;
  dob?: DayMonth | null;
  anniversaryDate?: DayMonth | null;
  contact?: UserPrivateInfo | null;
  lastAccessedTime?: Date | null;
}

export interface UserPrivateInfo {
  mobile?: string | null;
  email?: string | null;
}
