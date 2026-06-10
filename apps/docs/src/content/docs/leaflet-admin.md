---
title: "Leaflet"
---

The `leaflet-admin` block provides Leaflet-based components for displaying and editing geographic data.

```bash
npx shadcn@latest add https://marmelab.com/shadcn-admin-kit/r/leaflet-admin.json
```

## Components

### Lat/Lng (coordinate pair fields)

- [`<LatLngField>`](./lat-lng-field) — read-only map marker
- [`<LatLngInput>`](./lat-lng-input) — draggable marker input

### GeoJSON shape Fields & Inputs

- [`<PointField>`](./point-field) / [`<PointInput>`](./point-input)
- [`<MultiPointField>`](./multi-point-field) / [`<MultiPointInput>`](./multi-point-input)
- [`<LineStringField>`](./line-string-field) / [`<LineStringInput>`](./line-string-input)
- [`<MultiLineStringField>`](./multi-line-string-field) / [`<MultiLineStringInput>`](./multi-line-string-input)
- [`<PolygonField>`](./polygon-field) / [`<PolygonInput>`](./polygon-input)
- [`<MultiPolygonField>`](./multi-polygon-field) / [`<MultiPolygonInput>`](./multi-polygon-input)
- [`<GeometryCollectionField>`](./geometry-collection-field) / [`<GeometryCollectionInput>`](./geometry-collection-input)
- [`<BBoxField>`](./bbox-field) / [`<BBoxInput>`](./bbox-input)
- [`<GeoJsonField>`](./geojson-field) / [`<GeoJsonInput>`](./geojson-input) — polymorphic
- [`<FeatureField>`](./feature-field) / [`<FeatureInput>`](./feature-input) — `GeoJSON.Feature` with preserved `properties`
- [`<FeatureCollectionField>`](./feature-collection-field) / [`<FeatureCollectionInput>`](./feature-collection-input) — multi-feature collections
- [`<SimplifyInput>`](./simplify-input) — turf-driven geometry simplification with tolerance slider

### Drawing & editing primitives (Geoman)

- [`useGeomanRHF`](./use-geoman-rhf) — bridges Geoman draw/edit events to a React Hook Form field. Compose with `<FeatureGroup>` + `<GeomanControls>` from [`react-leaflet-geoman-v2`](https://www.npmjs.com/package/react-leaflet-geoman-v2).

### OSM utilities

- [`<OsmFeatureSubtract>`](./osm-feature-subtract)
- [`<OsmFeatureAdd>`](./osm-feature-add)
- [`useOverpass` / `useOsmFeatures` / `useOsmSnapToRoads`](./leaflet-osm)

### Geocoding

- [`<GeocodingInput>`](./geocoding-input)
- [`<ReverseGeocodeField>`](./reverse-geocode-field)
- [`<MapWithSearch>`](./map-with-search)
