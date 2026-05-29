import { describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { calloutBlock } from "./blocks/callout";
import { createBaseExtensions } from "./extensions/base";
import { createBlockNode } from "./extensions/block-node";
import {
  UnknownBlock,
  wrapUnknownNodes,
  unwrapUnknownNodes,
} from "./extensions/unknown-block";

describe("block-editor data-safety round-trip", () => {
  it("preserves a foreign block type through load → serialize", () => {
    const foreign = {
      type: "futureWidget",
      attrs: { x: 1 },
      content: [{ type: "text", text: "alien" }],
    };
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "keep me" }] },
        foreign,
      ],
    };
    const editor = new Editor({
      element: document.createElement("div"),
      extensions: [
        ...createBaseExtensions(),
        UnknownBlock,
        createBlockNode(calloutBlock),
      ],
    });
    const known = new Set(Object.keys(editor.schema.nodes));
    editor.commands.setContent(wrapUnknownNodes(doc, known), {
      emitUpdate: false,
    });
    const out = unwrapUnknownNodes(editor.getJSON());
    // The foreign node survived load (which drops unknown PM node types) and
    // came back byte-for-byte after unwrap.
    expect(out.content).toContainEqual(foreign);
    editor.destroy();
  });
});
