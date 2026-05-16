---
title: "OsmWaterClipButton"
---

Form button that subtracts OSM water features (lakes, rivers, riverbanks) from the polygon stored at a form field. Useful for trimming service areas to land.

## Usage

```tsx
import { OsmWaterClipButton, PolygonInput } from "@/components/leaflet";

<SimpleForm>
  <PolygonInput source="area" label="Service area" defaultCenter={[48.87, 2.35]} />
  <OsmWaterClipButton source="area" />
</SimpleForm>;
```

On click, fetches OSM water polygons within the current bbox via Overpass, unions them, and subtracts from the form value. Shows a notification with the removed area in km².

## Props

| Prop       | Required | Type     | Default                                           | Description                                              |
| ---------- | -------- | -------- | ------------------------------------------------- | -------------------------------------------------------- |
| `source`   | Required | `string` | -                                                 | RHF field holding a `Polygon` or `MultiPolygon`.         |
| `label`    | Optional | `string` | `t("ra.leaflet.osm.water_clip", "Remove water")` | Button label (translation key falls back to the string). |
| `endpoint` | Optional | `string` | -                                                 | Reserved for v2; ignored in v1.                          |
