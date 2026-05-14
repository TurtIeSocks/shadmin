---
title: "MapField"
---

`<MapField>` and `<MapInput>` add Leaflet-based interactive maps to Show and Create/Edit views. `<MapField>` renders a read-only map at a fixed coordinate. `<MapInput>` renders a draggable marker that writes back to two React Hook Form fields.

## `<MapField>` Usage

```tsx
import { MapField } from "@/components/admin";

<Show>
  <SimpleShowLayout>
    <TextField source="name" />
    <MapField latSource="lat" lngSource="lng" zoom={13} height={300} />
  </SimpleShowLayout>
</Show>
```

Reads `latSource` and `lngSource` from the current record context. Returns `null` when either coordinate is missing.

## `<MapField>` Props

| Prop          | Required | Type               | Default                       | Description                                   |
| ------------- | -------- | ------------------ | ----------------------------- | --------------------------------------------- |
| `latSource`   | Required | `string`           | -                             | Record field name for the latitude value.     |
| `lngSource`   | Required | `string`           | -                             | Record field name for the longitude value.    |
| `zoom`        | Optional | `number`           | `13`                          | Initial zoom level.                           |
| `height`      | Optional | `number \| string` | `300`                         | Height of the map container (px or CSS unit). |
| `tileUrl`     | Optional | `string`           | OpenStreetMap tile URL        | Tile layer URL template.                      |
| `attribution` | Optional | `string`           | OpenStreetMap attribution     | HTML attribution string shown on the map.     |

## `<MapInput>` Usage

```tsx
import { MapInput } from "@/components/admin";

<Create>
  <SimpleForm>
    <MapInput
      latSource="lat"
      lngSource="lng"
      defaultPosition={[48.85, 2.35]}
      height={300}
      label="Location"
      helperText="Click or drag the marker to set a location."
    />
  </SimpleForm>
</Create>
```

Clicking anywhere on the map or dragging the marker updates the two RHF fields. Both `latSource` and `lngSource` must exist as fields in your form (add them as hidden inputs or populate them via `defaultValues` if needed).

## `<MapInput>` Props

| Prop              | Required | Type               | Default                   | Description                                                            |
| ----------------- | -------- | ------------------ | ------------------------- | ---------------------------------------------------------------------- |
| `latSource`       | Required | `string`           | -                         | RHF field name for latitude.                                           |
| `lngSource`       | Required | `string`           | -                         | RHF field name for longitude.                                          |
| `defaultPosition` | Optional | `[number, number]` | `[0, 0]`                  | Initial map center `[lat, lng]` when no form value is present.         |
| `zoom`            | Optional | `number`           | `13`                      | Initial zoom level.                                                    |
| `height`          | Optional | `number \| string` | `300`                     | Height of the map container (px or CSS unit).                          |
| `tileUrl`         | Optional | `string`           | OpenStreetMap tile URL    | Tile layer URL template.                                               |
| `attribution`     | Optional | `string`           | OpenStreetMap attribution | HTML attribution string.                                               |
| `label`           | Optional | `ReactNode`        | -                         | Label rendered above the map.                                          |
| `helperText`      | Optional | `ReactNode`        | -                         | Helper text rendered below the map.                                    |

## `tileUrl`

Both components accept a custom `tileUrl` for using a different tile provider (e.g. Mapbox, Stadia, CartoDB). The URL must follow the Leaflet tile template format: `https://{s}.example.com/{z}/{x}/{y}.png`.

## Icon fix

Leaflet's default marker icons reference bundled image paths that break in Vite/webpack builds. Both components automatically patch `L.Icon.Default` to use CDN-hosted icons from `unpkg.com/leaflet@1.9.4`.
