import { GeocodingInput } from "@/components/leaflet/geocoding/geocoding-input";
import { MapWithSearch } from "@/components/leaflet/geocoding/map-with-search";
import { ReverseGeocodeField } from "@/components/leaflet/geocoding/reverse-geocode-field";

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

export const ReverseGeocodeFieldBasic = () => (
  <StoryAdmin record={{ id: 1, lat: 48.85, lng: 2.35 }}>
    <ReverseGeocodeField latSource="lat" lngSource="lng" />
  </StoryAdmin>
);

export const MapWithSearchBasic = () => (
  <StoryAdmin mode="form" record={{ lat: 48.85, lng: 2.35, address: "" }}>
    <MapWithSearch
      latSource="lat"
      lngSource="lng"
      addressSource="address"
      height={400}
    />
  </StoryAdmin>
);
