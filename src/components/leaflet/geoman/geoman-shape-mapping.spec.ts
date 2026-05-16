import { describe, expect, it } from "vitest";
import {
  geojsonTypeToGeomanShape,
  layerToGeometry,
  geometryToLatLngs,
} from "./geoman-shape-mapping";
import L from "leaflet";

describe("geojsonTypeToGeomanShape", () => {
  it("maps Point → Marker", () => expect(geojsonTypeToGeomanShape("Point")).toBe("Marker"));
  it("maps LineString → Line", () => expect(geojsonTypeToGeomanShape("LineString")).toBe("Line"));
  it("maps Polygon → Polygon", () => expect(geojsonTypeToGeomanShape("Polygon")).toBe("Polygon"));
});

describe("layerToGeometry", () => {
  it("converts an L.Marker to a Point geometry", () => {
    const m = L.marker([48.85, 2.35]);
    const g = layerToGeometry(m);
    expect(g).toEqual({ type: "Point", coordinates: [2.35, 48.85] });
  });

  it("converts an L.Polygon to a Polygon geometry with closed ring", () => {
    const p = L.polygon([
      [0, 0],
      [0, 1],
      [1, 1],
    ]);
    const g = layerToGeometry(p);
    expect(g).toMatchObject({ type: "Polygon" });
  });
});

describe("geometryToLatLngs", () => {
  it("returns lat/lng coords for a LineString", () => {
    const ll = geometryToLatLngs({
      type: "LineString",
      coordinates: [
        [2.35, 48.85],
        [2.36, 48.86],
      ],
    });
    expect(ll).toEqual([
      [48.85, 2.35],
      [48.86, 2.36],
    ]);
  });
});
