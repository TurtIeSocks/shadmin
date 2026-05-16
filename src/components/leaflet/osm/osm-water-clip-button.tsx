"use client";

import { useEffect, useState } from "react";
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
  endpoint: _endpoint,
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
    notify(
      `Removed ${Math.round(removedArea / 1000) / 1000} km² of water`,
      { type: "success" },
    );
    setBbox(null);
  }, [water.data, bbox, value, source, form, notify]);

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
