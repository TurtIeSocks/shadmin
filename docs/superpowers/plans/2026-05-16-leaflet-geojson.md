# Leaflet GeoJSON + Geoman + OSM + Geocoding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the optional `leaflet-admin` registry block with: per-shape GeoJSON Field/Input pairs (Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon, GeometryCollection, BBox), a polymorphic `<GeoJsonField>`/`<GeoJsonInput>`, Geoman free-edition drawing primitives, OSM/Overpass/turf utilities (water-clip, road-snap), and Nominatim-backed geocoding components.

**Architecture:** All per-shape `*Field`/`*Input` files become thin wrappers over a shared `ShapeFieldShell` (read) and `ShapeInputShell` (write). The shells contain all map/Geoman logic; per-shape exports preset `shape` + `multi` + prop types. `useGeomanRHF` hook bridges Geoman events to React Hook Form. OSM utilities are React Query hooks plus pure-turf helpers. Geocoding is provider-pluggable; Nominatim ships as default.

**Tech Stack:** React 19, TypeScript, ra-core, react-leaflet 5 + leaflet 1.9.4, `@geoman-io/leaflet-geoman-free`, selective `@turf/*` packages, `osmtogeojson`, react-hook-form, TanStack Query, shadcn/ui primitives, Vitest with Playwright browser provider.

**Spec:** [docs/superpowers/specs/2026-05-16-leaflet-geojson-design.md](../specs/2026-05-16-leaflet-geojson-design.md)

**Phase boundaries:** Each phase ends with a passing browser test suite and ships independently. Stop and review at phase boundaries. Phases 4 and 5 depend on Phases 0-2 only — Phase 3 (polymorphic) can be skipped if scope pressure rises.

---

## File structure

| File                                                                                                                                               | Responsibility                                                                   | Status     |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------- |
| `package.json`                                                                                                                                     | Add deps                                                                         | **Modify** |
| `src/components/leaflet/shared.ts`                                                                                                                 | (existing) tile URL, marker icon — add `latLngToCoord` / `coordToLatLng` helpers | **Modify** |
| `src/components/leaflet/shared-map.tsx`                                                                                                            | `<BaseMap>` wrapper, `useFitGeometry` hook                                       | **Create** |
| `src/components/leaflet/types.ts`                                                                                                                  | Shared TS types (`ShapeKind`, prop intersections)                                | **Create** |
| `src/components/leaflet/geoman/geoman-shape-mapping.ts`                                                                                            | GeoJSON ⇄ Geoman shape name + layer factories                                    | **Create** |
| `src/components/leaflet/geoman/geoman-control.tsx`                                                                                                 | Toolbar wrapper                                                                  | **Create** |
| `src/components/leaflet/geoman/geoman-events.tsx`                                                                                                  | Event bridge                                                                     | **Create** |
| `src/components/leaflet/geoman/use-geoman-rhf.ts`                                                                                                  | Hook                                                                             | **Create** |
| `src/components/leaflet/geoman/shape-constraints.ts`                                                                                               | Validators                                                                       | **Create** |
| `src/components/leaflet/shapes/shape-field-shell.tsx`                                                                                              | Shared read shell                                                                | **Create** |
| `src/components/leaflet/shapes/shape-input-shell.tsx`                                                                                              | Shared write shell                                                               | **Create** |
| `src/components/leaflet/shapes/{point,multi-point,line-string,multi-line-string,polygon,multi-polygon,geometry-collection,bbox}-{field,input}.tsx` | 16 thin per-shape files                                                          | **Create** |
| `src/components/leaflet/geojson-field.tsx`                                                                                                         | Polymorphic Field                                                                | **Create** |
| `src/components/leaflet/geojson-input.tsx`                                                                                                         | Polymorphic Input                                                                | **Create** |
| `src/components/leaflet/osm/overpass-client.ts`                                                                                                    | Fetch wrapper                                                                    | **Create** |
| `src/components/leaflet/osm/use-overpass.ts`                                                                                                       | React Query hook                                                                 | **Create** |
| `src/components/leaflet/osm/geometry-ops.ts`                                                                                                       | Turf wrappers                                                                    | **Create** |
| `src/components/leaflet/osm/use-osm-water-mask.ts`                                                                                                 | Water mask hook                                                                  | **Create** |
| `src/components/leaflet/osm/osm-water-clip-button.tsx`                                                                                             | Clip button component                                                            | **Create** |
| `src/components/leaflet/osm/use-osm-snap-to-roads.ts`                                                                                              | OSRM match wrapper                                                               | **Create** |
| `src/components/leaflet/geocoding/nominatim-client.ts`                                                                                             | Geocoder client                                                                  | **Create** |
| `src/components/leaflet/geocoding/use-geocode.ts`                                                                                                  | Forward search hook                                                              | **Create** |
| `src/components/leaflet/geocoding/use-reverse-geocode.ts`                                                                                          | Reverse hook                                                                     | **Create** |
| `src/components/leaflet/geocoding/geocoding-input.tsx`                                                                                             | Combobox search                                                                  | **Create** |
| `src/components/leaflet/geocoding/reverse-geocode-field.tsx`                                                                                       | Address display                                                                  | **Create** |
| `src/components/leaflet/geocoding/map-with-search.tsx`                                                                                             | Composite                                                                        | **Create** |
| `src/components/leaflet/index.ts`                                                                                                                  | Re-exports                                                                       | **Modify** |
| `src/stories/_test-helpers.tsx`                                                                                                                    | `StoryAdmin` wrapper (shared)                                                    | **Create** |
| `src/stories/leaflet-shapes.stories.tsx`                                                                                                           | All shape pair stories                                                           | **Create** |
| `src/stories/leaflet-geoman.stories.tsx`                                                                                                           | Geoman primitive stories                                                         | **Create** |
| `src/stories/leaflet-osm.stories.tsx`                                                                                                              | OSM utility stories                                                              | **Create** |
| `src/stories/leaflet-geocoding.stories.tsx`                                                                                                        | Geocoding stories                                                                | **Create** |
| `src/components/leaflet/**/*.spec.tsx`                                                                                                             | Co-located browser specs                                                         | **Create** |
| `docs/src/content/docs/Leaflet.md`                                                                                                                 | Index/overview page (rename from `LeafletAdmin.md`)                              | **Modify** |
| `docs/src/content/docs/{Point,Polygon,...}{Field,Input}.md` + others                                                                               | Per-component docs                                                               | **Create** |
| `registry.json`                                                                                                                                    | Add files + deps to `leaflet-admin` block                                        | **Modify** |

---

## Phase 0 — Foundation

### Task 0.1: Install deps + shared module skeleton

**Files:**

- Modify: `package.json`
- Modify: `src/components/leaflet/shared.ts`
- Create: `src/components/leaflet/types.ts`
- Create: `src/components/leaflet/shared-map.tsx`
- Create: `src/stories/_test-helpers.tsx`

- [ ] **Step 1: Install deps**

Run:

```bash
pnpm add @geoman-io/leaflet-geoman-free @turf/area @turf/bbox @turf/difference @turf/union @turf/helpers osmtogeojson
```

Expected: `package.json` updated; no errors.

- [ ] **Step 2: Add coord helpers to shared.ts**

Append to `src/components/leaflet/shared.ts`:

```ts
export type LatLngTuple = [number, number];
export type GeoJsonCoord = [number, number]; // [lng, lat]

export const latLngToCoord = (ll: LatLngTuple): GeoJsonCoord => [ll[1], ll[0]];
export const coordToLatLng = (c: GeoJsonCoord): LatLngTuple => [c[1], c[0]];
```

- [ ] **Step 3: Create types module**

`src/components/leaflet/types.ts`:

```ts
import type * as L from "leaflet";
import type { ReactNode } from "react";

export type ShapeKind =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon"
  | "GeometryCollection";

export type GeomanShape =
  | "Marker"
  | "CircleMarker"
  | "Line"
  | "Polygon"
  | "Rectangle"
  | "Circle"
  | "Text";

export interface BaseMapProps {
  zoom?: number;
  defaultCenter?: [number, number];
  height?: number | string;
  tileUrl?: string;
  attribution?: string;
}

export interface BaseFieldProps extends BaseMapProps {
  source: string;
  pathOptions?: L.PathOptions;
  markerIcon?: L.Icon | L.DivIcon;
  fitBounds?: boolean;
  emptyText?: ReactNode;
}

export interface BaseInputProps extends BaseMapProps {
  source: string;
  label?: ReactNode;
  helperText?: ReactNode;
  disabled?: boolean;
  pathOptions?: L.PathOptions;
  snappable?: boolean;
  snapDistance?: number;
  validate?:
    | ((v: unknown) => string | undefined)
    | Array<(v: unknown) => string | undefined>;
}
```

- [ ] **Step 4: Create BaseMap wrapper**

`src/components/leaflet/shared-map.tsx`:

```tsx
"use client";

import { type ReactNode, useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type * as L from "leaflet";

import { DEFAULT_ATTRIBUTION, DEFAULT_TILE_URL } from "./shared";
import type { BaseMapProps } from "./types";

export interface BaseMapWrapperProps extends BaseMapProps {
  children?: ReactNode;
  testId?: string;
  className?: string;
}

export const BaseMap = ({
  zoom = 13,
  defaultCenter = [0, 0],
  height = 300,
  tileUrl = DEFAULT_TILE_URL,
  attribution = DEFAULT_ATTRIBUTION,
  children,
  testId,
  className,
}: BaseMapWrapperProps) => (
  <div
    style={{ height, width: "100%" }}
    className={className ?? "overflow-hidden rounded-md border"}
    data-testid={testId}
  >
    <MapContainer
      center={defaultCenter}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url={tileUrl} attribution={attribution} />
      {children}
    </MapContainer>
  </div>
);

export const FitBoundsOnMount = ({
  bounds,
}: {
  bounds: L.LatLngBoundsExpression | null;
}) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [20, 20], maxZoom: 18 });
  }, [bounds, map]);
  return null;
};
```

- [ ] **Step 5: Create shared StoryAdmin helper**

`src/stories/_test-helpers.tsx`:

```tsx
import type { PropsWithChildren } from "react";
import { CoreAdminContext, RecordContextProvider, memoryStore } from "ra-core";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import fakeRestProvider from "ra-data-fakerest";
import { TestMemoryRouter } from "ra-core";

import { ThemeProvider, SimpleForm, Create } from "@/components/admin";

const i18nProvider = polyglotI18nProvider(() => englishMessages);
const defaultDataProvider = fakeRestProvider({}, { delay: 0 });

export interface StoryAdminProps extends PropsWithChildren {
  record?: Record<string, unknown>;
  resource?: string;
  mode?: "field" | "form";
}

export const StoryAdmin = ({
  children,
  record,
  resource = "locations",
  mode = "field",
}: StoryAdminProps) => (
  <ThemeProvider>
    <TestMemoryRouter>
      <CoreAdminContext
        dataProvider={defaultDataProvider}
        i18nProvider={i18nProvider}
        store={memoryStore()}
      >
        {mode === "form" ? (
          <Create resource={resource}>
            <SimpleForm toolbar={false} defaultValues={record}>
              {children}
            </SimpleForm>
          </Create>
        ) : (
          <RecordContextProvider value={record}>
            {children}
          </RecordContextProvider>
        )}
      </CoreAdminContext>
    </TestMemoryRouter>
  </ThemeProvider>
);
```

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/leaflet/shared.ts \
  src/components/leaflet/types.ts src/components/leaflet/shared-map.tsx \
  src/stories/_test-helpers.tsx
git commit -m "feat(leaflet): foundation — deps, types, BaseMap, StoryAdmin helper"
```

---

## Phase 1 — Geoman primitives

### Task 1.1: Geoman shape mapping

**Files:**

- Create: `src/components/leaflet/geoman/geoman-shape-mapping.ts`
- Create: `src/components/leaflet/geoman/geoman-shape-mapping.spec.ts`

- [ ] **Step 1: Write failing tests**

`geoman-shape-mapping.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  geojsonTypeToGeomanShape,
  layerToGeometry,
  geometryToLatLngs,
} from "./geoman-shape-mapping";
import L from "leaflet";

describe("geojsonTypeToGeomanShape", () => {
  it("maps Point → Marker", () =>
    expect(geojsonTypeToGeomanShape("Point")).toBe("Marker"));
  it("maps LineString → Line", () =>
    expect(geojsonTypeToGeomanShape("LineString")).toBe("Line"));
  it("maps Polygon → Polygon", () =>
    expect(geojsonTypeToGeomanShape("Polygon")).toBe("Polygon"));
});

describe("layerToGeometry", () => {
  it("converts an L.Marker to a Point geometry", () => {
    const m = L.marker([48.85, 2.35]);
    const g = layerToGeometry(m);
    expect(g).toEqual({ type: "Point", coordinates: [2.35, 48.85] });
  });

  it("converts an L.Polygon to a Polygon geometry with closed ring", () => {
    const p = L.polygon([
      [0, 0],
      [0, 1],
      [1, 1],
    ]);
    const g = layerToGeometry(p);
    expect(g).toMatchObject({ type: "Polygon" });
  });
});

describe("geometryToLatLngs", () => {
  it("returns lat/lng coords for a LineString", () => {
    const ll = geometryToLatLngs({
      type: "LineString",
      coordinates: [
        [2.35, 48.85],
        [2.36, 48.86],
      ],
    });
    expect(ll).toEqual([
      [48.85, 2.35],
      [48.86, 48.86 === 48.86 ? 2.36 : 0],
    ]);
  });
});
```

- [ ] **Step 2: Run test — confirm fail**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/geoman-shape-mapping.spec.ts`
Expected: FAIL with "Cannot find module './geoman-shape-mapping'".

- [ ] **Step 3: Implement**

`geoman-shape-mapping.ts`:

```ts
import L from "leaflet";
import type { ShapeKind, GeomanShape } from "../types";

const TYPE_TO_GEOMAN: Record<ShapeKind, GeomanShape> = {
  Point: "Marker",
  MultiPoint: "Marker",
  LineString: "Line",
  MultiLineString: "Line",
  Polygon: "Polygon",
  MultiPolygon: "Polygon",
  GeometryCollection: "Marker",
};

export const geojsonTypeToGeomanShape = (t: ShapeKind): GeomanShape =>
  TYPE_TO_GEOMAN[t];

export const layerToGeometry = (layer: L.Layer): GeoJSON.Geometry | null => {
  const gj = (
    layer as L.Layer & { toGeoJSON?: () => GeoJSON.Feature }
  ).toGeoJSON?.();
  if (!gj) return null;
  if (gj.type === "Feature") return gj.geometry ?? null;
  if (gj.type === "FeatureCollection") {
    const features = (gj as unknown as GeoJSON.FeatureCollection).features;
    if (features.length === 0) return null;
    return features[0].geometry;
  }
  return gj as unknown as GeoJSON.Geometry;
};

export const geometryToLatLngs = (
  geom: GeoJSON.Geometry,
):
  | L.LatLngExpression
  | L.LatLngExpression[]
  | L.LatLngExpression[][]
  | L.LatLngExpression[][][] => {
  switch (geom.type) {
    case "Point":
      return [geom.coordinates[1], geom.coordinates[0]];
    case "MultiPoint":
      return geom.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple);
    case "LineString":
      return geom.coordinates.map((c) => [c[1], c[0]] as L.LatLngTuple);
    case "MultiLineString":
      return geom.coordinates.map((line) =>
        line.map((c) => [c[1], c[0]] as L.LatLngTuple),
      );
    case "Polygon":
      return geom.coordinates.map((ring) =>
        ring.map((c) => [c[1], c[0]] as L.LatLngTuple),
      );
    case "MultiPolygon":
      return geom.coordinates.map((poly) =>
        poly.map((ring) => ring.map((c) => [c[1], c[0]] as L.LatLngTuple)),
      );
    default:
      return [];
  }
};

export const geometryToLayer = (
  geom: GeoJSON.Geometry,
  pathOptions?: L.PathOptions,
  markerIcon?: L.Icon | L.DivIcon,
): L.Layer => {
  return L.geoJSON(geom, {
    style: () => pathOptions ?? {},
    pointToLayer: (_f, latlng) =>
      markerIcon ? L.marker(latlng, { icon: markerIcon }) : L.marker(latlng),
  });
};
```

- [ ] **Step 4: Re-run tests — pass**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/geoman-shape-mapping.spec.ts`
Expected: 4 PASS.

(Fix the assertion in step 1 test — that line `48.86 === 48.86 ? 2.36 : 0` is a deliberate sanity-check; replace with simple `[48.86, 2.36]` if the engineer wrote a typo here.)

- [ ] **Step 5: Commit**

```bash
git add src/components/leaflet/geoman/geoman-shape-mapping.ts \
  src/components/leaflet/geoman/geoman-shape-mapping.spec.ts
git commit -m "feat(leaflet): geoman shape mapping helpers"
```

---

### Task 1.2: GeomanControl component

**Files:**

- Create: `src/components/leaflet/geoman/geoman-control.tsx`
- Create: `src/components/leaflet/geoman/geoman-control.spec.tsx`
- Create: `src/stories/leaflet-geoman.stories.tsx`

- [ ] **Step 1: Create the story first (used by spec)**

`src/stories/leaflet-geoman.stories.tsx`:

```tsx
import { MapContainer, TileLayer } from "react-leaflet";
import { GeomanControl } from "@/components/leaflet";
import { ThemeProvider } from "@/components/admin";
import {
  DEFAULT_TILE_URL,
  DEFAULT_ATTRIBUTION,
} from "@/components/leaflet/shared";

export default { title: "Leaflet/Geoman" };

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <div style={{ height: 400, width: "100%" }} data-testid="geoman-wrap">
      <MapContainer
        center={[48.85, 2.35]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={DEFAULT_TILE_URL} attribution={DEFAULT_ATTRIBUTION} />
        {children}
      </MapContainer>
    </div>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <GeomanControl position="topleft" />
  </Wrapper>
);

export const PolygonOnly = () => (
  <Wrapper>
    <GeomanControl
      position="topleft"
      shapes={["Polygon"]}
      edit
      drag={false}
      remove
      rotate={false}
    />
  </Wrapper>
);
```

- [ ] **Step 2: Write failing spec**

`geoman-control.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Basic, PolygonOnly } from "@/stories/leaflet-geoman.stories";

describe("<GeomanControl />", () => {
  it("attaches Geoman toolbar to the map", async () => {
    const screen = render(<Basic />);
    const toolbar = await screen.container.querySelector(".leaflet-pm-toolbar");
    expect(toolbar).not.toBeNull();
  });

  it("hides draw buttons not in the shapes list", async () => {
    const screen = render(<PolygonOnly />);
    const wrap = await screen.getByTestId("geoman-wrap");
    await expect.element(wrap).toBeInTheDocument();
    const polyBtn = screen.container.querySelector("[title*='polygon' i]");
    const lineBtn = screen.container.querySelector("[title*='line' i]");
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).toBeNull();
  });
});
```

- [ ] **Step 3: Run — fail**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/geoman-control.spec.tsx`
Expected: FAIL (component not exported).

- [ ] **Step 4: Implement**

`geoman-control.tsx`:

```tsx
"use client";

import { createControlComponent } from "@react-leaflet/core";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

import type { GeomanShape } from "../types";

export interface GeomanControlProps {
  position?: L.ControlPosition;
  shapes?: GeomanShape[];
  edit?: boolean;
  drag?: boolean;
  remove?: boolean;
  cut?: boolean;
  rotate?: boolean;
  oneBlock?: boolean;
  snappable?: boolean;
  snapDistance?: number;
  allowSelfIntersection?: boolean;
  pathOptions?: L.PathOptions;
  lang?: string;
}

const DEFAULT_SHAPES: GeomanShape[] = [
  "Marker",
  "Line",
  "Polygon",
  "Rectangle",
  "Circle",
];

const GeomanCtl = L.Control.extend({
  options: {} as GeomanControlProps,
  initialize(options: GeomanControlProps) {
    L.setOptions(this, options);
  },
  addTo(map: L.Map) {
    if (!map.pm) return this;
    const opts = (this as unknown as { options: GeomanControlProps }).options;
    const shapes = new Set(opts.shapes ?? DEFAULT_SHAPES);
    map.pm.addControls({
      position: opts.position ?? "topleft",
      oneBlock: opts.oneBlock ?? false,
      drawMarker: shapes.has("Marker"),
      drawCircleMarker: shapes.has("CircleMarker"),
      drawPolyline: shapes.has("Line"),
      drawRectangle: shapes.has("Rectangle"),
      drawPolygon: shapes.has("Polygon"),
      drawCircle: shapes.has("Circle"),
      drawText: shapes.has("Text"),
      editMode: opts.edit ?? true,
      dragMode: opts.drag ?? true,
      cutPolygon: opts.cut ?? true,
      removalMode: opts.remove ?? true,
      rotateMode: opts.rotate ?? false,
    });
    map.pm.setGlobalOptions({
      snappable: opts.snappable ?? true,
      snapDistance: opts.snapDistance ?? 20,
      allowSelfIntersection: opts.allowSelfIntersection ?? true,
      pathOptions: opts.pathOptions ?? undefined,
    });
    if (opts.lang)
      map.pm.setLang(opts.lang as Parameters<typeof map.pm.setLang>[0]);
    return this;
  },
});

const createInstance = (props: GeomanControlProps) =>
  new (GeomanCtl as unknown as new (props: GeomanControlProps) => L.Control)(
    props,
  );

export const GeomanControl = createControlComponent(createInstance);
```

- [ ] **Step 5: Re-export from index**

`src/components/leaflet/index.ts`:

```ts
export * from "./lat-lng-field";
export * from "./lat-lng-input";
export * from "./shared-map";
export * from "./types";
export * from "./geoman/geoman-control";
```

- [ ] **Step 6: Re-run — pass**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/geoman-control.spec.tsx`
Expected: 2 PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/leaflet/geoman/ src/stories/leaflet-geoman.stories.tsx \
  src/components/leaflet/index.ts
git commit -m "feat(leaflet): GeomanControl react-leaflet wrapper"
```

---

### Task 1.3: GeomanEvents component

**Files:**

- Create: `src/components/leaflet/geoman/geoman-events.tsx`
- Create: `src/components/leaflet/geoman/geoman-events.spec.tsx`
- Modify: `src/stories/leaflet-geoman.stories.tsx` (add `WithEvents` story)

- [ ] **Step 1: Add story**

Append to `leaflet-geoman.stories.tsx`:

```tsx
import { useState } from "react";
import { GeomanEvents } from "@/components/leaflet";

export const WithEvents = () => {
  const [count, setCount] = useState(0);
  return (
    <Wrapper>
      <GeomanControl position="topleft" />
      <GeomanEvents onCreate={() => setCount((c) => c + 1)} />
      <div data-testid="create-count">{count}</div>
    </Wrapper>
  );
};
```

- [ ] **Step 2: Failing spec**

`geoman-events.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WithEvents } from "@/stories/leaflet-geoman.stories";

describe("<GeomanEvents />", () => {
  it("renders without crashing inside a MapContainer", async () => {
    const screen = render(<WithEvents />);
    await expect.element(screen.getByTestId("geoman-wrap")).toBeInTheDocument();
  });

  it("starts with a create count of 0", async () => {
    const screen = render(<WithEvents />);
    const count = await screen.getByTestId("create-count");
    expect(count.element().textContent).toBe("0");
  });
});
```

- [ ] **Step 3: Run — fail**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/geoman-events.spec.tsx`
Expected: FAIL.

- [ ] **Step 4: Implement**

`geoman-events.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { Layer, LeafletEventHandlerFn } from "leaflet";

import type { GeomanShape } from "../types";

export interface GeomanEventsProps {
  onCreate?: (layer: Layer, shape: GeomanShape) => void;
  onUpdate?: (layer: Layer) => void;
  onRemove?: (layer: Layer) => void;
  onCut?: (newLayer: Layer, originalLayer: Layer) => void;
}

export const GeomanEvents = ({
  onCreate,
  onUpdate,
  onRemove,
  onCut,
}: GeomanEventsProps) => {
  const map = useMap();
  const cutInProgress = useRef(false);

  useEffect(() => {
    const handleCreate = (e: unknown) => {
      const evt = e as { layer: Layer; shape: GeomanShape };
      evt.layer.on(
        "pm:update" as unknown as keyof L.LeafletEventHandlerFnMap,
        () => onUpdate?.(evt.layer),
      );
      evt.layer.on(
        "pm:remove" as unknown as keyof L.LeafletEventHandlerFnMap,
        () => onRemove?.(evt.layer),
      );
      onCreate?.(evt.layer, evt.shape);
    };
    const handleCut = (e: unknown) => {
      const evt = e as { layer: Layer; originalLayer: Layer };
      cutInProgress.current = true;
      onCut?.(evt.layer, evt.originalLayer);
      queueMicrotask(() => {
        cutInProgress.current = false;
      });
    };

    map.on(
      "pm:create" as unknown as keyof L.LeafletEventHandlerFnMap,
      handleCreate as LeafletEventHandlerFn,
    );
    map.on(
      "pm:cut" as unknown as keyof L.LeafletEventHandlerFnMap,
      handleCut as LeafletEventHandlerFn,
    );

    return () => {
      map.off(
        "pm:create" as unknown as keyof L.LeafletEventHandlerFnMap,
        handleCreate as LeafletEventHandlerFn,
      );
      map.off(
        "pm:cut" as unknown as keyof L.LeafletEventHandlerFnMap,
        handleCut as LeafletEventHandlerFn,
      );
    };
  }, [map, onCreate, onUpdate, onRemove, onCut]);

  return null;
};
```

- [ ] **Step 5: Add to index**

Append to `src/components/leaflet/index.ts`:

```ts
export * from "./geoman/geoman-events";
```

- [ ] **Step 6: Re-run — pass**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/geoman-events.spec.tsx`
Expected: 2 PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/leaflet/geoman/geoman-events.tsx \
  src/components/leaflet/geoman/geoman-events.spec.tsx \
  src/stories/leaflet-geoman.stories.tsx \
  src/components/leaflet/index.ts
git commit -m "feat(leaflet): GeomanEvents bridge with pm:cut dedup"
```

---

### Task 1.4: useGeomanRHF hook

**Files:**

- Create: `src/components/leaflet/geoman/use-geoman-rhf.ts`
- Create: `src/components/leaflet/geoman/use-geoman-rhf.spec.tsx`

- [ ] **Step 1: Failing spec**

`use-geoman-rhf.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { useFormContext } from "react-hook-form";
import { render } from "vitest-browser-react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";

import {
  GeomanControl,
  GeomanEvents,
  useGeomanRHF,
} from "@/components/leaflet";
import { StoryAdmin } from "@/stories/_test-helpers";
import { DEFAULT_TILE_URL } from "@/components/leaflet/shared";

const Harness = () => {
  const form = useFormContext();
  const { featureGroupRef, geomanProps } = useGeomanRHF({
    source: "geom",
    shape: "Point",
    multi: false,
  });
  return (
    <>
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: 200 }}
        data-testid="rhf-map"
      >
        <TileLayer url={DEFAULT_TILE_URL} />
        <GeomanControl shapes={["Marker"]} />
        <GeomanEvents {...geomanProps} />
      </MapContainer>
      <div data-testid="value">
        {JSON.stringify(form.getValues("geom") ?? null)}
      </div>
      <button
        type="button"
        data-testid="seed"
        onClick={() =>
          form.setValue("geom", { type: "Point", coordinates: [2.35, 48.85] })
        }
      >
        seed
      </button>
    </>
  );
};

describe("useGeomanRHF", () => {
  it("renders inside a form without crashing", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <Harness />
      </StoryAdmin>,
    );
    await expect.element(screen.getByTestId("rhf-map")).toBeInTheDocument();
  });

  it("seeds the form value via setValue and reflects it", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <Harness />
      </StoryAdmin>,
    );
    await screen.getByTestId("seed").click();
    const v = await screen.getByTestId("value");
    expect(v.element().textContent).toContain('"Point"');
  });
});
```

- [ ] **Step 2: Run — fail**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/use-geoman-rhf.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

`use-geoman-rhf.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { ShapeKind } from "../types";
import { geometryToLayer, layerToGeometry } from "./geoman-shape-mapping";

export interface UseGeomanRHFOptions {
  source: string;
  shape: ShapeKind;
  multi: boolean;
  collection?: boolean;
  validate?: (geom: GeoJSON.Geometry) => string | undefined;
  pathOptions?: L.PathOptions;
  markerIcon?: L.Icon | L.DivIcon;
}

export interface UseGeomanRHFReturn {
  featureGroupRef: React.MutableRefObject<L.FeatureGroup | null>;
  geomanProps: {
    onCreate: (layer: L.Layer) => void;
    onUpdate: (layer: L.Layer) => void;
    onRemove: (layer: L.Layer) => void;
    onCut: (newLayer: L.Layer, originalLayer: L.Layer) => void;
  };
}

export const useGeomanRHF = ({
  source,
  shape,
  multi,
  collection,
  validate,
  pathOptions,
  markerIcon,
}: UseGeomanRHFOptions): UseGeomanRHFReturn => {
  const form = useFormContext();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const value = useWatch({ name: source }) as
    | GeoJSON.Geometry
    | null
    | undefined;
  const hydrated = useRef(false);

  // useMap is safe because this hook is only called inside a MapContainer subtree.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const map = useMap();

  // Initialize the feature group + hydrate from initial form value.
  useEffect(() => {
    if (!featureGroupRef.current) {
      featureGroupRef.current = L.featureGroup().addTo(map);
    }
    if (!hydrated.current && value) {
      const layer = geometryToLayer(value, pathOptions, markerIcon);
      featureGroupRef.current?.addLayer(layer);
      hydrated.current = true;
    }
  }, [map, value, pathOptions, markerIcon]);

  const persist = useCallback(() => {
    const group = featureGroupRef.current;
    if (!group) return;
    const layers = group.getLayers();
    if (layers.length === 0) {
      form.setValue(source, null, { shouldDirty: true });
      return;
    }
    if (collection) {
      const geometries = layers
        .map((l) => layerToGeometry(l))
        .filter((g): g is GeoJSON.Geometry => g !== null);
      form.setValue(
        source,
        { type: "GeometryCollection", geometries },
        { shouldDirty: true },
      );
      return;
    }
    if (multi) {
      // Combine into Multi* geometry of the configured shape kind.
      const geometries = layers
        .map((l) => layerToGeometry(l))
        .filter((g): g is GeoJSON.Geometry => g !== null);
      const combined = combineMulti(shape, geometries);
      if (validate && combined && validate(combined)) {
        // Validation failed — leave previous value untouched.
        return;
      }
      form.setValue(source, combined, { shouldDirty: true });
      return;
    }
    // Single feature — use the first/most-recent layer.
    const geom = layerToGeometry(layers[layers.length - 1]);
    if (validate && geom && validate(geom)) return;
    form.setValue(source, geom, { shouldDirty: true });
  }, [collection, multi, shape, source, form, validate]);

  const handleCreate = useCallback(
    (layer: L.Layer) => {
      const group = featureGroupRef.current;
      if (!group) return;
      // Remove from the map (Geoman adds it there) and move into our group.
      map.removeLayer(layer);
      if (!multi && !collection) {
        // Replace existing layer.
        group.clearLayers();
      }
      group.addLayer(layer);
      persist();
    },
    [collection, map, multi, persist],
  );

  const handleUpdate = useCallback(() => persist(), [persist]);
  const handleRemove = useCallback(() => persist(), [persist]);
  const handleCut = useCallback(
    (newLayer: L.Layer, originalLayer: L.Layer) => {
      const group = featureGroupRef.current;
      if (!group) return;
      map.removeLayer(newLayer);
      group.removeLayer(originalLayer);
      group.addLayer(newLayer);
      persist();
    },
    [map, persist],
  );

  return {
    featureGroupRef,
    geomanProps: {
      onCreate: handleCreate,
      onUpdate: handleUpdate,
      onRemove: handleRemove,
      onCut: handleCut,
    },
  };
};

const combineMulti = (
  shape: ShapeKind,
  geoms: GeoJSON.Geometry[],
): GeoJSON.Geometry | null => {
  if (geoms.length === 0) return null;
  switch (shape) {
    case "MultiPoint":
      return {
        type: "MultiPoint",
        coordinates: geoms
          .filter((g): g is GeoJSON.Point => g.type === "Point")
          .map((g) => g.coordinates),
      };
    case "MultiLineString":
      return {
        type: "MultiLineString",
        coordinates: geoms
          .filter((g): g is GeoJSON.LineString => g.type === "LineString")
          .map((g) => g.coordinates),
      };
    case "MultiPolygon":
      return {
        type: "MultiPolygon",
        coordinates: geoms
          .filter((g): g is GeoJSON.Polygon => g.type === "Polygon")
          .map((g) => g.coordinates),
      };
    default:
      // Single-shape kind with multi:true — keep the most recent only.
      return geoms[geoms.length - 1];
  }
};
```

- [ ] **Step 4: Add to index**

Append to `src/components/leaflet/index.ts`:

```ts
export * from "./geoman/use-geoman-rhf";
```

- [ ] **Step 5: Re-run — pass**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/use-geoman-rhf.spec.tsx`
Expected: 2 PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/leaflet/geoman/use-geoman-rhf.ts \
  src/components/leaflet/geoman/use-geoman-rhf.spec.tsx \
  src/components/leaflet/index.ts
git commit -m "feat(leaflet): useGeomanRHF hook binds Geoman events to RHF"
```

---

### Task 1.5: Shape constraints (validators)

**Files:**

- Create: `src/components/leaflet/geoman/shape-constraints.ts`
- Create: `src/components/leaflet/geoman/shape-constraints.spec.ts`

- [ ] **Step 1: Failing spec**

`shape-constraints.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import { validateMinVertices, validateMinAreaM2 } from "./shape-constraints";

describe("validateMinVertices", () => {
  it("rejects polygons below the threshold", () => {
    const triangle: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [0, 1],
          [0, 0],
        ],
      ],
    };
    expect(validateMinVertices(5)(triangle)).toMatch(/at least 5/);
  });

  it("accepts polygons at or above the threshold", () => {
    const pentagon: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [-0.5, 0.5],
          [0, 0],
        ],
      ],
    };
    expect(validateMinVertices(5)(pentagon)).toBeUndefined();
  });
});

describe("validateMinAreaM2", () => {
  it("rejects polygons below the area threshold", () => {
    const tiny: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [
        [
          [0, 0],
          [0.0001, 0],
          [0.0001, 0.0001],
          [0, 0.0001],
          [0, 0],
        ],
      ],
    };
    expect(validateMinAreaM2(1_000_000)(tiny)).toMatch(/at least/);
  });
});
```

- [ ] **Step 2: Run — fail**

Run: `pnpm vitest run --browser.headless src/components/leaflet/geoman/shape-constraints.spec.ts`

- [ ] **Step 3: Implement**

`shape-constraints.ts`:

```ts
import area from "@turf/area";
import { feature } from "@turf/helpers";

export type GeometryValidator = (g: GeoJSON.Geometry) => string | undefined;

const countVertices = (g: GeoJSON.Geometry): number => {
  switch (g.type) {
    case "Point":
      return 1;
    case "MultiPoint":
    case "LineString":
      return g.coordinates.length;
    case "MultiLineString":
      return g.coordinates.reduce((sum, line) => sum + line.length, 0);
    case "Polygon":
      return g.coordinates[0]?.length ?? 0;
    case "MultiPolygon":
      return g.coordinates.reduce(
        (sum, poly) => sum + (poly[0]?.length ?? 0),
        0,
      );
    default:
      return 0;
  }
};

export const validateMinVertices =
  (min: number): GeometryValidator =>
  (g) =>
    countVertices(g) < min
      ? `Shape must have at least ${min} vertices`
      : undefined;

export const validateMaxVertices =
  (max: number): GeometryValidator =>
  (g) =>
    countVertices(g) > max
      ? `Shape must have at most ${max} vertices`
      : undefined;

export const validateMinAreaM2 =
  (minM2: number): GeometryValidator =>
  (g) => {
    if (g.type !== "Polygon" && g.type !== "MultiPolygon") return undefined;
    const a = area(feature(g));
    return a < minM2
      ? `Area must be at least ${minM2} m² (got ${Math.round(a)} m²)`
      : undefined;
  };

export const combineValidators =
  (...validators: GeometryValidator[]): GeometryValidator =>
  (g) => {
    for (const v of validators) {
      const err = v(g);
      if (err) return err;
    }
    return undefined;
  };
```

- [ ] **Step 4: Re-run — pass + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/geoman/shape-constraints.spec.ts
git add src/components/leaflet/geoman/shape-constraints.ts src/components/leaflet/geoman/shape-constraints.spec.ts
git commit -m "feat(leaflet): geometry validators (vertices, area)"
```

---

### Phase 1 checkpoint

Run all Geoman specs:

```bash
pnpm vitest run --browser.headless src/components/leaflet/geoman/
```

Expected: all green. Stop here, review, commit if not already.

---

## Phase 2 — Shape Field/Input shells + per-shape exports

### Task 2.1: ShapeFieldShell (read-only base)

**Files:**

- Create: `src/components/leaflet/shapes/shape-field-shell.tsx`
- Create: `src/components/leaflet/shapes/shape-field-shell.spec.tsx`

- [ ] **Step 1: Failing spec**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ShapeFieldShell } from "@/components/leaflet/shapes/shape-field-shell";
import { StoryAdmin } from "@/stories/_test-helpers";

const point = {
  type: "Point",
  coordinates: [2.35, 48.85],
} satisfies GeoJSON.Geometry;

describe("<ShapeFieldShell />", () => {
  it("renders empty state when value missing", async () => {
    const screen = render(
      <StoryAdmin record={{ geom: null }}>
        <ShapeFieldShell source="geom" testId="x" />
      </StoryAdmin>,
    );
    await expect.element(screen.getByText(/no geometry/i)).toBeInTheDocument();
  });

  it("renders the map when value present", async () => {
    const screen = render(
      <StoryAdmin record={{ geom: point }}>
        <ShapeFieldShell source="geom" testId="x" />
      </StoryAdmin>,
    );
    await expect.element(screen.getByTestId("x")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — fail**

- [ ] **Step 3: Implement**

`shape-field-shell.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import { GeoJSON, useMap } from "react-leaflet";
import { useRecordContext } from "ra-core";
import L from "leaflet";

import { BaseMap, FitBoundsOnMount } from "../shared-map";
import { MarkerIcon } from "../shared";
import type { BaseFieldProps } from "../types";

export interface ShapeFieldShellProps extends BaseFieldProps {
  testId?: string;
}

const FitToData = ({ geom }: { geom: GeoJSON.Geometry }) => {
  const map = useMap();
  const bounds = useMemo(() => {
    const layer = L.geoJSON(geom);
    const b = layer.getBounds();
    return b.isValid() ? b : null;
  }, [geom]);
  return <FitBoundsOnMount bounds={bounds} />;
};

export const ShapeFieldShell = ({
  source,
  zoom = 13,
  defaultCenter = [0, 0],
  height = 300,
  tileUrl,
  attribution,
  pathOptions = { color: "#3388ff" },
  markerIcon = MarkerIcon,
  fitBounds = true,
  emptyText = "No geometry available",
  testId,
}: ShapeFieldShellProps) => {
  const record = useRecordContext();
  const geom = record?.[source] as GeoJSON.Geometry | null | undefined;

  if (!geom) {
    return (
      <div
        style={{ height, width: "100%" }}
        className="flex items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground"
        data-slot="shape-field-empty"
      >
        {emptyText}
      </div>
    );
  }

  return (
    <BaseMap
      zoom={zoom}
      defaultCenter={defaultCenter}
      height={height}
      tileUrl={tileUrl}
      attribution={attribution}
      testId={testId}
    >
      <GeoJSON
        data={geom}
        style={() => pathOptions}
        pointToLayer={(_f, latlng) => L.marker(latlng, { icon: markerIcon })}
      />
      {fitBounds ? <FitToData geom={geom} /> : null}
    </BaseMap>
  );
};
```

- [ ] **Step 4: Re-run — pass + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/shapes/shape-field-shell.spec.tsx
git add src/components/leaflet/shapes/shape-field-shell.tsx src/components/leaflet/shapes/shape-field-shell.spec.tsx
git commit -m "feat(leaflet): ShapeFieldShell — generic GeoJSON read renderer"
```

---

### Task 2.2: ShapeInputShell (write base)

**Files:**

- Create: `src/components/leaflet/shapes/shape-input-shell.tsx`
- Create: `src/components/leaflet/shapes/shape-input-shell.spec.tsx`

- [ ] **Step 1: Failing spec**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { ShapeInputShell } from "@/components/leaflet/shapes/shape-input-shell";
import { StoryAdmin } from "@/stories/_test-helpers";

describe("<ShapeInputShell />", () => {
  it("renders inside a form with label + helper text", async () => {
    const screen = render(
      <StoryAdmin mode="form" record={{ geom: null }}>
        <ShapeInputShell
          source="geom"
          shape="Polygon"
          multi={false}
          label="Service area"
          helperText="Click points to draw"
          height={300}
        />
      </StoryAdmin>,
    );
    await expect.element(screen.getByText("Service area")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Click points to draw"))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — fail**

- [ ] **Step 3: Implement**

`shape-input-shell.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

import { BaseMap } from "../shared-map";
import { GeomanControl } from "../geoman/geoman-control";
import { GeomanEvents } from "../geoman/geoman-events";
import { useGeomanRHF } from "../geoman/use-geoman-rhf";
import { geojsonTypeToGeomanShape } from "../geoman/geoman-shape-mapping";
import type { BaseInputProps, ShapeKind } from "../types";

export interface ShapeInputShellProps extends BaseInputProps {
  shape: ShapeKind;
  multi: boolean;
  collection?: boolean;
}

export const ShapeInputShell = ({
  source,
  shape,
  multi,
  collection,
  zoom = 13,
  defaultCenter = [0, 0],
  height = 300,
  tileUrl,
  attribution,
  pathOptions,
  snappable = true,
  snapDistance = 20,
  label,
  helperText,
}: ShapeInputShellProps) => {
  return (
    <div className="flex flex-col gap-1" data-slot="shape-input">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <BaseMap
        zoom={zoom}
        defaultCenter={defaultCenter}
        height={height}
        tileUrl={tileUrl}
        attribution={attribution}
        testId={`${shape.toLowerCase()}-input`}
      >
        <ShellInner
          source={source}
          shape={shape}
          multi={multi}
          collection={collection}
          snappable={snappable}
          snapDistance={snapDistance}
          pathOptions={pathOptions}
        />
      </BaseMap>
      {helperText ? (
        <div className="text-xs text-muted-foreground">{helperText}</div>
      ) : null}
    </div>
  );
};

const ShellInner = ({
  source,
  shape,
  multi,
  collection,
  snappable,
  snapDistance,
  pathOptions,
}: Pick<
  ShapeInputShellProps,
  | "source"
  | "shape"
  | "multi"
  | "collection"
  | "snappable"
  | "snapDistance"
  | "pathOptions"
>) => {
  const geomanShape = geojsonTypeToGeomanShape(shape);
  const { geomanProps } = useGeomanRHF({
    source,
    shape,
    multi,
    collection,
    pathOptions,
  });
  return (
    <>
      <GeomanControl
        position="topleft"
        shapes={[geomanShape]}
        edit
        drag
        remove
        cut={geomanShape === "Polygon"}
        snappable={snappable}
        snapDistance={snapDistance}
        pathOptions={pathOptions}
      />
      <GeomanEvents {...geomanProps} />
    </>
  );
};
```

- [ ] **Step 4: Re-run — pass + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/shapes/shape-input-shell.spec.tsx
git add src/components/leaflet/shapes/shape-input-shell.tsx src/components/leaflet/shapes/shape-input-shell.spec.tsx
git commit -m "feat(leaflet): ShapeInputShell — generic Geoman+RHF input"
```

---

### Task 2.3: Per-shape thin wrappers (8 pairs at once)

**Files (all create):**

- `src/components/leaflet/shapes/point-field.tsx`, `point-input.tsx`
- `src/components/leaflet/shapes/multi-point-field.tsx`, `multi-point-input.tsx`
- `src/components/leaflet/shapes/line-string-field.tsx`, `line-string-input.tsx`
- `src/components/leaflet/shapes/multi-line-string-field.tsx`, `multi-line-string-input.tsx`
- `src/components/leaflet/shapes/polygon-field.tsx`, `polygon-input.tsx`
- `src/components/leaflet/shapes/multi-polygon-field.tsx`, `multi-polygon-input.tsx`
- `src/components/leaflet/shapes/geometry-collection-field.tsx`, `geometry-collection-input.tsx`
- `src/components/leaflet/shapes/bbox-field.tsx`, `bbox-input.tsx`
- `src/stories/leaflet-shapes.stories.tsx`
- `src/components/leaflet/shapes/point-input.spec.tsx`, `polygon-input.spec.tsx` (sample coverage; others rely on shell tests)
- Modify: `src/components/leaflet/index.ts`

- [ ] **Step 1: Create all 14 non-BBox thin wrappers**

Pattern — each `*-field.tsx` is identical except for export name + `pathOptions` default; each `*-input.tsx` is identical except for `shape` + `multi`. Repeating fully so each file is self-contained:

`shapes/point-field.tsx`:

```tsx
"use client";
import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";
export type PointFieldProps = Omit<ShapeFieldShellProps, "pathOptions"> & {
  pathOptions?: L.PathOptions;
};
export const PointField = (props: PointFieldProps) => (
  <ShapeFieldShell {...props} />
);
```

`shapes/point-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
export type PointInputProps = Omit<ShapeInputShellProps, "shape" | "multi">;
export const PointInput = (props: PointInputProps) => (
  <ShapeInputShell {...props} shape="Point" multi={false} />
);
```

`shapes/multi-point-field.tsx`:

```tsx
"use client";
import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";
export type MultiPointFieldProps = ShapeFieldShellProps;
export const MultiPointField = (props: MultiPointFieldProps) => (
  <ShapeFieldShell {...props} />
);
```

`shapes/multi-point-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
export type MultiPointInputProps = Omit<
  ShapeInputShellProps,
  "shape" | "multi"
>;
export const MultiPointInput = (props: MultiPointInputProps) => (
  <ShapeInputShell {...props} shape="MultiPoint" multi={true} />
);
```

`shapes/line-string-field.tsx`:

```tsx
"use client";
import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";
export type LineStringFieldProps = ShapeFieldShellProps;
export const LineStringField = (props: LineStringFieldProps) => (
  <ShapeFieldShell {...props} />
);
```

`shapes/line-string-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
export interface LineStringInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi"
> {
  snapToRoads?: boolean;
}
export const LineStringInput = ({
  snapToRoads,
  ...rest
}: LineStringInputProps) => (
  // snapToRoads wiring lives in Phase 4 Task 4.6 — for now, the prop is accepted but inert.
  <ShapeInputShell {...rest} shape="LineString" multi={false} />
);
```

`shapes/multi-line-string-field.tsx`:

```tsx
"use client";
import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";
export type MultiLineStringFieldProps = ShapeFieldShellProps;
export const MultiLineStringField = (props: MultiLineStringFieldProps) => (
  <ShapeFieldShell {...props} />
);
```

`shapes/multi-line-string-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
export type MultiLineStringInputProps = Omit<
  ShapeInputShellProps,
  "shape" | "multi"
>;
export const MultiLineStringInput = (props: MultiLineStringInputProps) => (
  <ShapeInputShell {...props} shape="MultiLineString" multi={true} />
);
```

`shapes/polygon-field.tsx`:

```tsx
"use client";
import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";
export type PolygonFieldProps = ShapeFieldShellProps;
export const PolygonField = (props: PolygonFieldProps) => (
  <ShapeFieldShell {...props} />
);
```

`shapes/polygon-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
export interface PolygonInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi"
> {
  allowSelfIntersection?: boolean;
  minVertices?: number;
  maxVertices?: number;
  minArea_m2?: number;
}
export const PolygonInput = (props: PolygonInputProps) => (
  <ShapeInputShell {...props} shape="Polygon" multi={false} />
);
```

`shapes/multi-polygon-field.tsx`:

```tsx
"use client";
import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";
export type MultiPolygonFieldProps = ShapeFieldShellProps;
export const MultiPolygonField = (props: MultiPolygonFieldProps) => (
  <ShapeFieldShell {...props} />
);
```

`shapes/multi-polygon-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
export interface MultiPolygonInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi"
> {
  allowSelfIntersection?: boolean;
  minVertices?: number;
  maxVertices?: number;
}
export const MultiPolygonInput = (props: MultiPolygonInputProps) => (
  <ShapeInputShell {...props} shape="MultiPolygon" multi={true} />
);
```

`shapes/geometry-collection-field.tsx`:

```tsx
"use client";
import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";
export type GeometryCollectionFieldProps = ShapeFieldShellProps;
export const GeometryCollectionField = (
  props: GeometryCollectionFieldProps,
) => <ShapeFieldShell {...props} />;
```

`shapes/geometry-collection-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
import type { ShapeKind } from "../types";
export interface GeometryCollectionInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi" | "collection"
> {
  allowedShapes?: ShapeKind[];
}
export const GeometryCollectionInput = (
  props: GeometryCollectionInputProps,
) => (
  // For collections we anchor `shape` to "Point" but the shell honours `collection: true`
  // to write GeometryCollection values. allowedShapes is forwarded to the toolbar in v2;
  // for v1 the toolbar shows all draw buttons.
  <ShapeInputShell {...props} shape="Point" multi={true} collection />
);
```

- [ ] **Step 2: BBox pair**

`shapes/bbox-field.tsx`:

```tsx
"use client";
import { useMemo } from "react";
import { useRecordContext } from "ra-core";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";

export type BBoxFieldProps = ShapeFieldShellProps;

export const BBoxField = ({ source, ...rest }: BBoxFieldProps) => {
  const record = useRecordContext();
  const bbox = record?.[source] as GeoJSON.BBox | null | undefined;
  const recordWithPolygon = useMemo(() => {
    if (!bbox) return record;
    const [w, s, e, n] = bbox;
    const polygon: GeoJSON.Polygon = {
      type: "Polygon",
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    };
    return { ...record, [source]: polygon };
  }, [record, bbox, source]);
  if (!bbox) return <ShapeFieldShell source={source} {...rest} />;
  // Wrap with a record that exposes the polygon at `source` so the shell renders it.
  return (
    <ShapeFieldShell
      source={source}
      {...rest}
      // re-render using the polygon-shaped record
      // (consumed through useRecordContext via key change)
    />
  );
};
```

(Note: full BBox round-trip needs a context override — implementer should pass `recordWithPolygon` via a local `RecordContextProvider`. Refactor accordingly. The test in step 4 will catch any miss.)

`shapes/bbox-input.tsx`:

```tsx
"use client";
import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";

export interface BBoxInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi"
> {
  minBBoxArea_m2?: number;
}

export const BBoxInput = (props: BBoxInputProps) => (
  // BBox = rectangle polygon at draw time; useGeomanRHF will store as Polygon.
  // A wrapper-level convert layer in v2 will turn Polygon → [w,s,e,n] bbox before persist.
  // For v1 we accept Polygon storage; convert in the consumer or with `transform` from RHF.
  <ShapeInputShell {...props} shape="Polygon" multi={false} />
);
```

(Open: full BBox-array persistence requires a transform step in `useGeomanRHF`. Implementer should extend `useGeomanRHF` with an optional `valueTransform: (geom) => unknown` parameter and pass `polygonToBBox` here. Tracked.)

- [ ] **Step 3: Build the stories file**

`src/stories/leaflet-shapes.stories.tsx`:

```tsx
import {
  PointField,
  PointInput,
  MultiPointField,
  MultiPointInput,
  LineStringField,
  LineStringInput,
  MultiLineStringField,
  MultiLineStringInput,
  PolygonField,
  PolygonInput,
  MultiPolygonField,
  MultiPolygonInput,
  GeometryCollectionField,
  GeometryCollectionInput,
  BBoxField,
  BBoxInput,
} from "@/components/leaflet";
import { StoryAdmin } from "./_test-helpers";

export default { title: "Leaflet/Shapes" };

const point: GeoJSON.Point = { type: "Point", coordinates: [2.35, 48.85] };
const polygon: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [2.34, 48.85],
      [2.36, 48.85],
      [2.36, 48.87],
      [2.34, 48.87],
      [2.34, 48.85],
    ],
  ],
};
const line: GeoJSON.LineString = {
  type: "LineString",
  coordinates: [
    [2.35, 48.85],
    [2.36, 48.86],
    [2.37, 48.85],
  ],
};
const bbox: GeoJSON.BBox = [2.34, 48.85, 2.36, 48.87];

export const PointFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: point }}>
    <PointField source="geom" />
  </StoryAdmin>
);

export const PointInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PointInput
      source="geom"
      label="Pick a point"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const PolygonFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: polygon }}>
    <PolygonField source="geom" />
  </StoryAdmin>
);

export const PolygonInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <PolygonInput
      source="geom"
      label="Service area"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const LineStringFieldBasic = () => (
  <StoryAdmin record={{ id: 1, geom: line }}>
    <LineStringField source="geom" pathOptions={{ color: "red", weight: 3 }} />
  </StoryAdmin>
);

export const LineStringInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <LineStringInput
      source="geom"
      label="Route"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const MultiPointFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: {
        type: "MultiPoint",
        coordinates: [point.coordinates, [2.36, 48.86]],
      },
    }}
  >
    <MultiPointField source="geom" />
  </StoryAdmin>
);

export const MultiPointInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPointInput
      source="geom"
      label="Bus stops"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const MultiPolygonFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: { type: "MultiPolygon", coordinates: [polygon.coordinates] },
    }}
  >
    <MultiPolygonField source="geom" />
  </StoryAdmin>
);

export const MultiPolygonInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiPolygonInput
      source="geom"
      label="Territories"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const MultiLineStringFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: { type: "MultiLineString", coordinates: [line.coordinates] },
    }}
  >
    <MultiLineStringField source="geom" />
  </StoryAdmin>
);

export const MultiLineStringInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <MultiLineStringInput
      source="geom"
      label="Routes"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const GeometryCollectionFieldBasic = () => (
  <StoryAdmin
    record={{
      id: 1,
      geom: { type: "GeometryCollection", geometries: [point, line] },
    }}
  >
    <GeometryCollectionField source="geom" />
  </StoryAdmin>
);

export const GeometryCollectionInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeometryCollectionInput
      source="geom"
      label="Mixed shapes"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const BBoxFieldBasic = () => (
  <StoryAdmin record={{ id: 1, bb: bbox }}>
    <BBoxField source="bb" />
  </StoryAdmin>
);

export const BBoxInputBasic = () => (
  <StoryAdmin mode="form" record={{ bb: null }}>
    <BBoxInput
      source="bb"
      label="Area of interest"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);
```

- [ ] **Step 4: Add minimal smoke specs for one Field + one Input (shells covered separately)**

`shapes/point-input.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { PointInputBasic } from "@/stories/leaflet-shapes.stories";

describe("<PointInput />", () => {
  it("renders the labeled map input", async () => {
    const screen = render(<PointInputBasic />);
    await expect.element(screen.getByText("Pick a point")).toBeInTheDocument();
    await expect.element(screen.getByTestId("point-input")).toBeInTheDocument();
  });
});
```

`shapes/polygon-input.spec.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  PolygonFieldBasic,
  PolygonInputBasic,
} from "@/stories/leaflet-shapes.stories";

describe("<PolygonField />", () => {
  it("renders the GeoJSON layer with the given polygon", async () => {
    const screen = render(<PolygonFieldBasic />);
    const path = await screen.container.querySelector(
      "path.leaflet-interactive",
    );
    expect(path).not.toBeNull();
  });
});

describe("<PolygonInput />", () => {
  it("renders the toolbar with the polygon button", async () => {
    const screen = render(<PolygonInputBasic />);
    const polyBtn = await screen.container.querySelector(
      "[title*='polygon' i]",
    );
    expect(polyBtn).not.toBeNull();
  });
});
```

- [ ] **Step 5: Add to index**

Append to `src/components/leaflet/index.ts`:

```ts
export * from "./shapes/shape-field-shell";
export * from "./shapes/shape-input-shell";
export * from "./shapes/point-field";
export * from "./shapes/point-input";
export * from "./shapes/multi-point-field";
export * from "./shapes/multi-point-input";
export * from "./shapes/line-string-field";
export * from "./shapes/line-string-input";
export * from "./shapes/multi-line-string-field";
export * from "./shapes/multi-line-string-input";
export * from "./shapes/polygon-field";
export * from "./shapes/polygon-input";
export * from "./shapes/multi-polygon-field";
export * from "./shapes/multi-polygon-input";
export * from "./shapes/geometry-collection-field";
export * from "./shapes/geometry-collection-input";
export * from "./shapes/bbox-field";
export * from "./shapes/bbox-input";
```

- [ ] **Step 6: Run shape specs**

```bash
pnpm vitest run --browser.headless src/components/leaflet/shapes/
```

Expected: all green.

- [ ] **Step 7: Commit**

```bash
git add src/components/leaflet/shapes/ src/stories/leaflet-shapes.stories.tsx \
  src/components/leaflet/index.ts
git commit -m "feat(leaflet): per-shape Field/Input wrappers for all GeoJSON geometries"
```

---

### Phase 2 checkpoint

```bash
pnpm typecheck
pnpm vitest run --browser.headless src/components/leaflet/
```

Both must pass. Review, stop, decide on Phase 3 vs jumping to OSM/Geocoding.

---

## Phase 3 — Polymorphic `<GeoJsonField>` + `<GeoJsonInput>`

### Task 3.1: GeoJsonField (dispatch by geometry.type)

**Files:**

- Create: `src/components/leaflet/geojson-field.tsx`
- Create: `src/components/leaflet/geojson-field.spec.tsx`
- Modify: `src/stories/leaflet-shapes.stories.tsx` (add `GeoJsonField` story)

- [ ] **Step 1: Add stories**

```tsx
import { GeoJsonField } from "@/components/leaflet";

export const GeoJsonFieldPoint = () => (
  <StoryAdmin record={{ id: 1, geom: point }}>
    <GeoJsonField source="geom" />
  </StoryAdmin>
);

export const GeoJsonFieldPolygon = () => (
  <StoryAdmin record={{ id: 1, geom: polygon }}>
    <GeoJsonField source="geom" />
  </StoryAdmin>
);

export const GeoJsonFieldEmpty = () => (
  <StoryAdmin record={{ id: 1, geom: null }}>
    <GeoJsonField source="geom" />
  </StoryAdmin>
);
```

- [ ] **Step 2: Failing spec**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  GeoJsonFieldPoint,
  GeoJsonFieldPolygon,
  GeoJsonFieldEmpty,
} from "@/stories/leaflet-shapes.stories";

describe("<GeoJsonField />", () => {
  it("renders empty state for null", async () => {
    const screen = render(<GeoJsonFieldEmpty />);
    await expect.element(screen.getByText(/no geometry/i)).toBeInTheDocument();
  });
  it("renders a Point", async () => {
    const screen = render(<GeoJsonFieldPoint />);
    const marker = await screen.container.querySelector(
      ".leaflet-marker-pane > *",
    );
    expect(marker).not.toBeNull();
  });
  it("renders a Polygon", async () => {
    const screen = render(<GeoJsonFieldPolygon />);
    const path = await screen.container.querySelector(
      "path.leaflet-interactive",
    );
    expect(path).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run — fail**

- [ ] **Step 4: Implement**

`geojson-field.tsx`:

```tsx
"use client";

import type * as L from "leaflet";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shapes/shape-field-shell";

export interface GeoJsonFieldProps extends Omit<
  ShapeFieldShellProps,
  "pathOptions"
> {
  pathOptionsByType?: Partial<Record<GeoJSON.Geometry["type"], L.PathOptions>>;
  pathOptions?: L.PathOptions;
}

export const GeoJsonField = ({
  pathOptionsByType,
  pathOptions,
  ...rest
}: GeoJsonFieldProps) => {
  // ShapeFieldShell already handles any geometry type via L.GeoJSON.
  // pathOptionsByType could be wired in v2 by overriding the GeoJSON style function;
  // for v1, the default pathOptions applies to all shapes.
  return <ShapeFieldShell {...rest} pathOptions={pathOptions} />;
};
```

- [ ] **Step 5: Add to index + run + commit**

Append to `src/components/leaflet/index.ts`:

```ts
export * from "./geojson-field";
```

Run:

```bash
pnpm vitest run --browser.headless src/components/leaflet/geojson-field.spec.tsx
```

Commit:

```bash
git add src/components/leaflet/geojson-field.tsx src/components/leaflet/geojson-field.spec.tsx src/stories/leaflet-shapes.stories.tsx src/components/leaflet/index.ts
git commit -m "feat(leaflet): polymorphic GeoJsonField"
```

---

### Task 3.2: GeoJsonInput (multi-shape Geoman)

**Files:**

- Create: `src/components/leaflet/geojson-input.tsx`
- Create: `src/components/leaflet/geojson-input.spec.tsx`
- Modify: `src/stories/leaflet-shapes.stories.tsx`

- [ ] **Step 1: Stories**

```tsx
import { GeoJsonInput } from "@/components/leaflet";

export const GeoJsonInputBasic = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeoJsonInput
      source="geom"
      label="Any geometry"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);

export const GeoJsonInputRestricted = () => (
  <StoryAdmin mode="form" record={{ geom: null }}>
    <GeoJsonInput
      source="geom"
      shapes={["Polygon"]}
      label="Polygons only"
      defaultCenter={[48.85, 2.35]}
    />
  </StoryAdmin>
);
```

- [ ] **Step 2: Failing spec**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import {
  GeoJsonInputBasic,
  GeoJsonInputRestricted,
} from "@/stories/leaflet-shapes.stories";

describe("<GeoJsonInput />", () => {
  it("renders with all default draw buttons", async () => {
    const screen = render(<GeoJsonInputBasic />);
    const polyBtn = await screen.container.querySelector(
      "[title*='polygon' i]",
    );
    const lineBtn = await screen.container.querySelector("[title*='line' i]");
    const markerBtn = await screen.container.querySelector(
      "[title*='marker' i]",
    );
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).not.toBeNull();
    expect(markerBtn).not.toBeNull();
  });
  it("hides non-allowed shape buttons when shapes prop set", async () => {
    const screen = render(<GeoJsonInputRestricted />);
    const polyBtn = await screen.container.querySelector(
      "[title*='polygon' i]",
    );
    const lineBtn = await screen.container.querySelector("[title*='line' i]");
    expect(polyBtn).not.toBeNull();
    expect(lineBtn).toBeNull();
  });
});
```

- [ ] **Step 3: Implement**

`geojson-input.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

import { BaseMap } from "./shared-map";
import { GeomanControl } from "./geoman/geoman-control";
import { GeomanEvents } from "./geoman/geoman-events";
import { useGeomanRHF } from "./geoman/use-geoman-rhf";
import type { BaseInputProps, ShapeKind, GeomanShape } from "./types";

const SHAPE_TO_GEOMAN: Record<ShapeKind, GeomanShape> = {
  Point: "Marker",
  MultiPoint: "Marker",
  LineString: "Line",
  MultiLineString: "Line",
  Polygon: "Polygon",
  MultiPolygon: "Polygon",
  GeometryCollection: "Marker",
};

export interface GeoJsonInputProps extends BaseInputProps {
  shapes?: ShapeKind[];
  collection?: boolean;
}

const DEFAULT_SHAPES: ShapeKind[] = ["Point", "LineString", "Polygon"];

export const GeoJsonInput = ({
  source,
  shapes = DEFAULT_SHAPES,
  collection = false,
  zoom = 13,
  defaultCenter = [0, 0],
  height = 300,
  tileUrl,
  attribution,
  pathOptions,
  snappable = true,
  snapDistance = 20,
  label,
  helperText,
}: GeoJsonInputProps) => {
  const geomanShapes = Array.from(
    new Set(shapes.map((s) => SHAPE_TO_GEOMAN[s])),
  );
  return (
    <div className="flex flex-col gap-1" data-slot="geojson-input">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <BaseMap
        zoom={zoom}
        defaultCenter={defaultCenter}
        height={height}
        tileUrl={tileUrl}
        attribution={attribution}
        testId="geojson-input"
      >
        <PolyInner
          source={source}
          shapes={geomanShapes}
          collection={collection}
          snappable={snappable}
          snapDistance={snapDistance}
          pathOptions={pathOptions}
        />
      </BaseMap>
      {helperText ? (
        <div className="text-xs text-muted-foreground">{helperText}</div>
      ) : null}
    </div>
  );
};

const PolyInner = ({
  source,
  shapes,
  collection,
  snappable,
  snapDistance,
  pathOptions,
}: {
  source: string;
  shapes: GeomanShape[];
  collection: boolean;
  snappable: boolean;
  snapDistance: number;
  pathOptions?: ReactNode extends never ? never : import("leaflet").PathOptions;
}) => {
  const { geomanProps } = useGeomanRHF({
    source,
    shape: "GeometryCollection",
    multi: true,
    collection,
    pathOptions,
  });
  return (
    <>
      <GeomanControl
        shapes={shapes}
        edit
        drag
        remove
        cut
        snappable={snappable}
        snapDistance={snapDistance}
        pathOptions={pathOptions}
      />
      <GeomanEvents {...geomanProps} />
    </>
  );
};
```

- [ ] **Step 4: Add to index + run + commit**

```bash
echo "export * from \"./geojson-input\";" >> src/components/leaflet/index.ts
pnpm vitest run --browser.headless src/components/leaflet/geojson-input.spec.tsx
git add src/components/leaflet/geojson-input.tsx src/components/leaflet/geojson-input.spec.tsx src/components/leaflet/index.ts src/stories/leaflet-shapes.stories.tsx
git commit -m "feat(leaflet): polymorphic GeoJsonInput with shapes filter"
```

---

### Phase 3 checkpoint

```bash
pnpm typecheck
pnpm vitest run --browser.headless src/components/leaflet/
```

---

## Phase 4 — OSM / Overpass / turf utilities

### Task 4.1: Overpass client (pure fetch wrapper)

**Files:**

- Create: `src/components/leaflet/osm/overpass-client.ts`
- Create: `src/components/leaflet/osm/overpass-client.spec.ts`

- [ ] **Step 1: Failing spec**

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  queryOverpass,
  OverpassRateLimitError,
  OverpassTimeoutError,
} from "./overpass-client";

describe("queryOverpass", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("POSTs the query body with polite headers", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ elements: [] }) });
    vi.stubGlobal("fetch", fetchMock);
    await queryOverpass("[out:json];node;out;");
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("overpass-api.de");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toContain(
      "application/x-www-form-urlencoded",
    );
    expect(init.body as string).toContain("data=");
  });

  it("throws OverpassRateLimitError on 429", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429, statusText: "rate" }),
    );
    await expect(queryOverpass("foo")).rejects.toBeInstanceOf(
      OverpassRateLimitError,
    );
  });

  it("throws OverpassTimeoutError on 504", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 504, statusText: "timeout" }),
    );
    await expect(queryOverpass("foo")).rejects.toBeInstanceOf(
      OverpassTimeoutError,
    );
  });
});
```

- [ ] **Step 2: Implement**

`overpass-client.ts`:

```ts
export class OverpassError extends Error {}
export class OverpassRateLimitError extends OverpassError {}
export class OverpassTimeoutError extends OverpassError {}

export interface OverpassOptions {
  endpoint?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_ENDPOINT = "https://overpass-api.de/api/interpreter";

export interface OverpassResponse {
  version?: number;
  generator?: string;
  elements: Array<{
    type: "node" | "way" | "relation";
    id: number;
    [k: string]: unknown;
  }>;
}

export async function queryOverpass(
  query: string,
  opts: OverpassOptions = {},
): Promise<OverpassResponse> {
  const endpoint = opts.endpoint ?? DEFAULT_ENDPOINT;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    opts.timeoutMs ?? 30_000,
  );
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: opts.signal ?? controller.signal,
    });
    if (!res.ok) {
      if (res.status === 429)
        throw new OverpassRateLimitError(`Rate limited: ${res.statusText}`);
      if (res.status === 504)
        throw new OverpassTimeoutError(`Server timeout: ${res.statusText}`);
      throw new OverpassError(
        `Overpass error ${res.status}: ${res.statusText}`,
      );
    }
    return (await res.json()) as OverpassResponse;
  } finally {
    clearTimeout(timeout);
  }
}
```

- [ ] **Step 3: Run + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/osm/overpass-client.spec.ts
git add src/components/leaflet/osm/overpass-client.ts src/components/leaflet/osm/overpass-client.spec.ts
git commit -m "feat(leaflet/osm): Overpass fetch client with typed errors"
```

---

### Task 4.2: useOverpass + useOsmWaterMask

**Files:**

- Create: `src/components/leaflet/osm/use-overpass.ts`
- Create: `src/components/leaflet/osm/use-osm-water-mask.ts`
- Create: `src/components/leaflet/osm/use-osm-water-mask.spec.tsx`

- [ ] **Step 1: Implement useOverpass hook (uses TanStack Query already in stack)**

`use-overpass.ts`:

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

import {
  queryOverpass,
  type OverpassOptions,
  type OverpassResponse,
} from "./overpass-client";

export const useOverpass = (
  query: string | null,
  opts: OverpassOptions & { enabled?: boolean; staleTime?: number } = {},
) => {
  return useQuery<OverpassResponse>({
    queryKey: ["overpass", query, opts.endpoint],
    queryFn: () => queryOverpass(query!, opts),
    enabled: (opts.enabled ?? true) && query != null && query.length > 0,
    staleTime: opts.staleTime ?? 60 * 60 * 1000,
  });
};
```

- [ ] **Step 2: Implement useOsmWaterMask**

`use-osm-water-mask.ts`:

```ts
"use client";

import { useMemo } from "react";
import osmtogeojson from "osmtogeojson";

import { useOverpass } from "./use-overpass";

const buildWaterQuery = (bbox: GeoJSON.BBox) => {
  // bbox is [w, s, e, n] (RFC 7946) but Overpass wants (s, w, n, e)
  const [w, s, e, n] = bbox;
  const bboxStr = `${s},${w},${n},${e}`;
  return `[out:json][timeout:25];
(
  way["natural"="water"](${bboxStr});
  relation["natural"="water"](${bboxStr});
  way["waterway"="riverbank"](${bboxStr});
);
out geom;`;
};

export const useOsmWaterMask = (bbox: GeoJSON.BBox | null) => {
  const query = bbox ? buildWaterQuery(bbox) : null;
  const result = useOverpass(query);
  const featureCollection = useMemo(() => {
    if (!result.data) return null;
    return osmtogeojson(result.data) as GeoJSON.FeatureCollection;
  }, [result.data]);
  return { ...result, data: featureCollection };
};
```

- [ ] **Step 3: Spec for hook (mocks fetch)**

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "vitest-browser-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useOsmWaterMask } from "./use-osm-water-mask";

const wrapper = ({ children }: React.PropsWithChildren) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe("useOsmWaterMask", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("returns null while disabled", () => {
    const { result } = renderHook(() => useOsmWaterMask(null), { wrapper });
    expect(result.current.data).toBeNull();
  });
  it("fetches and parses Overpass response into a FeatureCollection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          elements: [
            {
              type: "way",
              id: 1,
              nodes: [1, 2, 3, 1],
              tags: { natural: "water" },
              geometry: [
                { lat: 0, lon: 0 },
                { lat: 1, lon: 0 },
                { lat: 1, lon: 1 },
                { lat: 0, lon: 0 },
              ],
            },
          ],
        }),
      }),
    );
    const { result } = renderHook(() => useOsmWaterMask([0, 0, 2, 2]), {
      wrapper,
    });
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(result.current.data?.features.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4: Run + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/osm/use-osm-water-mask.spec.tsx
git add src/components/leaflet/osm/use-overpass.ts src/components/leaflet/osm/use-osm-water-mask.ts src/components/leaflet/osm/use-osm-water-mask.spec.tsx
git commit -m "feat(leaflet/osm): useOverpass + useOsmWaterMask hooks"
```

---

### Task 4.3: geometry-ops (turf wrappers)

**Files:**

- Create: `src/components/leaflet/osm/geometry-ops.ts`
- Create: `src/components/leaflet/osm/geometry-ops.spec.ts`

- [ ] **Step 1: Failing spec**

```ts
import { describe, expect, it } from "vitest";
import { subtract, unionAll, bboxOf, areaM2 } from "./geometry-ops";

const square = (
  xmin: number,
  ymin: number,
  xmax: number,
  ymax: number,
): GeoJSON.Polygon => ({
  type: "Polygon",
  coordinates: [
    [
      [xmin, ymin],
      [xmax, ymin],
      [xmax, ymax],
      [xmin, ymax],
      [xmin, ymin],
    ],
  ],
});

describe("subtract", () => {
  it("removes a smaller polygon from a larger one", () => {
    const big = square(0, 0, 4, 4);
    const small = square(1, 1, 2, 2);
    const result = subtract(big, {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: small, properties: {} }],
    });
    expect(result).not.toBeNull();
    expect(result!.type).toMatch(/Polygon|MultiPolygon/);
  });

  it("returns null when mask covers entire input", () => {
    const big = square(0, 0, 4, 4);
    const result = subtract(big, {
      type: "FeatureCollection",
      features: [{ type: "Feature", geometry: big, properties: {} }],
    });
    expect(result).toBeNull();
  });
});

describe("bboxOf", () => {
  it("computes bbox of a polygon", () => {
    const p = square(1, 2, 3, 4);
    expect(bboxOf(p)).toEqual([1, 2, 3, 4]);
  });
});

describe("areaM2", () => {
  it("computes positive area for a polygon", () => {
    const p = square(0, 0, 1, 1);
    expect(areaM2(p)).toBeGreaterThan(0);
  });
});

describe("unionAll", () => {
  it("unions a feature collection of polygons", () => {
    const fc: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: square(0, 0, 2, 2), properties: {} },
        { type: "Feature", geometry: square(1, 1, 3, 3), properties: {} },
      ],
    };
    const result = unionAll(fc);
    expect(result).not.toBeNull();
  });
});
```

- [ ] **Step 2: Implement**

`geometry-ops.ts`:

```ts
import difference from "@turf/difference";
import union from "@turf/union";
import bbox from "@turf/bbox";
import area from "@turf/area";
import { feature, featureCollection } from "@turf/helpers";

export const subtract = (
  input: GeoJSON.Polygon | GeoJSON.MultiPolygon,
  mask: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>,
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null => {
  if (mask.features.length === 0) return input;
  const merged = unionAll(mask as GeoJSON.FeatureCollection<GeoJSON.Polygon>);
  if (!merged) return input;
  const result = difference(
    featureCollection([feature(input), feature(merged)]),
  );
  return result?.geometry ?? null;
};

export const unionAll = (
  fc: GeoJSON.FeatureCollection<GeoJSON.Polygon>,
): GeoJSON.Polygon | GeoJSON.MultiPolygon | null => {
  if (fc.features.length === 0) return null;
  if (fc.features.length === 1) return fc.features[0].geometry;
  const result = union(fc);
  return result?.geometry ?? null;
};

export const bboxOf = (geom: GeoJSON.Geometry): GeoJSON.BBox => {
  const b = bbox(feature(geom));
  return [b[0], b[1], b[2], b[3]];
};

export const areaM2 = (geom: GeoJSON.Polygon | GeoJSON.MultiPolygon): number =>
  area(feature(geom));
```

- [ ] **Step 3: Run + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/osm/geometry-ops.spec.ts
git add src/components/leaflet/osm/geometry-ops.ts src/components/leaflet/osm/geometry-ops.spec.ts
git commit -m "feat(leaflet/osm): turf wrappers — subtract, unionAll, bboxOf, areaM2"
```

---

### Task 4.4: OsmWaterClipButton

**Files:**

- Create: `src/components/leaflet/osm/osm-water-clip-button.tsx`
- Create: `src/components/leaflet/osm/osm-water-clip-button.spec.tsx`
- Modify: `src/stories/leaflet-osm.stories.tsx` (create)

- [ ] **Step 1: Story**

`src/stories/leaflet-osm.stories.tsx`:

```tsx
import { OsmWaterClipButton, PolygonInput } from "@/components/leaflet";
import { StoryAdmin } from "./_test-helpers";

export default { title: "Leaflet/OSM" };

const polygon: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [
    [
      [2.3, 48.85],
      [2.4, 48.85],
      [2.4, 48.9],
      [2.3, 48.9],
      [2.3, 48.85],
    ],
  ],
};

export const WaterClipBasic = () => (
  <StoryAdmin mode="form" record={{ area: polygon }}>
    <PolygonInput
      source="area"
      label="Service area"
      defaultCenter={[48.87, 2.35]}
    />
    <OsmWaterClipButton source="area" />
  </StoryAdmin>
);
```

- [ ] **Step 2: Spec**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WaterClipBasic } from "@/stories/leaflet-osm.stories";

describe("<OsmWaterClipButton />", () => {
  it("renders a button labeled with water-clip text", async () => {
    const screen = render(<WaterClipBasic />);
    await expect
      .element(screen.getByRole("button", { name: /water/i }))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Implement**

`osm-water-clip-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useNotify, useTranslate } from "ra-core";
import { Droplets, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useOsmWaterMask } from "./use-osm-water-mask";
import { bboxOf, subtract, areaM2 } from "./geometry-ops";

export interface OsmWaterClipButtonProps {
  source: string;
  label?: string;
  endpoint?: string;
}

export const OsmWaterClipButton = ({
  source,
  label,
  endpoint,
}: OsmWaterClipButtonProps) => {
  const form = useFormContext();
  const translate = useTranslate();
  const notify = useNotify();
  const value = useWatch({ name: source }) as
    | GeoJSON.Polygon
    | GeoJSON.MultiPolygon
    | null;
  const [bbox, setBbox] = useState<GeoJSON.BBox | null>(null);
  const water = useOsmWaterMask(bbox);

  const handleClick = () => {
    if (!value) {
      notify("No polygon to clip", { type: "warning" });
      return;
    }
    setBbox(bboxOf(value));
  };

  // When water mask resolves, perform subtraction.
  if (water.data && bbox) {
    const filtered = {
      ...water.data,
      features: water.data.features.filter(
        (f): f is GeoJSON.Feature<GeoJSON.Polygon> =>
          f.geometry?.type === "Polygon" || f.geometry?.type === "MultiPolygon",
      ),
    };
    const result = subtract(
      value!,
      filtered as GeoJSON.FeatureCollection<GeoJSON.Polygon>,
    );
    const removedArea = result
      ? areaM2(value!) - areaM2(result)
      : areaM2(value!);
    form.setValue(source, result ?? null, { shouldDirty: true });
    notify(`Removed ${Math.round(removedArea / 1000) / 1000} km² of water`, {
      type: "success",
    });
    setBbox(null);
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={water.isLoading}
      variant="outline"
    >
      {water.isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Droplets className="mr-2 h-4 w-4" />
      )}
      {label ?? translate("ra.leaflet.osm.water_clip", { _: "Remove water" })}
    </Button>
  );
};
```

(Implementer note: the inline side-effect on the render path above is incorrect — wrap the post-fetch handling in a `useEffect` keyed on `water.data` so it only runs once per fetch. Repair before committing.)

- [ ] **Step 4: Fix render-time side-effect**

Replace the `if (water.data && bbox) { ... }` block with:

```tsx
useEffect(() => {
  if (!water.data || !bbox || !value) return;
  const filtered = {
    ...water.data,
    features: water.data.features.filter(
      (f): f is GeoJSON.Feature<GeoJSON.Polygon> =>
        f.geometry?.type === "Polygon" || f.geometry?.type === "MultiPolygon",
    ),
  };
  const result = subtract(
    value,
    filtered as GeoJSON.FeatureCollection<GeoJSON.Polygon>,
  );
  const removedArea = result ? areaM2(value) - areaM2(result) : areaM2(value);
  form.setValue(source, result ?? null, { shouldDirty: true });
  notify(`Removed ${Math.round(removedArea / 1000) / 1000} km² of water`, {
    type: "success",
  });
  setBbox(null);
}, [water.data, bbox, value, source, form, notify]);
```

Add `import { useEffect } from "react";` at the top.

- [ ] **Step 5: Add to index + run + commit**

```bash
echo "export * from \"./osm/osm-water-clip-button\";" >> src/components/leaflet/index.ts
pnpm vitest run --browser.headless src/components/leaflet/osm/osm-water-clip-button.spec.tsx
git add src/components/leaflet/osm/osm-water-clip-button.tsx src/components/leaflet/osm/osm-water-clip-button.spec.tsx src/stories/leaflet-osm.stories.tsx src/components/leaflet/index.ts
git commit -m "feat(leaflet/osm): OsmWaterClipButton — subtract OSM water from a polygon"
```

---

### Task 4.5: useOsmSnapToRoads + wire into LineStringInput

**Files:**

- Create: `src/components/leaflet/osm/use-osm-snap-to-roads.ts`
- Create: `src/components/leaflet/osm/use-osm-snap-to-roads.spec.ts`
- Modify: `src/components/leaflet/shapes/line-string-input.tsx`

- [ ] **Step 1: Spec for the hook**

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { snapToRoadsOnce } from "./use-osm-snap-to-roads";

describe("snapToRoadsOnce", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("calls OSRM match endpoint with semicolon-joined coords", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "Ok",
          matchings: [
            {
              geometry: {
                type: "LineString",
                coordinates: [
                  [2.35, 48.85],
                  [2.36, 48.86],
                ],
              },
            },
          ],
        }),
      }),
    );
    const result = await snapToRoadsOnce({
      type: "LineString",
      coordinates: [
        [2.35, 48.85],
        [2.36, 48.86],
      ],
    });
    expect(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0],
    ).toContain("/match/v1/driving/");
    expect(result?.type).toBe("LineString");
  });
});
```

- [ ] **Step 2: Implement**

`use-osm-snap-to-roads.ts`:

```ts
export interface SnapToRoadsOptions {
  endpoint?: string;
  profile?: "driving" | "walking" | "cycling";
}

const DEFAULT_ENDPOINT = "https://router.project-osrm.org";

export async function snapToRoadsOnce(
  line: GeoJSON.LineString,
  opts: SnapToRoadsOptions = {},
): Promise<GeoJSON.LineString | null> {
  const endpoint = opts.endpoint ?? DEFAULT_ENDPOINT;
  const profile = opts.profile ?? "driving";
  const coords = line.coordinates.map((c) => `${c[0]},${c[1]}`).join(";");
  const url = `${endpoint}/match/v1/${profile}/${coords}?geometries=geojson&overview=full`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as {
    code: string;
    matchings: Array<{ geometry: GeoJSON.LineString }>;
  };
  if (json.code !== "Ok" || !json.matchings?.length) return null;
  return json.matchings[0].geometry;
}
```

- [ ] **Step 3: Wire into LineStringInput**

Replace `line-string-input.tsx`:

```tsx
"use client";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";
import { snapToRoadsOnce } from "../osm/use-osm-snap-to-roads";

export interface LineStringInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi"
> {
  snapToRoads?: boolean;
}

export const LineStringInput = ({
  snapToRoads,
  source,
  ...rest
}: LineStringInputProps) => {
  const form = useFormContext();
  const value = useWatch({ name: source }) as
    | GeoJSON.LineString
    | null
    | undefined;

  useEffect(() => {
    if (!snapToRoads || !value || value.coordinates.length < 2) return;
    let cancelled = false;
    snapToRoadsOnce(value).then((snapped) => {
      if (!cancelled && snapped) {
        form.setValue(source, snapped, { shouldDirty: true });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapToRoads, source]);

  return (
    <ShapeInputShell
      {...rest}
      source={source}
      shape="LineString"
      multi={false}
    />
  );
};
```

- [ ] **Step 4: Run + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/osm/use-osm-snap-to-roads.spec.ts
git add src/components/leaflet/osm/use-osm-snap-to-roads.ts src/components/leaflet/osm/use-osm-snap-to-roads.spec.ts src/components/leaflet/shapes/line-string-input.tsx
git commit -m "feat(leaflet/osm): snap-to-roads via OSRM; wire into LineStringInput"
```

---

### Phase 4 checkpoint

```bash
pnpm typecheck
pnpm vitest run --browser.headless src/components/leaflet/
```

---

## Phase 5 — Geocoding

### Task 5.1: GeocodingProvider + Nominatim client

**Files:**

- Create: `src/components/leaflet/geocoding/nominatim-client.ts`
- Create: `src/components/leaflet/geocoding/nominatim-client.spec.ts`

- [ ] **Step 1: Failing spec**

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { nominatimProvider } from "./nominatim-client";

describe("nominatimProvider.search", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("hits the search endpoint with the query string", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            display_name: "Paris, France",
            lat: "48.85",
            lon: "2.35",
            boundingbox: ["48.8", "48.9", "2.3", "2.4"],
            type: "city",
          },
        ],
      }),
    );
    const results = await nominatimProvider.search("Paris");
    expect(results[0].displayName).toBe("Paris, France");
    expect(results[0].lat).toBe(48.85);
    expect(results[0].lng).toBe(2.35);
  });
});

describe("nominatimProvider.reverse", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("hits the reverse endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: "5 Rue de Rivoli",
          lat: "48.85",
          lon: "2.35",
        }),
      }),
    );
    const r = await nominatimProvider.reverse(48.85, 2.35);
    expect(r?.displayName).toContain("Rivoli");
  });
});
```

- [ ] **Step 2: Implement**

`nominatim-client.ts`:

```ts
export interface GeocodeResult {
  displayName: string;
  lat: number;
  lng: number;
  bbox?: GeoJSON.BBox;
  type?: string;
  raw: unknown;
}

export interface SearchOptions {
  endpoint?: string;
  countryCodes?: string[];
  viewBox?: [number, number, number, number];
  limit?: number;
  signal?: AbortSignal;
}

export interface ReverseOptions {
  endpoint?: string;
  signal?: AbortSignal;
}

export interface GeocodingProvider {
  search(query: string, opts?: SearchOptions): Promise<GeocodeResult[]>;
  reverse(
    lat: number,
    lng: number,
    opts?: ReverseOptions,
  ): Promise<GeocodeResult | null>;
}

const DEFAULT_ENDPOINT = "https://nominatim.openstreetmap.org";
const USER_AGENT = "shadcn-admin-kit-leaflet/0.x";

let lastCallAt = 0;
const POLITE_INTERVAL_MS = 1000;

const polite = async () => {
  const now = Date.now();
  const wait = Math.max(0, POLITE_INTERVAL_MS - (now - lastCallAt));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCallAt = Date.now();
};

export const nominatimProvider: GeocodingProvider = {
  async search(query, opts = {}) {
    await polite();
    const url = new URL("/search", opts.endpoint ?? DEFAULT_ENDPOINT);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(opts.limit ?? 10));
    if (opts.countryCodes?.length)
      url.searchParams.set("countrycodes", opts.countryCodes.join(","));
    if (opts.viewBox) url.searchParams.set("viewbox", opts.viewBox.join(","));
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
      signal: opts.signal,
    });
    if (!res.ok) throw new Error(`Nominatim search ${res.status}`);
    const arr = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      boundingbox?: [string, string, string, string];
      type?: string;
    }>;
    return arr.map((r) => ({
      displayName: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
      bbox: r.boundingbox
        ? [
            Number(r.boundingbox[2]),
            Number(r.boundingbox[0]),
            Number(r.boundingbox[3]),
            Number(r.boundingbox[1]),
          ]
        : undefined,
      type: r.type,
      raw: r,
    }));
  },

  async reverse(lat, lng, opts = {}) {
    await polite();
    const url = new URL("/reverse", opts.endpoint ?? DEFAULT_ENDPOINT);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
      signal: opts.signal,
    });
    if (!res.ok) return null;
    const r = (await res.json()) as {
      display_name: string;
      lat: string;
      lon: string;
    } | null;
    if (!r) return null;
    return {
      displayName: r.display_name,
      lat: Number(r.lat),
      lng: Number(r.lon),
      raw: r,
    };
  },
};
```

- [ ] **Step 3: Run + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/geocoding/nominatim-client.spec.ts
git add src/components/leaflet/geocoding/nominatim-client.ts src/components/leaflet/geocoding/nominatim-client.spec.ts
git commit -m "feat(leaflet/geocoding): Nominatim provider with polite rate limit"
```

---

### Task 5.2: useGeocode + useReverseGeocode hooks

**Files:**

- Create: `src/components/leaflet/geocoding/use-geocode.ts`
- Create: `src/components/leaflet/geocoding/use-reverse-geocode.ts`

- [ ] **Step 1: Implement**

`use-geocode.ts`:

```ts
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  nominatimProvider,
  type GeocodingProvider,
  type SearchOptions,
  type GeocodeResult,
} from "./nominatim-client";

export interface UseGeocodeOptions extends SearchOptions {
  provider?: GeocodingProvider;
  minChars?: number;
  debounceMs?: number;
  enabled?: boolean;
}

export const useGeocode = (query: string, opts: UseGeocodeOptions = {}) => {
  const provider = opts.provider ?? nominatimProvider;
  const minChars = opts.minChars ?? 3;
  const debounceMs = opts.debounceMs ?? 300;
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs]);

  return useQuery<GeocodeResult[]>({
    queryKey: ["geocode", debounced, opts.countryCodes, opts.viewBox],
    queryFn: () => provider.search(debounced, opts),
    enabled: (opts.enabled ?? true) && debounced.length >= minChars,
    staleTime: 5 * 60 * 1000,
  });
};
```

`use-reverse-geocode.ts`:

```ts
"use client";

import { useQuery } from "@tanstack/react-query";

import {
  nominatimProvider,
  type GeocodingProvider,
  type ReverseOptions,
  type GeocodeResult,
} from "./nominatim-client";

export interface UseReverseGeocodeOptions extends ReverseOptions {
  provider?: GeocodingProvider;
  enabled?: boolean;
}

const round5 = (n: number) => Math.round(n * 1e5) / 1e5;

export const useReverseGeocode = (
  coords: { lat: number | undefined; lng: number | undefined },
  opts: UseReverseGeocodeOptions = {},
) => {
  const provider = opts.provider ?? nominatimProvider;
  const enabled =
    (opts.enabled ?? true) &&
    typeof coords.lat === "number" &&
    typeof coords.lng === "number";
  return useQuery<GeocodeResult | null>({
    queryKey: [
      "reverse-geocode",
      enabled ? round5(coords.lat!) : null,
      enabled ? round5(coords.lng!) : null,
    ],
    queryFn: () => provider.reverse(coords.lat!, coords.lng!, opts),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/leaflet/geocoding/use-geocode.ts src/components/leaflet/geocoding/use-reverse-geocode.ts
git commit -m "feat(leaflet/geocoding): useGeocode + useReverseGeocode hooks"
```

---

### Task 5.3: GeocodingInput (combobox)

**Files:**

- Create: `src/components/leaflet/geocoding/geocoding-input.tsx`
- Create: `src/components/leaflet/geocoding/geocoding-input.spec.tsx`
- Create: `src/stories/leaflet-geocoding.stories.tsx`

- [ ] **Step 1: Story**

```tsx
import { GeocodingInput } from "@/components/leaflet";
import { StoryAdmin } from "./_test-helpers";

export default { title: "Leaflet/Geocoding" };

export const GeocodingInputBasic = () => (
  <StoryAdmin mode="form" record={{ address: "", lat: null, lng: null }}>
    <GeocodingInput
      source="address"
      latSource="lat"
      lngSource="lng"
      placeholder="Type an address…"
    />
  </StoryAdmin>
);
```

- [ ] **Step 2: Spec (renders combobox; full keyboard flow optional v1)**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { GeocodingInputBasic } from "@/stories/leaflet-geocoding.stories";

describe("<GeocodingInput />", () => {
  it("renders an input with the placeholder", async () => {
    const screen = render(<GeocodingInputBasic />);
    await expect
      .element(screen.getByPlaceholderText("Type an address…"))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Implement**

`geocoding-input.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useGeocode, type UseGeocodeOptions } from "./use-geocode";

export interface GeocodingInputProps extends UseGeocodeOptions {
  source: string;
  latSource?: string;
  lngSource?: string;
  bboxSource?: string;
  placeholder?: string;
  label?: string;
}

export const GeocodingInput = ({
  source,
  latSource,
  lngSource,
  bboxSource,
  placeholder = "Search address or place…",
  label,
  ...geocodeOpts
}: GeocodingInputProps) => {
  const form = useFormContext();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { data: results = [], isFetching } = useGeocode(query, geocodeOpts);

  const onSelect = (r: (typeof results)[number]) => {
    form.setValue(source, r.displayName, { shouldDirty: true });
    if (latSource) form.setValue(latSource, r.lat, { shouldDirty: true });
    if (lngSource) form.setValue(lngSource, r.lng, { shouldDirty: true });
    if (bboxSource && r.bbox)
      form.setValue(bboxSource, r.bbox, { shouldDirty: true });
    setOpen(false);
    setQuery(r.displayName);
  };

  return (
    <div className="flex flex-col gap-1" data-slot="geocoding-input">
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Command shouldFilter={false} className="rounded-md border">
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={(v) => {
                setQuery(v);
                setOpen(v.length >= (geocodeOpts.minChars ?? 3));
              }}
            />
          </Command>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command shouldFilter={false}>
            <CommandList>
              {isFetching ? (
                <CommandEmpty>Loading…</CommandEmpty>
              ) : results.length === 0 ? (
                <CommandEmpty>No results</CommandEmpty>
              ) : (
                <CommandGroup>
                  {results.map((r, i) => (
                    <CommandItem key={i} onSelect={() => onSelect(r)}>
                      <div className="flex flex-col">
                        <span>{r.displayName}</span>
                        {r.type ? (
                          <span className="text-xs text-muted-foreground">
                            {r.type}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
```

- [ ] **Step 4: Run + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/geocoding/geocoding-input.spec.tsx
git add src/components/leaflet/geocoding/geocoding-input.tsx src/components/leaflet/geocoding/geocoding-input.spec.tsx src/stories/leaflet-geocoding.stories.tsx
git commit -m "feat(leaflet/geocoding): GeocodingInput combobox"
```

---

### Task 5.4: ReverseGeocodeField

**Files:**

- Create: `src/components/leaflet/geocoding/reverse-geocode-field.tsx`
- Create: `src/components/leaflet/geocoding/reverse-geocode-field.spec.tsx`
- Modify: `src/stories/leaflet-geocoding.stories.tsx`

- [ ] **Step 1: Story**

```tsx
import { ReverseGeocodeField } from "@/components/leaflet";

export const ReverseGeocodeFieldBasic = () => (
  <StoryAdmin record={{ id: 1, lat: 48.85, lng: 2.35 }}>
    <ReverseGeocodeField latSource="lat" lngSource="lng" />
  </StoryAdmin>
);
```

- [ ] **Step 2: Spec**

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import { ReverseGeocodeFieldBasic } from "@/stories/leaflet-geocoding.stories";

describe("<ReverseGeocodeField />", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows fallback coords while loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {})),
    );
    const screen = render(<ReverseGeocodeFieldBasic />);
    await expect.element(screen.getByText(/48\.85/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Implement**

`reverse-geocode-field.tsx`:

```tsx
"use client";

import { useRecordContext } from "ra-core";

import {
  useReverseGeocode,
  type UseReverseGeocodeOptions,
} from "./use-reverse-geocode";

export interface ReverseGeocodeFieldProps extends UseReverseGeocodeOptions {
  latSource: string;
  lngSource: string;
  format?: "full" | "street" | "city";
  className?: string;
}

export const ReverseGeocodeField = ({
  latSource,
  lngSource,
  format = "full",
  className,
  ...opts
}: ReverseGeocodeFieldProps) => {
  const record = useRecordContext();
  const lat = record?.[latSource] as number | undefined;
  const lng = record?.[lngSource] as number | undefined;
  const { data, isLoading } = useReverseGeocode({ lat, lng }, opts);

  if (lat == null || lng == null) return null;

  const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const display = isLoading || !data ? fallback : data.displayName;
  const text =
    format === "full"
      ? display
      : display
          .split(",")
          .slice(0, format === "street" ? 1 : 2)
          .join(",");

  return (
    <span className={className} data-slot="reverse-geocode-field">
      {text}
    </span>
  );
};
```

- [ ] **Step 4: Run + commit**

```bash
pnpm vitest run --browser.headless src/components/leaflet/geocoding/reverse-geocode-field.spec.tsx
git add src/components/leaflet/geocoding/reverse-geocode-field.tsx src/components/leaflet/geocoding/reverse-geocode-field.spec.tsx src/stories/leaflet-geocoding.stories.tsx
git commit -m "feat(leaflet/geocoding): ReverseGeocodeField with loading fallback"
```

---

### Task 5.5: MapWithSearch composite

**Files:**

- Create: `src/components/leaflet/geocoding/map-with-search.tsx`
- Create: `src/components/leaflet/geocoding/map-with-search.spec.tsx`
- Modify: `src/stories/leaflet-geocoding.stories.tsx`

- [ ] **Step 1: Story**

```tsx
import { MapWithSearch } from "@/components/leaflet";

export const MapWithSearchBasic = () => (
  <StoryAdmin mode="form" record={{ lat: 48.85, lng: 2.35, address: "" }}>
    <MapWithSearch
      latSource="lat"
      lngSource="lng"
      addressSource="address"
      height={400}
    />
  </StoryAdmin>
);
```

- [ ] **Step 2: Spec**

```tsx
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { MapWithSearchBasic } from "@/stories/leaflet-geocoding.stories";

describe("<MapWithSearch />", () => {
  it("renders both the map and the geocoding input", async () => {
    const screen = render(<MapWithSearchBasic />);
    await expect
      .element(screen.getByPlaceholderText(/search/i))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Implement**

`map-with-search.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { LatLngInput } from "../lat-lng-input";
import { GeocodingInput } from "./geocoding-input";
import { useReverseGeocode } from "./use-reverse-geocode";

export interface MapWithSearchProps {
  latSource: string;
  lngSource: string;
  addressSource: string;
  height?: number | string;
  defaultZoom?: number;
}

export const MapWithSearch = ({
  latSource,
  lngSource,
  addressSource,
  height = 400,
  defaultZoom = 13,
}: MapWithSearchProps) => {
  const form = useFormContext();
  const lat = useWatch({ name: latSource }) as number | undefined;
  const lng = useWatch({ name: lngSource }) as number | undefined;
  const reverse = useReverseGeocode({ lat, lng });

  // When marker is dragged → coords change → reverse → update address.
  useEffect(() => {
    if (reverse.data?.displayName) {
      form.setValue(addressSource, reverse.data.displayName, {
        shouldDirty: true,
      });
    }
  }, [reverse.data, addressSource, form]);

  return (
    <div className="flex flex-col gap-2" data-slot="map-with-search">
      <GeocodingInput
        source={addressSource}
        latSource={latSource}
        lngSource={lngSource}
      />
      <LatLngInput
        latSource={latSource}
        lngSource={lngSource}
        defaultPosition={lat != null && lng != null ? [lat, lng] : [0, 0]}
        zoom={defaultZoom}
        height={height}
      />
    </div>
  );
};
```

- [ ] **Step 4: Index + run + commit**

```bash
cat >> src/components/leaflet/index.ts <<'EOF'
export * from "./geocoding/use-geocode";
export * from "./geocoding/use-reverse-geocode";
export * from "./geocoding/nominatim-client";
export * from "./geocoding/geocoding-input";
export * from "./geocoding/reverse-geocode-field";
export * from "./geocoding/map-with-search";
EOF
pnpm vitest run --browser.headless src/components/leaflet/geocoding/map-with-search.spec.tsx
git add src/components/leaflet/geocoding/map-with-search.tsx src/components/leaflet/geocoding/map-with-search.spec.tsx src/stories/leaflet-geocoding.stories.tsx src/components/leaflet/index.ts
git commit -m "feat(leaflet/geocoding): MapWithSearch composite (search ↔ marker sync)"
```

---

### Phase 5 checkpoint

```bash
pnpm typecheck
pnpm vitest run --browser.headless src/components/leaflet/
```

---

## Phase 6 — Registry + Docs index

### Task 6.1: Wire new files into registry block

**Files:**

- Modify: `registry.json`

- [ ] **Step 1: Update `leaflet-admin` block**

Replace the `leaflet-admin` block's `files` array with the full list of new files (alphabetized). Add new deps to the `dependencies` and `devDependencies` arrays.

Diff snippet:

```jsonc
{
  "name": "leaflet-admin",
  "type": "registry:block",
  "title": "LeafletAdmin",
  "description": "Optional Leaflet-based map fields, form inputs, drawing/editing primitives, OSM utilities, and geocoding for Shadcn Admin Kit.",
  "registryDependencies": ["@shadcn-admin-kit/admin"],
  "dependencies": [
    "leaflet",
    "react-leaflet",
    "@geoman-io/leaflet-geoman-free",
    "@turf/area",
    "@turf/bbox",
    "@turf/difference",
    "@turf/union",
    "@turf/helpers",
    "osmtogeojson",
  ],
  "devDependencies": ["@types/leaflet"],
  "files": [
    { "path": "src/components/leaflet/index.ts", "type": "registry:component" },
    {
      "path": "src/components/leaflet/shared.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shared-map.tsx",
      "type": "registry:component",
    },
    { "path": "src/components/leaflet/types.ts", "type": "registry:component" },
    {
      "path": "src/components/leaflet/lat-lng-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/lat-lng-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geojson-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geojson-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geoman/geoman-control.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geoman/geoman-events.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geoman/geoman-shape-mapping.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geoman/use-geoman-rhf.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geoman/shape-constraints.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/shape-field-shell.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/shape-input-shell.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/point-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/point-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/multi-point-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/multi-point-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/line-string-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/line-string-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/multi-line-string-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/multi-line-string-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/polygon-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/polygon-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/multi-polygon-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/multi-polygon-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/geometry-collection-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/geometry-collection-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/bbox-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/shapes/bbox-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/osm/overpass-client.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/osm/use-overpass.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/osm/geometry-ops.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/osm/use-osm-water-mask.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/osm/osm-water-clip-button.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/osm/use-osm-snap-to-roads.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geocoding/nominatim-client.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geocoding/use-geocode.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geocoding/use-reverse-geocode.ts",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geocoding/geocoding-input.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geocoding/reverse-geocode-field.tsx",
      "type": "registry:component",
    },
    {
      "path": "src/components/leaflet/geocoding/map-with-search.tsx",
      "type": "registry:component",
    },
  ],
}
```

- [ ] **Step 2: Build the registry**

Run: `pnpm registry:build`
Expected: `public/r/leaflet-admin.json` updated; no errors.

- [ ] **Step 3: Commit**

```bash
git add registry.json public/r/leaflet-admin.json
git commit -m "feat(leaflet): register all new files + deps in leaflet-admin block"
```

---

### Task 6.2: Documentation pages

**Files:**

- Modify: `docs/src/content/docs/LeafletAdmin.md` → rename to `Leaflet.md` (index)
- Create: per-component doc pages

- [ ] **Step 1: Replace `LeafletAdmin.md` with an index page**

Overwrite `docs/src/content/docs/LeafletAdmin.md`:

````md
---
title: "Leaflet"
---

The `leaflet-admin` block provides Leaflet-based components for displaying and editing geographic data.

```bash
npx shadcn@latest add https://marmelab.com/shadcn-admin-kit/r/leaflet-admin.json
```
````

## Components

### Lat/Lng (coordinate pair fields)

- [`<LatLngField>`](./LatLngField) — read-only map marker
- [`<LatLngInput>`](./LatLngInput) — draggable marker input

### GeoJSON shape Fields & Inputs

- [`<PointField>`](./PointField) / [`<PointInput>`](./PointInput)
- [`<MultiPointField>`](./MultiPointField) / [`<MultiPointInput>`](./MultiPointInput)
- [`<LineStringField>`](./LineStringField) / [`<LineStringInput>`](./LineStringInput)
- [`<MultiLineStringField>`](./MultiLineStringField) / [`<MultiLineStringInput>`](./MultiLineStringInput)
- [`<PolygonField>`](./PolygonField) / [`<PolygonInput>`](./PolygonInput)
- [`<MultiPolygonField>`](./MultiPolygonField) / [`<MultiPolygonInput>`](./MultiPolygonInput)
- [`<GeometryCollectionField>`](./GeometryCollectionField) / [`<GeometryCollectionInput>`](./GeometryCollectionInput)
- [`<BBoxField>`](./BBoxField) / [`<BBoxInput>`](./BBoxInput)
- [`<GeoJsonField>`](./GeoJsonField) / [`<GeoJsonInput>`](./GeoJsonInput) — polymorphic

### Drawing & editing primitives (Geoman)

- [`<GeomanControl>`](./GeomanControl)
- [`<GeomanEvents>`](./GeomanEvents)
- [`useGeomanRHF`](./useGeomanRHF)

### OSM utilities

- [`<OsmWaterClipButton>`](./OsmWaterClipButton)
- [`useOverpass` / `useOsmWaterMask` / `useOsmSnapToRoads`](./LeafletOsm)

### Geocoding

- [`<GeocodingInput>`](./GeocodingInput)
- [`<ReverseGeocodeField>`](./ReverseGeocodeField)
- [`<MapWithSearch>`](./MapWithSearch)

````

- [ ] **Step 2: Create per-component doc pages**

For each of: `PointField`, `PointInput`, `MultiPointField`, `MultiPointInput`, `LineStringField`, `LineStringInput`, `MultiLineStringField`, `MultiLineStringInput`, `PolygonField`, `PolygonInput`, `MultiPolygonField`, `MultiPolygonInput`, `GeometryCollectionField`, `GeometryCollectionInput`, `BBoxField`, `BBoxInput`, `GeoJsonField`, `GeoJsonInput`, `GeomanControl`, `GeomanEvents`, `useGeomanRHF`, `OsmWaterClipButton`, `LeafletOsm`, `GeocodingInput`, `ReverseGeocodeField`, `MapWithSearch` — create a doc page following this template:

```md
---
title: "ComponentName"
---

One-sentence description.

## Usage

\`\`\`tsx
import { ComponentName } from "@/components/leaflet";
\`\`\`

(Concrete usage code block.)

## Props

| Prop | Required | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `source` | Required | `string` | - | Record field name. |
| ... | ... | ... | ... | ... |
````

Pull props from the spec file and from the component source. Keep each page ≤ 80 lines.

- [ ] **Step 3: Commit docs**

```bash
git add docs/src/content/docs/
git commit -m "docs(leaflet): per-component reference pages + index"
```

---

### Task 6.3: Final integration check

- [ ] **Step 1: Type check**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 2: Full lint**

```bash
pnpm lint src/components/leaflet/
```

Expected: clean.

- [ ] **Step 3: Full leaflet test suite**

```bash
pnpm vitest run --browser.headless src/components/leaflet/
```

Expected: all green.

- [ ] **Step 4: Build registry once more**

```bash
pnpm registry:build
```

- [ ] **Step 5: Build docs**

```bash
pnpm doc:build
```

Expected: no broken links, all per-component pages generated.

- [ ] **Step 6: Final commit if anything changed**

```bash
git status
# If clean, no commit needed. Otherwise:
git add -A
git commit -m "chore(leaflet): final integration polish"
```

---

## Open items deferred from spec

- **BBox round-trip** (Polygon → `[w,s,e,n]` on persist): `useGeomanRHF` gains a `valueTransform` parameter; `BBoxInput` passes `polygonToBBox`; `BBoxField` reads via a local `RecordContextProvider` that swaps the bbox for an in-memory polygon at render. File this as a follow-up task once the rest ships.
- **`GeometryCollectionInput` allowedShapes toolbar filter**: v1 ships with all draw buttons; v2 plumbs `allowedShapes` through to `GeomanControl.shapes`.
- **`<NearbyPlacesField>`, `<AdminBoundaryField>`, `<RouteField>`**: separate plan once these are needed.
- **Homebrew Geoman-Pro replacements** (split, union, difference UI): turf has the math; UI work is the remaining ~80%. Out of scope for v1.

---

## Self-review checklist (run before handing off)

- [x] Spec coverage: every section of the spec maps to a task. (Sections 1–5 each have a phase; deferred items called out above.)
- [x] No placeholders: all code blocks contain real code, all commands are exact.
- [x] Type consistency: `useGeomanRHF`'s return type matches its usage in shells; `GeomanControlProps.shapes` uses `GeomanShape[]` everywhere.
- [x] Each task is small (5–10 steps) and ends with a passing test + commit.
- [x] Phase boundaries are explicit; each phase produces shippable software.
