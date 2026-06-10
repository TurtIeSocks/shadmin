import { describe, expect, it } from "vitest";
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { defineBlock, getDefaultAttrs, schemaKeys } from "./define-block";

const block = defineBlock({
  name: "demo",
  label: "Demo",
  group: "content",
  icon: Lightbulb,
  schema: z.object({
    variant: z.enum(["info", "warning"]).default("info"),
    id: z.union([z.string(), z.number()]).nullable().default(null),
    required: z.string(),
  }),
  render: () => null,
});

describe("defineBlock", () => {
  it("returns the definition unchanged (identity helper)", () => {
    expect(block.name).toBe("demo");
    expect(block.group).toBe("content");
  });

  it("schemaKeys lists the top-level schema keys", () => {
    expect(schemaKeys(block.schema).sort()).toEqual([
      "id",
      "required",
      "variant",
    ]);
  });

  it("getDefaultAttrs derives defaults; missing required → null", () => {
    expect(getDefaultAttrs(block.schema)).toEqual({
      variant: "info",
      id: null,
      required: null,
    });
  });
});
