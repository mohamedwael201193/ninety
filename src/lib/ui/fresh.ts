import { TRIP_STORAGE_KEY } from "@/lib/trips";

/**
 * `?fresh=1` starts from an empty trip list (the test suite's clean slate). It is consumed:
 * the saved trips are cleared once and the flag is removed from the address with
 * replaceState, so reloading the page afterwards keeps the trips added since.
 */
export function consumeFresh(win: Window): boolean {
  const url = new URL(win.location.href);
  if (url.searchParams.get("fresh") !== "1") return false;
  win.localStorage.removeItem(TRIP_STORAGE_KEY);
  url.searchParams.delete("fresh");
  win.history.replaceState(win.history.state, "", url.pathname + url.search + url.hash);
  return true;
}
