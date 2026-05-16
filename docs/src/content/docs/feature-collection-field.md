---
title: "FeatureCollectionField"
---

Read-only Leaflet map that renders a `GeoJSON.FeatureCollection` stored at a record field. `L.geoJSON` renders the collection as a single multi-layer group — one layer per feature.

## Usage

```tsx
import { FeatureCollectionField } from "@/components/leaflet";

<Show>
  <SimpleShowLayout>
    <FeatureCollectionField source="geom" />
  </SimpleShowLayout>
</Show>
```

The `source` value is a `GeoJSON.FeatureCollection` (`{ type: "FeatureCollection", features: [...] }`). Renders an empty-state panel when the record value is missing.

## Props

| Prop            | Required | Type                  | Default                | Description                              |
| --------------- | -------- | --------------------- | ---------------------- | ---------------------------------------- |
| `source`        | Required | `string`              | -                      | Record field holding the FeatureCollection. |
| `zoom`          | Optional | `number`              | `13`                   | Initial zoom level.                      |
| `defaultCenter` | Optional | `[number, number]`    | `[0, 0]`               | Fallback center `[lat, lng]`.            |
| `height`        | Optional | `number \| string`    | `300`                  | Height of the map container.             |
| `tileUrl`       | Optional | `string`              | OpenStreetMap tile URL | Tile layer URL template.                 |
| `attribution`   | Optional | `string`              | OSM attribution        | Tile attribution string.                 |
| `pathOptions`   | Optional | `L.PathOptions`       | `{ color: "#3388ff" }` | Fill/stroke style options.               |
| `markerIcon`    | Optional | `L.Icon \| L.DivIcon` | shared `MarkerIcon`    | Icon used for Point geometries.          |
| `fitBounds`     | Optional | `boolean`             | `true`                 | Auto-fit map view to the geometry.       |
| `emptyText`     | Optional | `ReactNode`           | `"No geometry…"`       | Text shown when the value is missing.    |
| `testId`        | Optional | `string`              | -                      | `data-testid` for the map container.     |
