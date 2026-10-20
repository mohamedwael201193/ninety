/**
 * Every response the API gives (fixed edge inputs and random ones) matches the schema the OpenAPI
 * document declares for that status, and every status it gives is declared.
 */
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { OPENAPI } from "./openapi";
import { article52Letter, check, eesReconcile, type ApiResult } from "./v1";

type S = Record<string, unknown>;
const doc = JSON.parse(JSON.stringify(OPENAPI)) as { paths: Record<string, { post: { responses: Record<string, { content?: { "application/json": { schema: S } } }> } }>; components: { schemas: Record<string, S> } };
const deref = (s: S): S => (typeof s.$ref === "string" ? doc.components.schemas[s.$ref.split("/").pop()!] : s);

/** Problems with `v` against `schema` (the subset of JSON Schema the document uses). */
export function validate(v: unknown, schema: S, at = "$"): string[] {
  const s = deref(schema);
  if (Array.isArray(s.oneOf)) {
    const ok = (s.oneOf as S[]).filter((o) => validate(v, o, at).length === 0).length;
    return ok === 1 ? [] : [`${at}: matches ${ok} of oneOf`];
  }
  const out: string[] = [];
  switch (s.type) {
    case "null": if (v !== null) out.push(`${at}: not null`); break;
    case "boolean": if (typeof v !== "boolean") out.push(`${at}: not boolean`); break;
    case "integer": if (!Number.isInteger(v)) out.push(`${at}: not integer`); break;
    case "string":
      if (typeof v !== "string") { out.push(`${at}: not string`); break; }
      if (typeof s.pattern === "string" && !new RegExp(s.pattern).test(v)) out.push(`${at}: ${JSON.stringify(v)} fails ${s.pattern}`);
      if (Array.isArray(s.enum) && !s.enum.includes(v)) out.push(`${at}: ${v} not in enum`);
      break;
    case "array":
      if (!Array.isArray(v)) { out.push(`${at}: not array`); break; }
      v.forEach((x, i) => out.push(...validate(x, s.items as S, `${at}[${i}]`)));
      break;
    case "object": {
      if (!v || typeof v !== "object" || Array.isArray(v)) { out.push(`${at}: not object`); break; }
      for (const k of (s.required as string[] | undefined) ?? []) if (!(k in v)) out.push(`${at}.${k}: missing`);
      const props = (s.properties as Record<string, S> | undefined) ?? {};
      for (const [k, x] of Object.entries(v)) if (props[k]) out.push(...validate(x, props[k], `${at}.${k}`));
      break;
    }
  }
  return out;
}

function conforms(path: string, r: ApiResult): string[] {
  const res = doc.paths[path].post.responses[String(r.status)];
  if (!res) return [`status ${r.status} is not documented for ${path}`];
  const schema = res.content?.["application/json"].schema;
  return schema ? validate(r.body, schema) : [];
}

const identity = { fullName: "Ana Test", dateOfBirth: "1990-01-01", nationality: "Brazilian", documentNumber: "X1", email: "a@example.com", memberState: "France" };
const date = fc.integer({ min: 0, max: 900 }).map((n) => new Date(Date.UTC(2025, 9, 1) + n * 864e5).toISOString().slice(0, 10));
const trip = fc.tuple(date, fc.integer({ min: -2, max: 60 }), fc.boolean()).map(([e, len, open]) => ({ entry: e, exit: open ? null : new Date(Date.parse(e) + len * 864e5).toISOString().slice(0, 10) }));

describe("OpenAPI document matches what the API returns", () => {
  it("random requests to the three endpoints", () => {
    fc.assert(fc.property(fc.array(trip, { maxLength: 6 }), date, fc.integer({ min: 0, max: 120 }), fc.option(fc.tuple(date, fc.integer({ min: -1, max: 100 }))), (trips, on, figure, plan) => {
      const planned = plan ? { entry: plan[0], exit: new Date(Date.parse(plan[0]) + plan[1] * 864e5).toISOString().slice(0, 10) } : undefined;
      const ees = { daysUsed: Math.min(figure, 180), on, records: trips.slice(0, 2) };
      const problems = [
        ...conforms("/api/v1/check", check({ trips, on, ...(planned ? { planned } : {}) })),
        ...conforms("/api/v1/ees-reconcile", eesReconcile({ trips, ees })),
        ...conforms("/api/v1/letter", article52Letter({ trips, ees, identity })),
      ];
      expect(problems).toEqual([]);
    }), { numRuns: 400, seed: 20261020 });
  });

  it("years outside 1900 to 2199 are a 400 naming the field, not a crash or a five-digit year", () => {
    for (const d of ["0999-01-10", "9999-12-31"]) {
      const r = check({ trips: [], on: d });
      expect(r.status).toBe(400);
      expect(JSON.stringify(r.body)).toContain('"path":"on"');
    }
  });

  it.each([
    ["/api/v1/check", () => check({ trips: [{ entry: "0999-01-01", exit: "0999-01-05" }], on: "0999-01-10" })],
    ["/api/v1/check", () => check({ trips: [{ entry: "9999-12-20", exit: "9999-12-31" }], on: "9999-12-31" })],
    ["/api/v1/check", () => check({ trips: "x" })],
    ["/api/v1/check", () => check({ trips: [], on: "2024-02-29", planned: { entry: "2024-02-29", exit: "2024-02-28" } })],
    ["/api/v1/ees-reconcile", () => eesReconcile({ trips: [{ entry: "2025-12-31", exit: "2026-01-01" }], ees: { daysUsed: 2, on: "2026-01-01", records: [{ entry: "2025-12-31", exit: null }] } })],
    ["/api/v1/letter", () => article52Letter({ trips: [], ees: { daysUsed: 0, on: "2026-10-19" }, identity })],
  ] as const)("%s edge %#", (path, call) => {
    expect(conforms(path, call())).toEqual([]);
  });
});
