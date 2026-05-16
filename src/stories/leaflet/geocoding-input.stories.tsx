import { GeocodingInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/GeocodingInput" };

/** Address combobox backed by the Nominatim geocoder. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ address: "", lat: null, lng: null }}>
    <GeocodingInput
      source="address"
      latSource="lat"
      lngSource="lng"
      placeholder="Type an address…"
    />
  </StoryAdmin>
);

/** With a visible label. */
export const WithLabel = () => (
  <StoryAdmin mode="form" record={{ address: "", lat: null, lng: null }}>
    <GeocodingInput
      source="address"
      latSource="lat"
      lngSource="lng"
      label="Delivery address"
      placeholder="Search address or place…"
    />
  </StoryAdmin>
);

/** Also writes a `bbox` field when the Nominatim result includes one. */
export const WithBBox = () => (
  <StoryAdmin
    mode="form"
    record={{ address: "", lat: null, lng: null, bbox: null }}
  >
    <GeocodingInput
      source="address"
      latSource="lat"
      lngSource="lng"
      bboxSource="bbox"
      label="Coverage area"
      placeholder="Find a city or region…"
    />
  </StoryAdmin>
);
