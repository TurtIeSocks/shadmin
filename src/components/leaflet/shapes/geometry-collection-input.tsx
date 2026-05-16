"use client";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";
import type { ShapeKind } from "../types";

export interface GeometryCollectionInputProps
  extends Omit<ShapeInputShellProps, "shape" | "multi" | "collection"> {
  allowedShapes?: ShapeKind[];
}

export const GeometryCollectionInput = ({
  allowedShapes: _allowedShapes,
  ...rest
}: GeometryCollectionInputProps) => (
  // For collections we anchor `shape` to "Point" but the shell honours `collection: true`
  // to write GeometryCollection values. allowedShapes is forwarded to the toolbar in v2;
  // for v1 the toolbar shows all draw buttons.
  <ShapeInputShell {...rest} shape="Point" multi={true} collection />
);
