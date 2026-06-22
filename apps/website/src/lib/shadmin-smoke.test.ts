import { test } from "node:test";
import assert from "node:assert/strict";

test("shadmin Button export resolves from built package", async () => {
  const mod = await import("shadmin/components/ui/button");
  assert.ok(mod.Button, "Button export should exist");
});
