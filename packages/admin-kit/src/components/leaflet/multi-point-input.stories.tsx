import { MultiPointInput } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/MultiPointInput" };

const parisMultiPoint: GeoJSON.MultiPoint = {
  type: "MultiPoint",
  coordinates: [
    [2.3522, 48.8566],
    [2.36, 48.86],
  ],
};

/** Draw multiple points; persisted as one GeoJSON `MultiPoint`. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPointInput
      source="geom"
      label="Bus stops"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** Seeded with existing multi-point geometry. */
export const Seeded = () => (
  <StoryAdmin mode="form" record={{ geom: parisMultiPoint }}>
    <MultiPointInput
      source="geom"
      label="Edit existing stops"
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);

/** With a helper-text caption. */
export const WithHelperText = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPointInput
      source="geom"
      label="Hotspots"
      helperText="Place each marker on the map. Drag to adjust."
      defaultCenter={[48.85, 2.35]}
      height={400}
    />
  </StoryAdmin>
);
