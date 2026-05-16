---
title: "BBoxField"
---

Read-only Leaflet map that renders a `GeoJSON.BBox` (`[west, south, east, north]`) as a rectangular polygon stored at a record field.

## Usage

```tsx
import { BBoxField } from "@/components/leaflet";

<Show>
  <SimpleShowLayout>
    <BBoxField source="bb" />
  </SimpleShowLayout>
</Show>
```

Internally converts the BBox to a Polygon and renders via `ShapeFieldShell` inside a wrapping `RecordContextProvider`.

## Props

| Prop            | Required | Type                  | Default                | Description                              |
| --------------- | -------- | --------------------- | ---------------------- | ---------------------------------------- |
| `source`        | Required | `string`              | -                      | Record field holding the `BBox` tuple.   |
| `zoom`          | Optional | `number`              | `13`                   | Initial zoom level.                      |
| `defaultCenter` | Optional | `[number, number]`    | `[0, 0]`               | Fallback center `[lat, lng]`.            |
| `height`        | Optional | `number \| string`    | `300`                  | Height of the map container.             |
| `tileUrl`       | Optional | `string`              | OpenStreetMap tile URL | Tile layer URL template.                 |
| `attribution`   | Optional | `string`              | OSM attribution        | Tile attribution string.                 |
| `pathOptions`   | Optional | `L.PathOptions`       | `{ color: "#3388ff" }` | Fill/stroke style options.               |
| `markerIcon`    | Optional | `L.Icon \| L.DivIcon` | shared `MarkerIcon`    | Icon (unused).                           |
| `fitBounds`     | Optional | `boolean`             | `true`                 | Auto-fit map view to the bbox.           |
| `emptyText`     | Optional | `ReactNode`           | `"No geometry…"`       | Text shown when the value is missing.    |
| `testId`        | Optional | `string`              | -                      | `data-testid` for the map container.     |
