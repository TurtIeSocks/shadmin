---
title: "OsmFeatureSubtract"
---

Form button that subtracts OSM features matching one or more typed presets (`water`, `buildings`, `forest`, `roads`) from the polygon stored at a form field. Useful for trimming service areas to land, excluding building footprints, removing forested patches, or carving out major roads.

## Usage

```tsx
import { OsmFeatureSubtract, PolygonInput } from "@/components/leaflet";

<SimpleForm>
  <PolygonInput source="area" label="Service area" defaultCenter={[48.87, 2.35]} />
  <OsmFeatureSubtract source="area" presets={["water"]} label="Subtract water" />
</SimpleForm>;
```

On click, fetches OSM features matching the configured presets within the current bbox via Overpass, unions them, and subtracts from the form value. Shows a notification with the removed area in km². Line features (e.g. roads) are buffered to polygons before the set operation when the preset specifies `bufferLinesMeters`.

## Props

| Prop       | Required | Type                                | Default                       | Description                                                            |
| ---------- | -------- | ----------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `source`   | Required | `string`                            | -                             | RHF field holding a `Polygon` or `MultiPolygon`.                       |
| `presets`  | Required | `ReadonlyArray<OsmPresetName>`      | -                             | Typed OSM presets to subtract (e.g. `["water", "roads"]`).             |
| `label`    | Optional | `string`                            | `"Subtract OSM features"`     | Button label.                                                          |
| `endpoint` | Optional | `string`                            | Overpass public endpoint      | Override the Overpass endpoint URL.                                    |

### `presets`

The named presets currently shipped are:

| Preset       | OSM tags matched                                                                                            | Notes                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `water`      | `natural=water,bay,strait` and any `waterway`                                                                | Polygons (lakes, bays) + waterways.                  |
| `buildings`  | `building=*`                                                                                                | All building footprints.                             |
| `forest`     | `natural=wood,forest` and `landuse=forest`                                                                  | Wooded patches.                                      |
| `roads`      | `highway=motorway,trunk,primary,secondary`                                                                  | Buffered to 15 m polygons before set ops.            |

Pass multiple presets in one call to merge the masks (e.g. `["water", "roads"]`).

### `source`

A React Hook Form field name. The component reads the current `Polygon` or `MultiPolygon` value, computes its bbox, queries Overpass within that bbox, and writes the difference back via `form.setValue`.

### `label`

Optional override for the button text. Defaults to `"Subtract OSM features"`.

### `endpoint`

Optional override for the Overpass API endpoint. Defaults to the public mirror.
