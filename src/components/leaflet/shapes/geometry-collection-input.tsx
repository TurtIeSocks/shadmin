"use client";

import { GeoJsonInput, type GeoJsonInputProps } from "../geojson-input";
import type { ShapeKind } from "../types";

export interface GeometryCollectionInputProps
  extends Omit<GeoJsonInputProps, "shapes" | "collection"> {
  allowedShapes?: ShapeKind[];
}

const DEFAULT_ALLOWED: ShapeKind[] = ["Point", "LineString", "Polygon"];

export const GeometryCollectionInput = ({
  allowedShapes = DEFAULT_ALLOWED,
  ...rest
}: GeometryCollectionInputProps) => (
  <GeoJsonInput {...rest} shapes={allowedShapes} collection />
);
