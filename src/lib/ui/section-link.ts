/**
 * Where a link to a section of the home page should go from the current page.
 * On the home page itself the query (?scenario=, ?today=) is kept, so jumping
 * to a section never drops the demo history or the pinned date.
 */
export function sectionHref(hash: string, location: { pathname: string; search: string }): string {
  const id = hash.startsWith("#") ? hash : `#${hash}`;
  return location.pathname === "/" ? `/${location.search}${id}` : `/${id}`;
}
