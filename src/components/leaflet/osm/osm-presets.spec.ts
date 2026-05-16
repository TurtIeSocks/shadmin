import { describe, expect, it } from "vitest";

import { buildOverpassQuery, OSM_PRESETS } from "./osm-presets";

const PARIS_BBOX: GeoJSON.BBox = [2.3, 48.85, 2.4, 48.9];

describe("buildOverpassQuery", () => {
  it("emits the water preset clauses with the bbox in (s,w,n,e) Overpass order", () => {
    const q = buildOverpassQuery(["water"], PARIS_BBOX);
    // bbox order check: Overpass wants `s,w,n,e`
    expect(q).toContain("48.85,2.3,48.9,2.4");
    // natural-multi-value filter compiled as regex alternation
    expect(q).toMatch(/way\["natural"~"\^\(water\|bay\|strait\)\$"\]/);
    expect(q).toMatch(/relation\["natural"~"\^\(water\|bay\|strait\)\$"\]/);
    // waterway "any" filter
    expect(q).toMatch(/way\["waterway"\]/);
    expect(q).toMatch(/relation\["waterway"\]/);
    // wrapper boilerplate
    expect(q.startsWith("[out:json][timeout:25];")).toBe(true);
    expect(q.trim().endsWith("out geom;")).toBe(true);
  });

  it("emits a single 'any' filter for the buildings preset", () => {
    const q = buildOverpassQuery(["buildings"], PARIS_BBOX);
    expect(q).toMatch(/way\["building"\]/);
    expect(q).toMatch(/relation\["building"\]/);
    expect(q).not.toMatch(/building"=/); // no exact-value form
  });

  it("emits the roads preset with major-highway alternation and way-only element types", () => {
    const q = buildOverpassQuery(["roads"], PARIS_BBOX);
    expect(q).toMatch(
      /way\["highway"~"\^\(motorway\|trunk\|primary\|secondary\)\$"\]/,
    );
    // roads preset narrows elementTypes to ["way"] -> no relation lines
    expect(q).not.toMatch(/relation\["highway"\]/);
    // elementTypes config matches the preset def
    expect(OSM_PRESETS.roads.elementTypes).toEqual(["way"]);
    expect(OSM_PRESETS.roads.bufferLinesMeters).toBe(15);
  });

  it("merges clauses from multiple presets in one call", () => {
    const q = buildOverpassQuery(["water", "roads"], PARIS_BBOX);
    expect(q).toMatch(/way\["natural"~"\^\(water\|bay\|strait\)\$"\]/);
    expect(q).toMatch(/way\["highway"~/);
  });
});
