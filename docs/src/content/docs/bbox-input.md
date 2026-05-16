---
title: "BBoxInput"
---

Form input for drawing an axis-aligned bounding box. The drawn rectangle is converted on save to a `GeoJSON.BBox` tuple (`[west, south, east, north]`), and existing bbox values are hydrated back into a rectangle layer for editing.

Pass `aspectRatio` to lock the stored bbox to a given `width / height` ratio. The drawn rectangle is resized around its centre before persistence — the on-screen layer keeps the freely-drawn extent until next hydration.

## Usage

```tsx
import { BBoxInput } from "@/components/leaflet";

<Create>
  <SimpleForm>
    <BBoxInput source="bb" label="Area of interest" defaultCenter={[48.85, 2.35]} />
  </SimpleForm>
</Create>
```

## Props

| Prop             | Required | Type                         | Default                | Description                                            |
| ---------------- | -------- | ---------------------------- | ---------------------- | ------------------------------------------------------ |
| `source`         | Required | `string`                     | -                      | RHF field to write the geometry to.                    |
| `minBBoxArea_m2` | Optional | `number`                     | -                      | Reserved (validator hook). Not enforced yet.           |
| `aspectRatio`    | Optional | `number`                     | -                      | Lock stored bbox to `width / height = ratio`.          |
| `zoom`           | Optional | `number`                     | `13`                   | Initial zoom level.                                    |
| `defaultCenter`  | Optional | `[number, number]`           | `[0, 0]`               | Initial map center `[lat, lng]`.                       |
| `height`         | Optional | `number \| string`           | `300`                  | Height of the map container.                           |
| `tileUrl`        | Optional | `string`                     | OpenStreetMap tile URL | Tile layer URL template.                               |
| `attribution`    | Optional | `string`                     | OSM attribution        | Tile attribution string.                               |
| `pathOptions`    | Optional | `L.PathOptions`              | -                      | Vector styling for the rectangle.                      |
| `snappable`      | Optional | `boolean`                    | `true`                 | Enable Geoman snap-to-vertex.                          |
| `snapDistance`   | Optional | `number`                     | `20`                   | Snap radius in pixels.                                 |
| `label`          | Optional | `ReactNode`                  | -                      | Label rendered above the map.                          |
| `helperText`     | Optional | `ReactNode`                  | -                      | Helper text rendered below the map.                    |
| `disabled`       | Optional | `boolean`                    | `false`                | Disable editing.                                       |
| `validate`       | Optional | `(v) => string \| undefined` | -                      | RHF-compatible validator(s).                           |
