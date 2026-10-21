import { TRIP_STORAGE_KEY, TRIPS_CHANGED_EVENT } from "@/lib/trips";

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
  // Same-tab readers that already loaded the old trips (the landing band) must hear that they are
  // gone: removeItem fires no "storage" event in this tab.
  win.dispatchEvent(new Event(TRIPS_CHANGED_EVENT));
  return true;
}
