"use client";

import { useMemo } from "react";
import osmtogeojson from "osmtogeojson";
import buffer from "@turf/buffer";

import { useOverpass } from "./use-overpass";
import {
  OSM_PRESETS,
  type OsmPresetDef,
  type OsmPresetName,
  buildOverpassQueryFromSources,
} from "./osm-presets";
import type { OsmTagInput } from "./osm-tag-catalog";

export interface UseOsmFeaturesOptions {
  endpoint?: string;
  enabled?: boolean;
  staleTime?: number;
}

export interface OsmFeatureSources {
  presets?: ReadonlyArray<OsmPresetName>;
  tags?: ReadonlyArray<OsmTagInput>;
}

export const useOsmFeatures = (
  bbox: GeoJSON.BBox | null,
  sources: OsmFeatureSources,
  opts: UseOsmFeaturesOptions = {},
) => {
  const presets = sources.presets ?? [];
  const tags = sources.tags ?? [];
  const hasSources = presets.length + tags.length > 0;
  const query =
    bbox && hasSources ? buildOverpassQueryFromSources(sources, bbox) : null;
  const result = useOverpass(query, opts);

  const featureCollection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null>(() => {
    if (!result.data) return null;
    const fc = osmtogeojson(result.data) as GeoJSON.FeatureCollection;
    const polygons: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>[] = [];
    for (const feat of fc.features) {
      if (!feat.geometry) continue;
      if (feat.geometry.type === "Polygon" || feat.geometry.type === "MultiPolygon") {
        polygons.push(feat as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
        continue;
      }
      // Buffer line features only when a preset declares a bufferLinesMeters.
      // Raw-tag features do not get auto-buffered — presets are the way to express buffering.
      if (feat.geometry.type === "LineString" || feat.geometry.type === "MultiLineString") {
        const presetForFeature = findPresetForFeature(feat, presets);
        const bufferMeters = presetForFeature?.bufferLinesMeters;
        if (!bufferMeters) continue;
        const buffered = buffer(
          feat as GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString>,
          bufferMeters,
          { units: "meters" },
        );
        if (
          buffered?.geometry &&
          (buffered.geometry.type === "Polygon" || buffered.geometry.type === "MultiPolygon")
        ) {
          polygons.push(buffered as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>);
        }
      }
    }
    return { type: "FeatureCollection", features: polygons };
  }, [result.data, presets]);

  return { ...result, data: featureCollection };
};

/**
 * Best-effort: identify which preset a feature came from so we know whether to
 * buffer it. Matches the first preset whose filters accept the feature's tags.
 */
function findPresetForFeature(
  feat: GeoJSON.Feature,
  presets: ReadonlyArray<OsmPresetName>,
) {
  const tags = (feat.properties ?? {}) as Record<string, string>;
  for (const name of presets) {
    const preset: OsmPresetDef = OSM_PRESETS[name];
    for (const f of preset.filters) {
      const v = tags[f.key];
      if (v == null) continue;
      if ("any" in f && f.any) return preset;
      if ("value" in f && v === f.value) return preset;
      if ("values" in f && (f.values as string[]).includes(v)) return preset;
    }
  }
  return null;
}
