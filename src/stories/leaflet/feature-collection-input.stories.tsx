import { FeatureCollectionInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/FeatureCollectionInput" };

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

const seededCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: point, properties: { name: "POI" } },
    { type: "Feature", geometry: polygon, properties: { name: "Area" } },
  ],
};

/** Draw any mix of shapes into a `FeatureCollection`. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <FeatureCollectionInput
      source="geom"
      label="Feature collection"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);

/** Seeded with an existing collection — edit each feature in place. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: seededCollection }}>
    <FeatureCollectionInput
      source="geom"
      label="Feature collection (seeded)"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);

/** Restrict the toolbar to polygons only. */
export const PolygonOnly = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <FeatureCollectionInput
      source="geom"
      allowedShapes={["Polygon"]}
      label="Polygons only"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);
