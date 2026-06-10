import { MultiPolygonInput } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/MultiPolygonInput" };

const parisMultiPolygon: GeoJSON.MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [
    [
      [
        [2.34, 48.85],
        [2.355, 48.85],
        [2.355, 48.86],
        [2.34, 48.86],
        [2.34, 48.85],
      ],
    ],
  ],
};

/** Draw multiple polygons; persisted as one GeoJSON `MultiPolygon`. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPolygonInput
      source="geom"
      label="Territories"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Seeded with existing multi-polygon geometry. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: parisMultiPolygon }}>
    <MultiPolygonInput
      source="geom"
      label="Edit existing territories"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** With a helper-text caption. */
export const WithHelperText = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPolygonInput
      source="geom"
      label="Districts"
      helperText="Draw each district separately. All are stored as one MultiPolygon."
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);
