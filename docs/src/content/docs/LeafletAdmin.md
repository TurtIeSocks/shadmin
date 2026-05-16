---
title: "Leaflet"
---

The `leaflet-admin` block provides Leaflet-based components for displaying and editing geographic data.

```bash
npx shadcn@latest add https://marmelab.com/shadcn-admin-kit/r/leaflet-admin.json
```

## Components

### Lat/Lng (coordinate pair fields)

- [`<LatLngField>`](./LatLngField) — read-only map marker
- [`<LatLngInput>`](./LatLngInput) — draggable marker input

### GeoJSON shape Fields & Inputs

- [`<PointField>`](./PointField) / [`<PointInput>`](./PointInput)
- [`<MultiPointField>`](./MultiPointField) / [`<MultiPointInput>`](./MultiPointInput)
- [`<LineStringField>`](./LineStringField) / [`<LineStringInput>`](./LineStringInput)
- [`<MultiLineStringField>`](./MultiLineStringField) / [`<MultiLineStringInput>`](./MultiLineStringInput)
- [`<PolygonField>`](./PolygonField) / [`<PolygonInput>`](./PolygonInput)
- [`<MultiPolygonField>`](./MultiPolygonField) / [`<MultiPolygonInput>`](./MultiPolygonInput)
- [`<GeometryCollectionField>`](./GeometryCollectionField) / [`<GeometryCollectionInput>`](./GeometryCollectionInput)
- [`<BBoxField>`](./BBoxField) / [`<BBoxInput>`](./BBoxInput)
- [`<GeoJsonField>`](./GeoJsonField) / [`<GeoJsonInput>`](./GeoJsonInput) — polymorphic
- [`<FeatureField>`](./FeatureField) / [`<FeatureInput>`](./FeatureInput) — `GeoJSON.Feature` with preserved `properties`
- [`<FeatureCollectionField>`](./FeatureCollectionField) / [`<FeatureCollectionInput>`](./FeatureCollectionInput) — multi-feature collections
- [`<SimplifyInput>`](./SimplifyInput) — turf-driven geometry simplification with tolerance slider

### Drawing & editing primitives (Geoman)

- [`useGeomanRHF`](./UseGeomanRHF) — bridges Geoman draw/edit events to a React Hook Form field. Compose with `<FeatureGroup>` + `<GeomanControls>` from [`react-leaflet-geoman-v2`](https://www.npmjs.com/package/react-leaflet-geoman-v2).

### OSM utilities

- [`<OsmFeatureSubtract>`](./OsmFeatureSubtract)
- [`<OsmFeatureAdd>`](./OsmFeatureAdd)
- [`useOverpass` / `useOsmFeatures` / `useOsmSnapToRoads`](./LeafletOsm)

### Geocoding

- [`<GeocodingInput>`](./GeocodingInput)
- [`<ReverseGeocodeField>`](./ReverseGeocodeField)
- [`<MapWithSearch>`](./MapWithSearch)
