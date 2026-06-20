import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNavTree } from "./nav.ts";

test("buildNavTree orders by _meta then alpha, nests dirs", () => {
  const slugs = [
    "getting-started/install",
    "getting-started/quick-start",
    "components/data-table",
    "components/array-input",
  ];
  const metas = {
    "": [{ dir: "getting-started", title: "Getting Started" }, { dir: "components" }],
    "getting-started": [{ slug: "quick-start", title: "Quick Start" }, { slug: "install" }],
    components: [{ slug: "data-table" }],
  };
  const tree = buildNavTree(slugs, metas);

  // Top order from root _meta: getting-started before components
  assert.equal(tree[0].kind, "group");
  assert.equal((tree[0] as any).dir, "getting-started");
  // Within getting-started: quick-start before install (meta order)
  const gs = tree[0] as any;
  assert.deepEqual(gs.children.map((c: any) => c.slug), [
    "getting-started/quick-start",
    "getting-started/install",
  ]);
  // components: data-table listed in meta first, array-input appended alpha
  const comp = tree[1] as any;
  assert.deepEqual(comp.children.map((c: any) => c.slug), [
    "components/data-table",
    "components/array-input",
  ]);
});
