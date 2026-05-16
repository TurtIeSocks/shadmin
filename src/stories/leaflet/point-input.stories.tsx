import { PointInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/PointInput" };

const parisPoint: GeoJSON.Point = {
  type: "Point",
  coordinates: [2.3522, 48.8566],
};

/** Draw a single GeoJSON Point with Geoman. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PointInput
      source="geom"
      label="Pick a point"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Seeded with an existing point — drag/edit via Geoman tools. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: parisPoint }}>
    <PointInput
      source="geom"
      label="Edit existing point"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** With a helper-text caption. */
export const WithHelperText = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PointInput
      source="geom"
      label="Location"
      helperText="Click the marker tool, then click the map to place a point."
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);
