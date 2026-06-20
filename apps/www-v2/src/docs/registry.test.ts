import { test } from "node:test";
import assert from "node:assert/strict";
import { installFor } from "./registry.ts";

test("installFor returns shadcn commands for a real registry component", () => {
  // 'data-table' is a known registry item name.
  const cmds = installFor("components/data-table");
  assert.ok(cmds, "expected install commands");
  assert.equal(cmds.pnpm, "pnpm dlx shadcn@latest add @shadmin/data-table");
});

test("installFor returns null for a non-component guide slug", () => {
  assert.equal(installFor("getting-started/install"), null);
});
