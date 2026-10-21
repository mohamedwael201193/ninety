/**
 * Hands the EES figure and records from /ees to /letter in the same tab. Kept in sessionStorage
 * (this browser tab only, never sent anywhere), written when a comparison runs and read once when
 * the letter form opens with its EES fields empty.
 */
export const EES_CARRY_KEY = "ninety:ees-input";

export type EesCarry = { daysUsed: string; recordsText: string };

export function saveEesCarry(storage: Pick<Storage, "setItem">, value: EesCarry): void {
  try { storage.setItem(EES_CARRY_KEY, JSON.stringify(value)); } catch { /* storage full or blocked: nothing to carry */ }
}

export function loadEesCarry(storage: Pick<Storage, "getItem">): EesCarry | null {
  try {
    const raw = storage.getItem(EES_CARRY_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<EesCarry>;
    if (typeof v.daysUsed !== "string" || typeof v.recordsText !== "string") return null;
    if (!/^\d{1,4}$/.test(v.daysUsed)) return null;
    return { daysUsed: v.daysUsed, recordsText: v.recordsText.slice(0, 20_000) };
  } catch {
    return null;
  }
}
