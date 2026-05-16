---
title: "OsmFeatureSubtract"
---

Form button that subtracts OSM features matching one or more typed presets (`water`, `buildings`, `forest`, `roads`) and/or raw OSM tags (e.g. `natural=water`, `building=*`) from the polygon stored at a form field. Useful for trimming service areas to land, excluding building footprints, removing forested patches, or carving out major roads.

## Usage

```tsx
import { OsmFeatureSubtract, PolygonInput } from "@/components/leaflet";

<SimpleForm>
  <PolygonInput source="area" label="Service area" defaultCenter={[48.87, 2.35]} />
  <OsmFeatureSubtract source="area" presets={["water"]} label="Subtract water" />
</SimpleForm>;
```

For finer-grained filtering, pass raw OSM tags via the `tags` prop:

```tsx
<OsmFeatureSubtract
  source="area"
  tags={["natural=water", "building=*"]}
  label="Subtract water + buildings"
/>
```

Presets and tags can be combined in the same call — both sources are OR'd into one Overpass query:

```tsx
<OsmFeatureSubtract
  source="area"
  presets={["water"]}
  tags={["amenity=parking"]}
  label="Subtract water + parking"
/>
```

On click, fetches OSM features matching the configured sources within the current bbox via Overpass, unions them, and subtracts from the form value. Shows a notification with the removed area in km². Line features (e.g. roads) are buffered to polygons before the set operation when the preset specifies `bufferLinesMeters`. Raw-tag line features are not auto-buffered.

## Props

| Prop       | Required             | Type                                | Default                       | Description                                                            |
| ---------- | -------------------- | ----------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `source`   | Required             | `string`                            | -                             | RHF field holding a `Polygon` or `MultiPolygon`.                       |
| `presets`  | Optional<sup>1</sup> | `ReadonlyArray<OsmPresetName>`      | -                             | Typed OSM presets to subtract (e.g. `["water", "roads"]`).             |
| `tags`     | Optional<sup>1</sup> | `ReadonlyArray<OsmTagInput>`        | -                             | Raw OSM tags in `"key=value"` or `"key=*"` form.                       |
| `label`    | Optional             | `string`                            | `"Subtract OSM features"`     | Button label.                                                          |
| `endpoint` | Optional             | `string`                            | Overpass public endpoint      | Override the Overpass endpoint URL.                                    |

<sup>1</sup> At least one of `presets` or `tags` must be non-empty. If both are empty, the button click is a no-op with a warning notification.

### `presets`

The named presets currently shipped are:

| Preset       | OSM tags matched                                                                                            | Notes                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `water`      | `natural=water,bay,strait` and any `waterway`                                                                | Polygons (lakes, bays) + waterways.                  |
| `buildings`  | `building=*`                                                                                                | All building footprints.                             |
| `forest`     | `natural=wood,forest` and `landuse=forest`                                                                  | Wooded patches.                                      |
| `roads`      | `highway=motorway,trunk,primary,secondary`                                                                  | Buffered to 15 m polygons before set ops.            |

Pass multiple presets in one call to merge the masks (e.g. `["water", "roads"]`).

### `tags`

A `ReadonlyArray<OsmTagInput>` of raw OSM tags in `"key=value"` form. Use `*` as the value for "any value of this key", e.g. `"building=*"`.

`OsmTagInput` is `KnownOsmTag | (string & {})` — the union of ~350 curated tags from the [OSM Map Features wiki](https://wiki.openstreetmap.org/wiki/Map_features) gives autocomplete for well-known tags while `(string & {})` lets any other string through as an escape hatch.

```tsx
<OsmFeatureSubtract source="area" tags={["leisure=park", "amenity=parking"]} />
```

Tag-driven line features are not auto-buffered — if you need line buffering (e.g. for roads), use the matching preset.

### `source`

A React Hook Form field name. The component reads the current `Polygon` or `MultiPolygon` value, computes its bbox, queries Overpass within that bbox, and writes the difference back via `form.setValue`.

### `label`

Optional override for the button text. Defaults to `"Subtract OSM features"`.

### `endpoint`

Optional override for the Overpass API endpoint. Defaults to the public mirror.
