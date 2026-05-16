import { GeocodingInput } from "@/components/leaflet/geocoding/geocoding-input";

import { StoryAdmin } from "./_test-helpers";

export default { title: "Leaflet/Geocoding" };

export const GeocodingInputBasic = () => (
  <StoryAdmin mode="form" record={{ address: "", lat: null, lng: null }}>
    <GeocodingInput
      source="address"
      latSource="lat"
      lngSource="lng"
      placeholder="Type an address…"
    />
  </StoryAdmin>
);
