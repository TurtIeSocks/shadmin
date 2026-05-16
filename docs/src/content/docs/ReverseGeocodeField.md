---
title: "ReverseGeocodeField"
---

Read-only field that displays a human-readable address resolved from a lat/lng pair on the current record. Falls back to truncated coordinates while loading or when reverse geocoding returns no result.

## Usage

```tsx
import { ReverseGeocodeField } from "@/components/leaflet";

<Show>
  <SimpleShowLayout>
    <ReverseGeocodeField latSource="lat" lngSource="lng" />
  </SimpleShowLayout>
</Show>;
```

Returns `null` when either coordinate is missing on the record.

## Props

| Prop         | Required | Type                                 | Default             | Description                                                                              |
| ------------ | -------- | ------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------- |
| `latSource`  | Required | `string`                             | -                   | Record field name for latitude.                                                          |
| `lngSource`  | Required | `string`                             | -                   | Record field name for longitude.                                                         |
| `format`     | Optional | `"full" \| "street" \| "city"`      | `"full"`            | How much of the display name to render. `street` = first segment, `city` = first two.    |
| `className`  | Optional | `string`                             | -                   | Optional CSS class on the rendered `<span>`.                                             |
| `provider`   | Optional | `GeocodingProvider`                  | `nominatimProvider` | Custom provider (`search`/`reverse` interface).                                          |
| `enabled`    | Optional | `boolean`                            | `true`              | React Query `enabled` flag.                                                              |
| `endpoint`   | Optional | `string`                             | Nominatim           | Provider endpoint override.                                                              |
