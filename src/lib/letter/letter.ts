/**
 * Draft a request to rectify Entry/Exit System data.
 *
 * Article 52 of Regulation (EU) 2017/2226 gives a third-country national the
 * right to ask the competent authority of any Member State to rectify, complete
 * or erase personal data stored in the EES, or to restrict that processing,
 * where the data are factually inaccurate, incomplete or were recorded
 * unlawfully. The Member State replies within 45 days (Article 52(1)). If it
 * changes the data, it confirms that in writing without delay (Article 52(3)).
 *
 * The text is a draft for the person to review and sign. It is not a decision
 * by a border authority.
 */

import { isIsoDate, type IsoDate } from "../schengen/dates";
import type { DayDifference, Reconciliation } from "../ees/reconcile";

export type LetterIdentity = {
  fullName: string;
  dateOfBirth: IsoDate;
  nationality: string;
  documentNumber: string;
  email: string;
  /** Member State whose competent authority receives the request. */
  memberState: string;
};

export type CorrectionLetter = {
  title: string;
  addressee: string;
  paragraphs: string[];
  text: string;
};

function required(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
}

function listDays(differences: DayDifference[], side: DayDifference["side"]): string {
  const dates = differences.filter((difference) => difference.side === side).map((difference) => difference.date);
  if (dates.length === 0) return "None.";
  return dates.join(", ");
}

export function buildCorrectionLetter(identity: LetterIdentity, reconciliation: Reconciliation): CorrectionLetter {
  const fullName = required(identity.fullName, "Full name");
  const nationality = required(identity.nationality, "Nationality");
  const documentNumber = required(identity.documentNumber, "Travel document number");
  const email = required(identity.email, "Email");
  const memberState = required(identity.memberState, "Member State");
  if (!isIsoDate(identity.dateOfBirth)) throw new Error("Date of birth must be a YYYY-MM-DD date.");

  const title = "Request for rectification of Entry/Exit System data under Article 52 of Regulation (EU) 2017/2226";
  const addressee = `To the competent authority of ${memberState}`;
  const paragraphs = [
    title,
    addressee,
    `I, ${fullName}, born on ${identity.dateOfBirth}, a national of ${nationality}, holder of travel document ${documentNumber}, request rectification and completion of my personal data in the Entry/Exit System (EES).`,
    "Article 52 of Regulation (EU) 2017/2226 gives a third-country national the right to ask the competent authority of any Member State to rectify, complete or erase personal data stored in the EES, or to restrict their processing, where those data are factually inaccurate, incomplete or were recorded unlawfully. The Member State must reply within 45 days of receipt. If it rectifies, completes or erases the data, or restricts processing, it must confirm that in writing without delay.",
    `On ${reconciliation.on}, the EES states that I had used ${reconciliation.eesDaysUsed} day(s) in the 180-day period starting ${reconciliation.windowStart}. The entry and exit dates I hold show ${reconciliation.travellerDaysUsed} day(s) in that same period.`,
    reconciliation.explanation,
    `Days counted by the EES and not by my record: ${listDays(reconciliation.differences, "ees-only")}`,
    `Days in my record and not counted by the EES: ${listDays(reconciliation.differences, "traveller-only")}`,
    "I ask you to rectify the entry and exit data and the days-used figure so that they match the dates in this request, and to confirm the action in writing.",
    `Please reply to ${email}.`,
    `${fullName}`,
    "This draft was prepared for me to review, sign and submit. It is not a decision by a border authority.",
  ];

  return {
    title,
    addressee,
    paragraphs,
    text: paragraphs.join("\n\n"),
  };
}
