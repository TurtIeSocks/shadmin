"use client";

import type * as L from "leaflet";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shapes/shape-field-shell";

export interface GeoJsonFieldProps extends Omit<
  ShapeFieldShellProps,
  "pathOptions"
> {
  /**
   * Per-geometry-type path styling. Reserved for v2; v1 falls back to
   * `pathOptions` for every shape.
   */
  pathOptionsByType?: Partial<Record<GeoJSON.Geometry["type"], L.PathOptions>>;
  pathOptions?: L.PathOptions;
}

/**
 * Polymorphic field that renders any GeoJSON geometry on a map. Dispatches
 * by `geometry.type` via `ShapeFieldShell`'s internal `L.GeoJSON` layer,
 * which already handles all geometry kinds (Point / Line / Polygon / Multi*
 * / GeometryCollection).
 */
export const GeoJsonField = ({
  pathOptionsByType: _pathOptionsByType,
  pathOptions,
  ...rest
}: GeoJsonFieldProps) => (
  <ShapeFieldShell {...rest} pathOptions={pathOptions} />
);
