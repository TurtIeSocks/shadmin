import area from "@turf/area";
import { feature } from "@turf/helpers";

export type GeometryValidator = (g: GeoJSON.Geometry) => string | undefined;

const countVertices = (g: GeoJSON.Geometry): number => {
  switch (g.type) {
    case "Point":
      return 1;
    case "MultiPoint":
    case "LineString":
      return g.coordinates.length;
    case "MultiLineString":
      return g.coordinates.reduce((sum, line) => sum + line.length, 0);
    case "Polygon":
      return g.coordinates[0]?.length ?? 0;
    case "MultiPolygon":
      return g.coordinates.reduce(
        (sum, poly) => sum + (poly[0]?.length ?? 0),
        0,
      );
    default:
      return 0;
  }
};

export const validateMinVertices =
  (min: number): GeometryValidator =>
  (g) =>
    countVertices(g) < min
      ? `Shape must have at least ${min} vertices`
      : undefined;

export const validateMaxVertices =
  (max: number): GeometryValidator =>
  (g) =>
    countVertices(g) > max
      ? `Shape must have at most ${max} vertices`
      : undefined;

export const validateMinAreaM2 =
  (minM2: number): GeometryValidator =>
  (g) => {
    if (g.type !== "Polygon" && g.type !== "MultiPolygon") return undefined;
    const a = area(feature(g));
    return a < minM2
      ? `Area must be at least ${minM2} m² (got ${Math.round(a)} m²)`
      : undefined;
  };

export const combineValidators =
  (...validators: GeometryValidator[]): GeometryValidator =>
  (g) => {
    for (const v of validators) {
      const err = v(g);
      if (err) return err;
    }
    return undefined;
  };
