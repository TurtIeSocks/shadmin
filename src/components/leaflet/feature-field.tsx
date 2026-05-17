"use client";

import {
  ShapeFieldShell,
  type ShapeFieldShellProps,
} from "./shapes/shape-field-shell";

/**
 * Read-only Leaflet map that renders a `GeoJSON.Feature` stored at a record
 * field. Leaflet's `L.geoJSON` accepts Features directly, so this is a thin
 * wrapper around `ShapeFieldShell`.
 */
export type FeatureFieldProps = ShapeFieldShellProps;

export const FeatureField = (props: FeatureFieldProps) => (
  <ShapeFieldShell {...props} />
);
