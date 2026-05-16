import { OsmFeatureSubtract, OsmFeatureAdd, PolygonInput } from "@/components/leaflet";
import { StoryAdmin } from "./_test-helpers";

export default { title: "Leaflet/OSM" };

const parisPolygon: GeoJSON.Polygon = {
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

export const SubtractWater = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Service area (subtract water)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract source="area" presets={["water"]} label="Subtract water" />
  </StoryAdmin>
);

export const SubtractBuildings = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Service area (subtract buildings)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract
      source="area"
      presets={["buildings"]}
      label="Subtract buildings"
    />
  </StoryAdmin>
);

export const SubtractMulti = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Service area (water + roads)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract
      source="area"
      presets={["water", "roads"]}
      label="Subtract water + major roads"
    />
  </StoryAdmin>
);

export const AddForests = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Coverage (add forests)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureAdd source="area" presets={["forest"]} label="Add forest patches" />
  </StoryAdmin>
);

export const SubtractByTags = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Service area (tag-driven subtract)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract
      source="area"
      tags={["natural=water", "building=*"]}
      label="Subtract water + buildings"
    />
  </StoryAdmin>
);

export const AddByTags = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Coverage (tag-driven add)"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureAdd
      source="area"
      tags={["leisure=park", "leisure=nature_reserve"]}
      label="Add parks + reserves"
    />
  </StoryAdmin>
);

export const PresetsAndTagsTogether = () => (
  <StoryAdmin mode="form" record={{ area: parisPolygon }}>
    <PolygonInput
      source="area"
      label="Hybrid filter"
      defaultCenter={[48.87, 2.35]}
      height={500}
    />
    <OsmFeatureSubtract
      source="area"
      presets={["water"]}
      tags={["amenity=parking"]}
      label="Subtract water (preset) + parking (tag)"
    />
  </StoryAdmin>
);
