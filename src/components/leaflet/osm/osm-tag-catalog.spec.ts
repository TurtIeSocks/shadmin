import { describe, expect, it } from "vitest";
import { tagToFilter } from "./osm-tag-catalog";

describe("tagToFilter", () => {
  it("converts a key=value tag", () => {
    expect(tagToFilter("natural=water")).toEqual({ key: "natural", value: "water" });
  });
  it("converts a key=* wildcard to any-mode filter", () => {
    expect(tagToFilter("building=*")).toEqual({ key: "building", any: true });
  });
  it("throws on missing separator", () => {
    expect(() => tagToFilter("buildingyes")).toThrow(/Invalid OSM tag/);
  });
  it("throws on empty key", () => {
    expect(() => tagToFilter("=value")).toThrow(/Empty key/);
  });
  it("throws on empty value (suggests *)", () => {
    expect(() => tagToFilter("natural=")).toThrow(/Empty value/);
  });
});
