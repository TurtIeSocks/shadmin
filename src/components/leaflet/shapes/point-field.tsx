"use client";

import type * as L from "leaflet";

import { ShapeFieldShell, type ShapeFieldShellProps } from "./shape-field-shell";

export type PointFieldProps = Omit<ShapeFieldShellProps, "pathOptions"> & {
  pathOptions?: L.PathOptions;
};

export const PointField = (props: PointFieldProps) => <ShapeFieldShell {...props} />;
