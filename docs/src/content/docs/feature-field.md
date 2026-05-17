---
title: "FeatureField"
---

Read-only Leaflet map that renders a `GeoJSON.Feature` stored at a record field. Leaflet's `L.geoJSON` accepts Features directly, so this is a thin wrapper around the shared shape-field shell.

## Usage

```tsx
import { FeatureField } from "@/components/leaflet";

<Show>
  <SimpleShowLayout>
    <FeatureField source="geom" />
  </SimpleShowLayout>
</Show>;
```

The `source` value is a `GeoJSON.Feature` (`{ type: "Feature", geometry, properties }`). Renders an empty-state panel when the record value is missing.

## Props

| Prop            | Required | Type                  | Default                | Description                             |
| --------------- | -------- | --------------------- | ---------------------- | --------------------------------------- |
| `source`        | Required | `string`              | -                      | Record field holding the `Feature`.     |
| `zoom`          | Optional | `number`              | `13`                   | Initial zoom level.                     |
| `defaultCenter` | Optional | `[number, number]`    | `[0, 0]`               | Fallback center `[lat, lng]`.           |
| `height`        | Optional | `number \| string`    | `300`                  | Height of the map container.            |
| `tileUrl`       | Optional | `string`              | OpenStreetMap tile URL | Tile layer URL template.                |
| `attribution`   | Optional | `string`              | OSM attribution        | Tile attribution string.                |
| `pathOptions`   | Optional | `L.PathOptions`       | `{ color: "#3388ff" }` | Fill/stroke style options.              |
| `markerIcon`    | Optional | `L.Icon \| L.DivIcon` | shared `MarkerIcon`    | Icon used when the geometry is a Point. |
| `fitBounds`     | Optional | `boolean`             | `true`                 | Auto-fit map view to the geometry.      |
| `emptyText`     | Optional | `ReactNode`           | `"No geometry…"`       | Text shown when the value is missing.   |
| `testId`        | Optional | `string`              | -                      | `data-testid` for the map container.    |
