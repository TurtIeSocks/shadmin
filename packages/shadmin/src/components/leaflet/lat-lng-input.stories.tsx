import { LatLngInput } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/LatLngInput" };

/** Draggable marker; click or drag to update the lat/lng form values. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ lat: 48.8566, lng: 2.3522 }}>
    <LatLngInput
      latSource="lat"
      lngSource="lng"
      defaultPosition={[48.8566, 2.3522]}
      height={300}
    />
  </StoryAdmin>
);

/** Render with a label + helper text. */
export const WithLabel = () => (
  <StoryAdmin mode="form" record={{ lat: 40.7128, lng: -74.006 }}>
    <LatLngInput
      latSource="lat"
      lngSource="lng"
      defaultPosition={[40.7128, -74.006]}
      height={300}
      label="Office location"
      helperText="Click or drag the marker to set a location."
    />
  </StoryAdmin>
);

/** Empty starting record falls back to `defaultPosition`. */
export const EmptyValue = () => (
  <StoryAdmin mode="form" record={{ lat: null, lng: null }}>
    <LatLngInput
      latSource="lat"
      lngSource="lng"
      defaultPosition={[48.85, 2.35]}
      height={300}
      label="Pick a point"
    />
  </StoryAdmin>
);
