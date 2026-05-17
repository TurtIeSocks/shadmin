import { RecordField, Show, TabbedShowLayout } from "@/components/admin";
import {
  BBoxField,
  FeatureCollectionField,
  FeatureField,
  GeometryCollectionField,
  LatLngField,
  LineStringField,
  MultiLineStringField,
  MultiPointField,
  MultiPolygonField,
  PointField,
  PolygonField,
  ReverseGeocodeField,
} from "@/components/leaflet";

const NYC_CENTER: [number, number] = [40.74, -73.99];

export const MapShow = () => (
  <Show>
    <TabbedShowLayout>
      {/* ──────────────────────────────── Overview ──────────────────────────────── */}
      <TabbedShowLayout.Tab label="Overview">
        <RecordField source="name" />
        <RecordField source="type" />
        <RecordField source="address" />
        <RecordField source="lat" />
        <RecordField source="lng" />
        <RecordField label="Reverse-geocoded address">
          <ReverseGeocodeField latSource="lat" lngSource="lng" />
        </RecordField>
        <RecordField label="Map">
          <LatLngField latSource="lat" lngSource="lng" zoom={14} height={320} />
        </RecordField>
      </TabbedShowLayout.Tab>

      {/* ──────────────────────────────── Geometries ──────────────────────────────── */}
      <TabbedShowLayout.Tab label="Geometries">
        <RecordField label="Location (Point)">
          <PointField
            source="location"
            defaultCenter={NYC_CENTER}
            height={260}
          />
        </RecordField>
        <RecordField label="Alt locations (MultiPoint)">
          <MultiPointField
            source="alt_locations"
            defaultCenter={NYC_CENTER}
            height={260}
            emptyText="No alternative locations recorded"
          />
        </RecordField>
        <RecordField label="Route (LineString)">
          <LineStringField
            source="route"
            defaultCenter={NYC_CENTER}
            height={260}
            pathOptions={{ color: "#d97706", weight: 4 }}
            emptyText="No route recorded"
          />
        </RecordField>
        <RecordField label="Trails (MultiLineString)">
          <MultiLineStringField
            source="trails"
            defaultCenter={NYC_CENTER}
            height={260}
            pathOptions={{ color: "#7c3aed", weight: 3 }}
            emptyText="No trails recorded"
          />
        </RecordField>
        <RecordField label="Area (Polygon)">
          <PolygonField
            source="area"
            defaultCenter={NYC_CENTER}
            height={260}
            pathOptions={{ color: "#059669", fillOpacity: 0.25 }}
            emptyText="No area defined"
          />
        </RecordField>
        <RecordField label="Boundaries (MultiPolygon)">
          <MultiPolygonField
            source="boundaries"
            defaultCenter={NYC_CENTER}
            height={260}
            pathOptions={{ color: "#0ea5e9", fillOpacity: 0.2 }}
            emptyText="No boundary polygons"
          />
        </RecordField>
        <RecordField label="Bounding box (BBox)">
          <BBoxField
            source="bbox"
            defaultCenter={NYC_CENTER}
            height={260}
            pathOptions={{ color: "#475569", weight: 2, dashArray: "4 4" }}
          />
        </RecordField>
      </TabbedShowLayout.Tab>

      {/* ──────────────────────────────── Composite ──────────────────────────────── */}
      <TabbedShowLayout.Tab label="Composite">
        <RecordField label="Feature">
          <FeatureField
            source="feature"
            defaultCenter={NYC_CENTER}
            height={300}
          />
        </RecordField>
        <RecordField label="Feature collection">
          <FeatureCollectionField
            source="features"
            defaultCenter={NYC_CENTER}
            height={300}
          />
        </RecordField>
        <RecordField label="Geometry collection">
          <GeometryCollectionField
            source="geometries"
            defaultCenter={NYC_CENTER}
            height={300}
          />
        </RecordField>
      </TabbedShowLayout.Tab>
    </TabbedShowLayout>
  </Show>
);
