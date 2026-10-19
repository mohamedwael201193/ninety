import { describe, expect, it } from "vitest";
import { label, tableRows } from "./ParityPanel";
import type { ParityRow } from "@/lib/schengen/parity";

describe("parity table rows", () => {
  it("renders one row per scenario, numbered from 1", () => {
    const rows: ParityRow[] = Array.from({ length: 14 }, (_, i) => ({
      scenario: `s${i}`, on: "2026-01-01", stays: 1, ours: "1 left", theirs: "1 left", match: true,
    }));
    const out = tableRows(rows);
    expect(out).toHaveLength(14);
    expect(out[0].props.number).toBe(1);
    expect(out[0].props.row.scenario).toBe("s0");
    expect(out[13].props.number).toBe(14);
  });
});

describe("parity scenario names", () => {
  it("uses written names for known scenarios", () => {
    expect(label("calculator-example-kom-1-1")).toBe("Calculator's built-in example");
    expect(label("manual-14-jun-2024")).toBe("Manual example: 14 Jun 2024");
  });
  it("capitalises month names for unknown ids", () => {
    expect(label("entry-3-sep-2025")).toBe("Entry 3 Sep 2025");
  });
});
