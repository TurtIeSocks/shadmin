---
title: "OsmFeatureAdd"
---

Form button that unions OSM features matching one or more typed presets (`water`, `buildings`, `forest`, `roads`) onto the polygon stored at a form field. Useful for extending a coverage region to include neighboring forest patches, lakes, or other features that the user wants part of the final area.

## Usage

```tsx
import { OsmFeatureAdd, PolygonInput } from "@/components/leaflet";

<SimpleForm>
  <PolygonInput source="area" label="Coverage" defaultCenter={[48.87, 2.35]} />
  <OsmFeatureAdd source="area" presets={["forest"]} label="Add forest patches" />
</SimpleForm>;
```

On click, fetches OSM features matching the configured presets within the current bbox via Overpass and unions them with the form value. Shows a notification with the added area in km². Line features (e.g. roads) are buffered to polygons before the set operation when the preset specifies `bufferLinesMeters`.

## Props

| Prop       | Required | Type                                | Default                  | Description                                                            |
| ---------- | -------- | ----------------------------------- | ------------------------ | ---------------------------------------------------------------------- |
| `source`   | Required | `string`                            | -                        | RHF field holding a `Polygon` or `MultiPolygon`.                       |
| `presets`  | Required | `ReadonlyArray<OsmPresetName>`      | -                        | Typed OSM presets to union in (e.g. `["forest"]`).                     |
| `label`    | Optional | `string`                            | `"Add OSM features"`     | Button label.                                                          |
| `endpoint` | Optional | `string`                            | Overpass public endpoint | Override the Overpass endpoint URL.                                    |

### `presets`

See [`OsmFeatureSubtract`](./OsmFeatureSubtract) for the full preset table.

### `source`

A React Hook Form field name. The component reads the current `Polygon` or `MultiPolygon` value, computes its bbox, queries Overpass within that bbox, and writes the union back via `form.setValue`.

### `label`

Optional override for the button text. Defaults to `"Add OSM features"`.

### `endpoint`

Optional override for the Overpass API endpoint. Defaults to the public mirror.
