import { FeatureCollectionField } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/FeatureCollectionField" };

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

const featureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", geometry: point, properties: { name: "POI" } },
    { type: "Feature", geometry: polygon, properties: { name: "Area" } },
  ],
};

const singleFeatureCollection: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-73.965, 40.782] },
      properties: { name: "Central Park" },
    },
  ],
};

/** Renders a `FeatureCollection` containing a point + polygon. */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: featureCollection }}>
    <FeatureCollectionField source="geom" />
  </StoryAdmin>
);

/** Single-feature collection works too. */
export const SingleFeature = () => (
  <StoryAdmin record={{ id: 2, geom: singleFeatureCollection }}>
    <FeatureCollectionField source="geom" />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <FeatureCollectionField source="geom" />
  </StoryAdmin>
);
