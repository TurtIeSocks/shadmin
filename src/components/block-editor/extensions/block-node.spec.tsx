import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { z } from "zod";
import { Lightbulb } from "lucide-react";
import { defineBlock } from "../define-block";
import { createBaseExtensions } from "./base";
import { createBlockNode } from "./block-node";

const callout = defineBlock({
  name: "callout",
  label: "Callout",
  group: "content",
  icon: Lightbulb,
  schema: z.object({ variant: z.enum(["info", "warning"]).default("info") }),
  content: "block+",
  render: () => null,
});

describe("createBlockNode", () => {
  it("registers a node named after the block with its schema attrs", () => {
    const element = document.createElement("div");
    const editor = new Editor({
      element,
      extensions: [...createBaseExtensions(), createBlockNode(callout)],
      content: {
        type: "doc",
        content: [
          {
            type: "callout",
            attrs: { variant: "warning" },
            content: [{ type: "paragraph" }],
          },
        ],
      },
    });
    expect(editor.schema.nodes.callout).toBeDefined();
    const json = editor.getJSON();
    expect(json.content![0].type).toBe("callout");
    expect(json.content![0].attrs!.variant).toBe("warning");
    editor.destroy();
  });
});
