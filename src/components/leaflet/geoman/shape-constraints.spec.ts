import { describe, expect, it } from "vitest";
import {
  validateMinVertices,
  validateMinAreaM2,
} from "./shape-constraints";

describe("validateMinVertices", () => {
  it("rejects polygons below the threshold", () => {
    const triangle: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [0, 1], [0, 0]]],
    };
    expect(validateMinVertices(5)(triangle)).toMatch(/at least 5/);
  });

  it("accepts polygons at or above the threshold", () => {
    const pentagon: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [-0.5, 0.5], [0, 0]]],
    };
    expect(validateMinVertices(5)(pentagon)).toBeUndefined();
  });
});

describe("validateMinAreaM2", () => {
  it("rejects polygons below the area threshold", () => {
    const tiny: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [[[0, 0], [0.0001, 0], [0.0001, 0.0001], [0, 0.0001], [0, 0]]],
    };
    expect(validateMinAreaM2(1_000_000)(tiny)).toMatch(/at least/);
  });
});
