"use client";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";

export interface BBoxInputProps extends Omit<ShapeInputShellProps, "shape" | "multi"> {
  minBBoxArea_m2?: number;
}

export const BBoxInput = ({ minBBoxArea_m2: _minBBoxArea_m2, ...rest }: BBoxInputProps) => (
  // BBox = rectangle polygon at draw time; useGeomanRHF will store as Polygon for v1.
  // A wrapper-level convert layer in v2 will turn Polygon -> [w,s,e,n] bbox before persist
  // via an optional `valueTransform` parameter in useGeomanRHF (deferred).
  <ShapeInputShell {...rest} shape="Polygon" multi={false} />
);
