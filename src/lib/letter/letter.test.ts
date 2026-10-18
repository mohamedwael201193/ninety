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
  const document = await getDocument({ data: bytes, isEvalSupported: false }).promise;
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
    expect(letter.text).toContain("14 day(s)");
    expect(letter.text).toContain("10 day(s)");
    expect(letter.text).toContain("2024-06-11");
    expect(letter.text).toContain("Likely missing exit");
    expect(letter.paragraphs[0]).toBe(letter.title);
    expect(letter.text).toBe(letter.paragraphs.join("\n\n"));
  });

  it("refuses a blank name and a bad date of birth", () => {
    const reconciliation = reconcile([], { daysUsed: 0, on: "2024-06-14" });
    expect(() => buildCorrectionLetter({ ...identity, fullName: "  " }, reconciliation)).toThrow(/Full name/);
    expect(() => buildCorrectionLetter({ ...identity, dateOfBirth: "08/03/1990" }, reconciliation)).toThrow(/Date of birth/);
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
