---
title: "useGeomanRHF"
---

Hook that bridges Geoman draw/edit/remove/cut events to a React Hook Form field. Manages a `L.FeatureGroup` that holds the in-progress geometry layers and serializes them back to GeoJSON on every change.

Used internally by `ShapeInputShell` (and therefore every `*Input` component); exposed for advanced custom inputs that need to compose their own Geoman bridge.

The hook is paired with `<GeomanControls>` from [`react-leaflet-geoman-v2`](https://www.npmjs.com/package/react-leaflet-geoman-v2): spread the returned `geomanControlsProps` onto `<GeomanControls>`, and attach the returned `featureGroupRef` to a wrapping `<FeatureGroup>`.

## Usage

```tsx
import { FeatureGroup, MapContainer, TileLayer } from "react-leaflet";
import { GeomanControls } from "react-leaflet-geoman-v2";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import { useGeomanRHF } from "@/components/leaflet";

const MyInput = () => {
  const { featureGroupRef, geomanControlsProps } = useGeomanRHF({
    source: "geom",
    shape: "Polygon",
    multi: false,
  });
  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: 300 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FeatureGroup ref={featureGroupRef}>
        <GeomanControls
          options={{ position: "topleft", drawPolygon: true }}
          globalOptions={{ snappable: true, snapDistance: 20 }}
          {...geomanControlsProps}
        />
      </FeatureGroup>
    </MapContainer>
  );
};
```

Must be called inside a React Hook Form context. The `<FeatureGroup>` is supplied by the consumer; the hook no longer attaches a feature group to the map manually.

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
| `valueTransform` | Optional | `(geom: GeoJSON.Geometry) => unknown`    | -       | Converter that maps the drawn `GeoJSON.Geometry` into the value persisted in the form (e.g. `[w,s,e,n]` for BBox). |
| `valueParse`  | Optional | `(stored: unknown) => GeoJSON.Geometry \| null` | - | Inverse of `valueTransform` used during hydration. Return `null` for malformed input.                              |

## Returns

| Key                   | Type                                                              | Description                                                                                                       |
| --------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `featureGroupRef`     | `React.MutableRefObject<L.FeatureGroup \| null>`                  | Attach this to the wrapping `<FeatureGroup ref={...}>`. The hook reads from and writes to that feature group.     |
| `geomanControlsProps` | `{ onCreate, onUpdate, onLayerRemove, onMapCut, onLayerCut }`     | Handlers to spread onto `<GeomanControls>` from `react-leaflet-geoman-v2`.                                        |
