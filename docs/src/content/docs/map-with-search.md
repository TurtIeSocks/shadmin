---
title: "MapWithSearch"
---

Composite map input combining a draggable Leaflet marker (`<LatLngInput>`) with an address-search combobox (`<GeocodingInput>`). Two-way sync:

- Selecting a search result updates lat/lng/address and recenters the marker.
- Dragging the marker triggers a reverse geocode that updates the address field.

Must be rendered inside a React Hook Form context (e.g. `<SimpleForm>`).

## Usage

```tsx
import { MapWithSearch } from "@/components/leaflet";

<SimpleForm>
  <MapWithSearch
    latSource="lat"
    lngSource="lng"
    addressSource="address"
    height={400}
  />
</SimpleForm>;
```

## Props

| Prop            | Required | Type               | Default | Description                                                   |
| --------------- | -------- | ------------------ | ------- | ------------------------------------------------------------- |
| `latSource`     | Required | `string`           | -       | RHF field name for latitude.                                  |
| `lngSource`     | Required | `string`           | -       | RHF field name for longitude.                                 |
| `addressSource` | Required | `string`           | -       | RHF field name for the human-readable address (display name). |
| `height`        | Optional | `number \| string` | `400`   | Height of the map container.                                  |
| `defaultZoom`   | Optional | `number`           | `13`    | Initial zoom level.                                           |
