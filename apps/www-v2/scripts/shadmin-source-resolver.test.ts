import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveAtImport,
  resolveScopedShadmin,
} from "./shadmin-source-resolver.mjs";

const opts = {
  shadminSrc: "/repo/packages/shadmin/src",
  wwwSrc: "/repo/apps/www-v2/src",
};
const src = { shadminSrc: "/repo/packages/shadmin/src" };

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

test("bare admin barrel resolves to the src components/admin dir", () => {
  assert.equal(
    resolveScopedShadmin("shadmin/components/admin", src),
    "/repo/packages/shadmin/src/components/admin",
  );
});

test("deep admin path resolves to the matching src file", () => {
  assert.equal(
    resolveScopedShadmin("shadmin/components/admin/list/data-table", src),
    "/repo/packages/shadmin/src/components/admin/list/data-table",
  );
});

test("other src-only groups (csv-import, leaflet, realtime) resolve to src", () => {
  assert.equal(
    resolveScopedShadmin("shadmin/components/csv-import", src),
    "/repo/packages/shadmin/src/components/csv-import",
  );
  assert.equal(
    resolveScopedShadmin("shadmin/components/leaflet/map", src),
    "/repo/packages/shadmin/src/components/leaflet/map",
  );
});

test("ui resolves to src (shared context with folded-in admin source)", () => {
  assert.equal(
    resolveScopedShadmin("shadmin/components/ui/sidebar", src),
    "/repo/packages/shadmin/src/components/ui/sidebar",
  );
});

test("dist-built leaf editors (mdx-editor, rich-text-input) are NOT aliased", () => {
  assert.equal(
    resolveScopedShadmin("shadmin/components/mdx-editor", src),
    null,
  );
  assert.equal(
    resolveScopedShadmin("shadmin/components/rich-text-input", src),
    null,
  );
});

test("non-shadmin specifiers return null", () => {
  assert.equal(resolveScopedShadmin("react", src), null);
  assert.equal(resolveScopedShadmin("shadmin/lib/utils", src), null);
});
