"use client";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";

export type MultiPointInputProps = Omit<ShapeInputShellProps, "shape" | "multi">;

export const MultiPointInput = (props: MultiPointInputProps) => (
  <ShapeInputShell {...props} shape="MultiPoint" multi={true} />
);
