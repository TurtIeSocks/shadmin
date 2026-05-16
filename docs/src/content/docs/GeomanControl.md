---
title: "GeomanControl"
---

Attaches the Leaflet-Geoman drawing/editing toolbar to the parent `<MapContainer>`. Must be rendered inside react-leaflet's `<MapContainer>`.

## Usage

```tsx
import { MapContainer, TileLayer } from "react-leaflet";
import { GeomanControl } from "@/components/leaflet";

<MapContainer center={[48.85, 2.35]} zoom={13}>
  <TileLayer url={DEFAULT_TILE_URL} attribution={DEFAULT_ATTRIBUTION} />
  <GeomanControl
    position="topleft"
    shapes={["Polygon"]}
    edit
    drag={false}
    remove
  />
</MapContainer>;
```

Implemented with `useMap()` rather than `createControlComponent`, because `addControls` is an imperative call on `map.pm`, not an `L.Control` instance.

## Props

| Prop                    | Required | Type                | Default                                                | Description                                                                            |
| ----------------------- | -------- | ------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `position`              | Optional | `L.ControlPosition` | `"topleft"`                                            | Toolbar position on the map.                                                           |
| `shapes`                | Optional | `GeomanShape[]`     | `["Marker","Line","Polygon","Rectangle","Circle"]`     | Which draw tools to show. Valid: `Marker`, `CircleMarker`, `Line`, `Polygon`, `Rectangle`, `Circle`, `Text`. |
| `edit`                  | Optional | `boolean`           | `true`                                                 | Enable the edit-mode toggle.                                                           |
| `drag`                  | Optional | `boolean`           | `true`                                                 | Enable the drag-mode toggle.                                                           |
| `remove`                | Optional | `boolean`           | `true`                                                 | Enable the removal-mode toggle.                                                        |
| `cut`                   | Optional | `boolean`           | `true`                                                 | Enable the cut-polygon tool.                                                           |
| `rotate`                | Optional | `boolean`           | `false`                                                | Enable the rotate-mode toggle.                                                         |
| `oneBlock`              | Optional | `boolean`           | `false`                                                | Render the toolbar as a single grouped block.                                          |
| `snappable`             | Optional | `boolean`           | `true`                                                 | Enable Geoman snap-to-vertex globally.                                                 |
| `snapDistance`          | Optional | `number`            | `20`                                                   | Snap radius in pixels.                                                                 |
| `allowSelfIntersection` | Optional | `boolean`           | `true`                                                 | Whether polygons may self-intersect.                                                   |
| `pathOptions`           | Optional | `L.PathOptions`     | -                                                      | Global path options for new layers.                                                    |
| `lang`                  | Optional | `string`            | -                                                      | Geoman UI language code.                                                               |
