"use client";

import { ShapeFieldShell, type ShapeFieldShellProps } from "./shape-field-shell";

export type MultiPolygonFieldProps = ShapeFieldShellProps;

export const MultiPolygonField = (props: MultiPolygonFieldProps) => <ShapeFieldShell {...props} />;
