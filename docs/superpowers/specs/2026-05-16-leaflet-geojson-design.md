# Leaflet GeoJSON, Geoman, OSM & Geocoding Components

**Date:** 2026-05-16
**Status:** Draft
**Block:** `leaflet` (existing optional registry block)

Extends the existing `components/leaflet/` block (currently: `LatLngField`, `LatLngInput`) with:

1. Field + Input components for every GeoJSON geometry shape.
2. A polymorphic `<GeoJsonField>` / `<GeoJsonInput>` that dispatches by geometry `type`.
3. Drawing & editing primitives wrapping `@geoman-io/leaflet-geoman-free`.
4. OSM/Overpass utilities (water-clip, road-snap, generic Overpass query).
5. Geocoding & reverse-geocoding components backed by Nominatim (provider-pluggable).

---

## Goals

- Match the existing component contract: `<Field>` reads `useRecordContext()`; `<Input>` is RHF-bound via `useInput()` (or direct `useFormContext()` like `LatLngInput`).
- Store **GeoJSON `Geometry` only** (no `Feature`/`FeatureCollection` wrapper). Symmetric with PostGIS / Supabase `geometry` columns and current `LatLngInput`'s two-source pattern. Feature/FeatureCollection can be added later without breaking changes.
- Free Geoman only. No Pro features. Replicate the popular Pro behaviors (split, union, difference) via turf.js when needed.
- Stay inside the existing `leaflet` registry block so the optional Leaflet dep stays out of core.
- Per-component docs page-per-component (matches existing `LeafletAdmin.md`); one `Leaflet.md` index or per-component `.md` files — see Documentation section.

## Non-Goals

- Vector tiles. Raster tiles only.
- Server-side routing. Routing comes from external services (OSRM); we only render the result.
- Custom tile servers. Users pass `tileUrl` / `attribution`. We document common providers but don't bundle them.
- Mobile-specific touch UX beyond what Leaflet + Geoman already give us. No two-finger pinch override.
- Geoman Pro features (split, union, difference, scale, measurement, snap guides, auto-trace, pinning, line simplification).

---

## Directory Layout

```
src/components/leaflet/
├── shared.ts                              # existing — DEFAULT_TILE_URL, MarkerIcon, etc.
├── shared-map.tsx                         # NEW — BaseMap wrapper, fit-bounds helpers, SSR-safe wrapper
├── lat-lng-field.tsx                      # existing
├── lat-lng-input.tsx                      # existing
│
├── geojson-field.tsx                      # NEW — polymorphic Field
├── geojson-input.tsx                      # NEW — polymorphic Input
│
├── shapes/                                # NEW — one file per shape pair
│   ├── point-field.tsx
│   ├── point-input.tsx
│   ├── multi-point-field.tsx
│   ├── multi-point-input.tsx
│   ├── line-string-field.tsx
│   ├── line-string-input.tsx
│   ├── multi-line-string-field.tsx
│   ├── multi-line-string-input.tsx
│   ├── polygon-field.tsx
│   ├── polygon-input.tsx
│   ├── multi-polygon-field.tsx
│   ├── multi-polygon-input.tsx
│   ├── geometry-collection-field.tsx
│   ├── geometry-collection-input.tsx
│   ├── bbox-field.tsx
│   └── bbox-input.tsx
│
├── geoman/                                # NEW — drawing/editing primitives
│   ├── geoman-control.tsx                 # react-leaflet wrapper around map.pm.addControls
│   ├── geoman-events.tsx                  # event-bridge (pm:create/update/remove/cut)
│   ├── use-geoman-rhf.ts                  # hook: pm events ↔ RHF setValue
│   ├── geoman-shape-mapping.ts            # GeoJSON type ↔ Geoman shape name
│   └── shape-constraints.ts               # vertex-count, self-intersection, area validators
│
├── osm/                                   # NEW — OSM/Overpass + turf utilities
│   ├── overpass-client.ts                 # fetch wrapper, polite delay, error normalization
│   ├── use-overpass.ts                    # React Query hook for arbitrary Overpass QL
│   ├── use-osm-water-mask.ts              # fetch water polys for a bbox
│   ├── osm-water-clip-button.tsx          # one-click "subtract water from this polygon"
│   ├── use-osm-snap-to-roads.ts           # OSRM /match wrapper (used by LineStringInput)
│   └── geometry-ops.ts                    # turf wrappers (subtract, union, bbox, area)
│
└── geocoding/                             # NEW — search & reverse
    ├── nominatim-client.ts                # fetch wrapper, debounce, rate-limit, UA header
    ├── use-geocode.ts                     # forward search hook
    ├── use-reverse-geocode.ts             # reverse hook (coord-rounded cache key)
    ├── geocoding-input.tsx                # combobox search → writes coords/bbox to form
    ├── reverse-geocode-field.tsx          # display address from record coords
    └── map-with-search.tsx                # composite: LatLngInput + GeocodingInput overlay
```

Public exports updated in `index.ts` (one block per section for readability).

---

## 1. Per-Shape Field + Input Pairs

### Public API — Field (read-only)

All shape fields share:

```tsx
<PolygonField source="area" />
<MultiPolygonField source="territories" zoom={8} height={400} />
<LineStringField source="route" pathOptions={{ color: "red", weight: 3 }} />
<PointField source="location" />
```

Common props:

| Prop            | Type                  | Default                   | Notes                                                                                     |
| --------------- | --------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| `source`        | `string`              | —                         | Record field path. Value must be a GeoJSON `Geometry` of the matching `type` (or `null`). |
| `zoom`          | `number`              | `13`                      | Initial zoom when geometry's bounds can't be computed (point case).                       |
| `height`        | `number \| string`    | `300`                     | Map container height.                                                                     |
| `tileUrl`       | `string`              | `DEFAULT_TILE_URL`        |                                                                                           |
| `attribution`   | `string`              | `DEFAULT_ATTRIBUTION`     |                                                                                           |
| `pathOptions`   | `L.PathOptions`       | `{ color: "#3388ff" }`    | Style for vector shapes (ignored by Point/MultiPoint).                                    |
| `markerIcon`    | `L.Icon \| L.DivIcon` | `MarkerIcon`              | Point / MultiPoint only.                                                                  |
| `fitBounds`     | `boolean`             | `true`                    | Auto-fit to layer bounds. Falls back to `defaultCenter` + `zoom` for empty.               |
| `defaultCenter` | `[number, number]`    | `[0, 0]`                  | Used when geometry missing AND `fitBounds` can't compute.                                 |
| `emptyText`     | `ReactNode`           | `"No geometry available"` | Empty state.                                                                              |

Empty-state rendering matches existing `LatLngField`: bordered muted panel with `emptyText`.

### Public API — Input (RHF-bound)

```tsx
<PolygonInput source="area" label="Service area" helperText="Click to add vertices, double-click to finish" />
<LineStringInput source="route" snapToRoads label="Delivery route" />
<MultiPointInput source="bus_stops" />
```

Common Input props (all shape inputs):

| Prop                      | Type                       | Default      | Notes                                        |
| ------------------------- | -------------------------- | ------------ | -------------------------------------------- |
| `source`                  | `string`                   | —            | RHF field path. Stores `Geometry` or `null`. |
| `label`                   | `ReactNode`                | —            |                                              |
| `helperText`              | `ReactNode`                | —            |                                              |
| `validate`                | `Validator \| Validator[]` | —            | ra-core validators.                          |
| `disabled`                | `boolean`                  | `false`      |                                              |
| `defaultCenter`           | `[number, number]`         | `[0, 0]`     | Map center when no value.                    |
| `defaultZoom`             | `number`                   | `13`         |                                              |
| `height`                  | `number \| string`         | `300`        |                                              |
| `tileUrl` / `attribution` | `string`                   | OSM defaults |                                              |
| `pathOptions`             | `L.PathOptions`            | —            | Drawn-shape styling.                         |
| `snappable`               | `boolean`                  | `true`       | Geoman snap-while-drawing.                   |
| `snapDistance`            | `number`                   | `20`         | Pixels.                                      |

Per-shape extras:

| Shape                                     | Extra Props                                                                                                                                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PolygonInput`, `MultiPolygonInput`       | `allowSelfIntersection?: boolean = false`, `minVertices?: number = 3`, `maxVertices?: number`, `minArea_m2?: number`                                                                                                    |
| `LineStringInput`, `MultiLineStringInput` | `minVertices?: number = 2`, `maxVertices?: number`, `snapToRoads?: boolean = false`                                                                                                                                     |
| `PointInput`, `MultiPointInput`           | `markerIcon?: L.Icon \| L.DivIcon`                                                                                                                                                                                      |
| `BBoxInput`                               | `minBBoxArea_m2?: number`. (Note: `aspectRatio` ratio-lock-while-dragging is _not_ a Geoman free feature; deferred — would need a custom Geoman mode wrapper or post-draw resize hook. Tracked in Open Considerations.) |
| `GeometryCollectionInput`                 | `allowedShapes?: Array<GeoJSON.Geometry["type"]> = ["Point","LineString","Polygon"]`. Buttons for shapes not in this list are hidden from the Geoman toolbar.                                                           |

### Behavior

- Each `*Input` configures Geoman in single-shape mode. Only the matching draw button is exposed in the toolbar (set via `addControls` + per-shape flags). Edit/Drag/Remove are always exposed.
- `pm:create` fires → existing layer (if any, for single-feature shapes) is removed; new layer's `toGeoJSON().geometry` is written to the RHF source.
- `pm:update` fires → updated geometry written to source.
- `pm:remove` fires → source set to `null`.
- For `Multi*` and `GeometryCollection` inputs: new shapes append to an internal `L.FeatureGroup`, and the persisted value is the combined `Multi*` / `GeometryCollection` geometry. Removing one sub-shape rewrites the combined value.
- Initial value: if `source` already has a geometry (Edit view), render the existing geometry as an editable Geoman layer on mount.

### Value semantics

```ts
// Examples of what each Input writes back to RHF:

PointInput      → { type: "Point",      coordinates: [lng, lat] }            // RFC 7946: lng-first
LineStringInput → { type: "LineString", coordinates: [[lng,lat], ...] }
PolygonInput    → { type: "Polygon",    coordinates: [[[lng,lat], ...], /* holes */] }
MultiPolygonInput → { type: "MultiPolygon", coordinates: [/* array of polygon coords */] }
GeometryCollectionInput → { type: "GeometryCollection", geometries: [...] }
BBoxInput       → [west, south, east, north]                                  // RFC 7946 §5
```

`BBox` is special: it's an array, not a geometry. `BBoxField`/`BBoxInput` accept either a raw bbox array OR a rectangle polygon at write time, but always **read** an array shape.

### Files

- `shapes/{shape}-field.tsx` — ~60 lines each. Reads record, renders `<MapContainer><GeoJSON data={geometry}/></MapContainer>`.
- `shapes/{shape}-input.tsx` — ~80 lines each. Wraps `<MapContainer>` + `<GeomanControl shape={X}/>` + `<GeomanEvents>` + `useGeomanRHF({source, shape, multi})`.

### Tests

Story-driven (per `lat-lng-field.spec.tsx`). One story file per shape pair: `src/stories/{shape}.stories.tsx`. Specs co-located: `shapes/{shape}-field.spec.tsx`, `shapes/{shape}-input.spec.tsx`.

Shared story setup goes into `src/stories/_test-helpers.tsx` (per AGENTS.md). One `StoryAdmin` wrapper covers all map stories.

---

## 2. Polymorphic `<GeoJsonField>` / `<GeoJsonInput>`

For columns whose geometry type varies between records (or for one-input-fits-all dynamic schemas).

```tsx
<GeoJsonField source="geom" />
<GeoJsonInput source="geom" shapes={["Polygon", "Point"]} />
```

### Behavior

- `GeoJsonField`: reads `record[source]`, dispatches on `geometry.type` to the matching internal renderer (or `L.GeoJSON` directly — turf does the heavy lifting).
- `GeoJsonInput`: enables Geoman toolbar with **all** draw buttons filtered by `shapes` prop. Each `pm:create` replaces the previous geometry (single-feature) or appends to a collection. New `shapes` prop default: `["Point", "LineString", "Polygon"]`.
- Optional `collection: true` prop → wraps results in `GeometryCollection` so multiple heterogeneous shapes can coexist in one value.

### Props (in addition to the shared Field/Input props above)

| Prop                | Type                                      | Default                            | Applies to                                    |
| ------------------- | ----------------------------------------- | ---------------------------------- | --------------------------------------------- |
| `shapes`            | `Array<GeoJSON.Geometry["type"]>`         | `["Point","LineString","Polygon"]` | Input                                         |
| `collection`        | `boolean`                                 | `false`                            | Input — `true` ⇒ writes `GeometryCollection`. |
| `pathOptionsByType` | `Record<Geometry["type"], L.PathOptions>` | —                                  | Field (override style per shape).             |

---

## 3. Geoman Primitives

Two layers — composable for power users, RHF-bound for the shape Inputs.

### a) `<GeomanControl>` — toolbar wrapper

```tsx
<MapContainer ...>
  <TileLayer ... />
  <GeomanControl
    position="topleft"
    shapes={["Polygon", "Rectangle"]}
    edit
    drag
    remove
    cut
    rotate
    oneBlock
    snappable
    snapDistance={20}
    allowSelfIntersection={false}
    pathOptions={{ color: "red" }}
  />
</MapContainer>
```

Built with `createControlComponent` from `@react-leaflet/core` (per geoman skill ref). Maps prop flags to Geoman's `addControls({ drawX: bool, editMode: bool, ... })`.

Props:

| Prop                                          | Type                   | Default                                                |
| --------------------------------------------- | ---------------------- | ------------------------------------------------------ |
| `position`                                    | `L.ControlPosition`    | `"topleft"`                                            |
| `shapes`                                      | `Array<DrawableShape>` | `["Marker","Polyline","Polygon","Rectangle","Circle"]` |
| `edit` / `drag` / `remove` / `cut` / `rotate` | `boolean`              | `true`, `true`, `true`, `true`, `false`                |
| `oneBlock`                                    | `boolean`              | `false`                                                |
| `snappable`                                   | `boolean`              | `true`                                                 |
| `snapDistance`                                | `number`               | `20`                                                   |
| `allowSelfIntersection`                       | `boolean`              | `true`                                                 |
| `pathOptions`                                 | `L.PathOptions`        | —                                                      |
| `lang`                                        | `string`               | — (passes to `map.pm.setLang`)                         |

`DrawableShape = "Marker" | "CircleMarker" | "Polyline" | "Rectangle" | "Polygon" | "Circle" | "Text"`.

### b) `<GeomanEvents>` — event bridge

```tsx
<GeomanEvents
  onCreate={(layer, shape) => persist(layer.toGeoJSON())}
  onUpdate={(layer) => persist(layer.toGeoJSON())}
  onRemove={(layer) => unpersist(layer)}
  onCut={(newLayer, originalLayer) => {
    /* deduplication baked-in */
  }}
/>
```

Per geoman skill ref, internally wires `pm:cut`-vs-`pm:edit` deduplication so consumers don't double-fire.

### c) `useGeomanRHF` — hook

Powers all per-shape `*Input` components. Encapsulates:

```ts
function useGeomanRHF<T extends GeoJSON.Geometry>(opts: {
  source: string; // RHF field
  shape: GeoJSON.Geometry["type"]; // strict shape for this hook instance
  multi: boolean; // append vs replace
  collection?: boolean; // for GeometryCollection
  validate?: (geom: T) => string | undefined;
  pathOptions?: L.PathOptions;
}): {
  featureGroupRef: React.RefObject<L.FeatureGroup>;
  geomanProps: { onCreate; onUpdate; onRemove; onCut };
};
```

Mounts a `FeatureGroup`, hydrates from `form.getValues(source)`, listens to Geoman events, writes back GeoJSON, runs validator pre-write, supports both single-replace and multi-append.

### d) `geoman-shape-mapping.ts`

Maps GeoJSON `type` → Geoman draw mode name + leaflet layer factory:

```ts
const SHAPE_MAP = {
  Point:            { geomanShape: "Marker",  toGeoJSON: layerToPoint,    fromGeoJSON: pointToLayer },
  MultiPoint:       { geomanShape: "Marker",  toGeoJSON: ...,             fromGeoJSON: ... },
  LineString:       { geomanShape: "Line",    toGeoJSON: ...,             fromGeoJSON: ... },
  MultiLineString:  { geomanShape: "Line",    toGeoJSON: ...,             fromGeoJSON: ... },
  Polygon:          { geomanShape: "Polygon", toGeoJSON: ...,             fromGeoJSON: ... },
  MultiPolygon:     { geomanShape: "Polygon", toGeoJSON: ...,             fromGeoJSON: ... },
  // GeometryCollection: not a single Geoman shape; uses multi-shape mode in GeoJsonInput
};
```

### e) `shape-constraints.ts`

Reusable validators (Geoman fires `pm:create`/`pm:update` → we run these before persisting):

- `validateMinVertices(n)` / `validateMaxVertices(n)` — count rings.
- `validateMinArea(m2)` — `turf.area`.
- `validateNoSelfIntersection()` — uses Geoman's `layer.pm.hasSelfIntersection()` for polygons; turf-based fallback for lines.

Returns an `error: string | undefined` that surfaces via RHF.

---

## 4. OSM / Overpass / Turf Utilities

### `overpass-client.ts`

```ts
export async function queryOverpass(
  query: string,
  opts?: {
    endpoint?: string; // default https://overpass-api.de/api/interpreter
    timeoutMs?: number; // default 30_000
    signal?: AbortSignal;
  },
): Promise<OverpassJson>;
```

Polite default headers (`User-Agent: shadcn-admin-kit-leaflet/0.x`), normalized errors (`OverpassRateLimitError`, `OverpassTimeoutError`).

### `use-overpass.ts`

```ts
const { data, isLoading, error } = useOverpass(
  `[out:json][timeout:25];
   (way["natural"="water"](${bboxStr});
    relation["natural"="water"](${bboxStr}););
   out geom;`,
  { enabled: bbox != null },
);
```

React Query hook. `queryKey: ["overpass", query]`. `staleTime: 1h` default (water boundaries change slowly).

### `use-osm-water-mask.ts`

Higher-level: takes a bbox, returns `FeatureCollection<Polygon>` of water features (natural=water, waterway=riverbank, etc.). Composes `useOverpass` + Overpass-to-GeoJSON conversion (osmtogeojson, ~25kb gzipped — or hand-rolled if smaller).

### `geometry-ops.ts`

Thin turf wrappers (selective imports keep bundle small):

```ts
export function subtract(
  input: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  mask: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null;

export function unionAll(
  features: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null;

export function bboxOf(geom: GeoJSON.Geometry): GeoJSON.BBox;

export function areaM2(geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): number;
```

### `<OsmWaterClipButton>`

```tsx
<Edit>
  <SimpleForm>
    <PolygonInput source="area" />
    <OsmWaterClipButton source="area" />
  </SimpleForm>
</Edit>
```

Button reads polygon from `source` via `useWatch`. On click:

1. Compute bbox via `bboxOf`.
2. Call `useOsmWaterMask(bbox)`.
3. `subtract(polygon, waterMask)`.
4. `form.setValue(source, result, { shouldDirty: true })`.
5. Toast: "Removed N km² of water" (or "No water found in area").

Variant: `<OsmWaterClipButton mode="preview">` opens a side-by-side modal showing before/after before committing.

### `use-osm-snap-to-roads.ts`

Wraps OSRM's `/match/v1/{profile}/{coordinates}` endpoint. Returns road-snapped LineString. Consumed by `LineStringInput snapToRoads`. Configurable `osrmEndpoint`, default `https://router.project-osrm.org`.

---

## 5. Geocoding & Reverse Geocoding

### Provider abstraction

```ts
export interface GeocodingProvider {
  search(query: string, opts?: SearchOpts): Promise<GeocodeResult[]>;
  reverse(
    lat: number,
    lng: number,
    opts?: ReverseOpts,
  ): Promise<GeocodeResult | null>;
}

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
  bbox?: GeoJSON.BBox;
  type?: string; // "city" | "street" | "poi" | …
  raw: unknown; // provider-specific payload
}
```

Ship `nominatimProvider`. Document factory pattern for Mapbox / Pelias / Photon (skill ref has examples). Hooks accept `provider` prop, falling back to a default context-injected one.

### `nominatim-client.ts`

- Built-in 1 req/sec rate limit (Nominatim public policy).
- Required `User-Agent` header.
- Configurable `endpoint` (default `https://nominatim.openstreetmap.org`).
- Returns normalized `GeocodeResult[]`.

### `useGeocode(query, opts)` / `useReverseGeocode({lat, lng}, opts)`

React Query hooks:

- `useGeocode`: debounced (300ms default) query, `enabled: query.length >= 3`, `staleTime: 5min`.
- `useReverseGeocode`: queryKey rounds coords to 5 decimals (~1m) to share cache across small movements.

### `<GeocodingInput>`

```tsx
<GeocodingInput
  source="address" // writes displayName
  latSource="lat" // optional: writes lat
  lngSource="lng" // optional: writes lng
  bboxSource="bbox" // optional: writes bbox
  countryCodes={["us", "ca"]}
  viewBox={[-125, 24, -66, 49]} // bias results
  minChars={3}
  debounceMs={300}
  placeholder="Search address or place…"
/>
```

Combobox (cmdk under the hood, matches existing shadcn-admin-kit combobox pattern). Each result row shows display name + type badge. On select → writes to all configured sources.

If `latSource`/`lngSource` set but `source` not set, geocoding still happens; just no address text is written.

### `<ReverseGeocodeField>`

```tsx
<Show>
  <SimpleShowLayout>
    <LatLngField latSource="lat" lngSource="lng" />
    <ReverseGeocodeField latSource="lat" lngSource="lng" label="Address" />
  </SimpleShowLayout>
</Show>
```

Reads coords from record context. Shows skeleton while loading, formatted address on success, falls back to `"{lat}, {lng}"` on error. Optional `format` prop to pick which parts to render (`"street"` | `"city"` | `"full"`).

### `<MapWithSearch>` (composite)

```tsx
<Create>
  <SimpleForm>
    <MapWithSearch
      latSource="lat"
      lngSource="lng"
      addressSource="address"
      height={400}
    />
  </SimpleForm>
</Create>
```

Composes `LatLngInput` + `GeocodingInput` (rendered inside the map's `topright` Leaflet Control corner). Two-way sync:

- Type address → result selected → map flies to coords, marker moves, lat/lng + address updated.
- Drag marker → reverse-geocode → address text field updates.

This is the "standard address picker" so users don't need to compose three things every time.

### Bonus ideas (deferred / not v1)

- `<NearbyPlacesField category radius>` — Overpass POI lookup near record's coords.
- `<AdminBoundaryField source="city" />` — fetch city polygon by name (OSM `boundary=administrative`).
- `<RouteField from to mode="driving">` — OSRM route between two coord fields, rendered as polyline.

---

## Dependencies

Adds to `dependencies`:

| Package                          | Approx size (gzip) | Used by                                   |
| -------------------------------- | ------------------ | ----------------------------------------- |
| `@geoman-io/leaflet-geoman-free` | ~50kb              | All Input components, GeomanControl       |
| `@turf/area`                     | ~3kb               | Validators, OsmWaterClipButton toast      |
| `@turf/bbox`                     | ~2kb               | OSM utilities                             |
| `@turf/difference`               | ~5kb               | OsmWaterClipButton, geometry-ops.subtract |
| `@turf/union`                    | ~4kb               | geometry-ops.unionAll                     |
| `@turf/helpers`                  | ~2kb               | Construct features for turf input         |
| `osmtogeojson`                   | ~25kb              | use-osm-water-mask                        |

Total: ~90kb gzipped added to the **leaflet block only** (block is opt-in via shadcn registry — not part of core install).

No new peer deps. `@tanstack/react-query`, `leaflet`, `react-leaflet`, `react-hook-form`, `lucide-react` already present.

---

## Testing Plan

### Per-shape tests

Each shape pair gets:

- `*-field.spec.tsx` — renders story, asserts `data-testid="*-field"` present, asserts empty-state for missing value.
- `*-input.spec.tsx` — renders story, asserts toolbar present, simulates draw via Geoman API (programmatic `map.pm.enableDraw` + synthetic events; Geoman skill ref shows the pattern), asserts RHF value updated.

Drawing-tests run in Vitest browser provider (Chromium) so Geoman's DOM-based interaction works. Per AGENTS.md, run the browser suite at the end of each TDD task, not after every step.

### Geoman primitive tests

- `geoman-control.spec.tsx`: renders inside MapContainer, asserts `.leaflet-pm-toolbar` exists, asserts each `shapes` flag toggles the right button.
- `geoman-events.spec.tsx`: programmatic draw → `onCreate` fired with correct shape + GeoJSON.
- `use-geoman-rhf.spec.tsx`: programmatic draw → form value matches; edit → value updated; remove → null; cut deduplication.

### OSM utilities tests

- `overpass-client.spec.ts`: mocks `fetch`, asserts query body, polite headers, error normalization.
- `use-osm-water-mask.spec.tsx`: mocks Overpass response, asserts FeatureCollection shape.
- `geometry-ops.spec.ts`: pure functions, no map needed.
- `osm-water-clip-button.spec.tsx`: full integration — Polygon in form, click, mocked Overpass, assert form value is the difference polygon.

### Geocoding tests

- `nominatim-client.spec.ts`: mocked `fetch`, rate-limit behavior (consecutive calls spaced ≥1s — fake-timer test), UA header.
- `use-geocode.spec.tsx`: debounce, min-chars, country-code filter.
- `geocoding-input.spec.tsx`: types in combobox, asserts results render, selects → form values set.
- `reverse-geocode-field.spec.tsx`: mocked reverse → asserts rendered address; error → fallback to coords.
- `map-with-search.spec.tsx`: address typed → marker moves; marker dragged → address updates.

### Story files

One per shape pair + one per geoman/osm/geocoding component. All share `_test-helpers.tsx`'s `StoryAdmin` wrapper.

---

## Documentation

Per AGENTS.md: every component gets a doc page in `docs/src/content/docs/`. Following the existing `LeafletAdmin.md` pattern:

Option A — single doc page per component (matches existing one-doc-per-component convention):

- `PointField.md`, `PointInput.md`, … (16 files for shape pairs)
- `GeoJsonField.md`, `GeoJsonInput.md`
- `GeomanControl.md`, `GeomanEvents.md`
- `UseGeomanRHF.md` (hook doc)
- `OsmWaterClipButton.md`
- `GeocodingInput.md`, `ReverseGeocodeField.md`, `MapWithSearch.md`

Option B — grouped pages by category (4 pages):

- `LeafletShapeFields.md` — all per-shape field pairs in one page
- `LeafletDrawing.md` — Geoman primitives + GeoJsonInput
- `LeafletOsm.md` — Overpass utilities + water clip
- `LeafletGeocoding.md` — search + reverse + composite

**Recommendation: Option A** for discoverability (matches site nav pattern), with the existing `LeafletAdmin.md` retitled `Leaflet.md` as the index/overview page.

All pages follow Usage → Props → per-prop section structure (project doc contract).

---

## Open Considerations

1. **Bundle hit for full turf**: selective `@turf/*` subpackages keep size down but add 5 separate deps. Alternative: `@turf/turf` (all of turf) at ~120kb gzipped is simpler but heavier. **Picking selective** for the registry block — users who add the leaflet block care about bundle size.

2. **Coordinate order**: GeoJSON is `[lng, lat]`; Leaflet APIs are `[lat, lng]`. Internal mapping must be explicit. Helpers `latLngToCoord` / `coordToLatLng` live in `shared-map.tsx`; lint rule (or comment-driven convention) to keep usage clean.

3. **Geoman's `pm:edit` vs `pm:update`**: per skill ref, persist on `pm:update` only. Bake this into `useGeomanRHF` so consumers can't accidentally subscribe to `pm:edit` and hammer the form.

4. **SSR**: existing `LatLngField` has `"use client"` directive. All new components must too. No Next.js dynamic-import wrapper inside the library; consumers wrap if they want SSR-safe imports.

5. **OSM rate limits / etiquette**: document prominently. Public Overpass/Nominatim are not for production-scale workloads. Provide `endpoint` props on all hooks so users can self-host (overpass-api + nominatim-docker).

6. **Geoman registry block packaging**: ensure `scripts/build_registry.mjs` picks up new files. Verify `leaflet.json` registry block includes the new deps (`@geoman-io/leaflet-geoman-free`, turf subpackages, etc.).

7. **Future Feature/FeatureCollection support**: deferred. When added, will be a `<GeoJsonFeatureField>`/`<GeoJsonFeatureInput>` (separate components, won't break the existing geometry-only contract).

8. **Homebrew Geoman-Pro replacement** (not v1): user noted desire to avoid the Pro license. Track separately — would replace split/union/difference via turf-driven custom controls inside `geoman/`. Not blocked by this spec.

9. **BBoxInput aspect-ratio lock**: Geoman free's Rectangle draw mode has no aspect-ratio constraint. If needed v1, options are (a) post-draw `pm:create` handler that resizes the result to lock ratio, or (b) custom draw mode replacing Rectangle. Both feasible; deferred until a real consumer asks.

10. **Phasing**: this spec is substantial (~30 files). The implementation plan (next step) should split into phases — likely (a) shape Field/Input pairs + Geoman primitives + polymorphic, (b) OSM utilities, (c) Geocoding suite — so progress is reviewable in stages.
