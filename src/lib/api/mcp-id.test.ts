import { describe, expect, it } from "vitest";
import { rpc } from "./mcp-http";

// Caught by TestSprite backend test BE28 against production (2026-10-21, run 8c45fada): an error
// for a request whose id is not a string or a number had no "id" member at all.
describe("JSON-RPC 2.0 section 5: an error response always carries id", () => {
  for (const id of [true, { a: 1 }, [1]] as unknown[]) {
    it(`id ${JSON.stringify(id)}: -32600 with id null`, () => {
      const reply = rpc({ jsonrpc: "2.0", id: id as never, method: "tools/list" }) as Record<string, unknown>;
      expect(reply).toHaveProperty("id", null);
      expect((reply.error as { code: number }).code).toBe(-32600);
    });
  }

  it("an invalid id with bad params is still -32600 with id null, not an echo of the id", () => {
    const reply = rpc({ jsonrpc: "2.0", id: { a: 1 } as never, method: "tools/call", params: "x" as never }) as Record<string, unknown>;
    expect(reply).toEqual({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Request id must be a string or a number." } });
  });

  it("a message with jsonrpc 1.0 and an object id gets id null", () => {
    const reply = rpc({ jsonrpc: "1.0", id: { a: 1 } as never, method: "tools/list" }) as Record<string, unknown>;
    expect(reply).toHaveProperty("id", null);
  });
});
