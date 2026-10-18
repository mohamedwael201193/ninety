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

import { days } from "../plural";
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

const DEMONYMS: Record<string, string> = {
  afghan: "Afghanistan", albanian: "Albania", algerian: "Algeria", american: "the United States", argentine: "Argentina", argentinian: "Argentina",
  australian: "Australia", bangladeshi: "Bangladesh", brazilian: "Brazil", british: "the United Kingdom", canadian: "Canada", chilean: "Chile",
  chinese: "China", colombian: "Colombia", egyptian: "Egypt", emirati: "the United Arab Emirates", filipino: "the Philippines", georgian: "Georgia",
  indian: "India", indonesian: "Indonesia", iranian: "Iran", iraqi: "Iraq", israeli: "Israel", japanese: "Japan", jordanian: "Jordan",
  kenyan: "Kenya", korean: "South Korea", "south korean": "South Korea", kosovar: "Kosovo", lebanese: "Lebanon", malaysian: "Malaysia",
  mexican: "Mexico", moldovan: "Moldova", moroccan: "Morocco", "new zealander": "New Zealand", nigerian: "Nigeria", pakistani: "Pakistan",
  peruvian: "Peru", russian: "Russia", saudi: "Saudi Arabia", "saudi arabian": "Saudi Arabia", serbian: "Serbia", singaporean: "Singapore",
  "south african": "South Africa", syrian: "Syria", thai: "Thailand", tunisian: "Tunisia", turkish: "Türkiye", ukrainian: "Ukraine",
  venezuelan: "Venezuela", vietnamese: "Viet Nam",
};

/** Accept a country ("Egypt") or a demonym ("Egyptian") and return the country, for "a national of …". */
export function countryOf(nationality: string): string {
  return DEMONYMS[nationality.trim().toLowerCase()] ?? nationality.trim();
}

function required(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  return trimmed;
}

function listDays(differences: DayDifference[], side: DayDifference["side"]): string {
  const dates = differences.filter((difference) => difference.side === side).map((difference) => difference.date);
  if (dates.length === 0) return "no days.";
  return dates.join(", ");
}

function dayLines(r: Reconciliation): string[] {
  if (r.eesRecordDaysUsed === null) {
    if (r.figureGap === 0) return [];
    const gap = Math.abs(r.figureGap);
    return [
      `The two counts differ by ${days(gap)}: the EES counts ${days(gap)} ${r.figureGap > 0 ? "more" : "fewer"} than my record. I do not hold a copy of the EES entry and exit records, so I cannot list the individual dates. I ask you to compare the stored records with the dates I hold and correct any entry or exit that is missing or wrong.`,
    ];
  }
  return [
    `Days counted by the EES and not by my record: ${listDays(r.differences, "ees-only")}`,
    `Days in my record and not counted by the EES: ${listDays(r.differences, "traveller-only")}`,
  ];
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
    `I, ${fullName}, born on ${identity.dateOfBirth}, a national of ${countryOf(nationality)}, holder of travel document ${documentNumber}, request rectification and completion of my personal data in the Entry/Exit System (EES).`,
    "Under Article 52(1) of Regulation (EU) 2017/2226, a request relating to the rights in Articles 15 to 18 of Regulation (EU) 2016/679 may be addressed to the competent authority of any Member State, and the Member State responsible or the Member State to which the request is made shall reply within 45 days of receipt. Under Article 52(2) and (3), the accuracy of the data and the lawfulness of their processing are to be checked, normally within 30 days, and data that are factually inaccurate, incomplete or recorded unlawfully are to be rectified, completed or erased, with written confirmation to me without delay. If the authority does not agree, Article 52(4) requires an administrative decision explaining in writing why.",
    `On ${reconciliation.on}, the EES states that I had used ${days(reconciliation.eesDaysUsed)} in the 180-day period starting ${reconciliation.windowStart}. The entry and exit dates I hold show ${days(reconciliation.travellerDaysUsed)} in that same period.`,
    reconciliation.explanation,
    ...dayLines(reconciliation),
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
