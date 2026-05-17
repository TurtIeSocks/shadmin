"use client";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";

export type MultiPointFieldProps = ShapeFieldShellProps;

export const MultiPointField = (props: MultiPointFieldProps) => (
  <ShapeFieldShell {...props} />
);
