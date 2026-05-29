import { describe, expect, it } from "vitest";
import { dataBlocks } from "./data-blocks";
import { defaultBlocks } from "./index";

describe("dataBlocks", () => {
  it("contains the three data blocks and none overlap defaultBlocks", () => {
    expect(dataBlocks.map((b) => b.name).sort()).toEqual([
      "chart",
      "recordList",
      "referenceRecord",
    ]);
    const defaultNames = new Set(defaultBlocks.map((b) => b.name));
    expect(dataBlocks.some((b) => defaultNames.has(b.name))).toBe(false);
  });
});
