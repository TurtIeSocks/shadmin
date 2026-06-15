import { describe, expect, it } from "vitest";
import {
  wrapUnknownNodes,
  unwrapUnknownNodes,
  UNKNOWN_BLOCK_NAME,
} from "./unknown-block";

const known = new Set(["doc", "paragraph", "text", "callout"]);

const doc = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "hi" }] },
    {
      type: "fancyWidget",
      attrs: { foo: 1 },
      content: [{ type: "text", text: "x" }],
    },
    { type: "callout", attrs: { variant: "info" } },
  ],
};

describe("unknown-block transforms", () => {
  it("wraps only foreign nodes, preserving their full JSON in payload", () => {
    const wrapped = wrapUnknownNodes(doc, known);
    const types = wrapped.content!.map((n) => n.type);
    expect(types).toEqual(["paragraph", UNKNOWN_BLOCK_NAME, "callout"]);
    expect(wrapped.content![1].attrs!.payload).toEqual(doc.content[1]);
  });

  it("unwrap is the inverse of wrap for foreign nodes", () => {
    const round = unwrapUnknownNodes(wrapUnknownNodes(doc, known));
    expect(round).toEqual(doc);
  });

  it("leaves docs without foreign nodes untouched", () => {
    const clean = {
      type: "doc",
      content: [{ type: "callout", attrs: { variant: "info" } }],
    };
    expect(wrapUnknownNodes(clean, known)).toEqual(clean);
  });
});
