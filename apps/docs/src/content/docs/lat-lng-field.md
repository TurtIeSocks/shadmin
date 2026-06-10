---
title: "LatLngField"
---

Read-only Leaflet map with a marker at the lat/lng pair read from the current record. Renders an empty-state panel when either coordinate is missing.

## Usage

```tsx
import { LatLngField } from "@/components/leaflet";

<Show>
  <SimpleShowLayout>
    <TextField source="name" />
    <LatLngField latSource="lat" lngSource="lng" zoom={13} height={300} />
  </SimpleShowLayout>
</Show>;
```

## Props

| Prop          | Required | Type               | Default                   | Description                                   |
| ------------- | -------- | ------------------ | ------------------------- | --------------------------------------------- |
| `latSource`   | Required | `string`           | -                         | Record field name for the latitude value.     |
| `lngSource`   | Required | `string`           | -                         | Record field name for the longitude value.    |
| `zoom`        | Optional | `number`           | `13`                      | Initial zoom level.                           |
| `height`      | Optional | `number \| string` | `300`                     | Height of the map container (px or CSS unit). |
| `tileUrl`     | Optional | `string`           | OpenStreetMap tile URL    | Tile layer URL template.                      |
| `attribution` | Optional | `string`           | OpenStreetMap attribution | HTML attribution string shown on the map.     |

## `tileUrl`

Accepts a custom `tileUrl` for using a different tile provider (Mapbox, Stadia, CartoDB). The URL must follow the Leaflet tile template format: `https://{s}.example.com/{z}/{x}/{y}.png`.
