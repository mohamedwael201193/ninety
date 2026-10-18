/** "1 day", "5 days". */
export function days(count: number): string {
  return `${count} ${Math.abs(count) === 1 ? "day" : "days"}`;
}
