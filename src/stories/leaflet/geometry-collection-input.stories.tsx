import { GeometryCollectionInput } from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";

export default { title: "Map (Leaflet)/GeometryCollectionInput" };

/** Draw any mix of Point / LineString / Polygon shapes into one collection. */
export const Basic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeometryCollectionInput
      source="geom"
      label="Mixed shapes"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);

/** Restrict to polygons only. */
export const PolygonOnly = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeometryCollectionInput
      source="geom"
      allowedShapes={["Polygon"]}
      label="Polygons only collection"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);

/** With a helper-text caption. */
export const WithHelperText = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeometryCollectionInput
      source="geom"
      label="Annotations"
      helperText="Use any Geoman tool. Each shape becomes a geometry in the collection."
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </StoryAdmin>
);
