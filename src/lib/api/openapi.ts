/** OpenAPI 3.1 description of the public API, served at /api/openapi.json. Kept in step with v1.ts by openapi.test.ts. */
import { API_VERSION } from "./v1";

const date = { type: "string", format: "date", pattern: "^\\d{4}-\\d{2}-\\d{2}$", examples: ["2026-10-19"] };
/** A date the API accepts: 1900-01-01 to 2199-12-31 (answers can run a few months past it, so they use `date`). */
const inDate = { ...date, pattern: "^(19\\d{2}|2[01]\\d{2})-\\d{2}-\\d{2}$" };
/** One line of non-blank text. */
const line = (maxLength: number) => ({ type: "string", minLength: 1, maxLength, pattern: "\\S" });
const trip = {
  type: "object", additionalProperties: false, required: ["entry"],
  properties: { entry: inDate, exit: { oneOf: [inDate, { type: "null" }], description: "Omit or null for a stay still in progress." } },
};
const trips = { type: "array", maxItems: 200, items: trip };
const ees = {
  type: "object", additionalProperties: false, required: ["daysUsed", "on"],
  properties: {
    daysUsed: { type: "integer", minimum: 0, maximum: 180, description: "The days-used figure the EES shows." },
    on: inDate,
    records: { type: "array", maxItems: 200, items: { type: "object", additionalProperties: false, required: ["entry", "exit"], properties: { entry: inDate, exit: { oneOf: [inDate, { type: "null" }] } } } },
  },
};
const error = {
  type: "object", required: ["error"],
  properties: {
    error: { type: "string" },
    issues: { type: "array", items: { type: "object", properties: { path: { type: "string" }, message: { type: "string" } } } },
    messages: { type: "array", items: { type: "string" } },
  },
};
const errors = {
  "400": { description: "Invalid JSON or a field failed validation.", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
  "413": { description: "Body over 64 KB." },
  "415": { description: "Content-Type is not application/json." },
  "422": { description: "Valid shape, but the trips or plan cannot be counted (for example an exit before its entry).", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
};
const json = (schema: object, example?: object) => ({ required: true, content: { "application/json": { schema, ...(example ? { example } : {}) } } });

export const OPENAPI = {
  openapi: "3.1.0",
  info: {
    title: "Ninety API",
    version: API_VERSION,
    description: "Schengen 90/180 counting, EES reconciliation and the Article 52 correction letter, using the same engine as https://ninety-coral.vercel.app. No key, no account; nothing you send is stored. This is a helping tool, not a decision by a border authority.",
    license: { name: "MIT" },
  },
  servers: [{ url: "https://ninety-coral.vercel.app" }],
  paths: {
    "/api/v1/check": {
      post: {
        operationId: "schengenCheck",
        summary: "Days used and left on a date, latest legal exit, next legal entry, overstays; optionally whether a planned trip fits.",
        requestBody: json({
          type: "object", additionalProperties: false, required: ["trips"],
          properties: { trips, on: { ...inDate, description: "Date to count on. Defaults to today (UTC)." }, planned: { type: "object", additionalProperties: false, required: ["entry", "exit"], properties: { entry: inDate, exit: inDate } } },
        }, { trips: [{ entry: "2026-05-01", exit: "2026-06-15" }, { entry: "2026-08-20", exit: "2026-09-30" }], on: "2026-10-19" }),
        responses: {
          "200": { description: "The count.", content: { "application/json": { schema: { $ref: "#/components/schemas/Check" } } } },
          ...errors,
        },
      },
    },
    "/api/v1/ees-reconcile": {
      post: {
        operationId: "eesReconcile",
        summary: "Compare the EES days-used figure (and records, if you have them) with your trips, and name the days that differ.",
        requestBody: json({ type: "object", additionalProperties: false, required: ["trips", "ees"], properties: { trips, ees } }),
        responses: { "200": { description: "The comparison.", content: { "application/json": { schema: { $ref: "#/components/schemas/Reconciliation" } } } }, ...errors },
      },
    },
    "/api/v1/letter": {
      post: {
        operationId: "article52Letter",
        summary: "Draft the Article 52 (Regulation (EU) 2017/2226) request to rectify EES data, from your details and the comparison.",
        requestBody: json({
          type: "object", additionalProperties: false, required: ["trips", "ees", "identity"],
          properties: {
            trips, ees,
            identity: {
              type: "object", additionalProperties: false,
              required: ["fullName", "dateOfBirth", "nationality", "documentNumber", "email", "memberState"],
              properties: { fullName: line(120), dateOfBirth: inDate, nationality: line(60), documentNumber: line(40), email: { type: "string", maxLength: 200, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" }, memberState: line(60) },
            },
          },
        }),
        responses: { "200": { description: "The letter.", content: { "application/json": { schema: { $ref: "#/components/schemas/Letter" } } } }, ...errors },
      },
    },
  },
  components: {
    schemas: {
      Error: error,
      Check: {
        type: "object", required: ["on", "daysUsed", "daysLeft", "present", "latestExit", "nextLegalEntry", "overstays"],
        properties: {
          on: date, daysUsed: { type: "integer" }, daysLeft: { type: "integer" }, present: { type: "boolean" },
          latestExit: { oneOf: [date, { type: "null" }] }, nextLegalEntry: { oneOf: [date, { type: "null" }] },
          overstays: { type: "array", items: { type: "object", properties: { from: date, to: date, days: { type: "integer" } } } },
          planned: { type: "object", properties: { fits: { type: "boolean" }, plannedDays: { type: "integer" }, daysLeftOnEntry: { type: "integer" }, latestExit: { oneOf: [date, { type: "null" }] } } },
        },
      },
      Reconciliation: {
        type: "object",
        properties: {
          on: date, windowStart: date, travellerDaysUsed: { type: "integer" }, eesDaysUsed: { type: "integer" }, figureGap: { type: "integer" },
          codes: { type: "array", items: { type: "string" } }, explanation: { type: "string" },
          differences: { type: "array", items: { type: "object", properties: { from: date, to: date, side: { type: "string", enum: ["traveller-only", "ees-only"] }, count: { type: "integer" } } } },
        },
      },
      Letter: { type: "object", properties: { title: { type: "string" }, addressee: { type: "string" }, text: { type: "string" }, evidence: { type: "object" } } },
    },
  },
} as const;
