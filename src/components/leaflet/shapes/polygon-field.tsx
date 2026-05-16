"use client";

import { ShapeFieldShell, type ShapeFieldShellProps } from "./shape-field-shell";

export type PolygonFieldProps = ShapeFieldShellProps;

export const PolygonField = (props: PolygonFieldProps) => <ShapeFieldShell {...props} />;
