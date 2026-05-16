import { MapWithSearch } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/MapWithSearch" };

/** Composite map + address combobox with two-way sync. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ lat: 48.85, lng: 2.35, address: "" }}>
    <MapWithSearch
      latSource="lat"
      lngSource="lng"
      addressSource="address"
      height={400}
    />
  </StoryAdmin>
);

/** NYC-seeded variant — drag the marker to trigger a reverse geocode. */
export const NewYorkSeeded = () => (
  <StoryAdmin
    mode="form"
    record={{ lat: 40.7128, lng: -74.006, address: "New York, NY, USA" }}
  >
    <MapWithSearch
      latSource="lat"
      lngSource="lng"
      addressSource="address"
      height={400}
    />
  </StoryAdmin>
);

/** Taller map with a tighter default zoom. */
export const TallWithCustomZoom = () => (
  <StoryAdmin mode="form" record={{ lat: 48.85, lng: 2.35, address: "" }}>
    <MapWithSearch
      latSource="lat"
      lngSource="lng"
      addressSource="address"
      height={600}
      defaultZoom={15}
    />
  </StoryAdmin>
);
