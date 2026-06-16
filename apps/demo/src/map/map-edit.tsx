import {
  Edit,
  FormToolbar,
  SelectInput,
  TabbedForm,
  TextInput,
} from "shadmin/components/admin";
import {
  BBoxInput,
  FeatureCollectionInput,
  FeatureInput,
  GeocodingInput,
  GeometryCollectionInput,
  LatLngInput,
  LineStringInput,
  MapWithSearch,
  MultiLineStringInput,
  MultiPointInput,
  MultiPolygonInput,
  OsmFeatureAdd,
  OsmFeatureSubtract,
  PointInput,
  PolygonInput,
  SimplifyInput,
} from "shadmin/components/leaflet";
import { required } from "ra-core";

const NYC_CENTER: [number, number] = [40.74, -73.99];
const PLACE_TYPE_CHOICES = [
  { id: "park", name: "Park" },
  { id: "lake", name: "Lake" },
  { id: "trail", name: "Trail" },
  { id: "monument", name: "Monument" },
];

export const MapEdit = () => (
  <Edit>
    <TabbedForm
      toolbar={
        <FormToolbar className="pt-4 pb-4 sticky bottom-0 bg-linear-to-b from-transparent to-background to-10%" />
      }
    >
      {/* ─────────────────────────── Details ─────────────────────────── */}
      <TabbedForm.Tab label="Details" className="max-w-2xl">
        <TextInput source="name" validate={required()} />
        <SelectInput
          source="type"
          choices={PLACE_TYPE_CHOICES}
          validate={required()}
        />
        <GeocodingInput
          source="address"
          latSource="lat"
          lngSource="lng"
          bboxSource="bbox"
          label="Search address"
          placeholder="Type an address…"
        />
        <TextInput source="address" multiline rows={2} />
      </TabbedForm.Tab>

      {/* ─────────────────────────── Location ─────────────────────────── */}
      <TabbedForm.Tab label="Location">
        <LatLngInput
          latSource="lat"
          lngSource="lng"
          defaultPosition={NYC_CENTER}
          height={320}
          label="Pin location (lat/lng)"
          helperText="Click or drag the marker."
        />
        <MapWithSearch
          latSource="lat"
          lngSource="lng"
          addressSource="address"
          height={320}
        />
        <PointInput
          source="location"
          label="Point geometry"
          defaultCenter={NYC_CENTER}
          height={320}
          helperText="Drop a single point. Stored as GeoJSON.Point."
        />
      </TabbedForm.Tab>

      {/* ─────────────────────────── Multi-geometries ─────────────────────────── */}
      <TabbedForm.Tab label="Multi-geometries">
        <MultiPointInput
          source="alt_locations"
          label="Alt locations (MultiPoint)"
          defaultCenter={NYC_CENTER}
          height={320}
        />
        <LineStringInput
          source="route"
          label="Route (LineString)"
          defaultCenter={NYC_CENTER}
          height={320}
        />
        <MultiLineStringInput
          source="trails"
          label="Trails (MultiLineString)"
          defaultCenter={NYC_CENTER}
          height={320}
        />
        <PolygonInput
          source="area"
          label="Area (Polygon)"
          defaultCenter={NYC_CENTER}
          height={400}
        />
        <div className="flex flex-wrap gap-2">
          <OsmFeatureSubtract
            source="area"
            presets={["water"]}
            label="Subtract water from area"
          />
          <OsmFeatureAdd
            source="area"
            presets={["forest"]}
            label="Add forests to area"
          />
        </div>
        <SimplifyInput
          source="area"
          label="Simplify area"
          helperText="Reduce vertex count with Douglas-Peucker."
          defaultCenter={NYC_CENTER}
          height={320}
        />
        <MultiPolygonInput
          source="boundaries"
          label="Boundaries (MultiPolygon)"
          defaultCenter={NYC_CENTER}
          height={320}
        />
        <BBoxInput
          source="bbox"
          label="Bounding box"
          defaultCenter={NYC_CENTER}
          height={320}
          helperText="Drag to draw a rectangle. Stored as [west, south, east, north]."
        />
      </TabbedForm.Tab>

      {/* ─────────────────────────── Composite ─────────────────────────── */}
      <TabbedForm.Tab label="Composite">
        <FeatureInput
          source="feature"
          label="Feature (Polygon by default)"
          defaultCenter={NYC_CENTER}
          height={360}
          helperText="Properties are preserved across edits."
        />
        <FeatureCollectionInput
          source="features"
          label="Feature collection"
          defaultCenter={NYC_CENTER}
          height={400}
          allowedShapes={["Point", "LineString", "Polygon"]}
        />
        <GeometryCollectionInput
          source="geometries"
          label="Geometry collection"
          defaultCenter={NYC_CENTER}
          height={400}
        />
      </TabbedForm.Tab>
    </TabbedForm>
  </Edit>
);
