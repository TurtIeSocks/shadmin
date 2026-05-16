import { MultiPointField } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/MultiPointField" };

const parisMultiPoint: GeoJSON.MultiPoint = {
  type: "MultiPoint",
  coordinates: [
    [2.3522, 48.8566],
    [2.36, 48.86],
    [2.34, 48.85],
  ],
};

const nycMultiPoint: GeoJSON.MultiPoint = {
  type: "MultiPoint",
  coordinates: [
    [-74.006, 40.7128],
    [-73.965, 40.782],
  ],
};

/** Renders multiple GeoJSON points as Leaflet markers. */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: parisMultiPoint }}>
    <MultiPointField source="geom" />
  </StoryAdmin>
);

/** Two NYC markers — fit bounds zooms to include both. */
export const TwoPoints = () => (
  <StoryAdmin record={{ id: 2, geom: nycMultiPoint }}>
    <MultiPointField source="geom" />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <MultiPointField source="geom" />
  </StoryAdmin>
);
