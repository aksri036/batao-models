export interface OccasionOfferRule {
  id: string;
  storeId: string;
  name: string; // seller-defined label: "Birthday", "Anniversary", "Kid's Birthday"...
  points: number;
  advanceNoticeDays: number; // days before occasion to send WhatsApp teaser
  offerValidityDays: number; // days after crediting before points expire
  active: boolean;
  sendWhatsApp?: boolean; // defaults true; false = credit points silently, no teaser WA sent
}
