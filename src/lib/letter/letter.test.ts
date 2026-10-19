import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { reconcile } from "../ees/reconcile";
import { buildCorrectionLetter } from "./letter";
import { letterToPdf } from "./pdf";

const fontBytes = new Uint8Array(readFileSync("public/fonts/NotoSans-Regular.ttf"));
const accentedName = "José María Ñuñez-Ångström";

const identity = {
  fullName: accentedName,
  dateOfBirth: "1990-03-08",
  nationality: "España",
  documentNumber: "X1234567",
  email: "jose@example.com",
  memberState: "République française",
};

function sampleLetter() {
  const reconciliation = reconcile([{ entry: "2024-06-01", exit: "2024-06-10" }], {
    daysUsed: 14,
    on: "2024-06-14",
    records: [{ entry: "2024-06-01", exit: null }],
  });
  return buildCorrectionLetter(identity, reconciliation);
}

async function pdfText(bytes: Uint8Array): Promise<string> {
  const document = await getDocument({ data: bytes, isEvalSupported: false } as Parameters<typeof getDocument>[0]).promise;
  const parts: string[] = [];
  for (let index = 1; index <= document.numPages; index += 1) {
    const page = await document.getPage(index);
    const content = await page.getTextContent();
    parts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(""));
  }
  return parts.join("\n");
}

describe("buildCorrectionLetter", () => {
  it("keeps accented names and cites Article 52", () => {
    const letter = sampleLetter();
    expect(letter.text).toContain(accentedName);
    expect(letter.text).toContain("España");
    expect(letter.text).toContain("République française");
    expect(letter.text).toContain("Article 52 of Regulation (EU) 2017/2226");
    expect(letter.text).toContain("14 days");
    expect(letter.text).toContain("10 days");
    expect(letter.text).toContain("2024-06-11");
    expect(letter.text).toContain("one of my exits from the Schengen area was not recorded");
    expect(letter.text).not.toContain("Likely missing exit");
    expect(letter.paragraphs[0]).toBe(letter.title);
    expect(letter.text).toBe(letter.paragraphs.join("\n\n"));
  });

  it("refuses a blank name and a bad date of birth", () => {
    const reconciliation = reconcile([], { daysUsed: 0, on: "2024-06-14" });
    expect(() => buildCorrectionLetter({ ...identity, fullName: "  " }, reconciliation)).toThrow(/Full name/);
    expect(() => buildCorrectionLetter({ ...identity, dateOfBirth: "08/03/1990" }, reconciliation)).toThrow(/Date of birth/);
  });
});

describe("buildCorrectionLetter without EES records", () => {
  it("states the gap instead of writing None when only the figure is known", () => {
    const reconciliation = reconcile([{ entry: "2024-06-01", exit: "2024-06-10" }], { daysUsed: 15, on: "2024-06-14" });
    const letter = buildCorrectionLetter(identity, reconciliation);
    expect(letter.text).not.toMatch(/\bNone\b/);
    expect(letter.text).toContain("differ by 5 days");
    expect(letter.text).toContain("5 days more");
  });
});

describe("letter wording", () => {
  const recon = () => reconcile([{ entry: "2024-06-14", exit: "2024-06-14" }], { daysUsed: 2, on: "2024-06-14" });
  it("turns a demonym into the country", () => {
    const text = buildCorrectionLetter({ ...identity, nationality: "Egyptian" }, recon()).text;
    expect(text).toContain("a national of Egypt,");
    expect(text).not.toContain("of Egyptian");
  });
  it("keeps a country as typed", () => {
    expect(buildCorrectionLetter({ ...identity, nationality: "Egypt" }, recon()).text).toContain("a national of Egypt,");
  });
  it("uses singular and plural day counts and never day(s)", () => {
    const text = buildCorrectionLetter(identity, recon()).text;
    expect(text).toContain("used 2 days");
    expect(text).toContain("show 1 day ");
    expect(text).toContain("differ by 1 day:");
    expect(text).not.toContain("day(s)");
  });
  it("cites the Article 52(1) 45-day reply duty for the responsible or receiving Member State", () => {
    const text = buildCorrectionLetter(identity, recon()).text;
    expect(text).toContain("Member State responsible or the Member State to which the request is made shall reply within 45 days of receipt");
  });
});

describe("letterToPdf", () => {
  it("embeds accented names so they can be read back from the PDF", async () => {
    const letter = sampleLetter();
    const bytes = await letterToPdf(letter, fontBytes);
    expect(Buffer.from(bytes.subarray(0, 5)).toString("latin1")).toBe("%PDF-");
    const text = await pdfText(bytes);
    expect(text).toContain(accentedName);
    expect(text).toContain("Article 52");
    expect(text).toContain("2017/2226");
    expect(text).not.toContain("\uFFFD");
  });

  it("renders a second accented name that is outside the WinAnsi set", async () => {
    const reconciliation = reconcile([], { daysUsed: 0, on: "2024-01-15" });
    const letter = buildCorrectionLetter(
      { ...identity, fullName: "Łukasz Żółć" },
      reconciliation,
    );
    expect(letter.text).toContain("Łukasz Żółć");
    const text = await pdfText(await letterToPdf(letter, fontBytes));
    expect(text).toContain("Łukasz Żółć");
  });
});

describe("Article 52 clauses", () => {
  it("states 52(1)–52(5) separately and accurately", () => {
    const text = buildCorrectionLetter(identity, reconcile([{ entry: "2024-06-01", exit: "2024-06-10" }], { daysUsed: 14, on: "2024-06-14" })).text;
    expect(text).toContain("45 days");
    expect(text).toContain("within seven days");
    expect(text).toContain("supervisory authority");
    expect(text).toContain("Article 52(5)");
    expect(text).not.toContain("normally");
    expect(text).not.toMatch(/52\(3\)[^.]*30 days/);
  });
});
