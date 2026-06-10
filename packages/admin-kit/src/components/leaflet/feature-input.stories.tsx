import { FeatureInput } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/FeatureInput" };

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
  properties: { name: "Notre-Dame area", note: "Original" },
};

/** Draw/edit a GeoJSON `Feature` — properties survive geometry edits. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <FeatureInput
      source="geom"
      label="Feature"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Seeded with an existing polygon Feature. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: polygonFeature }}>
    <FeatureInput
      source="geom"
      label="Edit existing feature"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Start with a `Point` shape instead of the default `Polygon`. */
export const PointShape = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <FeatureInput
      source="geom"
      shape="Point"
      label="Point feature"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);
