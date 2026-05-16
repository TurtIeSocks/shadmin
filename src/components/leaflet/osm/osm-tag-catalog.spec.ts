import { describe, expect, it } from "vitest";
import type {
  BuildingTag,
  HighwayTag,
  KnownOsmTag,
  NaturalTag,
} from "./osm-tag-catalog";
import { tagToFilter } from "./osm-tag-catalog";

// Compile-time assertion: each category type is assignable to KnownOsmTag.
type _AssertNaturalSubset = NaturalTag extends KnownOsmTag ? true : false;
type _AssertBuildingSubset = BuildingTag extends KnownOsmTag ? true : false;
type _AssertHighwaySubset = HighwayTag extends KnownOsmTag ? true : false;
const _natural: _AssertNaturalSubset = true;
const _building: _AssertBuildingSubset = true;
const _highway: _AssertHighwaySubset = true;
void _natural;
void _building;
void _highway;

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
