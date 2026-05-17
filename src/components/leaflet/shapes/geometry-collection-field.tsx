"use client";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";

export type GeometryCollectionFieldProps = ShapeFieldShellProps;

export const GeometryCollectionField = (
  props: GeometryCollectionFieldProps,
) => <ShapeFieldShell {...props} />;
