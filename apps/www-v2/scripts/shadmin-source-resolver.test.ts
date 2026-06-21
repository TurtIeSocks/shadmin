import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAtImport } from "./shadmin-source-resolver.mjs";

const opts = {
  shadminSrc: "/repo/packages/shadmin/src",
  wwwSrc: "/repo/apps/www-v2/src",
};

test("@/ from an admin source file resolves to shadmin src", () => {
  assert.equal(
    resolveAtImport(
      "/repo/packages/shadmin/src/components/admin/fields/reference-field.tsx",
      opts,
    ),
    "/repo/packages/shadmin/src",
  );
});

test("@/ from a www-v2 file resolves to www-v2 src", () => {
  assert.equal(
    resolveAtImport("/repo/apps/www-v2/src/demo/demo-layout.tsx", opts),
    "/repo/apps/www-v2/src",
  );
});

test("@/ with no importer falls back to www-v2 src", () => {
  assert.equal(resolveAtImport(undefined, opts), "/repo/apps/www-v2/src");
});
