import { MultiLineStringInput } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/MultiLineStringInput" };

const parisMultiLine: GeoJSON.MultiLineString = {
  type: "MultiLineString",
  coordinates: [
    [
      [2.35, 48.85],
      [2.36, 48.86],
    ],
  ],
};

/** Draw multiple lines; persisted as a single GeoJSON `MultiLineString`. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiLineStringInput
      source="geom"
      label="Routes"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Seeded with existing multi-line geometry. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: parisMultiLine }}>
    <MultiLineStringInput
      source="geom"
      label="Edit existing routes"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** With a helper-text caption. */
export const WithHelperText = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiLineStringInput
      source="geom"
      label="Trails"
      helperText="Draw each trail separately. All are stored as one MultiLineString."
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);
