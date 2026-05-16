---
title: "GeoJsonField"
---

Polymorphic read-only Leaflet field that renders any GeoJSON geometry (Point, LineString, Polygon, Multi\*, or GeometryCollection) stored at a record field.

## Usage

```tsx
import { GeoJsonField } from "@/components/leaflet";

<Show>
  <SimpleShowLayout>
    <GeoJsonField source="geom" />
  </SimpleShowLayout>
</Show>
```

Dispatches by `geometry.type` internally via `L.GeoJSON`, which handles every GeoJSON geometry kind.

## Props

| Prop                | Required | Type                                                       | Default                | Description                                           |
| ------------------- | -------- | ---------------------------------------------------------- | ---------------------- | ----------------------------------------------------- |
| `source`            | Required | `string`                                                   | -                      | Record field holding any GeoJSON geometry.            |
| `zoom`              | Optional | `number`                                                   | `13`                   | Initial zoom level.                                   |
| `defaultCenter`     | Optional | `[number, number]`                                         | `[0, 0]`               | Fallback center `[lat, lng]`.                         |
| `height`            | Optional | `number \| string`                                         | `300`                  | Height of the map container.                          |
| `tileUrl`           | Optional | `string`                                                   | OpenStreetMap tile URL | Tile layer URL template.                              |
| `attribution`       | Optional | `string`                                                   | OSM attribution        | Tile attribution string.                              |
| `pathOptions`       | Optional | `L.PathOptions`                                            | -                      | Vector styling for every shape.                       |
| `pathOptionsByType` | Optional | `Partial<Record<GeoJSON.Geometry["type"], L.PathOptions>>` | -                      | Reserved for v2. v1 falls back to `pathOptions`.      |
| `markerIcon`        | Optional | `L.Icon \| L.DivIcon`                                      | shared `MarkerIcon`    | Icon for point geometries.                            |
| `fitBounds`         | Optional | `boolean`                                                  | `true`                 | Auto-fit map view to the geometry.                    |
| `emptyText`         | Optional | `ReactNode`                                                | `"No geometry…"`       | Text shown when the value is missing.                 |
| `testId`            | Optional | `string`                                                   | -                      | `data-testid` for the map container.                  |
