---
title: "Leaflet OSM utilities"
---

Hooks and pure helpers for querying OpenStreetMap data and performing geometric operations. Used by `<OsmWaterClipButton>` and `<LineStringInput snapToRoads>`, and available for custom workflows.

## `useOverpass`

React Query hook around the Overpass API.

```ts
import { useOverpass } from "@/components/leaflet";

const { data } = useOverpass(
  '[out:json];way["natural"="water"](48.85,2.3,48.9,2.4);out geom;',
);
```

| Option       | Type                | Default                                  | Description                       |
| ------------ | ------------------- | ---------------------------------------- | --------------------------------- |
| `endpoint`   | `string`            | `https://overpass-api.de/api/interpreter` | Overpass endpoint URL.            |
| `timeoutMs`  | `number`            | `30000`                                  | Request timeout in ms.            |
| `signal`     | `AbortSignal`       | -                                        | Abort signal forwarded to fetch.  |
| `enabled`    | `boolean`           | `true`                                   | React Query `enabled` flag.       |
| `staleTime`  | `number`            | `3600000` (1 h)                          | React Query `staleTime`.          |

## `useOsmWaterMask`

Wraps `useOverpass` with a query that fetches water features (`natural=water`, `waterway=riverbank`) for a given bbox, and returns a parsed GeoJSON `FeatureCollection` (via `osmtogeojson`).

```ts
import { useOsmWaterMask } from "@/components/leaflet";

const { data } = useOsmWaterMask([2.3, 48.85, 2.4, 48.9]);
```

| Param  | Type                  | Description                                          |
| ------ | --------------------- | ---------------------------------------------------- |
| `bbox` | `GeoJSON.BBox \| null` | `[w, s, e, n]`. Pass `null` to disable the query.    |

## `snapToRoadsOnce`

Async helper that calls the public OSRM `match` endpoint to snap a `LineString` to OSM roads. Returns `null` if OSRM returns no match.

```ts
import { snapToRoadsOnce } from "@/components/leaflet";

const snapped = await snapToRoadsOnce(line, { profile: "driving" });
```

| Option     | Type                                    | Default                              | Description                |
| ---------- | --------------------------------------- | ------------------------------------ | -------------------------- |
| `endpoint` | `string`                                | `https://router.project-osrm.org`    | OSRM base URL.             |
| `profile`  | `"driving" \| "walking" \| "cycling"` | `"driving"`                          | OSRM routing profile.      |

## Geometry helpers (`geometry-ops`)

Pure turf wrappers exported from `@/components/leaflet`.

| Function                | Signature                                                                                                          | Description                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `subtract(input, mask)` | `(Polygon \| MultiPolygon, FeatureCollection) => Polygon \| MultiPolygon \| null`                                | Subtract a union-of-masks polygon collection from `input`.                   |
| `unionAll(fc)`          | `(FeatureCollection<Polygon>) => Polygon \| MultiPolygon \| null`                                                | Union every feature in a polygon FeatureCollection.                          |
| `bboxOf(geom)`          | `(Geometry) => BBox`                                                                                               | Compute the bbox `[w, s, e, n]` of any GeoJSON geometry.                     |
| `areaM2(geom)`          | `(Polygon \| MultiPolygon) => number`                                                                            | Area in square meters via turf's geodesic algorithm.                         |
