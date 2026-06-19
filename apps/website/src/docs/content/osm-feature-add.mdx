---
title: "OsmFeatureAdd"
---

Form button that unions OSM features matching one or more typed presets (curated subsets like `water`, `buildings`, `forest`, `roads`, plus per-key category catch-alls like `amenity`, `leisure`, `natural`) and/or raw OSM tags (e.g. `leisure=park`) onto the polygon stored at a form field. Useful for extending a coverage region to include neighboring forest patches, lakes, or other features that the user wants part of the final area.

## Usage

```tsx
import { OsmFeatureAdd, PolygonInput } from "@/components/leaflet";

<SimpleForm>
  <PolygonInput source="area" label="Coverage" defaultCenter={[48.87, 2.35]} />
  <OsmFeatureAdd
    source="area"
    presets={["forest"]}
    label="Add forest patches"
  />
</SimpleForm>;
```

For finer-grained filtering, pass raw OSM tags via the `tags` prop:

```tsx
<OsmFeatureAdd
  source="area"
  tags={["leisure=park", "leisure=nature_reserve"]}
  label="Add parks + reserves"
/>
```

Presets and tags can be combined in the same call.

On click, fetches OSM features matching the configured sources within the current bbox via Overpass and unions them with the form value. Shows a notification with the added area in km². Line features (e.g. roads) are buffered to polygons before the set operation when the preset specifies `bufferLinesMeters`. Raw-tag line features are not auto-buffered.

## Props

| Prop       | Required             | Type                           | Default                  | Description                                        |
| ---------- | -------------------- | ------------------------------ | ------------------------ | -------------------------------------------------- |
| `source`   | Required             | `string`                       | -                        | RHF field holding a `Polygon` or `MultiPolygon`.   |
| `presets`  | Optional<sup>1</sup> | `ReadonlyArray<OsmPresetName>` | -                        | Typed OSM presets to union in (e.g. `["forest"]`). |
| `tags`     | Optional<sup>1</sup> | `ReadonlyArray<OsmTagInput>`   | -                        | Raw OSM tags in `"key=value"` or `"key=*"` form.   |
| `label`    | Optional             | `string`                       | `"Add OSM features"`     | Button label.                                      |
| `endpoint` | Optional             | `string`                       | Overpass public endpoint | Override the Overpass endpoint URL.                |

<sup>1</sup> At least one of `presets` or `tags` must be non-empty. If both are empty, the button click is a no-op with a warning notification.

### `presets`

See [`OsmFeatureSubtract`](./osm-feature-subtract) for the full preset table.

### `tags`

A `ReadonlyArray<OsmTagInput>` of raw OSM tags in `"key=value"` form. Use `*` as the value for "any value of this key", e.g. `"building=*"`. `OsmTagInput` is `KnownOsmTag | (string & {})` — autocomplete for ~350 well-known tags from the [OSM Map Features wiki](https://wiki.openstreetmap.org/wiki/Map_features) plus an escape hatch for any other string.

```tsx
<OsmFeatureAdd source="area" tags={["leisure=park"]} />
```

### `source`

A React Hook Form field name. The component reads the current `Polygon` or `MultiPolygon` value, computes its bbox, queries Overpass within that bbox, and writes the union back via `form.setValue`.

### `label`

Optional override for the button text. Defaults to `"Add OSM features"`.

### `endpoint`

Optional override for the Overpass API endpoint. Defaults to the public mirror.
