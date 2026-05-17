import { OsmFeatureSubtract, PolygonInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/OsmFeatureSubtract" };

const parisPolygon: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [2.3, 48.85],
      [2.4, 48.85],
      [2.4, 48.9],
      [2.3, 48.9],
      [2.3, 48.85],
    ],
  ],
};

/**
 * Click the button to remove all OSM water features within the polygon's bbox
 * from the form value. Requires a live Overpass API.
 */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Service area (subtract water)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract
      source="area"
      presets={["water"]}
      label="Subtract water"
    />
  </StoryAdmin>
);

/** Multiple presets combine into a single subtraction pass. */
export const MultiPreset = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Service area (water + roads)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract
      source="area"
      presets={["water", "roads"]}
      label="Subtract water + major roads"
    />
  </StoryAdmin>
);

/** Subtract OSM features matched by raw tag selectors. */
export const ByTags = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Service area (tag-driven subtract)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract
      source="area"
      tags={["natural=water", "building=*"]}
      label="Subtract water + buildings"
    />
  </StoryAdmin>
);
