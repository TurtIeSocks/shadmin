import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildManifest } from "./generate-docs-manifest.mjs";

const FIXTURE = {
  items: [
    {
      name: "button-group",
      type: "registry:ui",
      title: "Button Group",
      description: "A group of buttons.",
      categories: ["shadmin", "buttons"],
      docs: "See the button-group docs for usage.",
    },
    {
      name: "csv-import",
      type: "registry:block",
      title: "CSV Import",
      description: null,
      categories: ["shadmin", "data-import"],
      docs: null,
    },
    {
      // no categories — should fall back to "misc"
      name: "extras",
      type: "registry:block",
      title: "Extras",
    },
    {
      // no description — should be null
      name: "style-shadmin",
      type: "registry:style",
      title: "Shadmin Style",
      categories: ["shadmin"],
    },
  ],
};

describe("buildManifest", () => {
  const manifest = buildManifest(FIXTURE);

  it("produces correct item count", () => {
    assert.equal(manifest.items.length, 4);
  });

  it("generatedAt is null", () => {
    assert.equal(manifest.generatedAt, null);
  });

  it("install commands correct for all 4 managers", () => {
    const item = manifest.items.find((i) => i.name === "button-group");
    assert.ok(item, "button-group item present");
    assert.equal(item.install.npm, "npx shadcn@latest add @shadmin/button-group");
    assert.equal(item.install.pnpm, "pnpm dlx shadcn@latest add @shadmin/button-group");
    assert.equal(item.install.yarn, "yarn dlx shadcn@latest add @shadmin/button-group");
    assert.equal(item.install.bun, "bunx shadcn@latest add @shadmin/button-group");
  });

  it("category falls back to misc when categories absent", () => {
    const item = manifest.items.find((i) => i.name === "extras");
    assert.ok(item, "extras item present");
    assert.equal(item.category, "misc");
  });

  it("category falls back to misc when categories has only 1 entry", () => {
    const item = manifest.items.find((i) => i.name === "style-shadmin");
    assert.ok(item, "style-shadmin item present");
    assert.equal(item.category, "misc");
  });

  it("description is null when absent", () => {
    const item = manifest.items.find((i) => i.name === "extras");
    assert.equal(item.description, null);
  });

  it("description is null when explicitly null", () => {
    const item = manifest.items.find((i) => i.name === "csv-import");
    assert.equal(item.description, null);
  });

  it("docs field preserved when present", () => {
    const item = manifest.items.find((i) => i.name === "button-group");
    assert.equal(item.docs, "See the button-group docs for usage.");
  });

  it("docs field is null when absent", () => {
    const item = manifest.items.find((i) => i.name === "extras");
    assert.equal(item.docs, null);
  });

  it("nav groups correct categories", () => {
    const cats = manifest.nav.map((g) => g.category);
    assert.ok(cats.includes("buttons"), "buttons group present");
    assert.ok(cats.includes("data-import"), "data-import group present");
    assert.ok(cats.includes("misc"), "misc group present");
  });

  it("nav groups sorted: curated order (data-import before misc)", () => {
    const cats = manifest.nav.map((g) => g.category);
    const diIdx = cats.indexOf("data-import");
    const miscIdx = cats.indexOf("misc");
    assert.ok(diIdx < miscIdx, "data-import comes before misc");
  });

  it("nav items sorted alpha by title within group", () => {
    const miscGroup = manifest.nav.find((g) => g.category === "misc");
    assert.ok(miscGroup, "misc nav group present");
    // extras + style-shadmin both in misc; Extras < Shadmin Style alphabetically
    assert.equal(miscGroup.items[0].name, "extras");
    assert.equal(miscGroup.items[1].name, "style-shadmin");
  });

  it("nav labels mapped correctly", () => {
    const dataImport = manifest.nav.find((g) => g.category === "data-import");
    assert.equal(dataImport.label, "Data Import");
    const misc = manifest.nav.find((g) => g.category === "misc");
    assert.equal(misc.label, "Misc");
  });
});
