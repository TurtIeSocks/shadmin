"use client";
import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";
import { snapToRoadsOnce } from "../osm/use-osm-snap-to-roads";

export interface LineStringInputProps extends Omit<ShapeInputShellProps, "shape" | "multi"> {
  snapToRoads?: boolean;
}

export const LineStringInput = ({ snapToRoads, source, ...rest }: LineStringInputProps) => {
  const form = useFormContext();
  const value = useWatch({ name: source }) as GeoJSON.LineString | null | undefined;

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

  return <ShapeInputShell {...rest} source={source} shape="LineString" multi={false} />;
};
