import { PolygonInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/PolygonInput" };

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

/** Draw a polygon, rectangle, or circle (all persisted as a `Polygon`). */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PolygonInput
      source="geom"
      label="Service area"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Seeded with an existing polygon — edit/cut/drag via Geoman. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: parisPolygon }}>
    <PolygonInput
      source="geom"
      label="Edit existing area"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** With a helper-text caption. */
export const WithHelperText = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PolygonInput
      source="geom"
      label="Coverage zone"
      helperText="Use the polygon/rectangle/circle tools to draw a coverage area."
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);
