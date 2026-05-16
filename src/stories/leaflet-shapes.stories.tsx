import {
  PointField,
  PointInput,
  MultiPointField,
  MultiPointInput,
  LineStringField,
  LineStringInput,
  MultiLineStringField,
  MultiLineStringInput,
  PolygonField,
  PolygonInput,
  MultiPolygonField,
  MultiPolygonInput,
  GeometryCollectionField,
  GeometryCollectionInput,
  BBoxField,
  BBoxInput,
  GeoJsonField,
  GeoJsonInput,
  SimplifyInput,
  FeatureField,
  FeatureInput,
  FeatureCollectionField,
  FeatureCollectionInput,
} from "@/components/leaflet";
import { StoryAdmin } from "./_test-helpers";

export default { title: "Leaflet/Shapes" };

const point: GeoJSON.Point = { type: "Point", coordinates: [2.35, 48.85] };
const polygon: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [2.34, 48.85],
      [2.36, 48.85],
      [2.36, 48.87],
      [2.34, 48.87],
      [2.34, 48.85],
    ],
  ],
};
const line: GeoJSON.LineString = {
  type: "LineString",
  coordinates: [
    [2.35, 48.85],
    [2.36, 48.86],
    [2.37, 48.85],
  ],
};
const bbox: GeoJSON.BBox = [2.34, 48.85, 2.36, 48.87];

export const PointFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: point }}>
    <PointField source="geom" />
  </StoryAdmin>
);

export const PointInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PointInput source="geom" label="Pick a point" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

export const PolygonFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: polygon }}>
    <PolygonField source="geom" />
  </StoryAdmin>
);

export const PolygonInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PolygonInput source="geom" label="Service area" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

export const LineStringFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: line }}>
    <LineStringField source="geom" pathOptions={{ color: "red", weight: 3 }} />
  </StoryAdmin>
);

export const LineStringInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <LineStringInput source="geom" label="Route" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

export const MultiPointFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: { type: "MultiPoint", coordinates: [point.coordinates, [2.36, 48.86]] },
    }}
  >
    <MultiPointField source="geom" />
  </StoryAdmin>
);

export const MultiPointInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPointInput source="geom" label="Bus stops" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

export const MultiPolygonFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: { type: "MultiPolygon", coordinates: [polygon.coordinates] },
    }}
  >
    <MultiPolygonField source="geom" />
  </StoryAdmin>
);

export const MultiPolygonInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPolygonInput source="geom" label="Territories" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

export const MultiLineStringFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: { type: "MultiLineString", coordinates: [line.coordinates] },
    }}
  >
    <MultiLineStringField source="geom" />
  </StoryAdmin>
);

export const MultiLineStringInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiLineStringInput source="geom" label="Routes" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

export const GeometryCollectionFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: { type: "GeometryCollection", geometries: [point, line] },
    }}
  >
    <GeometryCollectionField source="geom" />
  </StoryAdmin>
);

export const GeometryCollectionInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeometryCollectionInput
      source="geom"
      label="Mixed shapes"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);

export const GeometryCollectionInputPolygonOnly = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeometryCollectionInput
      source="geom"
      allowedShapes={["Polygon"]}
      label="Polygons only collection"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const BBoxFieldBasic = () => (
  <StoryAdmin record={{ id: 1, bb: bbox }}>
    <BBoxField source="bb" />
  </StoryAdmin>
);

export const BBoxInputBasic = () => (
  <StoryAdmin mode="form" record={{ bb: null }}>
    <BBoxInput source="bb" label="Area of interest" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

export const GeoJsonFieldPoint = () => (
  <StoryAdmin record={{ id: 1, geom: point }}>
    <GeoJsonField source="geom" />
  </StoryAdmin>
);

export const GeoJsonFieldPolygon = () => (
  <StoryAdmin record={{ id: 1, geom: polygon }}>
    <GeoJsonField source="geom" />
  </StoryAdmin>
);

export const GeoJsonFieldEmpty = () => (
  <StoryAdmin record={{ id: 1, geom: null }}>
    <GeoJsonField source="geom" />
  </StoryAdmin>
);

export const GeoJsonInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeoJsonInput
      source="geom"
      label="Any geometry"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);

export const GeoJsonInputRestricted = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeoJsonInput
      source="geom"
      shapes={["Polygon"]}
      label="Polygons only"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

// A 20-vertex roughly-circular polygon — visible difference between
// tolerance=0 (original) and tolerance≈0.05 (heavily simplified).
const buildJaggedRing = (): GeoJSON.Polygon => {
  const cx = 2.35;
  const cy = 48.85;
  const r = 0.02;
  const N = 20;
  const ring: GeoJSON.Position[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 2 * Math.PI;
    // Slight per-vertex jitter so Douglas-Peucker has real work to do.
    const jitter = 0.001 * (i % 2 === 0 ? 1 : -1);
    ring.push([cx + (r + jitter) * Math.cos(a), cy + (r + jitter) * Math.sin(a)]);
  }
  ring.push(ring[0]); // close
  return { type: "Polygon", coordinates: [ring] };
};

const jaggedPolygon = buildJaggedRing();

export const SimplifyInputBasic = () => (
  <StoryAdmin mode="form" record={{ area: jaggedPolygon }}>
    <SimplifyInput
      source="area"
      label="Simplify"
      helperText="Adjust slider to lower the vertex count"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

const polygonFeature: GeoJSON.Feature = {
  type: "Feature",
  geometry: polygon,
  properties: { name: "Notre-Dame area", note: "test" },
};

export const FeatureFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: polygonFeature }}>
    <FeatureField source="geom" />
  </StoryAdmin>
);

export const FeatureInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: polygonFeature }}>
    <FeatureInput source="geom" label="Feature" defaultCenter={[48.85, 2.35]} />
  </StoryAdmin>
);

const featureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: point, properties: { name: "POI" } },
    { type: "Feature", geometry: polygon, properties: { name: "Area" } },
  ],
};

export const FeatureCollectionFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: featureCollection }}>
    <FeatureCollectionField source="geom" />
  </StoryAdmin>
);

export const FeatureCollectionInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <FeatureCollectionInput
      source="geom"
      label="Feature collection"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);

export const FeatureCollectionInputSeeded = () => (
  <StoryAdmin mode="form" record={{ geom: featureCollection }}>
    <FeatureCollectionInput
      source="geom"
      label="Feature collection (seeded)"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);
