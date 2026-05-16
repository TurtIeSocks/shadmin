import { FeatureField } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/FeatureField" };

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

const polygonFeature: GeoJSON.Feature = {
  type: "Feature",
  geometry: polygon,
  properties: { name: "Notre-Dame area", category: "landmark" },
};

const pointFeature: GeoJSON.Feature = {
  type: "Feature",
  geometry: { type: "Point", coordinates: [-73.965, 40.782] },
  properties: { name: "Central Park", category: "park" },
};

/** Renders a polygon `Feature` (with properties preserved). */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: polygonFeature }}>
    <FeatureField source="geom" />
  </StoryAdmin>
);

/** Renders a point `Feature` — Leaflet picks the right shape per geometry. */
export const PointFeature = () => (
  <StoryAdmin record={{ id: 2, geom: pointFeature }}>
    <FeatureField source="geom" />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <FeatureField source="geom" />
  </StoryAdmin>
);
