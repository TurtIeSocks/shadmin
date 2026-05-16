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

### Drawing & editing primitives (Geoman)

- [`<GeomanControl>`](./GeomanControl)
- [`<GeomanEvents>`](./GeomanEvents)
- [`useGeomanRHF`](./UseGeomanRHF)

### OSM utilities

- [`<OsmFeatureSubtract>`](./OsmFeatureSubtract)
- [`<OsmFeatureAdd>`](./OsmFeatureAdd)
- [`useOverpass` / `useOsmFeatures` / `useOsmSnapToRoads`](./LeafletOsm)

### Geocoding

- [`<GeocodingInput>`](./GeocodingInput)
- [`<ReverseGeocodeField>`](./ReverseGeocodeField)
- [`<MapWithSearch>`](./MapWithSearch)
