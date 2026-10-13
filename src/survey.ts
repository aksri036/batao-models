import { Timestamp } from "./timestamp";
import { Benefit } from "./offers/benefits";

export type QuestionType = "text" | "number" | "radio" | "checkbox" | "date";

export interface Survey {
  id: string;
  storeId: string; // sellerId
  title: string;
  questions: Question[];
  createdAt: Date;
  benefit?: Benefit | null;
  deletedAt?: Date;
  tags?: string[]; //these are the tags generated based on responses
}

export interface AnswerOption {
  tag: string;
  value: string;
}
export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: AnswerOption[]; // for radio, checkbox
  required: boolean;
}

export interface Answer {
  id: string; //question id
  answer?: string | number | string[] | Date | Timestamp;
  tags?: string[];
}

export interface SurveyResponse {
  id: string;
  buyerId: string;
  buyerMobile?: string | null;
  storeId: string;
  surveyId: string;
  answers: Answer[];
  createdAt: Date;
}
