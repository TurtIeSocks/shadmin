import { describe, expect, it } from "vitest";
import {
  subtract,
  unionAll,
  bboxOf,
  areaM2,
  polygonToBBox,
  bboxToPolygon,
  aspectLockedBBox,
} from "./geometry-ops";

const square = (xmin: number, ymin: number, xmax: number, ymax: number): GeoJSON.Polygon => ({
  type: "Polygon",
  coordinates: [[[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]],
});

describe("subtract", () => {
  it("removes a smaller polygon from a larger one", () => {
    const big = square(0, 0, 4, 4);
    const small = square(1, 1, 2, 2);
    const result = subtract(big, {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: small, properties: {} }],
    });
    expect(result).not.toBeNull();
    expect(result!.type).toMatch(/Polygon|MultiPolygon/);
  });

  it("returns null when mask covers entire input", () => {
    const big = square(0, 0, 4, 4);
    const result = subtract(big, {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: big, properties: {} }],
    });
    expect(result).toBeNull();
  });
});

describe("bboxOf", () => {
  it("computes bbox of a polygon", () => {
    const p = square(1, 2, 3, 4);
    expect(bboxOf(p)).toEqual([1, 2, 3, 4]);
  });
});

describe("areaM2", () => {
  it("computes positive area for a polygon", () => {
    const p = square(0, 0, 1, 1);
    expect(areaM2(p)).toBeGreaterThan(0);
  });
});

describe("unionAll", () => {
  it("unions a feature collection of polygons", () => {
    const fc: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: square(0, 0, 2, 2), properties: {} },
        { type: "Feature", geometry: square(1, 1, 3, 3), properties: {} },
      ],
    };
    const result = unionAll(fc);
    expect(result).not.toBeNull();
  });
});

describe("polygonToBBox", () => {
  it("converts a Polygon to its bounding box [w,s,e,n]", () => {
    const result = polygonToBBox({
      type: "Polygon",
      coordinates: [
        [
          [2, 48],
          [3, 48],
          [3, 49],
          [2, 49],
          [2, 48],
        ],
      ],
    });
    expect(result).toEqual([2, 48, 3, 49]);
  });

  it("returns null for non-Polygon input", () => {
    expect(polygonToBBox({ type: "Point", coordinates: [0, 0] })).toBeNull();
  });
});

describe("bboxToPolygon", () => {
  it("converts [w,s,e,n] to a closed Polygon ring", () => {
    const result = bboxToPolygon([2, 48, 3, 49]);
    expect(result?.type).toBe("Polygon");
    expect(result?.coordinates[0]).toHaveLength(5);
    expect(result?.coordinates[0][0]).toEqual([2, 48]);
    expect(result?.coordinates[0][4]).toEqual([2, 48]);
  });

  it("returns null for malformed input", () => {
    expect(bboxToPolygon([1, 2, 3])).toBeNull();
    expect(bboxToPolygon("nope")).toBeNull();
    expect(bboxToPolygon(null)).toBeNull();
  });
});

describe("aspectLockedBBox", () => {
  it("returns the bbox unchanged when it already matches the ratio", () => {
    const transform = aspectLockedBBox(2);
    const result = transform({
      type: "Polygon",
      coordinates: [[[0, 0], [4, 0], [4, 2], [0, 2], [0, 0]]],
    });
    expect(result).toEqual([0, 0, 4, 2]);
  });

  it("widens a too-tall bbox to match the ratio, centred", () => {
    const transform = aspectLockedBBox(2);
    // Input is 1×1 → too tall for ratio=2; needs to become 2×1, centred on 0.5,0.5
    const result = transform({
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    });
    expect(result).not.toBeNull();
    const [w, s, e, n] = result!;
    expect(e - w).toBeCloseTo(2);
    expect(n - s).toBeCloseTo(1);
    expect((w + e) / 2).toBeCloseTo(0.5);
    expect((s + n) / 2).toBeCloseTo(0.5);
  });

  it("returns null for non-Polygon", () => {
    expect(aspectLockedBBox(1)({ type: "Point", coordinates: [0, 0] })).toBeNull();
  });
});
