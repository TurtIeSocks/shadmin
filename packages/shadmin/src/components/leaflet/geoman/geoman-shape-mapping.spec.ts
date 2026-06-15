import { describe, expect, it } from "vitest";
import {
  geojsonTypeToGeomanShape,
  layerToGeometry,
  geometryToLatLngs,
} from "./geoman-shape-mapping";
import L from "leaflet";

describe("geojsonTypeToGeomanShape", () => {
  it("maps Point → Marker", () =>
    expect(geojsonTypeToGeomanShape("Point")).toBe("Marker"));
  it("maps LineString → Line", () =>
    expect(geojsonTypeToGeomanShape("LineString")).toBe("Line"));
  it("maps Polygon → Polygon", () =>
    expect(geojsonTypeToGeomanShape("Polygon")).toBe("Polygon"));
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

  it("converts an L.Circle to a Polygon ring approximation (64 segments + closing point)", () => {
    const c = L.circle([48.85, 2.35], { radius: 1000 });
    const g = layerToGeometry(c);
    expect(g).not.toBeNull();
    expect(g!.type).toBe("Polygon");
    const poly = g as GeoJSON.Polygon;
    expect(poly.coordinates).toHaveLength(1);
    // 64 segments around the perimeter + one closing point that equals the
    // first vertex.
    expect(poly.coordinates[0]).toHaveLength(65);
    const first = poly.coordinates[0][0];
    const last = poly.coordinates[0][64];
    expect(last[0]).toBeCloseTo(first[0], 10);
    expect(last[1]).toBeCloseTo(first[1], 10);
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

  it("flattens a GeometryCollection into latlng coordinates", () => {
    const result = geometryToLatLngs({
      type: "GeometryCollection",
      geometries: [
        { type: "Point", coordinates: [2.35, 48.85] },
        { type: "Point", coordinates: [2.36, 48.86] },
      ],
    });
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBeGreaterThan(0);
  });
});
