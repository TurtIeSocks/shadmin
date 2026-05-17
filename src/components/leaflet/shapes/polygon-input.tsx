"use client";

import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";

export interface PolygonInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi" | "geomanShapes"
> {
  allowSelfIntersection?: boolean;
  minVertices?: number;
  maxVertices?: number;
  minArea_m2?: number;
}

const POLYGON_TOOLS = ["Polygon", "Rectangle", "Circle"] as const;

export const PolygonInput = ({
  allowSelfIntersection: _allowSelfIntersection,
  minVertices: _minVertices,
  maxVertices: _maxVertices,
  minArea_m2: _minArea_m2,
  ...rest
}: PolygonInputProps) => (
  <ShapeInputShell
    {...rest}
    shape="Polygon"
    multi={false}
    geomanShapes={[...POLYGON_TOOLS]}
  />
);
