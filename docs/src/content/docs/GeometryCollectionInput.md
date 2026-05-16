---
title: "GeometryCollectionInput"
---

Form input for drawing a `GeoJSON.GeometryCollection`. All drawn shapes are stored together as a single `GeometryCollection` value.

## Usage

```tsx
import { GeometryCollectionInput } from "@/components/leaflet";

<Create>
  <SimpleForm>
    <GeometryCollectionInput source="geom" label="Mixed shapes" defaultCenter={[48.85, 2.35]} />
  </SimpleForm>
</Create>
```

In v1 the Geoman toolbar shows all draw buttons. Filtering via `allowedShapes` is reserved for v2.

## Props

| Prop            | Required | Type                         | Default                | Description                                              |
| --------------- | -------- | ---------------------------- | ---------------------- | -------------------------------------------------------- |
| `source`        | Required | `string`                     | -                      | RHF field to write the geometry to.                      |
| `allowedShapes` | Optional | `ShapeKind[]`                | -                      | Reserved for v2 toolbar filter. Ignored in v1.           |
| `zoom`          | Optional | `number`                     | `13`                   | Initial zoom level.                                      |
| `defaultCenter` | Optional | `[number, number]`           | `[0, 0]`               | Initial map center `[lat, lng]`.                         |
| `height`        | Optional | `number \| string`           | `300`                  | Height of the map container.                             |
| `tileUrl`       | Optional | `string`                     | OpenStreetMap tile URL | Tile layer URL template.                                 |
| `attribution`   | Optional | `string`                     | OSM attribution        | Tile attribution string.                                 |
| `pathOptions`   | Optional | `L.PathOptions`              | -                      | Vector styling for all drawn shapes.                     |
| `snappable`     | Optional | `boolean`                    | `true`                 | Enable Geoman snap-to-vertex.                            |
| `snapDistance`  | Optional | `number`                     | `20`                   | Snap radius in pixels.                                   |
| `label`         | Optional | `ReactNode`                  | -                      | Label rendered above the map.                            |
| `helperText`    | Optional | `ReactNode`                  | -                      | Helper text rendered below the map.                      |
| `disabled`      | Optional | `boolean`                    | `false`                | Disable editing.                                         |
| `validate`      | Optional | `(v) => string \| undefined` | -                      | RHF-compatible validator(s).                             |
