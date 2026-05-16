import difference from "@turf/difference";
import union from "@turf/union";
import bbox from "@turf/bbox";
import area from "@turf/area";
import { feature, featureCollection } from "@turf/helpers";

export const subtract = (
  input: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  mask: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null => {
  if (mask.features.length === 0) return input;
  const merged = unionAll(mask as GeoJSON.FeatureCollection<GeoJSON.Polygon>);
  if (!merged) return input;
  const result = difference(featureCollection([feature(input), feature(merged)]));
  return result?.geometry ?? null;
};

export const unionAll = (
  fc: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null => {
  if (fc.features.length === 0) return null;
  if (fc.features.length === 1) return fc.features[0].geometry;
  const result = union(fc);
  return result?.geometry ?? null;
};

export const bboxOf = (geom: GeoJSON.Geometry): GeoJSON.BBox => {
  const b = bbox(feature(geom));
  return [b[0], b[1], b[2], b[3]];
};

export const areaM2 = (geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): number =>
  area(feature(geom));
