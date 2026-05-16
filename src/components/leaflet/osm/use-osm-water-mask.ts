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
