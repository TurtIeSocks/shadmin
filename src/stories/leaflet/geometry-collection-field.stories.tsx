import { GeometryCollectionField } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/GeometryCollectionField" };

const point: GeoJSON.Point = { type: "Point", coordinates: [2.35, 48.85] };
const line: GeoJSON.LineString = {
  type: "LineString",
  coordinates: [
    [2.35, 48.85],
    [2.36, 48.86],
    [2.37, 48.85],
  ],
};
const polygon: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [2.36, 48.86],
      [2.37, 48.86],
      [2.37, 48.87],
      [2.36, 48.87],
      [2.36, 48.86],
    ],
  ],
};

const mixedCollection: GeoJSON.GeometryCollection = {
  type: "GeometryCollection",
  geometries: [point, line, polygon],
};

/** Renders a mixed-shape `GeometryCollection` (point + line + polygon). */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: mixedCollection }}>
    <GeometryCollectionField source="geom" />
  </StoryAdmin>
);

/** Collection containing only a point + line. */
export const PointAndLine = () => (
  <StoryAdmin
    record={{
      id: 2,
      geom: {
        type: "GeometryCollection",
        geometries: [point, line],
      } as GeoJSON.GeometryCollection,
    }}
  >
    <GeometryCollectionField source="geom" />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <GeometryCollectionField source="geom" />
  </StoryAdmin>
);
