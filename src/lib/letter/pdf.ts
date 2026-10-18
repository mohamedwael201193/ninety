/**
 * Render a correction letter to PDF with an embedded Unicode font.
 * Standard PDF fonts cannot draw names outside WinAnsi, so the caller passes
 * font bytes (Noto Sans, SIL Open Font License) and this module embeds them.
 */

import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { CorrectionLetter } from "./letter";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;
const BODY_SIZE = 11;
const TITLE_SIZE = 14;
const LINE = 15;

function wrapLine(text: string, maxWidth: number, widthOf: (value: string) => number): string[] {
  if (text.length === 0) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current.length === 0 ? word : `${current} ${word}`;
    if (widthOf(next) <= maxWidth) {
      current = next;
      continue;
    }
    if (current.length > 0) lines.push(current);
    if (widthOf(word) <= maxWidth) {
      current = word;
      continue;
    }
    let chunk = "";
    for (const character of word) {
      const extended = chunk + character;
      if (widthOf(extended) > maxWidth && chunk.length > 0) {
        lines.push(chunk);
        chunk = character;
      } else {
        chunk = extended;
      }
    }
    current = chunk;
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

export async function letterToPdf(letter: CorrectionLetter, fontBytes: Uint8Array): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const font = await document.embedFont(fontBytes, { subset: true });
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  const measure = (value: string, size: number) => font.widthOfTextAtSize(value, size);

  let page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(height: number) {
    if (y - height >= MARGIN) return;
    page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function drawParagraph(text: string, size: number, gapAfter: number) {
    const lines = wrapLine(text, maxWidth, (value) => measure(value, size));
    for (const line of lines) {
      ensureSpace(LINE);
      page.drawText(line, { x: MARGIN, y: y - size, size, font });
      y -= LINE;
    }
    y -= gapAfter;
  }

  drawParagraph(letter.title, TITLE_SIZE, 8);
  for (const paragraph of letter.paragraphs.slice(1)) {
    drawParagraph(paragraph, BODY_SIZE, 8);
  }

  document.setTitle(letter.title);
  document.setAuthor(letter.paragraphs.find((paragraph) => paragraph.startsWith("I, ")) ?? "");
  return document.save();
}
