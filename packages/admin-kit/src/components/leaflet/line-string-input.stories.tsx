import { LineStringInput } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/LineStringInput" };

const parisLine: GeoJSON.LineString = {
  type: "LineString",
  coordinates: [
    [2.35, 48.85],
    [2.36, 48.86],
    [2.37, 48.85],
  ],
};

/** Draw a GeoJSON LineString. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <LineStringInput
      source="geom"
      label="Route"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Seeded with an existing line — edit/drag vertices via Geoman. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: parisLine }}>
    <LineStringInput
      source="geom"
      label="Edit existing route"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** With a helper-text caption. */
export const WithHelperText = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <LineStringInput
      source="geom"
      label="Bike path"
      helperText="Click the polyline tool, then click points along the path."
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);
