/**
 * Curated OSM tag filters consumable by `useOsmFeatures` /
 * `OsmFeatureSubtract` / `OsmFeatureAdd`. Each preset compiles to one or more
 * Overpass query clauses targeting `way`/`relation` features whose geometry
 * can be converted to a Polygon (with optional buffering for line features).
 */

import { tagToFilter, type OsmTagInput } from "./osm-tag-catalog";

export type OsmTagFilter =
  | { key: string; value: string }
  | { key: string; values: string[] }
  | { key: string; any: true };

export interface OsmPresetDef {
  /** Tag filters; OR'd together inside Overpass. */
  filters: OsmTagFilter[];
  /** When set, line geometries (highway etc.) are buffered to polygons. */
  bufferLinesMeters?: number;
  /** Element types to query (default `["way","relation"]`). */
  elementTypes?: Array<"way" | "relation">;
}

export const OSM_PRESETS = {
  water: {
    filters: [
      { key: "natural", values: ["water", "bay", "strait"] },
      { key: "waterway", any: true },
    ],
  },
  buildings: {
    filters: [{ key: "building", any: true }],
  },
  forest: {
    filters: [
      { key: "natural", values: ["wood", "forest"] },
      { key: "landuse", value: "forest" },
    ],
  },
  roads: {
    filters: [
      { key: "highway", values: ["motorway", "trunk", "primary", "secondary"] },
    ],
    bufferLinesMeters: 15,
    elementTypes: ["way"],
  },
} as const satisfies Record<string, OsmPresetDef>;

export type OsmPresetName = keyof typeof OSM_PRESETS;

function renderFilter(filter: OsmTagFilter): string {
  if ("value" in filter) return `["${filter.key}"="${filter.value}"]`;
  if ("values" in filter)
    return `["${filter.key}"~"^(${filter.values.join("|")})$"]`;
  return `["${filter.key}"]`;
}

/**
 * Compile an Overpass query from preset names AND/OR raw tag strings.
 * Filters from both sources are OR'd together inside one query.
 */
export function buildOverpassQueryFromSources(
  sources: {
    presets?: ReadonlyArray<OsmPresetName>;
    tags?: ReadonlyArray<OsmTagInput>;
  },
  bbox: GeoJSON.BBox,
): string {
  const [w, s, e, n] = bbox;
  const bboxStr = `${s},${w},${n},${e}`;
  const lines: string[] = [];

  for (const name of sources.presets ?? []) {
    const preset: OsmPresetDef = OSM_PRESETS[name];
    const elements = preset.elementTypes ?? ["way", "relation"];
    for (const filter of preset.filters) {
      const tagExpr = renderFilter(filter);
      for (const el of elements) {
        lines.push(`  ${el}${tagExpr}(${bboxStr});`);
      }
    }
  }

  for (const tag of sources.tags ?? []) {
    const filter = tagToFilter(tag);
    const tagExpr = renderFilter(filter);
    for (const el of ["way", "relation"] as const) {
      lines.push(`  ${el}${tagExpr}(${bboxStr});`);
    }
  }

  return `[out:json][timeout:25];\n(\n${lines.join("\n")}\n);\nout geom;`;
}
