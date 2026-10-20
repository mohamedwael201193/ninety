import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const token = (name: string) => {
  const match = new RegExp(`--color-${name}:\\s*([^;]+);`).exec(css);
  if (!match) throw new Error(`missing token ${name}`);
  return match[1].trim();
};
const hex = (value: string) => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16));
const rgba = (value: string) => {
  if (value.startsWith("#")) return { rgb: hex(value), a: 1 };
  const [r, g, b, a] = value.replace(/rgba?\(|\)/g, "").split(",").map((part) => Number(part.trim()));
  return { rgb: [r, g, b], a: Number.isNaN(a) ? 1 : a };
};
const luminance = (rgb: number[]) => {
  const [r, g, b] = rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg: string, bg: string) => {
  const back = hex(token(bg));
  const { rgb, a } = rgba(token(fg));
  const mixed = rgb.map((c, i) => a * c + (1 - a) * back[i]);
  const [hi, lo] = [luminance(back), luminance(mixed)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Every text colour on every surface it is used on. axe found ok-on-ok-wash (status chip and
// table badges), warn-on-warn-wash and ink-faint (trip dates) below 4.5:1.
const PAIRS: [string, string][] = [
  ...["ink-faint", "ink-hushed"].flatMap((fg) => ["paper", "paper-warm", "paper-sunk"].map((bg): [string, string] => [fg, bg])),
  ...["ok", "warn", "risk"].flatMap((tone) => [[tone, `${tone}-wash`], [tone, "paper"], [tone, "paper-warm"]] as [string, string][]),
  ["ok", "spring-wash"],
];

describe("text contrast (WCAG AA, 4.5:1)", () => {
  for (const [fg, bg] of PAIRS) {
    it(`${fg} on ${bg}`, () => expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5));
  }
});

describe("theme files agree", () => {
  it("dashboard-theme.css repeats the same colour tokens as globals.css", () => {
    const other = readFileSync("src/app/dashboard-theme.css", "utf8");
    for (const [, name, value] of other.matchAll(/--color-([a-z-]+):\s*([^;]+);/g)) {
      if (new RegExp(`--color-${name}:`).test(css)) expect(value.trim(), name).toBe(token(name));
    }
  });
});
