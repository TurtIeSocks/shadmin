---
title: "LineStringField"
---

Read-only Leaflet map that renders a `GeoJSON.LineString` geometry stored at a record field.

## Usage

```tsx
import { LineStringField } from "@/components/leaflet";

<Show>
  <SimpleShowLayout>
    <LineStringField source="geom" pathOptions={{ color: "red", weight: 3 }} />
  </SimpleShowLayout>
</Show>;
```

Renders an empty-state panel when the record value is missing.

## Props

| Prop            | Required | Type                  | Default                | Description                            |
| --------------- | -------- | --------------------- | ---------------------- | -------------------------------------- |
| `source`        | Required | `string`              | -                      | Record field holding the `LineString`. |
| `zoom`          | Optional | `number`              | `13`                   | Initial zoom level.                    |
| `defaultCenter` | Optional | `[number, number]`    | `[0, 0]`               | Fallback center `[lat, lng]`.          |
| `height`        | Optional | `number \| string`    | `300`                  | Height of the map container.           |
| `tileUrl`       | Optional | `string`              | OpenStreetMap tile URL | Tile layer URL template.               |
| `attribution`   | Optional | `string`              | OSM attribution        | Tile attribution string.               |
| `pathOptions`   | Optional | `L.PathOptions`       | `{ color: "#3388ff" }` | Stroke/style options for the polyline. |
| `markerIcon`    | Optional | `L.Icon \| L.DivIcon` | shared `MarkerIcon`    | Icon (unused for LineString).          |
| `fitBounds`     | Optional | `boolean`             | `true`                 | Auto-fit map view to the geometry.     |
| `emptyText`     | Optional | `ReactNode`           | `"No geometry…"`       | Text shown when the value is missing.  |
| `testId`        | Optional | `string`              | -                      | `data-testid` for the map container.   |
