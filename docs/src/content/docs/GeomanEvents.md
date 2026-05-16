---
title: "GeomanEvents"
---

Event-bridge component that listens for Leaflet-Geoman events on the parent `<MapContainer>` and wires per-layer events (`pm:update`, `pm:remove`) onto each created layer.

Handles the `pm:cut` ↔ `pm:edit` dedup gotcha: when a layer is cut, Geoman fires both events; an internal `cutInProgress` flag suppresses the duplicate `pm:edit` within the same tick.

## Usage

```tsx
import { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { GeomanControl, GeomanEvents } from "@/components/leaflet";

const [count, setCount] = useState(0);

<MapContainer center={[48.85, 2.35]} zoom={13}>
  <TileLayer url={DEFAULT_TILE_URL} attribution={DEFAULT_ATTRIBUTION} />
  <GeomanControl position="topleft" />
  <GeomanEvents onCreate={() => setCount((c) => c + 1)} />
</MapContainer>;
```

## Props

| Prop       | Required | Type                                                   | Default | Description                                                       |
| ---------- | -------- | ------------------------------------------------------ | ------- | ----------------------------------------------------------------- |
| `onCreate` | Optional | `(layer: L.Layer, shape: GeomanShape) => void`         | -       | Fired when the user finishes drawing a new layer.                 |
| `onUpdate` | Optional | `(layer: L.Layer) => void`                             | -       | Fired when an existing layer's geometry is edited.                |
| `onRemove` | Optional | `(layer: L.Layer) => void`                             | -       | Fired when a layer is removed.                                    |
| `onCut`   | Optional | `(newLayer: L.Layer, originalLayer: L.Layer) => void` | -       | Fired when a polygon is cut; receives both layers.                |
