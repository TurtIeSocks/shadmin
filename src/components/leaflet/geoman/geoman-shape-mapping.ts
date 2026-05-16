import L from "leaflet";
import type { ShapeKind, GeomanShape } from "../types";

const TYPE_TO_GEOMAN: Record<ShapeKind, GeomanShape> = {
  Point: "Marker",
  MultiPoint: "Marker",
  LineString: "Line",
  MultiLineString: "Line",
  Polygon: "Polygon",
  MultiPolygon: "Polygon",
  GeometryCollection: "Marker",
};

export const geojsonTypeToGeomanShape = (t: ShapeKind): GeomanShape => TYPE_TO_GEOMAN[t];

export const layerToGeometry = (layer: L.Layer): GeoJSON.Geometry | null => {
  const gj = (layer as L.Layer & { toGeoJSON?: () => GeoJSON.Feature }).toGeoJSON?.();
  if (!gj) return null;
  if (gj.type === "Feature") return gj.geometry ?? null;
  if (gj.type === "FeatureCollection") {
    const features = (gj as unknown as GeoJSON.FeatureCollection).features;
    if (features.length === 0) return null;
    return features[0].geometry;
  }
  return gj as unknown as GeoJSON.Geometry;
};

export const geometryToLatLngs = (
  geom: GeoJSON.Geometry,
): L.LatLngExpression | L.LatLngExpression[] | L.LatLngExpression[][] | L.LatLngExpression[][][] => {
  switch (geom.type) {
    case "Point":
      return [geom.coordinates[1], geom.coordinates[0]];
    case "MultiPoint":
      return geom.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple);
    case "LineString":
      return geom.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple);
    case "MultiLineString":
      return geom.coordinates.map((line) => line.map((c) => [c[1], c[0]] as L.LatLngTuple));
    case "Polygon":
      return geom.coordinates.map((ring) => ring.map((c) => [c[1], c[0]] as L.LatLngTuple));
    case "MultiPolygon":
      return geom.coordinates.map((poly) =>
        poly.map((ring) => ring.map((c) => [c[1], c[0]] as L.LatLngTuple)),
      );
    default:
      return [];
  }
};

export const geometryToLayer = (
  geom: GeoJSON.Geometry,
  pathOptions?: L.PathOptions,
  markerIcon?: L.Icon | L.DivIcon,
): L.Layer => {
  return L.geoJSON(geom, {
    style: () => pathOptions ?? {},
    pointToLayer: (_f, latlng) =>
      markerIcon ? L.marker(latlng, { icon: markerIcon }) : L.marker(latlng),
  });
};
