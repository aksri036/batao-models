// Structural shape shared by firebase/firestore and firebase-admin/firestore Timestamp,
// so models stay SDK-agnostic.
export interface Timestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}
