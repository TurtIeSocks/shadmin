import { PolygonField } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/PolygonField" };

const parisPolygon: GeoJSON.Polygon = {
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

const nycPolygon: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [-74.01, 40.71],
      [-73.97, 40.71],
      [-73.97, 40.78],
      [-74.01, 40.78],
      [-74.01, 40.71],
    ],
  ],
};

/** Renders a GeoJSON Polygon as a filled shape. */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: parisPolygon }}>
    <PolygonField source="geom" />
  </StoryAdmin>
);

/** Override fill + stroke with `pathOptions`. */
export const Styled = () => (
  <StoryAdmin record={{ id: 2, geom: nycPolygon }}>
    <PolygonField
      source="geom"
      pathOptions={{ color: "#dc2626", fillColor: "#fecaca", weight: 2 }}
    />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <PolygonField source="geom" />
  </StoryAdmin>
);
