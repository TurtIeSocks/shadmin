---
title: "LatLngField"
---

`<LatLngField>` and `<LatLngInput>` add Leaflet-based interactive maps to Show and Create/Edit views. `<LatLngField>` renders a read-only map at a fixed coordinate. `<LatLngInput>` renders a draggable marker that writes back to two React Hook Form fields.

These components live in a separate registry block (`lat-lng-field`) to keep the optional Leaflet dependency out of the core admin install. Add the block with:

```bash
npx shadcn@latest add https://marmelab.com/shadcn-admin-kit/r/lat-lng-field.json
```

## `<LatLngField>` Usage

```tsx
import { LatLngField } from "@/components/lat-lng-field";

<Show>
  <SimpleShowLayout>
    <TextField source="name" />
    <LatLngField latSource="lat" lngSource="lng" zoom={13} height={300} />
  </SimpleShowLayout>
</Show>
```

Reads `latSource` and `lngSource` from the current record context. Renders an empty-state panel when either coordinate is missing.

## `<LatLngField>` Props

| Prop          | Required | Type               | Default                       | Description                                   |
| ------------- | -------- | ------------------ | ----------------------------- | --------------------------------------------- |
| `latSource`   | Required | `string`           | -                             | Record field name for the latitude value.     |
| `lngSource`   | Required | `string`           | -                             | Record field name for the longitude value.    |
| `zoom`        | Optional | `number`           | `13`                          | Initial zoom level.                           |
| `height`      | Optional | `number \| string` | `300`                         | Height of the map container (px or CSS unit). |
| `tileUrl`     | Optional | `string`           | OpenStreetMap tile URL        | Tile layer URL template.                      |
| `attribution` | Optional | `string`           | OpenStreetMap attribution     | HTML attribution string shown on the map.     |

## `<LatLngInput>` Usage

```tsx
import { LatLngInput } from "@/components/lat-lng-field";

<Create>
  <SimpleForm>
    <LatLngInput
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

## `<LatLngInput>` Props

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

## Reserved names

`PointField` / `PointInput` are reserved for a future component that operates on a GeoJSON `Point` shape rather than two scalar fields.
