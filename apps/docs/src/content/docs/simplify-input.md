---
title: "SimplifyInput"
---

Form-aware control that simplifies a GeoJSON shape stored in the form value using [`@turf/simplify`](https://turfjs.org/docs/api/simplify) (Douglas-Peucker). Renders a Leaflet preview of the simplified result, a tolerance slider, and a quality toggle.

The original geometry is captured on mount; every slider/quality change re-simplifies from that snapshot, so sliding tolerance back to `0` restores the original.

## Usage

```tsx
import { SimplifyInput } from "@/components/leaflet";

<Edit>
  <SimpleForm>
    <SimplifyInput
      source="area"
      label="Simplify"
      helperText="Adjust slider to lower the vertex count"
      defaultCenter={[48.85, 2.35]}
    />
  </SimpleForm>
</Edit>;
```

The `source` value must be a `GeoJSON.Geometry`, `GeoJSON.Feature`, `GeoJSON.FeatureCollection`, or `null`. Anything else throws.

## Props

| Prop            | Required | Type                  | Default                | Description                                        |
| --------------- | -------- | --------------------- | ---------------------- | -------------------------------------------------- |
| `source`        | Required | `string`              | -                      | RHF field that holds the GeoJSON value.            |
| `tolerance`     | Optional | `number`              | `0.01`                 | Initial slider value (Douglas-Peucker tolerance).  |
| `minTolerance`  | Optional | `number`              | `0`                    | Minimum slider value.                              |
| `maxTolerance`  | Optional | `number`              | `0.05`                 | Maximum slider value.                              |
| `step`          | Optional | `number`              | `0.001`                | Slider step.                                       |
| `quality`       | Optional | `"Default" \| "High"` | `"Default"`            | `"High"` maps to `simplify`'s `highQuality: true`. |
| `zoom`          | Optional | `number`              | `13`                   | Initial zoom level.                                |
| `defaultCenter` | Optional | `[number, number]`    | `[0, 0]`               | Initial map center `[lat, lng]`.                   |
| `height`        | Optional | `number \| string`    | `400`                  | Height of the map container.                       |
| `tileUrl`       | Optional | `string`              | OpenStreetMap tile URL | Tile layer URL template.                           |
| `attribution`   | Optional | `string`              | OSM attribution        | Tile attribution string.                           |
| `pathOptions`   | Optional | `L.PathOptions`       | `{ color: "#3388ff" }` | Vector styling for the preview layer.              |
| `label`         | Optional | `ReactNode`           | -                      | Label rendered above the map.                      |
| `helperText`    | Optional | `ReactNode`           | -                      | Helper text rendered below the controls.           |

## `tolerance`

The Douglas-Peucker tolerance (in the same units as the input coordinates — degrees for lat/lng). Higher tolerance → fewer vertices.

## `quality`

`"High"` enables `simplify-js`'s more expensive but more accurate algorithm. Use for finishing passes when interactivity matters less than fidelity.
