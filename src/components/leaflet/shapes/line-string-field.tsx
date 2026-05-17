"use client";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";

export type LineStringFieldProps = ShapeFieldShellProps;

export const LineStringField = (props: LineStringFieldProps) => (
  <ShapeFieldShell {...props} />
);
