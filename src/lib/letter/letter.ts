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
import { EES_CUTOFF, explainedByCutoff, groupDifferences, type DayDifference, type Reconciliation } from "../ees/reconcile";

export type LetterIdentity = {
  fullName: string;
  dateOfBirth: IsoDate;
  nationality: string;
  documentNumber: string;
  email: string;
  /** Member State whose competent authority receives the request. */
  memberState: string;
};

/** The three figures the request rests on, shown as a table in the preview and stated in the letter. */
export type LetterEvidence = {
  on: IsoDate;
  windowStart: IsoDate;
  /** Days counted from the traveller's own dates (only stays the EES covers, when some began before the cutoff). */
  ours: number;
  ees: number;
  /** EES minus ours: positive when the EES counts more. */
  gap: number;
};

export type CorrectionLetter = {
  title: string;
  addressee: string;
  paragraphs: string[];
  text: string;
  evidence: LetterEvidence;
  /** The traveller's name, as signed (the PDF Author). */
  signedBy: string;
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
  const ranges = groupDifferences(differences.filter((difference) => difference.side === side));
  if (ranges.length === 0) return "no days.";
  return `${ranges.map((r) => (r.from === r.to ? r.from : `${r.from} to ${r.to} (${days(r.count)})`)).join(", ")}.`;
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

function evidenceLine(e: LetterEvidence): string {
  const direction = e.gap > 0 ? "more" : "fewer";
  return `In figures: my dates ${days(e.ours)}; EES ${days(e.ees)}; difference ${days(Math.abs(e.gap))}${e.gap === 0 ? "" : `, the EES counting ${direction}`}.`;
}

function reasonLines(r: Reconciliation): string[] {
  const lines: string[] = [];
  if (r.codes.includes("likely-missing-exit")) lines.push("I believe one of my exits from the Schengen area was not recorded, so the EES counts days on which I was not present.");
  if (r.codes.includes("likely-missing-entry")) lines.push("I believe one of my entries into the Schengen area was not recorded.");
  if (r.codes.includes("exit-dates-disagree")) lines.push("The exit dates recorded in the EES do not match the dates on which I actually left.");
  if (r.codes.includes("ees-figure-inconsistent")) lines.push("The days-used figure shown to me does not match the EES entry and exit records themselves.");
  return lines;
}

export function buildCorrectionLetter(identity: LetterIdentity, reconciliation: Reconciliation): CorrectionLetter {
  const fullName = required(identity.fullName, "Full name");
  const nationality = required(identity.nationality, "Nationality");
  const documentNumber = required(identity.documentNumber, "Travel document number");
  const email = required(identity.email, "Email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email must be a full address, for example jane@example.com.");
  const memberState = required(identity.memberState, "Member State");
  if (!isIsoDate(identity.dateOfBirth)) throw new Error("Date of birth must be a YYYY-MM-DD date.");

  if (explainedByCutoff(reconciliation.codes)) {
    throw new Error(
      `No correction to request: the gap comes from stays that began before ${EES_CUTOFF}, which the EES does not count. A border officer applying the 90/180 rule may still count those days.`,
    );
  }

  // The API refuses with 422 when the comparison has input errors; the page must not draft a letter either.
  if (reconciliation.errors.length > 0) throw new Error(reconciliation.errors.join(" "));
  if (reconciliation.codes.length === 1 && reconciliation.codes[0] === "match" && reconciliation.errors.length === 0) {
    throw new Error("No correction to request: the EES figure matches your trips. There is nothing to correct.");
  }

  const evidence: LetterEvidence = {
    on: reconciliation.on,
    windowStart: reconciliation.windowStart,
    ours: reconciliation.preCutoffDays.length > 0 ? reconciliation.eesComparableDaysUsed : reconciliation.travellerDaysUsed,
    ees: reconciliation.eesDaysUsed,
    gap: reconciliation.figureGap,
  };

  const title = "Request for rectification of Entry/Exit System data under Article 52 of Regulation (EU) 2017/2226";
  const addressee = `To the competent authority of ${memberState}`;
  const paragraphs = [
    title,
    addressee,
    `I, ${fullName}, born on ${identity.dateOfBirth}, a national of ${countryOf(nationality)}, holder of travel document ${documentNumber}, request rectification and completion of my personal data in the Entry/Exit System (EES).`,
    "Under Article 52(1) of Regulation (EU) 2017/2226, a request relating to the rights in Articles 15 to 18 of Regulation (EU) 2016/679 may be addressed to the competent authority of any Member State, and the Member State responsible or the Member State to which the request is made shall reply within 45 days of receipt.",
    "Under Article 52(2), where the request is made to a Member State other than the one responsible, that Member State checks the accuracy of the data and the lawfulness of their processing within 30 days if it can do so without consulting the Member State responsible; otherwise it contacts the authorities of the Member State responsible within seven days, and that Member State checks the data within 30 days of being contacted.",
    "Under Article 52(3), where data are factually inaccurate, incomplete or recorded unlawfully, the Member State responsible shall rectify, complete or erase them without delay and confirm to me in writing that it has done so. I would be grateful to receive that written confirmation.",
    "Under Article 52(4), if the Member State does not agree that the data are inaccurate, incomplete or recorded unlawfully, it shall adopt an administrative decision explaining to me in writing, without delay, why it is not prepared to correct, complete or erase them.",
    "If this request is refused, I ask that the decision also give, as Article 52(5) requires, information on how to bring an action or a complaint before the competent authorities or courts of that Member State, and on assistance available, including from the competent national supervisory authority.",
    `On ${reconciliation.on}, the EES states that I had used ${days(reconciliation.eesDaysUsed)} in the 180-day period starting ${reconciliation.windowStart}. The entry and exit dates I hold show ${days(reconciliation.travellerDaysUsed)} in that same period.${reconciliation.preCutoffDays.length > 0 ? ` Of these, ${days(reconciliation.preCutoffDays.length)} belong to stays that began before ${EES_CUTOFF}, which the EES does not count; this request does not concern them, and compares the remaining ${days(reconciliation.eesComparableDaysUsed)}.` : ""}`,
    evidenceLine(evidence),
    ...reasonLines(reconciliation),
    ...dayLines(reconciliation),
    "I ask you to rectify the entry and exit data and the days-used figure so that they match the dates in this request, and to confirm the action in writing.",
    `Please reply to ${email}.`,
    "Yours faithfully,",
    `${fullName}`,
  ];

  return {
    title,
    addressee,
    paragraphs,
    text: paragraphs.join("\n\n"),
    evidence,
    signedBy: fullName,
  };
}
