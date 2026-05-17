---
title: "Leaflet OSM utilities"
---

Hooks and pure helpers for querying OpenStreetMap data and performing geometric operations. Used by `<OsmFeatureSubtract>`, `<OsmFeatureAdd>`, and `<LineStringInput snapToRoads>`, and available for custom workflows.

## `useOverpass`

React Query hook around the Overpass API.

```ts
import { useOverpass } from "@/components/leaflet";

const { data } = useOverpass(
  '[out:json];way["natural"="water"](48.85,2.3,48.9,2.4);out geom;',
);
```

| Option      | Type          | Default                                   | Description                      |
| ----------- | ------------- | ----------------------------------------- | -------------------------------- |
| `endpoint`  | `string`      | `https://overpass-api.de/api/interpreter` | Overpass endpoint URL.           |
| `timeoutMs` | `number`      | `30000`                                   | Request timeout in ms.           |
| `signal`    | `AbortSignal` | -                                         | Abort signal forwarded to fetch. |
| `enabled`   | `boolean`     | `true`                                    | React Query `enabled` flag.      |
| `staleTime` | `number`      | `3600000` (1 h)                           | React Query `staleTime`.         |

## `useOsmFeatures` + `OSM_PRESETS`

Wraps `useOverpass` with a typed-preset query builder. Pass a bbox and a list of preset names; returns a parsed GeoJSON `FeatureCollection` of polygons (line features are buffered when the preset declares `bufferLinesMeters`).

```ts
import { useOsmFeatures } from "@/components/leaflet";

const { data } = useOsmFeatures([2.3, 48.85, 2.4, 48.9], ["water", "roads"]);
```

### Bundled presets (`OSM_PRESETS`)

| Preset      | OSM tags matched                              | Notes                                     |
| ----------- | --------------------------------------------- | ----------------------------------------- |
| `water`     | `natural=water,bay,strait` and any `waterway` | Polygons (lakes, bays) + waterways.       |
| `buildings` | `building=*`                                  | All building footprints.                  |
| `forest`    | `natural=wood,forest` and `landuse=forest`    | Wooded patches.                           |
| `roads`     | `highway=motorway,trunk,primary,secondary`    | Buffered to 15 m polygons before set ops. |

| Param     | Type                                  | Description                                       |
| --------- | ------------------------------------- | ------------------------------------------------- |
| `bbox`    | `GeoJSON.BBox \| null`                | `[w, s, e, n]`. Pass `null` to disable the query. |
| `presets` | `ReadonlyArray<OsmPresetName>`        | One or more preset names from `OSM_PRESETS`.      |
| `opts`    | `{ endpoint?, enabled?, staleTime? }` | Optional overrides forwarded to `useOverpass`.    |

## `snapToRoadsOnce`

Async helper that calls the public OSRM `match` endpoint to snap a `LineString` to OSM roads. Returns `null` if OSRM returns no match.

```ts
import { snapToRoadsOnce } from "@/components/leaflet";

const snapped = await snapToRoadsOnce(line, { profile: "driving" });
```

| Option     | Type                                  | Default                           | Description           |
| ---------- | ------------------------------------- | --------------------------------- | --------------------- |
| `endpoint` | `string`                              | `https://router.project-osrm.org` | OSRM base URL.        |
| `profile`  | `"driving" \| "walking" \| "cycling"` | `"driving"`                       | OSRM routing profile. |

## Geometry helpers (`geometry-ops`)

Pure turf wrappers exported from `@/components/leaflet`.

| Function                | Signature                                                                         | Description                                                |
| ----------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `subtract(input, mask)` | `(Polygon \| MultiPolygon, FeatureCollection) => Polygon \| MultiPolygon \| null` | Subtract a union-of-masks polygon collection from `input`. |
| `unionAll(fc)`          | `(FeatureCollection<Polygon>) => Polygon \| MultiPolygon \| null`                 | Union every feature in a polygon FeatureCollection.        |
| `bboxOf(geom)`          | `(Geometry) => BBox`                                                              | Compute the bbox `[w, s, e, n]` of any GeoJSON geometry.   |
| `areaM2(geom)`          | `(Polygon \| MultiPolygon) => number`                                             | Area in square meters via turf's geodesic algorithm.       |
