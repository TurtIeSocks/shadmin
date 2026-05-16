---
title: "useGeomanRHF"
---

Hook that bridges Geoman draw/edit/remove/cut events to a React Hook Form field. Manages a `L.FeatureGroup` that holds the in-progress geometry layers and serializes them back to GeoJSON on every change.

Used internally by `ShapeInputShell` (and therefore every `*Input` component); exposed for advanced custom inputs that need to compose their own Geoman bridge.

## Usage

```ts
import { useGeomanRHF } from "@/components/leaflet";

const { geomanProps, featureGroupRef } = useGeomanRHF({
  source: "geom",
  shape: "Polygon",
  multi: false,
});

// Spread onto <GeomanEvents />
<GeomanEvents {...geomanProps} />;
```

Must be called inside a `<MapContainer>` subtree (uses `useMap`) and inside a React Hook Form context.

## Options

| Option        | Required | Type                                        | Default | Description                                                                                                       |
| ------------- | -------- | ------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| `source`      | Required | `string`                                    | -       | RHF field name to read/write.                                                                                     |
| `shape`       | Required | `ShapeKind`                                 | -       | The GeoJSON shape kind to write (`Point`, `LineString`, `Polygon`, `Multi*`, `GeometryCollection`).               |
| `multi`       | Required | `boolean`                                   | -       | When true, combines drawn layers into a `Multi*` geometry of the configured `shape` kind.                         |
| `collection`  | Optional | `boolean`                                   | `false` | When true, writes a `GeometryCollection` of every drawn layer regardless of `shape`.                              |
| `validate`    | Optional | `(geom: GeoJSON.Geometry) => string \| undefined` | - | Optional pre-write validator; if it returns a message, the previous value is preserved.                           |
| `pathOptions` | Optional | `L.PathOptions`                             | -       | Style options used when re-hydrating an existing value from the form.                                             |
| `markerIcon`  | Optional | `L.Icon \| L.DivIcon`                       | -       | Icon used when re-hydrating point geometries.                                                                     |

## Returns

| Key               | Type                                                     | Description                                                                                                       |
| ----------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `featureGroupRef` | `React.MutableRefObject<L.FeatureGroup \| null>`         | Reference to the internal `L.FeatureGroup` that backs the hook.                                                   |
| `geomanProps`     | `{ onCreate, onUpdate, onRemove, onCut }`                | Handlers to spread onto `<GeomanEvents />`.                                                                       |
