import { ReverseGeocodeField } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/ReverseGeocodeField" };

const parisRecord = { id: 1, lat: 48.8566, lng: 2.3522 };
const nycRecord = { id: 2, lat: 40.7128, lng: -74.006 };

/** Display the full reverse-geocoded address for a lat/lng. */
export const Basic = () => (
  <StoryAdmin record={parisRecord}>
    <ReverseGeocodeField latSource="lat" lngSource="lng" />
  </StoryAdmin>
);

/** Compact format: street-level only. */
export const StreetFormat = () => (
  <StoryAdmin record={nycRecord}>
    <ReverseGeocodeField latSource="lat" lngSource="lng" format="street" />
  </StoryAdmin>
);

/** City-level format (street + city). */
export const CityFormat = () => (
  <StoryAdmin record={nycRecord}>
    <ReverseGeocodeField latSource="lat" lngSource="lng" format="city" />
  </StoryAdmin>
);

/** Returns null when coordinates are missing from the record. */
export const NoCoordinates = () => (
  <StoryAdmin record={{ id: 3 }}>
    <ReverseGeocodeField latSource="lat" lngSource="lng" />
  </StoryAdmin>
);
