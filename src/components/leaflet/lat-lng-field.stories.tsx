import { LatLngField } from "@/components/leaflet";
import { StoryAdmin } from "@/test/_test-helpers";

export default { title: "Map (Leaflet)/LatLngField" };

const parisRecord = {
  id: 1,
  name: "Paris",
  lat: 48.8566,
  lng: 2.3522,
};

const nycRecord = {
  id: 2,
  name: "New York",
  lat: 40.7128,
  lng: -74.006,
};

const recordMissingCoords = {
  id: 3,
  name: "Unknown",
};

/** Static Leaflet marker at the record's lat/lng. */
export const Basic = () => (
  <StoryAdmin record={parisRecord}>
    <LatLngField latSource="lat" lngSource="lng" zoom={13} height={300} />
  </StoryAdmin>
);

/** Different city — same component renders any coordinate. */
export const NewYork = () => (
  <StoryAdmin record={nycRecord}>
    <LatLngField latSource="lat" lngSource="lng" zoom={12} height={300} />
  </StoryAdmin>
);

/** Empty-state panel when either coordinate field is missing. */
export const MissingCoordinates = () => (
  <StoryAdmin record={recordMissingCoords}>
    <LatLngField latSource="lat" lngSource="lng" height={300} />
  </StoryAdmin>
);
