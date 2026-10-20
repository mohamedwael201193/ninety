import { isIsoDate } from "../schengen/dates";

export type LetterForm = {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  documentNumber: string;
  email: string;
  memberState: string;
  daysUsed: string;
};

/** Field ids as used in the form (data-testid and the id of each input). */
export const LETTER_FIELD_IDS: Record<keyof LetterForm, string> = {
  fullName: "letter-name",
  dateOfBirth: "letter-birth",
  nationality: "letter-nationality",
  documentNumber: "letter-document",
  email: "letter-email",
  memberState: "letter-member-state",
  daysUsed: "letter-ees-days",
};

/** One message per field that blocks drafting, in form order. Empty when the letter can be drafted. */
export function validateLetterForm(form: LetterForm): Partial<Record<keyof LetterForm, string>> {
  const errors: Partial<Record<keyof LetterForm, string>> = {};
  const blank = (v: string) => v.trim() === "";
  if (blank(form.fullName)) errors.fullName = "Enter your full name as it appears in your travel document.";
  if (blank(form.dateOfBirth)) errors.dateOfBirth = "Enter your date of birth.";
  else if (!isIsoDate(form.dateOfBirth.trim())) errors.dateOfBirth = "Use YYYY-MM-DD, for example 1990-05-04.";
  if (blank(form.nationality)) errors.nationality = "Enter your country of nationality.";
  if (blank(form.documentNumber)) errors.documentNumber = "Enter your travel document number.";
  if (blank(form.email)) errors.email = "Enter an email address for the reply.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a full address, for example jane@example.com.";
  if (blank(form.memberState)) errors.memberState = "Enter the Member State whose authority you are writing to.";
  if (blank(form.daysUsed)) errors.daysUsed = "Enter the days-used figure the EES shows.";
  else if (!/^\d+$/.test(form.daysUsed.trim())) errors.daysUsed = "Enter the EES figure as a whole number.";
  return errors;
}
