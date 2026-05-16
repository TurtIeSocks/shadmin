import { OsmWaterClipButton, PolygonInput } from "@/components/leaflet";
import { StoryAdmin } from "./_test-helpers";

export default { title: "Leaflet/OSM" };

const polygon: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [2.3, 48.85],
      [2.4, 48.85],
      [2.4, 48.9],
      [2.3, 48.9],
      [2.3, 48.85],
    ],
  ],
};

export const WaterClipBasic = () => (
  <StoryAdmin mode="form" record={{ area: polygon }}>
    <PolygonInput source="area" label="Service area" defaultCenter={[48.87, 2.35]} />
    <OsmWaterClipButton source="area" />
  </StoryAdmin>
);
