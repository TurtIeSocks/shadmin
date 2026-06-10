import { MultiPolygonField } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/MultiPolygonField" };

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
    [
      [
        [2.37, 48.86],
        [2.385, 48.86],
        [2.385, 48.87],
        [2.37, 48.87],
        [2.37, 48.86],
      ],
    ],
  ],
};

/** Renders two disjoint polygons as a single GeoJSON `MultiPolygon`. */
export const Basic = () => (
  <StoryAdmin record={{ id: 1, geom: parisMultiPolygon }}>
    <MultiPolygonField source="geom" />
  </StoryAdmin>
);

/** With a custom fill + stroke. */
export const Styled = () => (
  <StoryAdmin record={{ id: 2, geom: parisMultiPolygon }}>
    <MultiPolygonField
      source="geom"
      pathOptions={{ color: "#2563eb", fillColor: "#bfdbfe", weight: 2 }}
    />
  </StoryAdmin>
);

/** No geometry available → empty-state panel. */
export const EmptyValue = () => (
  <StoryAdmin record={{ id: 3, geom: null }}>
    <MultiPolygonField source="geom" />
  </StoryAdmin>
);
