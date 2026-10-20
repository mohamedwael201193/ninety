/** Query parameters that describe *which* history is shown, and that a link to another page must keep. */
const CARRIED = ["scenario", "today"] as const;

/**
 * `path` plus the `?scenario=` and `?today=` of the current URL, so a demo scenario
 * opened on one page shows the same history on /ees and /letter. Other parameters
 * (such as `fresh=1`, which clears saved trips) are dropped on purpose.
 */
export function carryQuery(path: string, search: string): string {
  const from = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const key of CARRIED) {
    const value = from.get(key);
    if (value) kept.set(key, value);
  }
  const query = kept.toString();
  return query ? `${path}?${query}` : path;
}
