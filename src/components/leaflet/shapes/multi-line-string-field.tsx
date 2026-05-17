"use client";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shape-field-shell";

export type MultiLineStringFieldProps = ShapeFieldShellProps;

export const MultiLineStringField = (props: MultiLineStringFieldProps) => (
  <ShapeFieldShell {...props} />
);
