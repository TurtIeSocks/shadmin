import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Lightbulb, Boxes } from "lucide-react";
import { defineBlock } from "./define-block";
import { createBlockRegistry } from "./block-registry";

const callout = defineBlock({
  name: "callout", label: "Callout", group: "content", icon: Lightbulb,
  schema: z.object({ variant: z.string().default("info") }), render: () => null,
});
const ref = defineBlock({
  name: "referenceRecord", label: "Reference record", group: "data", icon: Boxes,
  schema: z.object({ id: z.number().nullable().default(null) }), render: () => null,
});

describe("createBlockRegistry", () => {
  const registry = createBlockRegistry([callout, ref]);

  it("gets a block by name", () => {
    expect(registry.get("callout")).toBe(callout);
    expect(registry.get("nope")).toBeUndefined();
  });

  it("lists all blocks and their names", () => {
    expect(registry.list()).toHaveLength(2);
    expect(registry.names()).toEqual(["callout", "referenceRecord"]);
  });

  it("groups blocks by group, preserving insertion order", () => {
    const groups = registry.groups();
    expect(groups.map((g) => g.group)).toEqual(["content", "data"]);
    expect(groups[0].blocks).toEqual([callout]);
  });

  it("throws on duplicate block names", () => {
    expect(() => createBlockRegistry([callout, callout])).toThrow(/duplicate/i);
  });
});
