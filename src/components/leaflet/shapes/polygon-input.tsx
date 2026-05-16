"use client";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";

export interface PolygonInputProps extends Omit<ShapeInputShellProps, "shape" | "multi"> {
  allowSelfIntersection?: boolean;
  minVertices?: number;
  maxVertices?: number;
  minArea_m2?: number;
}

export const PolygonInput = ({
  allowSelfIntersection: _allowSelfIntersection,
  minVertices: _minVertices,
  maxVertices: _maxVertices,
  minArea_m2: _minArea_m2,
  ...rest
}: PolygonInputProps) => <ShapeInputShell {...rest} shape="Polygon" multi={false} />;
