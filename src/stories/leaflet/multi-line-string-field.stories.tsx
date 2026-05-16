import { MultiLineStringField } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/MultiLineStringField" };

const parisMultiLine: GeoJSON.MultiLineString = {
  type: "MultiLineString",
  coordinates: [
    [
      [2.35, 48.85],
      [2.36, 48.86],
    ],
    [
      [2.37, 48.85],
      [2.38, 48.86],
    ],
  ],
};

const nycMultiLine: GeoJSON.MultiLineString = {
  type: "MultiLineString",
  coordinates: [
    [
      [-74.006, 40.7128],
      [-73.985, 40.748],
    ],
    [
      [-73.96, 40.77],
      [-73.94, 40.79],
    ],
  ],
};

/** Renders multiple disconnected lines from a single GeoJSON `MultiLineString`. */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: parisMultiLine }}>
    <MultiLineStringField source="geom" />
  </StoryAdmin>
);

/** NYC routes, styled with a custom color. */
export const Styled = () => (
  <StoryAdmin record={{ id: 2, geom: nycMultiLine }}>
    <MultiLineStringField
      source="geom"
      pathOptions={{ color: "#16a34a", weight: 4 }}
    />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <MultiLineStringField source="geom" />
  </StoryAdmin>
);
