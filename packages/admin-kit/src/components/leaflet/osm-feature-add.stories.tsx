import { OsmFeatureAdd, PolygonInput } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/OsmFeatureAdd" };

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
 * Click the button to union all matching OSM forest features within the
 * current polygon's bbox into the form value. Requires a live Overpass API.
 */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Coverage (add forests)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureAdd
      source="area"
      presets={["forest"]}
      label="Add forest patches"
    />
  </StoryAdmin>
);

/** Add OSM features matched by raw tag selectors (no preset). */
export const ByTags = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Coverage (tag-driven add)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureAdd
      source="area"
      tags={["leisure=park", "leisure=nature_reserve"]}
      label="Add parks + reserves"
    />
  </StoryAdmin>
);

/** Whole-category preset: union all `leisure=*` features. */
export const AllLeisure = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Coverage (all leisure)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureAdd
      source="area"
      presets={["leisure"]}
      label="Add all leisure areas"
    />
  </StoryAdmin>
);
