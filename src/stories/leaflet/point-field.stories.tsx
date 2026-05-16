import { PointField } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/PointField" };

const parisPoint: GeoJSON.Point = {
  type: "Point",
  coordinates: [2.3522, 48.8566],
};

const nycPoint: GeoJSON.Point = {
  type: "Point",
  coordinates: [-74.006, 40.7128],
};

/** Renders a GeoJSON Point as a Leaflet marker. */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: parisPoint }}>
    <PointField source="geom" />
  </StoryAdmin>
);

/** Same component on a different coordinate. */
export const NewYork = () => (
  <StoryAdmin record={{ id: 2, geom: nycPoint }}>
    <PointField source="geom" />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <PointField source="geom" />
  </StoryAdmin>
);
