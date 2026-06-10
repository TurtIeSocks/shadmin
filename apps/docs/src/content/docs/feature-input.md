---
title: "FeatureInput"
---

Form input for drawing and editing a `GeoJSON.Feature`. Writes `{ type: "Feature", geometry, properties }` to the form value; **preserves `properties` across edits** so attribute data isn't lost when the user reshapes the geometry.

## Usage

```tsx
import { FeatureInput } from "@/components/leaflet";

<Create>
  <SimpleForm>
    <FeatureInput source="geom" label="Feature" defaultCenter={[48.85, 2.35]} />
  </SimpleForm>
</Create>;
```

The default draw tool is the polygon. Set `shape` to switch:

```tsx
<FeatureInput source="geom" shape="LineString" />
```

## Props

| Prop            | Required | Type                                                                                          | Default                | Description                                         |
| --------------- | -------- | --------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------- |
| `source`        | Required | `string`                                                                                      | -                      | RHF field to write the Feature to.                  |
| `shape`         | Optional | `"Point" \| "LineString" \| "Polygon" \| "MultiPoint" \| "MultiLineString" \| "MultiPolygon"` | `"Polygon"`            | Default geometry type when the user starts drawing. |
| `zoom`          | Optional | `number`                                                                                      | `13`                   | Initial zoom level.                                 |
| `defaultCenter` | Optional | `[number, number]`                                                                            | `[0, 0]`               | Initial map center `[lat, lng]`.                    |
| `height`        | Optional | `number \| string`                                                                            | `300`                  | Height of the map container.                        |
| `tileUrl`       | Optional | `string`                                                                                      | OpenStreetMap tile URL | Tile layer URL template.                            |
| `attribution`   | Optional | `string`                                                                                      | OSM attribution        | Tile attribution string.                            |
| `pathOptions`   | Optional | `L.PathOptions`                                                                               | -                      | Vector styling for the drawn shape.                 |
| `snappable`     | Optional | `boolean`                                                                                     | `true`                 | Enable Geoman snap-to-vertex.                       |
| `snapDistance`  | Optional | `number`                                                                                      | `20`                   | Snap radius in pixels.                              |
| `label`         | Optional | `ReactNode`                                                                                   | -                      | Label rendered above the map.                       |
| `helperText`    | Optional | `ReactNode`                                                                                   | -                      | Helper text rendered below the map.                 |
| `disabled`      | Optional | `boolean`                                                                                     | `false`                | Disable editing.                                    |
| `validate`      | Optional | `(v) => string \| undefined`                                                                  | -                      | RHF-compatible validator(s).                        |

## `shape`

Determines which Geoman draw tool the toolbar exposes when the user starts a new geometry. The persisted `Feature.geometry.type` may differ if the user later edits the shape with the cut tool.

## Property preservation

`FeatureInput` reads the previous form value at every persist and copies `properties` from it onto the new Feature. This means:

- On hydration, the seeded `Feature` value is left intact — properties are preserved.
- After an edit (move/reshape), the new `Feature` re-uses the prior `properties`.
- New geometries drawn from scratch (no prior Feature) start with `properties: {}`.
