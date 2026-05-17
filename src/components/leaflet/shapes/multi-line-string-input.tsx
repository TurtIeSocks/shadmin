"use client";

import {
  ShapeInputShell,
  type ShapeInputShellProps,
} from "./shape-input-shell";

export type MultiLineStringInputProps = Omit<
  ShapeInputShellProps,
  "shape" | "multi"
>;

export const MultiLineStringInput = (props: MultiLineStringInputProps) => (
  <ShapeInputShell {...props} shape="MultiLineString" multi={true} />
);
