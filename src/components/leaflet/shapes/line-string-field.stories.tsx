import { LineStringField } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/LineStringField" };

const parisLine: GeoJSON.LineString = {
  type: "LineString",
  coordinates: [
    [2.35, 48.85],
    [2.36, 48.86],
    [2.37, 48.85],
  ],
};

const nycLine: GeoJSON.LineString = {
  type: "LineString",
  coordinates: [
    [-74.006, 40.7128],
    [-73.985, 40.748],
    [-73.965, 40.782],
  ],
};

/** Renders a GeoJSON LineString as a polyline. */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: parisLine }}>
    <LineStringField source="geom" />
  </StoryAdmin>
);

/** Override the polyline color and weight. */
export const Styled = () => (
  <StoryAdmin record={{ id: 2, geom: nycLine }}>
    <LineStringField source="geom" pathOptions={{ color: "red", weight: 4 }} />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <LineStringField source="geom" />
  </StoryAdmin>
);
