"use client";

import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";

export interface MultiPolygonInputProps extends Omit<
  ShapeInputShellProps,
  "shape" | "multi" | "geomanShapes"
> {
  allowSelfIntersection?: boolean;
  minVertices?: number;
  maxVertices?: number;
}

export const MultiPolygonInput = ({
  allowSelfIntersection: _allowSelfIntersection,
  minVertices: _minVertices,
  maxVertices: _maxVertices,
  ...rest
}: MultiPolygonInputProps) => (
  <ShapeInputShell
    {...rest}
    shape="MultiPolygon"
    multi={true}
    geomanShapes={["Polygon", "Rectangle", "Circle"]}
  />
);
