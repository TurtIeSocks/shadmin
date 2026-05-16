"use client";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";

export interface LineStringInputProps extends Omit<ShapeInputShellProps, "shape" | "multi"> {
  /**
   * Snap drawn points to road networks. Phase 4 Task 4.6 wires this up.
   * For now, the prop is accepted but inert.
   */
  snapToRoads?: boolean;
}

export const LineStringInput = ({ snapToRoads: _snapToRoads, ...rest }: LineStringInputProps) => (
  <ShapeInputShell {...rest} shape="LineString" multi={false} />
);
