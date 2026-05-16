"use client";

import { ShapeInputShell, type ShapeInputShellProps } from "./shape-input-shell";

export type PointInputProps = Omit<ShapeInputShellProps, "shape" | "multi">;

export const PointInput = (props: PointInputProps) => (
  <ShapeInputShell {...props} shape="Point" multi={false} />
);
