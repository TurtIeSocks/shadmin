---
title: "FeatureCollectionInput"
---

Form input for drawing and editing a `GeoJSON.FeatureCollection`. Each drawn shape becomes a `Feature` in the collection; `properties` are carried forward from the previous form value by index on every edit.

## Usage

```tsx
import { FeatureCollectionInput } from "@/components/leaflet";

<Create>
  <SimpleForm>
    <FeatureCollectionInput
      source="geom"
      label="Feature collection"
      defaultCenter={[48.85, 2.35]}
      height={500}
    />
  </SimpleForm>
</Create>
```

The default toolbar exposes Point, LineString, and Polygon draw modes. Restrict via `allowedShapes`:

```tsx
<FeatureCollectionInput source="geom" allowedShapes={["Polygon"]} />
```

## Props

| Prop             | Required | Type                                                                                   | Default                                | Description                                                |
| ---------------- | -------- | -------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------- |
| `source`         | Required | `string`                                                                               | -                                      | RHF field to write the FeatureCollection to.               |
| `allowedShapes`  | Optional | `Array<"Point" \| "LineString" \| "Polygon" \| "MultiPoint" \| "MultiLineString" \| "MultiPolygon">` | `["Point", "LineString", "Polygon"]` | Which draw tools to expose.                                |
| `zoom`           | Optional | `number`                                                                               | `13`                                   | Initial zoom level.                                        |
| `defaultCenter`  | Optional | `[number, number]`                                                                     | `[0, 0]`                               | Initial map center `[lat, lng]`.                           |
| `height`         | Optional | `number \| string`                                                                     | `300`                                  | Height of the map container.                               |
| `tileUrl`        | Optional | `string`                                                                               | OpenStreetMap tile URL                 | Tile layer URL template.                                   |
| `attribution`    | Optional | `string`                                                                               | OSM attribution                        | Tile attribution string.                                   |
| `pathOptions`    | Optional | `L.PathOptions`                                                                        | -                                      | Vector styling for the drawn shapes.                       |
| `snappable`      | Optional | `boolean`                                                                              | `true`                                 | Enable Geoman snap-to-vertex.                              |
| `snapDistance`   | Optional | `number`                                                                               | `20`                                   | Snap radius in pixels.                                     |
| `label`          | Optional | `ReactNode`                                                                            | -                                      | Label rendered above the map.                              |
| `helperText`     | Optional | `ReactNode`                                                                            | -                                      | Helper text rendered below the map.                        |
| `disabled`       | Optional | `boolean`                                                                              | `false`                                | Disable editing.                                           |
| `validate`       | Optional | `(v) => string \| undefined`                                                           | -                                      | RHF-compatible validator(s).                               |

## Property preservation

Per-feature `properties` are matched **by index** to the previous form value. Removing a feature can shift subsequent indices, so this is best-effort: if attribute fidelity across removal is critical, persist `properties` keyed on a stable id in the host application instead of relying on positional matching.
