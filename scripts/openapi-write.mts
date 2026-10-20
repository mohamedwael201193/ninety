import { writeFileSync } from "node:fs";
import { OPENAPI } from "../src/lib/api/openapi";
writeFileSync("docs/openapi.json", JSON.stringify(OPENAPI, null, 2) + "\n");
