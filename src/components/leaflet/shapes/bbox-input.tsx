"use client";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";
import { polygonToBBox, bboxToPolygon } from "../osm/geometry-ops";

export interface BBoxInputProps
  extends Omit<ShapeInputShellProps, "shape" | "multi" | "valueTransform" | "valueParse"> {
  minBBoxArea_m2?: number;
}

export const BBoxInput = ({ minBBoxArea_m2: _minBBoxArea_m2, ...rest }: BBoxInputProps) => (
  // A drawn rectangle is a `Polygon` in Geoman; we round-trip it through
  // `[w, s, e, n]` (GeoJSON.BBox) for storage in the form value.
  <ShapeInputShell
    {...rest}
    shape="Polygon"
    multi={false}
    valueTransform={polygonToBBox}
    valueParse={bboxToPolygon}
  />
);
